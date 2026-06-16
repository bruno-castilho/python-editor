# CLAUDE.md — `@python-editor/trpc`

Technical reference document for LLM sessions. Based exclusively on the package's actual code — no generic tRPC explanations.

---

## Package role

Pure routing layer: receives HTTP requests via Fastify, validates input with Zod, calls use cases from `@python-editor/core`, and returns the response. **Contains no business logic and has no tests of its own** — tests live in `apps/server`.

```
apps/server (Fastify)
  └── fastifyTRPCPlugin
        └── appRouter  (packages/trpc)
              ├── auth.*
              ├── users.*
              └── projects.*
                    └── makeXxxUseCase()  →  packages/core
```

---

## Router structure

```
src/routers/index.ts        ← appRouter + AppRouter type
src/routers/auth.ts         ← authRouter      (signIn, sessionRefresh, signOut)
src/routers/users.ts        ← usersRouter     (registerUser, verifyEmail, resendVerificationEmail,
                                               forgotPassword, resetPassword, getProfile,
                                               updateProfile, removeAvatar, getUserSessions,
                                               revokeUserSession)
src/routers/projects.ts     ← projectsRouter  (findPersonalProjects, findSharedWithMeProjects,
                                               removeProject, shareProject, unshareProject)
```

**Aggregator** (`src/routers/index.ts`):

```typescript
export const appRouter = router({
  healthCheck: publicProcedure.query(() => 'OK'),
  users: usersRouter,
  auth: authRouter,
  projects: projectsRouter,
})
export type AppRouter = typeof appRouter
```

---

## Procedure types

Defined in `src/index.ts`. Every procedure uses **one** or **the other** — never `t.procedure` directly.

### `publicProcedure`

Applies only the `errorHandlerMiddleware`. Does not verify authentication.

```typescript
export const publicProcedure = t.procedure.use(errorHandlerMiddleware)
```

### `authenticatedProcedure`

Applies `errorHandlerMiddleware` **and** validates that `ctx.session` is not null. Narrows the type of `session` for the rest of the chain.

```typescript
export const authenticatedProcedure = t.procedure
  .use(errorHandlerMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be authenticated to access this resource.',
      })
    }
    return next({ ctx: { ...ctx, session: ctx.session } })
  })
```

Inside an `authenticatedProcedure`, `ctx.session` is `JWTPayloadDTO` (never `null`).

---

## Context (`ctx`)

Created in `src/context.ts` for each request.

```typescript
// Full shape
{
  req: FastifyRequest,   // headers, cookies, ip
  res: FastifyReply,     // setCookie, clearCookie
  session: JWTPayloadDTO | null,  // null if unauthenticated or token absent
}

// JWTPayloadDTO (from @python-editor/schemas/jwt-payload)
{
  sessionId: string,  // uuid v4
  userId: string,     // uuid v7
}
```

**How `session` is built:**

1. Reads `Authorization: Bearer <token>` from the header
2. Calls `AccessTokenVerify.verifyAndParse(token)` from `@python-editor/core`
3. If the token is expired (`jwt.TokenExpiredError`), throws `TRPCError({ code: 'UNAUTHORIZED', message: 'Token expired' })`
4. Any other JWT error propagates without handling
5. If the header is absent, `session` stays `null`

**Recurring uses of `ctx` in routers:**

```typescript
ctx.session.userId              // authenticated user's ID
ctx.req.cookies.refresh_token   // httpOnly cookie
ctx.req.headers['x-forwarded-for'] // via parseSessionInfo()
ctx.res.setCookie('refresh_token', token, { httpOnly: true, ... })
ctx.res.clearCookie('refresh_token', { path: '/' })
```

---

## Middlewares

Only two, both in `src/index.ts`.

### `errorHandlerMiddleware`

Catches domain errors and converts them to `TRPCError` via `handleError()`. Applied to **all** procedures.

```typescript
const errorHandlerMiddleware = t.middleware(async ({ next }) => {
  const result = await next()
  if (!result.ok) {
    handleError(result.error.cause ?? result.error)
  }
  return result
})
```

`result.error.cause` is checked first to cover wrapped errors (e.g., `cause` of a `TRPCError` already thrown internally).

### Auth middleware (inline in `authenticatedProcedure`)

Restricts access and narrows `session`. Does not exist as a separate variable — it is inline in the `authenticatedProcedure` definition.

---

## Input validation

