# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is `python-editor`: an online Python editor (Monaco + Pyodide) with personal/shared
projects and an OpenRouter-backed AI chat.

## Commands

```bash
# Development
npm run dev            # all apps
npm run dev:web        # web only (port 3001)
npm run dev:server     # server only (port 3000)

# Build
npm run build

# Unit tests (live in packages/core only)
npm test               # run once
npm run test:watch     # watch mode
npm run test:cov       # with coverage
npm run test:debug     # with Node inspector (--inspect-brk)

# E2E tests (per app, not a single root suite)
npm run test:e2e:server      # vitest e2e against the real Fastify server
npm run test:e2e:watch:server
npm run test:e2e:web         # Playwright against apps/web
npm run test:e2e:ui:web
npm run test:e2e:report:web

# Linting & type checking
npm run lint
npm run lint:fix
npm run check-types

# Database
npm run db:push        # push schema without migration
npm run db:migrate     # create + apply migration interactively
npm run db:generate    # regenerate Prisma client
npm run db:studio      # open Prisma Studio
```

Run a single test file: `npx vitest run packages/core/src/domain/use-cases/sign-in.spec.ts`

## Architecture

**Turborepo monorepo** with two apps and several shared packages:

```
apps/server/      – Fastify 5 server (port 3000): HTTP transport only, no business logic.
                     tRPC endpoint at /trpc plus a few custom REST routes for file I/O
                     (avatar/project upload-download). See apps/server/CLAUDE.md
apps/web/         – Next.js 15 App Router frontend (port 3001): UI only, consumes the
                     tRPC client. See apps/web/CLAUDE.md
packages/trpc/    – Thin routing layer: tRPC routers + Zod input validation, calls into
                     packages/core via factories. No business logic, no tests of its own.
                     See packages/trpc/CLAUDE.md
packages/core/    – All business logic, Clean Architecture: domain/ (use-cases,
                     interfaces, errors, types) + infra/ (gateways implementing those
                     interfaces, factories for DI) + test/ (fakes). See packages/core/CLAUDE.md
packages/db/      – Prisma client + generated types (PostgreSQL). See packages/db/CLAUDE.md
packages/schemas/ – Shared Zod schemas + inferred DTOs. See packages/schemas/CLAUDE.md
packages/env/     – t3-oss env validation (separate server/web envs)
packages/redis/   – ioredis wrapper
packages/s3/      – AWS SDK S3 client (MinIO in dev)
packages/mailer/  – Nodemailer wrapper (MailHog in dev)
packages/config/  – Shared tsconfig.base.json
packages/eslint/  – Shared ESLint config
```

Each package/app listed above with a `CLAUDE.md` reference has its own detailed doc — read it
before making changes in that area instead of relying on this overview.

### Request flow

`apps/web` → tRPC client (`@trpc/tanstack-react-query`) → `apps/server` (Fastify +
`fastifyTRPCPlugin`) → `packages/trpc` routers (validation only) → use-cases in `packages/core`
→ `packages/db` / `packages/redis` / `packages/s3` / `packages/mailer`.

Avatar and project uploads/downloads go through separate REST routes on the Fastify server
(`@fastify/multipart`) rather than tRPC.

### Auth

- **Access token**: short-lived JWT in `Authorization: Bearer` header
- **Refresh token**: long-lived JWT in an `httpOnly` cookie
- Sessions are stored in Redis so they can be listed and individually revoked
- Session/JWT use-cases and interfaces live in `packages/core` (e.g. `session-refresh`,
  `get-user-sessions`, `revoke-user-session`); `packages/trpc`'s `authenticatedProcedure` only
  calls into them via factories to inject `userId` into tRPC context

### Business logic pattern

Use-cases in `packages/core/src/domain/use-cases/` receive all dependencies (repositories, JWT
signers, mailer, key-value stores, etc.) as constructor parameters defined by interfaces in
`domain/interfaces/` — making them fully unit-testable with fakes. Concrete implementations live
in `infra/gateways/`, wired up by `infra/factories/make-*.ts`. Test fakes live in
`packages/core/test/`.

### Infrastructure (local dev via Docker Compose)

| Service  | Port      |
|----------|-----------|
| Postgres | 5432      |
| Redis    | 6379      |
| MinIO    | 9000/9001 |
| MailHog  | 1025/8025 |

## TypeScript notes

- **strict mode** + `verbatimModuleSyntax` — use `import type` for type-only imports
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`
- `noUnusedLocals` / `noUnusedParameters: true` — no dead code allowed
- Path alias `@/*` → `./src/*` within each package/app
