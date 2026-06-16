# CLAUDE.md — `apps/server`

Technical reference document for LLM sessions. Based exclusively on the app's actual code.

---

## App role

`apps/server` is the **HTTP transport layer**. It boots Fastify, registers plugins, and exposes
two kinds of endpoints:

```
apps/server (Fastify)
  ├── /trpc/*              → fastifyTRPCPlugin → appRouter (packages/trpc)
  │                            all business logic lives there, see packages/trpc/CLAUDE.md
  ├── /upload-avatar       ┐
  ├── /upload-project      │  custom REST routes — binary file I/O
  ├── /download-avatar/:id │  (multipart upload / streamed download),
  ├── /download-project/:id│  not a good fit for tRPC's JSON-RPC model
  ├── /update-project/:id  ┘
  └── /                    → health check, returns 'OK'
```

**Contains no business logic.** Custom routes only parse/validate binary I/O and delegate to use
cases from `@python-editor/core` via factories (`makeXxxUseCase()`), instantiated per request —
same pattern as `packages/trpc`.

---

## Bootstrap (`src/app.ts`)

Plugin/route registration order matters and must not be reordered without reason:

```typescript
app.register(fastifyCors, baseCorsConfig)
app.register(fastifyCookie)
app.register(fastifyMultipart)

app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext, onError(...) },
})

app.post('/upload-avatar', { preHandler: [...] }, uploadAvatar)
app.post('/upload-project', { preHandler: [...] }, uploadProject)
app.get('/download-avatar/:fileId', downloadAvatar)
app.get('/download-project/:projectId', { preHandler: [...] }, downloadProject)
app.patch('/update-project/:projectId', { preHandler: [...] }, updateProject)
app.get('/', async () => 'OK')
```

**CORS config** (`baseCorsConfig`):

```typescript
{
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],  // required so the browser can read the
  credentials: true,                        // filename on file downloads
  maxAge: 86400,
}
```

`onError` for the tRPC plugin just `console.error`s — it does not affect the response, which is
already shaped by `packages/trpc`'s own `errorHandlerMiddleware` / `handle-error.ts`.

---

## Entry point (`src/index.ts`)

```typescript
const port = Number(process.env.PORT ?? 3000)
app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server running on port ${port}`)
})
```

Note: this file reads `PORT` straight from `process.env`, not from `env` (`@python-editor/env/server`).
Everything else in the app should go through `env`, never `process.env` directly.

---

## Custom REST routes

| Method | Path | `preHandler` | Handler |
|---|---|---|---|
| POST | `/upload-avatar` | `onlyUserMiddleware`, `receiveAvatarFileAndParseMiddleware` | `src/routes/upload-avatar.ts` |
| POST | `/upload-project` | `onlyUserMiddleware`, `receiveProjectFileMiddleware` | `src/routes/upload-project.ts` |
| GET | `/download-avatar/:fileId` | *(none — public)* | `src/routes/download-avatar.ts` |
| GET | `/download-project/:projectId` | `onlyUserMiddleware` | `src/routes/download-project.ts` |
| PATCH | `/update-project/:projectId` | `onlyUserMiddleware`, `receiveProjectFileMiddleware` | `src/routes/update-project.ts` |
| GET | `/` | *(none)* | health check, returns `'OK'` |

All handlers follow the same shape: read `request.session` / `request.params` /
`request.uploadedXxxFile`, call a use-case factory from `@python-editor/core`, map domain errors to
HTTP status in a local `try/catch`.

---

## Middlewares (`src/middlewares/`)

### `onlyUserMiddleware`

```typescript
const authHeader = request.headers.authorization ?? ''
if (!authHeader.startsWith('Bearer ')) return reply.status(401).send(...)
const payload = accessTokenVerify.verifyAndParse(authHeader.slice(7))
request.session = payload   // { userId, sessionId }
```

Error mapping: `jwt.TokenExpiredError` → 401 `'Token expired.'`; anything else → 500. Missing/
malformed header → 401 `'Unauthorized.'`. Uses `AccessTokenVerify` from
`@python-editor/core/infra/gateways/cryptography/jwt-verify` — same verifier as `packages/trpc`'s
context, but invoked directly instead of through tRPC context creation.

### `receiveAvatarFileAndParseMiddleware` / `receiveProjectFileMiddleware`

Same shape for both (avatar vs. project differ only in schema/constant/output field):

```typescript
const data = await request.file()                       // @fastify/multipart
if (!data) return reply.status(400).send({ message: 'No file uploaded.' })