All input schemas live in `@python-editor/schemas/src/`. The package uses **Zod v4** (`^4.1.13`).

**Important Zod v4 difference:**

```typescript
// CORRECT (Zod v4)
z.email()
z.uuid()
z.uuidv7()

// WRONG (Zod v3 — does not work here)
z.string().email()
z.string().uuid()
```

**How to apply:**

```typescript
import { mySchema } from '@python-editor/schemas/my-schema'

myProcedure
  .input(mySchema)
  .mutation(async ({ input: dto, ctx }) => { ... })
//            ↑ always aliased as `dto`
```

**No procedure uses `.output()`.** Return types are inferred by TypeScript from the literal `return`. Do not add `.output()` without an explicit need.

---

## Error handling

Two distinct paths. Do not mix them.

### Path 1 — Guard clauses (transport/protocol logic)

Use `TRPCError` directly in the procedure when the error is a protocol issue, not a domain one:

```typescript
// auth.ts — missing cookie is a transport problem
const refreshToken = ctx.req.cookies.refresh_token
if (!refreshToken) {
  throw new TRPCError({
    code: 'UNAUTHORIZED',
    message: 'Missing refresh token.',
  })
}
```

### Path 2 — Domain errors

**Never** throw `TRPCError` for business errors. The use case throws the domain error class, and `errorHandlerMiddleware` intercepts it via `handleError()` in `src/handle-error.ts`.

```typescript
// handle-error.ts — centralized mapping
const ERROR_MAP: Array<[AnyErrorConstructor, TRPC_ERROR_CODE_KEY]> = [
  [UserDoesNotExistsError,              'NOT_FOUND'],
  [UserAlreadyExistsError,              'CONFLICT'],
  [InvalidCredentialsError,             'UNAUTHORIZED'],
  [EmailNotVerifiedError,               'FORBIDDEN'],
  [EmailAlreadyVerifiedError,           'BAD_REQUEST'],
  [InvalidEmailVerificationTokenError,  'UNAUTHORIZED'],
  [SessionDoesNotExistsError,           'UNAUTHORIZED'],
  [InvalidPasswordResetTokenError,      'UNAUTHORIZED'],
  [InvalidCurrentPasswordError,         'FORBIDDEN'],
  [ProjectDoesNotExistError,            'NOT_FOUND'],
  [NotAllowedToRemoveProjectError,      'FORBIDDEN'],
  [NotAllowedToShareProjectError,       'FORBIDDEN'],
  [NotAllowedToDownloadProjectError,    'FORBIDDEN'],
  [CannotShareProjectWithYourselfError, 'BAD_REQUEST'],
]
```

The `TRPCError` message is always `error.message` from the original domain class.

**To add a new domain error to the map:**

1. Import the class from `packages/core/src/domain/errors/` in `src/handle-error.ts`
2. Add an entry to `ERROR_MAP`

---

## How to add a procedure

**Checklist:**

- [ ] **1. Schema** — create or reuse in `packages/schemas/src/action-name.ts`
- [ ] **2. Use case + factory** — implement in `packages/core` (see core CLAUDE.md)
- [ ] **3. Choose the base procedure** — `publicProcedure` or `authenticatedProcedure`
- [ ] **4. Add to the correct router** — with `.input(schema).query/mutation()`
- [ ] **5. If new domain error** — add to `ERROR_MAP` in `handle-error.ts`

**Authenticated mutation template:**

```typescript
import { myActionSchema } from '@python-editor/schemas/my-action'
import { makeMyActionUseCase } from '@python-editor/core/infra/factories/make-my-action'

myRouter = router({
  // ...
  myAction: authenticatedProcedure
    .input(myActionSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const useCase = makeMyActionUseCase()
      const result = await useCase.execute({ dto, userId: ctx.session.userId })
      return { message: 'Action completed successfully.', ...result }
    }),
})
```

**Authenticated paginated query template** (pattern from `findPersonalProjects`):

```typescript
myList: authenticatedProcedure
  .input(findMyItemsSchema)  // z.object({ page, perPage, sortBy, orderBy })
  .query(async ({ input: dto, ctx }) => {
    const useCase = makeFindMyItemsUseCase()
    const { items, totalCount } = await useCase.execute({
      dto,
      userId: ctx.session.userId,
    })
    return { message: 'Items retrieved successfully.', items, totalCount }
  }),
```

---

## How to add a sub-router

