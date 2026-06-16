## Primary directive

This guide **must strictly follow what is written in the repository's `CLAUDE.md` files**: the
root `CLAUDE.md` (`/CLAUDE.md`) and the `CLAUDE.md` of each package/app (`apps/server/CLAUDE.md`,
`apps/web/CLAUDE.md`, `packages/core/CLAUDE.md`, `packages/trpc/CLAUDE.md`,
`packages/db/CLAUDE.md`, `packages/schemas/CLAUDE.md`).

- **In case of conflict**, the `CLAUDE.md` of the affected package/app overrides any rule or
  example in this file.
- **Before implementing anything**, read the `CLAUDE.md` of the package/app you are going to
  touch — it contains the patterns, checklists, and known pitfalls for that layer, with examples
  extracted from real code.
- This file does not duplicate the content of the `CLAUDE.md` files — it only outlines the
  general flow and gathers rules that are genuinely cross-cutting (language, naming,
  TypeScript). Layer-specific implementation details live exclusively in that layer's
  `CLAUDE.md`.

---

## Architecture overview

Turborepo monorepo with Clean Architecture. Request flow:

```
apps/web (Next.js, UI only)
  → tRPC client (@trpc/tanstack-react-query)
    → apps/server (Fastify — HTTP transport, no business logic)
      → packages/trpc (routers — Zod validation + factory call, no business logic)
        → packages/core (all business logic: use-cases, interfaces, factories, gateways)
          → packages/db / packages/redis / packages/s3 / packages/mailer
```

Avatar and project uploads/downloads use custom REST routes in `apps/server` (not through tRPC),
but follow the same principle: the route only handles I/O, the logic lives in `packages/core`.

| Layer | Responsibility | Reference |
|---|---|---|
| `apps/web` | Next.js UI, consumes `AppRouter` | [apps/web/CLAUDE.md](../../apps/web/CLAUDE.md) |
| `apps/server` | Fastify transport (tRPC plugin + file REST) | [apps/server/CLAUDE.md](../../apps/server/CLAUDE.md) |
| `packages/trpc` | Routers + Zod validation, zero business logic | [packages/trpc/CLAUDE.md](../../packages/trpc/CLAUDE.md) |
| `packages/core` | All business logic (Clean Architecture) | [packages/core/CLAUDE.md](../../packages/core/CLAUDE.md) |
| `packages/db` | Prisma client + schema | [packages/db/CLAUDE.md](../../packages/db/CLAUDE.md) |
| `packages/schemas` | Shared Zod schemas + DTOs | [packages/schemas/CLAUDE.md](../../packages/schemas/CLAUDE.md) |

---

## Adding a new feature — checklist

Follow this order. Each step points to the `CLAUDE.md` that has the exact pattern to follow.

1. **Zod schema** → `packages/schemas/src/{name}.ts`, exporting the schema + inferred
   `{Name}DTO`. See [packages/schemas/CLAUDE.md](../../packages/schemas/CLAUDE.md).

2. **Business logic in `packages/core`** — follow the "How to Implement Something New" checklist
   in [packages/core/CLAUDE.md](../../packages/core/CLAUDE.md): types → interfaces → domain
   errors → use-case (`domain/use-cases/{name}.ts`) → spec (`.spec.ts`) → fakes (`test/`) →
   gateways (`infra/gateways/`) → factory (`infra/factories/make-{name}.ts`).

3. **tRPC router** → `packages/trpc/src/routers/{domain}.ts`, calling the factory from
   `packages/core` and using `publicProcedure`/`authenticatedProcedure`. See
   [packages/trpc/CLAUDE.md](../../packages/trpc/CLAUDE.md).

4. **Register the domain error**, if a new one was created, in the `ERROR_MAP` of
   `packages/trpc/src/handle-error.ts` — never skip this step, or the error becomes a generic
   `500`.

5. **Non-tRPC REST route** (e.g., file upload/download) → handler in `apps/server/src/routes/`,
   calling the same factory from `packages/core`. See
   [apps/server/CLAUDE.md](../../apps/server/CLAUDE.md).

6. **Front-end consumption** → form with `react-hook-form` + `zodResolver` using the schema from
   step 1, and/or `useQuery`/`useMutation` via `trpc.*`. See
   [apps/web/CLAUDE.md](../../apps/web/CLAUDE.md).

---

## Cross-cutting rules (apply to every layer)

### Language

Every code artifact must be in English (en-US): variable/function/class/interface names, file
and directory names, comments, error messages, Zod validation messages, commit messages, and PR
descriptions.

### TypeScript

- **Always** use `import type` for type-only imports (`verbatimModuleSyntax` is enforced)
- `noUncheckedIndexedAccess: true` — index access returns `T | undefined`, always handle it
- `noUnusedLocals` / `noUnusedParameters: true` — no dead code
- Never use `any`
- Path alias `@/*` → `./src/*` within each package/app

### Naming

| Construct | Convention | Example |
|---|---|---|
| Files | kebab-case | `sign-in.ts`, `make-register-user.ts` |
| Classes | PascalCase | `SignInUseCase`, `UsersRepository` |
| Interfaces | `I` + PascalCase | `IUsersRepository`, `IHashGenerator` |
| Functions/variables | camelCase | `makeSignInUseCase`, `accessToken` |
| DTOs | `{Name}DTO` (via `z.infer`) | `SignInDTO` |
| Domain errors | `{Domain}Error` | `InvalidCredentialsError` |
| Zod schemas | `{name}Schema` | `signInSchema` |
| Tests | `{name}.spec.ts` | `register-user.spec.ts` |

Never use single-letter names (`a`, `e`, `i`, `x`) or generic context-free names (`data`, `obj`,
`item`, `result`, `payload`) — prefer names that describe the domain (`createdUser`,
`sessionToken`). Boolean functions must read as a predicate (`isExpired`, `hasPermission`).

### Comments

Do not comment on **what** the code does — rewrite it until it's obvious instead. Comments are
only acceptable to explain **why** a non-obvious decision was made (business rule, legal
constraint, known workaround).

### Validation

- `.input(schema)` is mandatory on every tRPC procedure — no input reaches a use-case without
  Zod validation first
- Never use deprecated Zod APIs (`z.string().email()`, `z.string().uuid()`, etc.) — always use
  the current top-level form (`z.email()`, `z.uuid()`); this rule also applies to other
  libraries: always check whether an API is deprecated before using it

---

## Anti-patterns — never do these

| Anti-pattern | Why |
|---|---|
| Business logic in a tRPC router or Fastify route | Transport has no logic — it lives in `packages/core` |
| Use-case importing a concrete class or infra package | Breaks Clean Architecture — see `packages/core/CLAUDE.md` |
| `TRPCError` thrown by a use-case | Use-cases throw domain errors; `errorHandlerMiddleware` converts them |
| Skipping `.input(schema)` on a procedure | Every input must be validated |
| Using `any` | Defeats type-checking |
| Redefining a type the Prisma already generates | Use the generated types in `packages/db` |
| `console.log` in committed code | Use structured error handling instead |
| Deprecated API (Zod or any other library) | Always prefer the current recommended form |
| Non-English identifiers, comments, or messages | Violates the project's language standard |
| Creating an `index.ts` barrel in `packages/core` or `packages/schemas` | Breaks the wildcard export system — see the respective `CLAUDE.md` |

---

## Reference

For any question about a layer-specific pattern — code examples, testing conventions, known
pitfalls — **consult that layer's `CLAUDE.md` before asking or assuming anything**. They are the
source of truth and are kept up to date with the code.
