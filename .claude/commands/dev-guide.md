You are assisting development on a **Turborepo monorepo** with a strict layered architecture. Apply every rule below when writing any new code. Do not deviate from established patterns unless the user explicitly requests it.

---

## Language Standard

**All code artifacts must use English (en-US):**
- Variable names, function names, class names, interface names
- File names, directory names
- Code comments and inline documentation
- Error messages (both in code and thrown to the user)
- Git commit messages and PR descriptions
- Zod validation messages

---

## Monorepo Layout & Responsibilities

```
apps/server/      Fastify 5 server — HTTP transport only (tRPC plugin + custom routes)
apps/web/         Next.js 15 App Router — UI only, consumes tRPC client
packages/api/     ALL business logic: tRPC routers, use-cases, repositories, interfaces
packages/db/      Prisma client singleton — no logic, only exports client + generated types
packages/redis/   ioredis singleton — no logic
packages/s3/      AWS SDK S3Client — no logic
packages/mailer/  Nodemailer singleton — no logic
packages/env/     t3-oss env validation (server.ts / web.ts)
packages/schemas/ Shared Zod schemas and inferred DTO types
packages/test/    Shared Vitest config + fake implementations for unit tests
```

**Request flow:**
```
apps/web (React) → tRPC client → apps/server (Fastify) → packages/api (router → use-case → repository/KV/storage)
```

---

## Adding a New Feature — Mandatory Checklist

Follow these steps **in order** for every new feature:

1. **Zod schema** → `packages/schemas/src/{name}.ts`
   - Export the schema and infer the DTO type: `export type {Name}DTO = z.infer<typeof {name}Schema>`

2. **Interface(s)** → `packages/api/src/{layer}/interfaces/{name}.ts`
   - For repositories: `IUsersRepository` pattern
   - For KV stores: `IUserSessionsKeyValueStore` pattern
   - For emails: `ISendEmailVerification` pattern

3. **Use-case class** → `packages/api/src/use-cases/{feature-name}.ts`
   - Constructor receives **only interfaces** as parameters
   - Single public `execute({ dto, ...context })` method
   - Returns plain data — never tRPC types, never HTTP types
   - See canonical example: `packages/api/src/use-cases/sign-in.ts`

4. **Factory** → `packages/api/src/use-cases/factories/make-{feature-name}.ts`
   - Instantiates all concrete implementations
   - Wires them into the use-case constructor
   - Returns the configured use-case instance
   - See canonical example: `packages/api/src/use-cases/factories/make-sign-in.ts`

5. **Custom error(s)** → `packages/api/src/use-cases/errors/{error-name}.ts`
   - Extend `Error` directly
   - Name pattern: `{Domain}Error` (e.g., `InvalidCredentialsError`)

6. **Register error** in `packages/api/src/handle-error.ts`
   - Add entry to `ERROR_MAP`: `[YourCustomError, 'TRPC_CODE']`
   - Never skip this step — unregistered errors will bubble as 500

7. **tRPC router** → `packages/api/src/routers/{domain}.ts`
   - Use `publicProcedure` or `authenticatedProcedure` (never raw `t.procedure`)
   - Validate input with `.input(zodSchema)` — always
   - Router body: call factory, call `execute()`, return response. Nothing else.
   - Export from `packages/api/src/routers/index.ts`

8. **Unit tests** → `packages/api/src/use-cases/{feature-name}.spec.ts`
   - Cover: success path + every error path
   - See canonical example: `packages/api/src/use-cases/sign-in.spec.ts`

**For non-tRPC HTTP routes** (e.g., file uploads):
- Add route handler in `apps/server/src/index.ts`
- Create dedicated middleware(s) in `apps/server/src/middlewares/`
- Still call a use-case via its factory for all business logic

---

## Coding Standards

### File Naming
- All files: `kebab-case` (e.g., `sign-in.ts`, `make-register-user.ts`)
- Test files: `{name}.spec.ts`
- Interface files: `{name}.ts` inside an `interfaces/` subdirectory

### Naming Conventions
| Construct | Convention | Example |
|-----------|-----------|---------|
| Classes | PascalCase | `SignInUseCase`, `UsersRepository` |
| Interfaces | `I` prefix + PascalCase | `IUsersRepository`, `IJWTSign` |
| Functions / variables | camelCase | `makeSignInUseCase`, `accessToken` |
| DTO types | `{Name}DTO` suffix | `SignInDTO`, `JWTPayloadDTO` |
| Error classes | `{Domain}Error` suffix | `InvalidCredentialsError` |
| Zod schemas | `{name}Schema` | `signInSchema`, `registerUserSchema` |
| Redis keys | `{entity}:{id}` | `session:uuid`, `password-reset-token:hash` |