uploadAvatarSchema.pick({ contentType: true }).parse({ contentType: data.mimetype })

const buffer = await data.toBuffer()
if (buffer.byteLength > MAX_FILE_SIZE_BYTES) return reply.status(413).send(...)

request.uploadedAvatarFile = { buffer, contentType: data.mimetype }
```

(Project variant additionally captures `filename` and uses `uploadProjectSchema` /
`MAX_PROJECT_FILE_SIZE_BYTES` from `@python-editor/schemas/upload-project`.)

**Error mapping** (identical pattern in both):
- no file → 400
- `ZodError` with an issue on `contentType` → 415, using `issue.message`
- size exceeded → 413
- anything else → 500

**Convention:** each middleware file defines its error mapping as a separate named function
(`xMiddlewareErrorHandler(error, reply)`) called from the `catch` block, rather than inlining the
mapping. Repeat this shape for new middlewares.

---

## Fastify type augmentation (`src/@types/fastify.d.ts`)

```typescript
declare module 'fastify' {
  interface FastifyRequest {
    session: { userId: string; sessionId: string }
    uploadedAvatarFile: { buffer: Buffer; contentType: string }
    uploadedProjectFile: { buffer: Buffer; filename: string; contentType: string }
  }
}
```

Any new property set on `request` by a middleware **must** be declared here first, or downstream
handlers won't type-check.

---

## Error handling in custom routes

Each handler wraps its use-case call in `try/catch` and maps domain error classes (from
`@python-editor/core/domain/errors/*`) to HTTP status via `instanceof` checks, e.g.
(`src/routes/download-project.ts`):

```typescript
catch (error) {
  if (error instanceof ProjectDoesNotExistError)
    return reply.status(404).send({ message: error.message })
  if (error instanceof NotAllowedToDownloadProjectError)
    return reply.status(403).send({ message: error.message })
  return reply.status(500).send({ message: 'Internal server error.' })
}
```

This is **different from tRPC's approach**: `packages/trpc` centralizes the error→status mapping
in one `ERROR_MAP` (see `packages/trpc/CLAUDE.md`). Here there is no shared middleware to do that,
so each handler repeats its own `instanceof` chain locally. `TRPCError` is never used in this app's
custom routes — they are plain Fastify, so always respond via `reply.status(...).send(...)`.

Some handlers (`upload-avatar.ts`, `upload-project.ts`, `download-avatar.ts`) only have a generic
500 fallback today and don't map any specific domain error — that's the existing state, not
necessarily a target to copy if the underlying use case actually throws typed errors.

---

## Env and config

`env` comes from `@python-editor/env/server` (Zod/t3-oss validated), loaded from
`apps/server/.env.development` in dev. **Always import `env`, never read `process.env` directly**
in new code (the one exception is `PORT` in `src/index.ts` — pre-existing, don't take it as the
pattern to copy).

---

## Build, dev, run

- `npm run dev:server` (root) / `dev` (here) — `tsx watch src/index.ts`
- `build` — `tsdown` (`tsdown.config.ts`): bundles to `dist/` as ESM, `noExternal: [/@python-editor\/.*/]`
  inlines all internal workspace packages into the bundle
- `start` — `node dist/index.mjs` (production)
- `compile` — `bun build --compile` to a standalone `server` binary (not part of the standard
  build/deploy path described elsewhere in this repo; treat as experimental unless told otherwise)

---

## E2E tests (`test/`)

Run with `npm run test:e2e` (`vitest.config.e2e.ts`, includes only `test/*.e2e-spec.ts`).

**Isolation per test run** (`vitest-environment-custom.ts`):

```typescript
const schema = randomUUID()
process.env.DATABASE_URL = generateDatabaseURL(schema)  // ?schema=<uuid>
await redis.flushdb()
execSync('npm run -w @python-editor/db db:push')
// ...
// teardown:
await db.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
await db.prisma.$disconnect()
```

Every e2e run gets a fresh Postgres schema and a flushed Redis — **preserve this isolation** when
writing new e2e tests; don't add tests that depend on state from a previous run or share a schema.

- `test/factories/` — DB/data builders (`make-user`, `make-session`, `make-project`, etc.)
- `test/helpers/` — higher-level reusable flows (`upload-avatar`, `share-project`)
- tRPC routes are tested via a real tRPC client (`httpBatchLink`) hitting the test server; custom
  REST routes are tested via `supertest`

---

## How to add a custom REST route

1. Create the handler in `src/routes/<name>.ts` — read session/params/uploaded file, call a
   `makeXxxUseCase()` from `@python-editor/core`, map domain errors to status codes locally
2. If it needs pre-processing (auth, file parsing), add/reuse a middleware in `src/middlewares/`
3. If a middleware sets a new property on `request`, declare it in `src/@types/fastify.d.ts` first
4. Register the route in `src/app.ts`, keeping `onlyUserMiddleware` before any file-parsing
   middleware in `preHandler` arrays
5. Write an e2e spec in `test/`, reusing factories/helpers where possible

---

## Pitfalls and anti-patterns

### 1. Putting business logic in a route handler

Routes here are I/O adapters only. If a handler does anything beyond reading
request data and calling a use case, the logic belongs in `@python-editor/core` instead.

### 2. Using `TRPCError` in custom routes

```typescript
// WRONG — these routes never go through the tRPC plugin
throw new TRPCError({ code: 'NOT_FOUND', message: '...' })

// CORRECT
return reply.status(404).send({ message: '...' })
```

### 3. Reordering `preHandler` so file parsing runs before auth

`onlyUserMiddleware` must run before `receiveAvatarFileAndParseMiddleware` /
`receiveProjectFileMiddleware` in every `preHandler` array — authenticate before doing any work on
the request body.

### 4. Comparing error messages instead of `instanceof`

Domain errors are imported from `@python-editor/core/domain/errors/*` and checked with
`instanceof`, never by matching `error.message` strings.

### 5. Reading `process.env` directly

Use `env` from `@python-editor/env/server`, which is validated at import time — direct
`process.env` access bypasses that validation and TypeScript typing.

---

## Internal references

| What to do | Reference file |
|---|---|
| Plugin registration order, CORS config | [src/app.ts](src/app.ts) |
| Server listen / fatal error handling | [src/index.ts](src/index.ts) |
| Auth middleware (JWT verify, sets `request.session`) | [src/middlewares/only-user-middleware.ts](src/middlewares/only-user-middleware.ts) |
| File-parsing middleware pattern | [src/middlewares/receive-project-file-middleware.ts](src/middlewares/receive-project-file-middleware.ts) |
| Route with multiple mapped domain errors | [src/routes/download-project.ts](src/routes/download-project.ts), [src/routes/update-project.ts](src/routes/update-project.ts) |
| Route with streamed/binary response + headers | [src/routes/download-project.ts](src/routes/download-project.ts) |
| `FastifyRequest` type augmentation | [src/@types/fastify.d.ts](src/@types/fastify.d.ts) |
| E2E test isolation (schema-per-run, Redis flush) | [vitest-environment-custom.ts](vitest-environment-custom.ts) |
| Test factories / helpers | `test/factories/`, `test/helpers/` |
| Business logic, routers, error-code mapping | `packages/trpc/CLAUDE.md` |