1. Create `src/routers/my-domain.ts`
2. **Always** use `router({...})` and export the type:

```typescript
import { router, authenticatedProcedure } from '../index'  // or publicProcedure

export const myDomainRouter = router({
  myAction: authenticatedProcedure
    .input(mySchema)
    .mutation(async ({ input: dto, ctx }) => { ... }),
})

export type MyDomainRouter = typeof myDomainRouter
```

3. Register in `src/routers/index.ts`:

```typescript
import { myDomainRouter } from './my-domain'

export const appRouter = router({
  // ...
  myDomain: myDomainRouter,
})
```

---

## Pitfalls and anti-patterns

### 1. `projectsRouter` as a plain object (existing inconsistency)

`src/routers/projects.ts` exports a **plain object** instead of `router({...})`:

```typescript
// AS IS (inconsistent — do not repeat)
export const projectsRouter = {
  findPersonalProjects: authenticatedProcedure...
}

// AS IT SHOULD BE (pattern from auth.ts and users.ts)
export const projectsRouter = router({
  findPersonalProjects: authenticatedProcedure...
})
export type ProjectsRouter = typeof projectsRouter
```

This works because `appRouter` accepts plain objects, but it loses the exported type and breaks consistency. All new routers must use `router({})`.

### 2. Throwing `TRPCError` for domain errors in the procedure

```typescript
// WRONG — bypasses centralized mapping
.mutation(async ({ input: dto }) => {
  const user = await repo.findByEmail(dto.email)
  if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
})

// CORRECT — let the use case throw the domain error; errorHandlerMiddleware converts it
.mutation(async ({ input: dto }) => {
  const useCase = makeMyUseCase()
  await useCase.execute({ dto })  // use case throws UserDoesNotExistsError internally
})
```

### 3. Accessing `ctx.session` in `publicProcedure` without a null check

```typescript
// WRONG — publicProcedure does not guarantee session
publicProcedure.query(async ({ ctx }) => {
  const { userId } = ctx.session  // ← TypeScript accepts this, but session can be null at runtime
})

// CORRECT — use authenticatedProcedure to guarantee a non-null session
authenticatedProcedure.query(async ({ ctx }) => {
  const { userId } = ctx.session  // ← narrowed to JWTPayloadDTO
})
```

### 4. Using `input` without the `dto` alias

```typescript
// WRONG — inconsistent with the project pattern
.mutation(async ({ input, ctx }) => {
  await useCase.execute({ email: input.email })
})

// CORRECT
.mutation(async ({ input: dto, ctx }) => {
  await useCase.execute({ dto })
})
```

### 5. Instantiating dependencies outside the procedure

```typescript
// WRONG — singleton use case shared across requests
const signInUseCase = makeSignInUseCase()
export const authRouter = router({
  signIn: publicProcedure.mutation(async ({ input: dto }) => {
    await signInUseCase.execute({ dto })
  }),
})

// CORRECT — new instance per call (as in auth.ts)
export const authRouter = router({
  signIn: publicProcedure.mutation(async ({ input: dto }) => {
    const signInUseCase = makeSignInUseCase()
    await signInUseCase.execute({ dto })
  }),
})
```

### 6. Adding output validation with `.output()`

The project does not use `.output()`. Do not add it without explicit discussion — it would break the current contract with the frontend.

---

## Internal references

| What to do | Reference file |
|---|---|
| Public mutation with cookie | [src/routers/auth.ts](src/routers/auth.ts) — `signIn` |
| Mutation with no input | [src/routers/auth.ts](src/routers/auth.ts) — `signOut` |
| Authenticated query with no input | [src/routers/users.ts](src/routers/users.ts) — `getProfile` |
| Authenticated mutation with input | [src/routers/users.ts](src/routers/users.ts) — `revokeUserSession` |
| Paginated query with sorting | [src/routers/projects.ts](src/routers/projects.ts) — `findPersonalProjects` |
| Domain error mapping | [src/handle-error.ts](src/handle-error.ts) |
| Context construction | [src/context.ts](src/context.ts) |
| Procedure and middleware definitions | [src/index.ts](src/index.ts) |
| UA + GeoIP parsing for session | [src/utils/parse-session-info.ts](src/utils/parse-session-info.ts) |
| Input schemas (Zod v4) | `packages/schemas/src/*.ts` |
| Use cases and factories | `packages/core/src/domain/use-cases/` and `packages/core/src/infra/factories/` |