### TypeScript
- **Always** use `import type` for type-only imports (`verbatimModuleSyntax` is enforced)
- Use path alias `@/*` for `./src/*` (e.g., `import { db } from '@/index'`)
- No `any` — use proper inference or explicit union types
- No unused variables or parameters (`noUnusedLocals` / `noUnusedParameters` enforced)
- Array/object index access always accounts for `T | undefined` (`noUncheckedIndexedAccess` enforced)
- Infer DTO types from Zod schemas: `z.infer<typeof schema>` — never duplicate type definitions

---

## Use-Case Pattern

```typescript
// packages/api/src/use-cases/example-feature.ts

import type { IUsersRepository } from '@/repositories/interfaces/users-repository'
import type { ExampleFeatureDTO } from '@packages/schemas/src/example-feature'
import { SomeCustomError } from '@/use-cases/errors/some-custom-error'

interface ExampleFeatureUseCaseParams {
  dto: ExampleFeatureDTO
}

export class ExampleFeatureUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({ dto }: ExampleFeatureUseCaseParams) {
    const user = await this.usersRepository.findByEmail({ email: dto.email })
    if (!user) throw new SomeCustomError()
    // ... business logic
    return { user }
  }
}
```

---

## Factory Pattern

```typescript
// packages/api/src/use-cases/factories/make-example-feature.ts

import { ExampleFeatureUseCase } from '@/use-cases/example-feature'
import { UsersRepository } from '@/repositories/users-repository'

export function makeExampleFeatureUseCase() {
  const usersRepository = new UsersRepository()
  return new ExampleFeatureUseCase(usersRepository)
}
```

---

## tRPC Router Pattern

```typescript
// packages/api/src/routers/domain.ts

import { publicProcedure, authenticatedProcedure } from '@/index'
import { exampleFeatureSchema } from '@packages/schemas/src/example-feature'
import { makeExampleFeatureUseCase } from '@/use-cases/factories/make-example-feature'

export const domainRouter = {
  exampleFeature: authenticatedProcedure
    .input(exampleFeatureSchema)
    .mutation(async ({ input: dto, ctx }) => {
      const useCase = makeExampleFeatureUseCase()
      const result = await useCase.execute({ dto })
      return { message: 'Done.', ...result }
    }),
}
```

**Router rules:**
- No business logic in routers — only: call factory, call execute, return
- No try/catch — error middleware handles it globally
- Use `authenticatedProcedure` for any route that requires a logged-in user
- Use `ctx.session.userId` (never trust user-supplied userId) for authenticated operations
- **Always return a message**: every procedure must return a `message` field (e.g., `{ message: 'Done.', ...result }`), whether the operation succeeds or fails

---

## Error Handling

```typescript
// packages/api/src/use-cases/errors/example-error.ts
export class ExampleError extends Error {
  constructor() {
    super('Descriptive message in English.')
  }
}

// packages/api/src/handle-error.ts — add to ERROR_MAP:
[ExampleError, 'BAD_REQUEST'],
```

**Rules:**
- Use-cases throw domain errors only — never `TRPCError`
- Routers have no try/catch — the global `errorHandlerMiddleware` handles all errors
- Every custom error must be registered in `ERROR_MAP`
- `handle-error.ts` is the single source of truth for error → HTTP status mapping

---

## Front-End Mutation Pattern

When consuming a tRPC mutation in React components:

**Naming conventions:**
- Rename `mutate` → `{backendRouteName}Mutate` (e.g., `signInMutate`)
- Rename `mutateAsync` → `{backendRouteName}MutateAsync` (e.g., `signInMutateAsync`)
- Rename `isPending` → `isPending{BackendRouteName}` (e.g., `isPendingSignIn`)

**Handler rule:**
- Never call mutate functions directly inside JSX/HTML (e.g., `onClick={signInMutate}`)
- Always invoke them through a named handler function (e.g., `onClick={handleSignIn}`)

