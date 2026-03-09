# packages/api

tRPC API package exposing auth and user procedures. No HTTP server here — consumed by `apps/server`.

## Build & Test Commands

Run from the monorepo root (`/workspace`):

```bash
# Run all tests (includes this package)
bun test

# Watch mode
bun test:watch

# Type-check this package
cd packages/api && bun tsc --noEmit
```

Tests use Vitest with globals enabled (no imports needed for `describe`, `it`, `expect`, `vi`).

## Architecture

Clean architecture with strict dependency inversion. Every external dependency is hidden behind an interface.

```
src/
  index.ts                  # tRPC init: t, router, publicProcedure
  context.ts                # Fastify request context (req, res, session)
  routers/
    index.ts                # Merges all routers into appRouter
    auth.ts                 # signIn mutation
    users.ts                # registerUser, verifyEmail, resendVerificationEmail
  use-cases/                # Business logic (framework-agnostic classes)
    *.ts                    # Each use case is a class with an execute() method
    *.spec.ts               # Co-located unit tests
    factories/              # make-*.ts: wire real implementations into use cases
    errors/                 # Typed domain errors (extend Error)
  repositories/
    users-repository.ts     # Prisma implementation
    interfaces/             # IUsersRepository interface
    types/                  # User, UserWithoutPassword, UserCreateParams
  cryptography/
    hasher/                 # PasswordHasher, EmailVerificationTokenHasher
    jwt/                    # AccessToken, RefreshToken (jsonwebtoken)
    token/                  # EmailVerificationToken (random token generator)
    interfaces/             # IHasher, IJWT, IToken
  key-value-stores/
    email-verification-token-key-value-store.ts  # Redis implementation
    interfaces/
  emails/
    send-email-verification.ts  # Mailer implementation
    interfaces/

test/                       # Fake implementations for unit tests
  repositories/
    data.ts                 # Shared in-memory store (Data class with items.users[])
    fake-users-repository.ts
  cryptography/             # FakeHasher, FakeJWT, FakeToken
  key-value-stores/         # FakeEmailVerificationTokenKeyValueStore
  emails/                   # FakeSendEmailVerification
```

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | tRPC instance — import `router`, `publicProcedure` from here |
| `src/routers/index.ts` | `appRouter` and its `AppRouter` type (used by server) |
| `src/context.ts` | `createContext` and `Context` type |
| `test/repositories/data.ts` | Shared mutable state passed to all fake repositories in tests |

## Coding Conventions

- **Interfaces** live in `interfaces/` subdirectories; prefixed with `I` (e.g., `IUsersRepository`).
- **Factories** (`make-*.ts`) instantiate real dependencies and return a use-case instance. No DI container.
- **Use-case tests** construct the SUT manually using fakes — no mocking framework, just fake classes.
- **Errors** are plain classes extending `Error`; caught in routers and mapped to `TRPCError`.
- **Password never leaves the use case** — `findByEmail` always omits `hashedPassword`; only `findByEmailWithPassword` includes it.
- `uuid` v7 is used for user IDs (time-ordered).
- Refresh token is set as an `httpOnly` secure cookie; access token is returned in the response body.
- Response messages are in Portuguese (pt-BR).
