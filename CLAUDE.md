# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (all apps)
npm run dev

# Testing
npm test               # run all tests once
npm run test:watch     # watch mode

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

Run a single test file: `npx vitest run packages/api/src/use-cases/sign-in.spec.ts`

## Architecture

**Turborepo monorepo** with two apps and several shared packages:

```
apps/server/      – Fastify 5 server (port 3000), tRPC endpoint at /trpc
apps/web/         – Next.js 15 App Router frontend (port 3001)
packages/api/     – All business logic: tRPC routers + use-case functions
packages/db/      – Prisma client + generated types (PostgreSQL)
packages/env/     – t3-oss env validation (separate server/web envs)
packages/schemas/ – Shared Zod schemas
packages/redis/   – ioredis wrapper
packages/s3/      – AWS SDK S3 client (MinIO in dev)
packages/mailer/  – Nodemailer wrapper (MailHog in dev)
packages/test/    – Shared Vitest config
```

### Request flow

Frontend → tRPC client (`@trpc/react-query`) → `apps/server` (Fastify + `fastifyTRPCPlugin`) → `packages/api` routers → use-case functions → `packages/db` / `packages/redis` / `packages/s3`

Avatar uploads go to a separate `POST /upload-avatar` route on the Fastify server (using `@fastify/multipart`) rather than through tRPC.

### Auth

- **Access token**: short-lived JWT in `Authorization: Bearer` header
- **Refresh token**: long-lived RSA-signed JWT in an `httpOnly` cookie
- Sessions are stored in Redis so they can be listed and individually revoked
- `authenticatedProcedure` in `packages/api` validates the access token and injects `userId` into tRPC context

### Business logic pattern

Use-cases in `packages/api/src/use-cases/` receive all dependencies (repositories, JWT signers, mailer, etc.) as constructor/function parameters — making them fully unit-testable with fakes. Test fakes live in `packages/api/test/`.

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