```typescript
// ✅ Correct
const { mutate: signInMutate, isPending: isPendingSignIn } = trpc.auth.signIn.useMutation()

function handleSignIn() {
  signInMutate({ email, password })
}

return <button onClick={handleSignIn} disabled={isPendingSignIn}>Sign in</button>

// ❌ Wrong — mutate called directly in JSX, no renamed variables
const { mutate, isPending } = trpc.auth.signIn.useMutation()
return <button onClick={() => mutate({ email, password })} disabled={isPending}>Sign in</button>
```

---

## Testing Pattern

```typescript
// packages/api/src/use-cases/example-feature.spec.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { ExampleFeatureUseCase } from '@/use-cases/example-feature'
import { FakeUsersRepository } from '@test/repositories/fake-users-repository'
import { SomeCustomError } from '@/use-cases/errors/some-custom-error'

describe('ExampleFeatureUseCase', () => {
  let sut: ExampleFeatureUseCase
  let usersRepository: FakeUsersRepository

  beforeEach(() => {
    usersRepository = new FakeUsersRepository()
    sut = new ExampleFeatureUseCase(usersRepository)
  })

  it('should succeed when ...', async () => {
    // Arrange
    usersRepository.items.users.push(/* seed data */)
    // Act
    const result = await sut.execute({ dto: { email: 'test@example.com' } })
    // Assert
    expect(result.user).toBeDefined()
  })

  it('should throw SomeCustomError when ...', async () => {
    await expect(
      sut.execute({ dto: { email: 'notfound@example.com' } })
    ).rejects.toBeInstanceOf(SomeCustomError)
  })
})
```

**Testing rules:**
- Use `beforeEach()` for setup — never `beforeAll()`
- Always name the system under test `sut`
- Use fakes from `packages/api/test/` — never real DB, Redis, mailer, or S3
- Assertions on fake state (e.g., `usersRepository.items.users.length`) are valid
- Run a single test file: `npx vitest run packages/api/src/use-cases/{name}.spec.ts`
- **One happy-path test only**: create exactly one test for the success path; its description must start with `"should be able"`
- **One test per exception**: create a separate test for each error/exception case; each description must start with `"should not be able"`

---

## Security & Authentication

- **Access token**: HS256 JWT, 1h expiry, passed as `Authorization: Bearer <token>`
- **Refresh token**: RS256 JWT, 7d expiry, `httpOnly` + `secure` + `sameSite: strict` cookie
- Sessions stored in Redis with TTL; individual revocation supported
- **Always** use `authenticatedProcedure` for protected routes — never check the token manually
- **Never** expose `hashedPassword` from repositories — use Prisma `omit` or select specific fields
- **Never** trust a `userId` from the request body in authenticated routes — always use `ctx.session.userId`

---

## Validation

- Define Zod schemas in `packages/schemas/src/` and infer DTO types from them
- Add `.input(schema)` on every tRPC procedure — no raw unvalidated input ever reaches a use-case
- For JWT payloads: always parse with Zod at the point of verification (`jwtPayloadSchema.parse(payload)`)
- Validation error messages must be written in English (en-US)

---

## Use-Case Purity — No External Dependencies

Use-cases must contain **only pure business rules**. They are infrastructure-agnostic by design.

**Prohibited inside use-cases:**
- Importing or calling Prisma, Redis, S3, Nodemailer, or any other infrastructure module directly
- Importing from `packages/db`, `packages/redis`, `packages/s3`, or `packages/mailer`
- Using any external library or framework that couples the use-case to a delivery mechanism

**Allowed inside use-cases:**
- Calling methods on injected interfaces (`IUsersRepository`, `IMailer`, etc.)
- Importing domain error classes from `@/use-cases/errors/`
- Importing DTO types from `@packages/schemas/`
- Pure language built-ins (`Date`, `crypto.randomUUID`, etc.)

This rule enforces the dependency rule of Clean Architecture: the domain layer must never depend on the infrastructure layer.

---

## Repository Type Standardization

The input and output types of all `Repository` classes must be derived from Prisma-generated types.

- Use types from `packages/api/src/repositories/types/` as the reference for repository method signatures
- Never redefine a type that already exists as a Prisma model or Prisma utility type (e.g., `Prisma.UserCreateInput`)
- When a Prisma type covers the use-case exactly, use it directly — do not wrap it in a redundant interface
- Input/output types on `IRepository` interfaces must mirror what the concrete Prisma-backed implementation actually accepts and returns

