# packages/test

Shared Vitest configuration package for the monorepo. Consumed by other packages/apps to get a consistent test setup.

## Architecture

A minimal utility package with a single export: a pre-configured `vitest` config object.

```
src/
  index.ts   — exports a defineConfig() with shared Vitest settings
package.json — declares the package and its exports
```

## Key Files

| File | Purpose |
|---|---|
| `src/index.ts` | Vitest config: `globals: true`, `environment: 'node'` |
| `package.json` | Package entry — exports `src/index.ts` directly (ESM, no build step) |

## Coding Conventions

- **No build step** — `exports` points directly at the TypeScript source (`./src/index.ts`). Consumers resolve TS at their own build time.
- **ESM only** — `"type": "module"` in `package.json`.
- `dotenv` is a runtime dependency (consumers can load `.env` files in tests).
- `@python-editor/config` is a dev dependency used for shared TypeScript/tooling config.
- Keep this package minimal — it is infrastructure, not application code.
