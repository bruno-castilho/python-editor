# CLAUDE.md — `@python-editor/schemas`

Technical reference document for LLM sessions. Based exclusively on the package's actual code — no generic Zod explanations.

---

## Package role

Pure validation-contract layer: defines Zod schemas and their inferred TypeScript types (`*DTO`), shared between the backend and the frontend. **No business logic, no tests of its own.**

```
packages/schemas/src/*.ts
  ├── used as .input(schema) in   →  packages/trpc/src/routers/*.ts
  └── used as zodResolver(schema) →  apps/web/**/*.tsx (react-hook-form)
```

---

## File structure

```
package.json   ← exports every file individually via a wildcard, no barrel
tsconfig.json  ← only extends @python-editor/config/tsconfig.base.json
src/
  sign-in.ts
  register-user.ts
  upload-avatar.ts
  find-personal-projects.ts
  share-project.ts
  ...           ← 20 files total, all flat in src/, no subfolders
```

```json
// package.json
"exports": {
  "./*": { "default": "./src/*.ts" }
}
```

There is **no `index.ts`**. Every schema is imported directly by file path:

```typescript
import { signInSchema } from '@python-editor/schemas/sign-in'
```

Do not add a barrel file — it would not match how every existing consumer imports today.

---

## Schema file pattern

Every file follows the same three-part shape:

```typescript
// src/share-project.ts
import z from 'zod'

export const shareProjectSchema = z.object({
  projectId: z.uuid(),
  email: z.email({ message: 'Invalid email' }),
})

export type ShareProjectDTO = z.infer<typeof shareProjectSchema>
```

**Naming convention:**

| Element | Convention | Example |
|---|---|---|
| File name | kebab-case, named after the action/entity | `share-project.ts` |
| Schema variable | camelCase + `Schema` suffix | `shareProjectSchema` |
| Exported type | PascalCase + `DTO` suffix, via `z.infer` | `ShareProjectDTO` |

**Always export both** the schema and its inferred `DTO` type — never just one or the other.

---

## Zod v4 conventions

This package uses **Zod v4** (`^4.1.13`). Top-level string-format validators, not the v3 method-chain style:

```typescript
// CORRECT (Zod v4) — used throughout this package
z.email({ message: 'Invalid email' })
z.uuid()
z.uuidv7()

// WRONG (Zod v3 style — do not introduce)
z.string().email()
z.string().uuid()
```

### Cross-field validation — `.refine()`

`register-user.ts` validates that two fields match by wrapping `.object()` in `.refine()`:

```typescript
export const registerUserSchema = z
  .object({
    password: z.string().trim().min(8, { ... }).regex(/(?=.*[A-Z])/, { ... }),
    repeatPassword: z.string().trim().min(1, { message: 'This field cannot be empty' }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeat_password'],
    message: 'Passwords do not match',
  })
```

### Pagination — coerced numbers + enums with defaults

`find-personal-projects.ts` is the reference pattern for any paginated/sortable list input:

```typescript
export const findPersonalProjectsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'updatedAt']).default('updatedAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
})
```

`z.coerce.number()` is required because pagination params usually arrive as query-string strings.

### Local constants for file/upload validation

`upload-avatar.ts` defines its accepted values as local constants instead of inline literals:

```typescript
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export const uploadAvatarSchema = z.object({
  contentType: z.enum(ACCEPTED_MIME_TYPES, { message: 'Only JPEG, PNG, and WebP images are accepted.' }),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, { message: 'File must be smaller than 5 MB.' }),
})
```

Export the constant (`MAX_FILE_SIZE_BYTES`) only when a consumer needs the same value outside the schema (e.g. to show a hint in the UI before submitting).

---

## How to add a new schema

**Checklist:**

- [ ] **1.** Create `src/<action-name>.ts` (kebab-case, named after the action/entity, not the router)
- [ ] **2.** Write the schema with `z.object({...})`, using Zod v4 top-level validators (`z.email()`, `z.uuid()`, `z.uuidv7()`)
- [ ] **3.** Export the inferred type: `export type XxxDTO = z.infer<typeof xxxSchema>`
- [ ] **4.** No change needed in `package.json` or any index — the wildcard export already covers the new file
- [ ] **5.** Wire it up where it's consumed:
  - tRPC procedure: `.input(xxxSchema)` in `packages/trpc/src/routers/*.ts` (see that package's CLAUDE.md)
  - Form: `useForm<XxxDTO>({ resolver: zodResolver(xxxSchema) })` in `apps/web`

**Template:**

```typescript
import z from 'zod'

export const myActionSchema = z.object({
  // fields, with a { message: '...' } on each user-facing constraint
})

export type MyActionDTO = z.infer<typeof myActionSchema>
```

---

## Pitfalls and anti-patterns

### 1. Adding an `index.ts` barrel

```typescript
// WRONG — no consumer imports this way, and package.json's wildcard export doesn't need it
export * from './sign-in'
export * from './register-user'
```

Every existing import is `from '@python-editor/schemas/<file-name>'`. Adding a barrel creates a second, inconsistent way to import and is not needed for the wildcard export to work.

### 2. Translating error messages to Portuguese

All current `{ message: '...' }` strings are in English (`'Invalid email'`, `'Password must be at least 8 characters'`), even though the rest of the product is PT-BR. Keep new messages in English to stay consistent with existing schemas — do not translate ad hoc on a per-file basis.

### 3. Re-deriving the password regex differently per file

`sign-in.ts` and `register-user.ts` both duplicate the same three password `.regex()` rules verbatim. This duplication is the existing pattern (no shared helper exists yet) — when adding another schema with the same rule, copy the exact same three regexes rather than writing a new, slightly different version that could silently diverge.

### 4. Using `z.string().email()` / `z.string().uuid()` (Zod v3 style)

```typescript
// WRONG
email: z.string().email()

// CORRECT — matches every existing schema in this package
email: z.email({ message: 'Invalid email' })
```

### 5. Expecting tests in this package

There are no `*.spec.ts` files here, and none should be added. Schema behavior is exercised indirectly through the consumers — a router test in `apps/server` or a use-case test in `packages/core`/`packages/trpc`. If a schema's logic is complex enough to need its own test, that's a signal to double-check the validation is actually necessary at this layer.

---

## Internal references

| What to do | Reference file |
|---|---|
| Simple field validation (email + password) | [src/sign-in.ts](src/sign-in.ts) |
| Cross-field validation with `.refine()` | [src/register-user.ts](src/register-user.ts) |
| Paginated/sortable list input | [src/find-personal-projects.ts](src/find-personal-projects.ts) |
| File upload validation with local constants | [src/upload-avatar.ts](src/upload-avatar.ts) |
| Minimal schema, no custom messages | [src/jwt-payload.ts](src/jwt-payload.ts) |
| Consuming a schema in a tRPC procedure | `packages/trpc/src/routers/auth.ts` — `signIn` |
| Consuming a schema + DTO in a form | `apps/web/src/app/(auth)/sign-in/components/SignInCard/index.tsx` |