```typescript
// ✅ Correct — reuses Prisma-generated type
import type { User } from '@packages/db'

interface IUsersRepository {
  findByEmail({ email }: { email: string }): Promise<User | null>
}

// ❌ Wrong — duplicates a type Prisma already provides
interface UserRecord {
  id: string
  email: string
  // ... redeclaring what Prisma already generated
}
```

---

## Naming Best Practices

Names must be **clear, complete, and self-descriptive**. A reader must understand the intent without needing a comment or mental decoding.

**Prohibited:**
- Single-letter or single-character names: `a`, `b`, `i`, `e`, `x`, `n`
- Generic, context-free names: `data`, `obj`, `item`, `temp`, `val`, `result`, `info`, `payload` (use a domain-specific name instead, e.g., `createdUser`, `sessionToken`)
- Abbreviations that obscure meaning:

| Abbreviation | Use instead |
|---|---|
| `bg` | `background` |
| `cfg` | `config` |
| `usr` | `user` |
| `btn` | `button` |
| `err` | `error` |
| `msg` | `message` |
| `req` / `res` | `request` / `response` |
| `idx` | `index` |
| `cnt` | `count` |
| `repo` | `repository` (or full variable name like `usersRepository`) |

**Required:**
- Function names must describe the action and subject: `findUserByEmail`, `sendPasswordResetEmail`, `createProjectStorage`
- Boolean variables and functions must read as a predicate: `isExpired`, `hasPermission`, `userExists`
- Loop variables must be named after what they represent: `for (const session of activeSessions)`, not `for (const s of sessions)`

---

## Readability Over Comments

**Do not use comments to explain what the code does.** If a comment is needed to explain logic, rewrite the logic until it is self-evident.

**Prohibited:**
```typescript
// ❌ Comment explains what the code is doing — rewrite instead
// Check if token is expired
if (Date.now() > payload.exp * 1000) throw new TokenExpiredError()

// ❌ Comment restates the variable name
const u = await repo.find(id) // get user
```

**Allowed (rare exceptions):**
- Comments that explain **why** a non-obvious decision was made (business rule, legal constraint, known workaround)
- JSDoc on public interface methods when the signature alone is ambiguous

```typescript
// ✅ Explains a non-obvious business rule, not the mechanics
// Prisma omit is used here to prevent hashed passwords from leaking into use-case return values
const user = await db.user.findUnique({ where: { email }, omit: { hashedPassword: true } })
```

Write code that reads like well-structured prose. Rename, extract, and restructure until the intent is obvious.

---

## Anti-Patterns — Never Do These

| Anti-pattern | Why |
|---|---|
| Business logic inside tRPC routers | Routers are transport — logic belongs in use-cases |
| Importing concrete classes inside use-cases | Breaks testability — use interfaces only |
| Importing infrastructure packages inside use-cases | Violates Clean Architecture's dependency rule |
| Throwing `TRPCError` from a use-case | Use-cases are framework-agnostic — throw domain errors |
| Skipping `.input(schema)` on a procedure | All inputs must be validated |
| Using `any` type | Defeats TypeScript's purpose; fails type check |
| Direct Prisma/Redis/S3 calls outside their layer | Breaks separation of concerns |
| Redefining types already provided by Prisma | Causes drift and duplication — reuse Prisma types |
| Generic or abbreviated variable names | Reduces readability and increases cognitive load |
| Comments that explain what the code does | Code must be self-explanatory — rewrite unclear logic |
| `console.log` in committed code | Use structured error handling instead |
| Creating new packages for single-use utilities | Reuse existing packages; only create packages for truly cross-cutting concerns |
| Using `beforeAll()` in tests | Leads to state leakage between tests |
| Non-English identifiers, comments, or messages | Violates the project's language standard |

---

## Reference Files

When implementing a new feature, consult these canonical examples:

- **Use-case pattern**: `packages/api/src/use-cases/sign-in.ts`
- **Factory pattern**: `packages/api/src/use-cases/factories/make-sign-in.ts`
- **Router pattern**: `packages/api/src/routers/auth.ts`
- **Error mapping**: `packages/api/src/handle-error.ts`
- **Procedure definitions**: `packages/api/src/index.ts`
- **Test pattern**: `packages/api/src/use-cases/sign-in.spec.ts`
- **Fake implementations**: `packages/api/test/`
- **Zod schema + DTO pattern**: `packages/schemas/src/`
- **Environment validation**: `packages/env/src/server.ts`
