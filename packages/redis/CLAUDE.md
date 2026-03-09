# Redis Package

## Architecture Overview

Minimal singleton package that creates and exports a single shared `ioredis` Redis client instance. No classes, no abstraction layers — just a configured client ready to import.

## Key Files

- `src/index.ts` — Creates the Redis client using `REDIS_URL` from `@python-editor/env` and exports it as the default export.
- `package.json` — Package name: `@python-editor/redis`. ESM-only (`"type": "module"`). Exports root `.` directly from TypeScript source.

## Coding Conventions

- **ESM only**: `"type": "module"` in `package.json`; no CommonJS.
- **Direct TS source exports**: `exports` points to `./src/index.ts`, not a compiled output — consumers import TypeScript directly.
- **Singleton pattern**: One Redis instance created at module load time; all consumers share it via the default export.
- **Environment via shared package**: Redis URL comes from `@python-editor/env/server`, not `process.env` directly.
- **Dependency**: `ioredis ^5` is the Redis client library.
