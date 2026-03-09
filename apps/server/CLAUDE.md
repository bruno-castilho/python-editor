# Server Module

## Build & Dev Commands

```bash
# Development (watch mode)
npm run dev        # tsx watch src/index.ts

# Build
npm run build      # tsdown (ESM bundle to dist/)

# Type check
npm run check-types  # tsc -b

# Production start
npm run start      # node dist/index.mjs

# Compile to standalone binary
npm run compile    # bun build --compile -> ./server binary
```

## Architecture Overview

Thin HTTP server entry point. All business logic lives in `@python-editor/api`.

- **Framework**: Fastify v5
- **API layer**: tRPC mounted at `/trpc`, router and context imported from `@python-editor/api`
- **Build**: `tsdown` bundles to ESM; `@python-editor/*` workspace packages are inlined (not externalized)
- **Path alias**: `@/*` maps to `./src/*`

## Key Files

| File | Purpose |
|---|---|
| `src/index.ts` | Server entry — registers CORS, cookie, tRPC plugin, starts on port 3000 |
| `tsdown.config.ts` | Build config; inlines all `@python-editor/*` workspace packages |
| `tsconfig.json` | Extends `@python-editor/config/tsconfig.base.json`, composite mode |
| `package.json` | Scripts and dependencies |

## Coding Conventions

- ESM-only (`"type": "module"`)
- TypeScript strict mode via shared `@python-editor/config` base tsconfig
- Env vars accessed via `@python-editor/env/server` (not `process.env` directly)
- CORS credentials enabled; `CORS_ORIGIN` configured via env
- Health check: `GET /` returns `"OK"`
- Port hardcoded to `3000`, host `0.0.0.0`
