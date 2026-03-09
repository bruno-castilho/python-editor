# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based Python IDE built as a TypeScript monorepo. Python code runs **client-side via Pyodide Web Worker** — the server handles auth, not code execution. Stack: Next.js 16 (web) + Fastify 5 (server) + tRPC 11 + Prisma 7 + PostgreSQL + Redis.

## Commands

All commands run from the repo root via Turborepo:

```bash
npm run dev              # Start all apps (web :3001, server :3000)
npm run dev:web          # Web only
npm run dev:server       # Server only
npm run build            # Build all
npm run check-types      # Type-check all (no emit)
npm run lint             # Check ESLint
npm run lint:fix         # Fix ESLint issues
npm run test             # Run all Vitest tests
npm run test:watch       # Vitest watch mode
npm run db:push          # Push Prisma schema to DB
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Create new migration
npm run db:studio        # Open Prisma Studio
```

Environment setup: copy/create `apps/server/.env` with `DATABASE_URL`, JWT secrets, Redis URL, SMTP config. See `packages/env/` for all required vars.

## Architecture

### Monorepo Structure

```
apps/web/        # Next.js 16 App Router frontend
apps/server/     # Fastify 5 entry point (thin — just mounts tRPC)
packages/api/    # tRPC routers + all business logic (clean architecture)
packages/db/     # Prisma schema + client
packages/env/    # Type-safe env vars (@t3-oss/env) — dual export: ./server, ./web
packages/schemas/# Shared Zod validation schemas (DTOs)
packages/mailer/ # Nodemailer singleton
packages/redis/  # ioredis singleton
packages/config/ # Shared tsconfig.base.json
packages/eslint/ # Shared ESLint flat config
packages/test/   # Shared Vitest config
```

Packages have **no build step** — they export TypeScript directly; consumers resolve types at build time. All packages are ESM-only.

### API Layer — Clean Architecture (`packages/api/`)

All business logic lives here, not in the Fastify server:
- **Use cases** — classes with `execute()` method (e.g., `RegisterUserUseCase`, `SignInUseCase`)
- **Repository interfaces** — `IUsersRepository`, `IHasher`, `IToken`, etc. (dependency inversion)
- **Factories** (`make-*.ts`) — instantiate use cases with real implementations
- **Prisma repositories** — concrete implementations of interfaces
- **tRPC routers** — thin layer that calls factories, maps domain errors to `TRPCError`
- **Tests** — co-located `.spec.ts` files using manual fakes (no mocking framework)

Domain error classes (e.g., `UserAlreadyExistsError`) are thrown by use cases and caught in routers.

### tRPC

Modular routers merged into `appRouter`. Uses `publicProcedure` and authenticated procedures. Input validated by Zod schemas from `@python-editor/schemas`. The Fastify request/response context is passed through for cookie management (httpOnly refresh tokens).

### Frontend (`apps/web/`)

- App Router with `use client` only on interactive components
- React Hook Form + Zod resolver using schemas from `@python-editor/schemas`
- React Query (TanStack) + tRPC client for all server state
- Monaco Editor for Python editing; Pyodide runs in a Web Worker
- COOP/COEP headers enabled in `next.config.ts` (required for SharedArrayBuffer/Pyodide)
- React Compiler (Babel plugin) enabled — no need for manual `useMemo`/`useCallback`

### Database

User model: `id` (UUIDv7), `name`, `lastName`, `email` (unique), `hashedPassword`, `emailVerified`, `createdAt`. Passwords are never exposed — `findByEmail()` omits `hashedPassword`; only `findByEmailWithPassword()` includes it.

## Conventions

- **User-facing messages** are in Portuguese (pt-BR) — validation errors, API responses
- Use `import type` for type-only imports (`verbatimModuleSyntax` is enabled)
- Path alias `@/*` maps to `./src/*` in both apps
- UUIDv7 for all entity IDs
- Per-package CLAUDE.md files exist in each `apps/` and `packages/` directory for detailed guidance
