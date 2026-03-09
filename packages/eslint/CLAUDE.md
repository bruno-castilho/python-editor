# packages/eslint

Shared ESLint flat config package for the monorepo. Consumed by other packages/apps via `@python-editor/eslint`.

## Architecture

Single-file package that exports a composed ESLint flat config array:

```
packages/eslint/
├── package.json       # Package manifest, ESM module
└── src/
    └── index.js       # Single export: flat config array
```

## Key Files

- `src/index.js` — The entire package. Exports a flat config array combining:
  1. Global ignores (`node_modules`, `dist`, `build`, `.next`, `coverage`)
  2. `@rocketseat/eslint-config/next` (via `FlatCompat` for legacy config compatibility)
  3. `typescript-eslint` recommended rules
  4. Rule overrides: `camelcase` and `no-useless-constructor` both disabled

## Coding Conventions

- **ESM only** — `"type": "module"` in `package.json`; use `import`/`export` syntax
- **No build step** — source in `src/` is consumed directly via `exports` field
- **FlatCompat** is used to bridge legacy shareable configs (like `@rocketseat`) into ESLint v9 flat config format
- Rule overrides go in the trailing config object in the exported array, scoped to `**/*.{ts,tsx,js,jsx}`

## Usage

In consuming packages, reference this config as:

```js
import baseConfig from '@python-editor/eslint'
export default [...baseConfig, /* local overrides */]
```