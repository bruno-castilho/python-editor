# @python-editor/env

Shared environment variable validation package. Provides type-safe, validated env configs for both the server and web (Next.js) apps using `@t3-oss/env` and `zod`.

## Architecture

Two separate entry points, each exporting a single `env` object:

- `./server` → `src/server.ts` — Node/server-side env vars (loaded via `dotenv/config`)
- `./web` → `src/web.ts` — Next.js client-side env vars (`NEXT_PUBLIC_*` only)

Consumers import directly from the sub-path export, e.g.:
```ts
import { env } from '@python-editor/env/server'
import { env } from '@python-editor/env/web'
```

## Key Files

| File | Purpose |
|---|---|
| `src/server.ts` | Server env schema: `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_PRIVATE_KEY`, `REFRESH_TOKEN_PUBLIC_KEY`, `REDIS_URL`, `SMTP_*` |
| `src/web.ts` | Web env schema: `NEXT_PUBLIC_SERVER_URL` |
| `package.json` | Defines dual sub-path exports (`./server`, `./web`) |

## Coding Conventions

- All schemas use `zod` for validation; `emptyStringAsUndefined: true` is set on all `createEnv` calls.
- Server uses `@t3-oss/env-core`; web uses `@t3-oss/env-nextjs`.
- `server.ts` imports `dotenv/config` at the top to load `.env` before validation.
- ESM-only package (`"type": "module"`), exports source TypeScript directly (no build step).
- When adding a new variable: add the zod schema field and the `runtimeEnv` mapping in the appropriate file.