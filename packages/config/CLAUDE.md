# packages/config

Shared configuration package for the `@python-editor` monorepo. Contains no source code — only configuration files consumed by other packages.

## Architecture

This package is a thin configuration-only workspace package. Other packages extend its configs rather than duplicating settings.

## Key Files

- `tsconfig.base.json` — Base TypeScript configuration extended by all other packages/apps.
- `package.json` — Declares this as `@python-editor/config`, private, no dependencies.

## tsconfig.base.json Conventions

- **Target/Module**: `ESNext` with `bundler` module resolution (assumes Vite or similar bundler).
- **Strict mode**: Full strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`).
- **verbatimModuleSyntax**: Enabled — use `import type` for type-only imports.
- **isolatedModules**: Enabled — each file must be independently compilable.
- **Path alias**: `@/*` maps to `./src/*` (consumers override this to point to their own `src/`).

## Usage

Other packages extend this config:
```json
{ "extends": "@python-editor/config/tsconfig.base.json" }
```
