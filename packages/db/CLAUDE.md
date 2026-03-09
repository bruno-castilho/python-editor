# @python-editor/db

Database package for the monorepo. Provides a configured Prisma client and exports all generated types.

## Architecture Overview

```
packages/db/
├── src/
│   └── index.ts              # Single entry point: exports prisma client + all types
├── prisma/
│   ├── schema/
│   │   └── schema.prisma     # Data model definitions
│   ├── migrations/           # SQL migration history
│   └── generated/            # Auto-generated Prisma client (do not edit)
├── prisma.config.ts          # Prisma CLI config (loads .env from apps/server)
├── package.json
└── tsconfig.json
```

## Key Files

- `src/index.ts` — Instantiates `PrismaClient` with the `@prisma/adapter-pg` driver and re-exports all generated types. This is the only import consumers need.
- `prisma/schema/schema.prisma` — Source of truth for the database schema. Uses ESM output + Node.js runtime.
- `prisma.config.ts` — Points Prisma CLI to `../../apps/server/.env` for `DATABASE_URL`.

## Database

- **Provider:** PostgreSQL (via `pg` + `@prisma/adapter-pg`)
- **Connection:** `DATABASE_URL` from `apps/server/.env`

## Current Models

| Model | Table  | Key Fields |
|-------|--------|------------|
| User  | users  | id (String PK), name, lastName, email (unique), hashedPassword, emailVerified (bool), createdAt |

## DB Scripts

Run from this package directory (`packages/db`):

```bash
bun db:push        # Push schema to DB without migrations
bun db:generate    # Regenerate Prisma client after schema changes
bun db:migrate     # Create and apply a new migration
bun db:studio      # Open Prisma Studio (headless)
```

## Coding Conventions

- **ESM only** — `"type": "module"` in package.json; all imports use ESM syntax.
- **No build step for consumers** — exports point directly to `src/index.ts` (TypeScript source).
- **Single export** — consumers import the default prisma instance and types from `@python-editor/db`.
- **Generated code is off-limits** — never edit files under `prisma/generated/`; regenerate with `bun db:generate`.
- **Schema split** — schema lives in `prisma/schema/` directory (not a single file), configured via `prisma.config.ts`.
- **Type re-exports** — `export type * from '../prisma/generated/client'` keeps generated types accessible to consumers without direct dependency on `@prisma/client`.