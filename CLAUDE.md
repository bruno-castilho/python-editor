# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Turborepo monorepo for a full-stack TypeScript application using the Better-T-Stack template. The project name is `python-editor` (internal package scope: `@python-editor/`).

## Common Commands

```bash
# Development
npm run dev              # Start all apps (web on :3001, server on :3000)
npm run dev:web          # Web only
npm run dev:server       # Server only

# Build & Type checking
npm run build            # Build all apps
npm run check-types      # Run TypeScript type checking across all packages
npm run lint             # Lint all packages
npm run lint:fix         # Auto-fix lint issues

# Database (via Turbo, runs in packages/db context)
npm run db:push          # Push schema to database (no migration files)
npm run db:migrate       # Create and apply a migration
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:studio        # Open Prisma Studio

# Testing
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test packages/test  # Run tests in a specific package
```

## Architecture

### Monorepo Layout

```
apps/web        → Next.js frontend (port 3001)
apps/server     → Fastify backend (port 3000)
packages/api    → tRPC routers + service implementations
packages/db     → Prisma ORM, repository implementations, DB interfaces
packages/cryptography → Password hashing (bcryptjs, 6 rounds)
packages/schemas      → Zod validation schemas (Portuguese error messages)
packages/env          → T3 Env environment variable validation
packages/test         → Shared Vitest config + fake implementations for tests
packages/config       → Shared tsconfig.base.json
packages/eslint       → Shared ESLint config (Rocketseat preset)
```

### Request Flow

```
Web (Next.js) → tRPC client → Fastify server → packages/api (routers + services)
                                                      ↓
                                               packages/db (repositories)
                                                      ↓
                                               PostgreSQL
```

The `apps/server` is a thin Fastify wrapper — all business logic lives in `packages/api`.

### Key Architectural Patterns

**Dependency Injection via Factories**: Services and repositories are constructed in factory files (e.g., `packages/api/src/services/users/factories/make-register-user-service.ts`). Tests substitute fakes from `packages/test`.

**Repository + Interface Pattern**: `packages/db` exports both the Prisma implementation (`PrismaUsersRepository`) and the interface (`UsersRepository`). Services depend on the interface; factories wire in the concrete implementation.

**Environment Variables**: All env vars are validated at startup via `packages/env`. Server vars (`DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`) are in `packages/env/server.ts`; client-side vars (`NEXT_PUBLIC_SERVER_URL`) are in `packages/env/web.ts`.

### tRPC Setup

- The `appRouter` is defined in `packages/api/src/routers/index.ts` and re-exported for use in both `apps/server` (handler registration) and `apps/web` (type inference for the client).
- The web app configures the tRPC client in `apps/web/src/utils/trpc.ts`.
- `apps/web/src/providers/TanstackProvider.tsx` wraps the app with TanStack Query + tRPC provider.

### Prisma Client

The Prisma client is generated into `packages/db/prisma/generated/` in ESM format using `@prisma/adapter-pg`. After any schema change run `npm run db:generate`.

### Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, MUI v7, TanStack Query, React Hook Form |
| Backend | Fastify 5, tRPC 11 |
| API | tRPC (type-safe RPC, no REST) |
| Database | PostgreSQL via Prisma 7 + pg adapter |
| Validation | Zod 4 |
| Auth/Crypto | bcryptjs |
| Styling | TailwindCSS 4, Emotion, custom MUI "Radioactive Nebula" theme |
| Testing | Vitest |
| Monorepo | Turborepo |
