# Quickstart: User Avatar Upload

**Branch**: `001-user-avatar-upload` | **Date**: 2026-03-16

Developer guide for implementing the avatar upload feature end-to-end.

---

## Prerequisites

- Node.js 22, npm 11
- PostgreSQL running (see `apps/server/.env`)
- An S3-compatible storage bucket (AWS S3, Cloudflare R2, or MinIO)
- All existing env vars configured

---

## Step 1 — Install New Dependencies

```bash
# New workspace package (created in Step 4a)
# @aws-sdk/client-s3 goes into packages/storage
npm install @aws-sdk/client-s3 --workspace=packages/storage

# Fastify multipart plugin for the upload route
npm install @fastify/multipart --workspace=apps/server
```

---

## Step 2 — Configure Environment Variables

Add to `apps/server/.env`:

```env
# S3-compatible object storage
# For Cloudflare R2:
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_REGION=auto
# For AWS S3 (omit STORAGE_ENDPOINT entirely):
# STORAGE_REGION=us-east-1
# For MinIO:
# STORAGE_ENDPOINT=http://localhost:9000
# STORAGE_REGION=us-east-1

STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_BUCKET=your-bucket-name
STORAGE_PUBLIC_URL=https://your-cdn-or-bucket-url.com
```

> `STORAGE_ENDPOINT` is optional — omit entirely for native AWS S3.
> `STORAGE_PUBLIC_URL` is the base used to construct avatar URLs:
> final URL = `${STORAGE_PUBLIC_URL}/${avatarKey}`

---

## Step 3 — Run Database Migration

```bash
# From repo root
npm run db:migrate
```

This renames the `avatarUrl` column to `avatar` and drops the empty-string default.

---

## Step 4 — New Files to Create (implementation order)

### 4a. New `packages/storage` Package

Create `packages/storage/package.json`:
```json
{
  "name": "@python-editor/storage",
  "type": "module",
  "exports": {
    "./*": { "default": "./src/*.ts" }
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3",
    "@python-editor/env": "*"
  },
  "devDependencies": {
    "@python-editor/config": "*",
    "@types/node": "^22",
    "typescript": "^5"
  }
}
```

Files:
```
packages/storage/src/interfaces/storage-service.ts
packages/storage/src/s3-storage-service.ts
```

`IStorageService` interface:
```typescript
export interface IStorageService {
  upload(params: {
    key: string
    body: Buffer | NodeJS.ReadableStream
    contentType: string
  }): Promise<void>

  getPublicUrl(params: { key: string }): string

  delete(params: { key: string }): Promise<void>
}
```

`S3StorageService` uses `@aws-sdk/client-s3` `PutObjectCommand` and `DeleteObjectCommand`.
Configure `S3Client` with `forcePathStyle: !!env.STORAGE_ENDPOINT` for MinIO/R2.

Also add `@python-editor/storage: "*"` to `packages/api/package.json` dependencies.

### 4b. Domain Errors

```
packages/api/src/use-cases/errors/invalid-image-type-error.ts
packages/api/src/use-cases/errors/image-too-large-error.ts
```

Pattern (mirrors `UserAlreadyExistsError`):
```typescript
export class InvalidImageTypeError extends Error {
  constructor() {
    super('Only JPEG, PNG, and WebP images are accepted.')
  }
}
```

### 4c. Fake for Tests

```
packages/api/test/storage/fake-storage-service.ts
```

In-memory implementation of `IStorageService`:
- `upload`: stores `{ contentType, size }` in a `Map<key, ...>`.
- `getPublicUrl`: returns `https://fake-storage.test/${key}`.
- `delete`: removes entry from the map.

### 4d. Zod Schema

```
packages/schemas/src/upload-avatar.ts
```

See [contracts/trpc-users-avatar.md](./contracts/trpc-users-avatar.md) for schema shape.

### 4e. Update `IUsersRepository`

Add `updateAvatar` method to interface + `UsersRepository` + `FakeUsersRepository`.

### 4f. Use Cases

```
packages/api/src/use-cases/upload-avatar.ts    + .spec.ts
packages/api/src/use-cases/remove-avatar.ts    + .spec.ts
```

Inject: `IUsersRepository` + `IStorageService`.
Test with: `FakeUsersRepository` + `FakeStorageService`.

`UploadAvatarUseCase.execute({ userId, fileBuffer, contentType, fileSize })`:
1. Validate `contentType` → throw `InvalidImageTypeError` if invalid.
2. Validate `fileSize` → throw `ImageTooLargeError` if > 5 MB.
3. Find user → throw `UserDoesNotExistsError` if not found.
4. If user has existing `avatar` key → call `storageService.delete({ key })`.
5. Generate new UUIDv7 key.
6. Call `storageService.upload({ key, body: fileBuffer, contentType })`.
7. Call `usersRepository.updateAvatar({ userId, avatarKey: key })`.
8. Return `{ avatarUrl: storageService.getPublicUrl({ key }) }`.

### 4g. Factories

```
packages/api/src/use-cases/factories/make-upload-avatar.ts
packages/api/src/use-cases/factories/make-remove-avatar.ts
```

Wire `UsersRepository` + `S3StorageService` (no DI container).

### 4h. Error Handler + tRPC Router

```
packages/api/src/routers/error-handlers/remove-avatar-error-handler.ts
```

Add `removeAvatar` mutation to `usersRouter`.
Update `getProfile` to include `avatarUrl` in the response (derive from key via
`storageService.getPublicUrl`).

### 4i. Fastify Multipart Route

In `apps/server/src/index.ts`:
```typescript
import fastifyMultipart from '@fastify/multipart'
import { makeUploadAvatar } from '@python-editor/api/use-cases/factories/make-upload-avatar'

fastify.register(fastifyMultipart, {
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB hard cap
})

fastify.post('/api/users/avatar', { onRequest: [verifyJWT] }, async (request, reply) => {
  const data = await request.file()
  // validate, call UploadAvatarUseCase, return { avatarUrl }
})
```

### 4j. Frontend

**Profile page** (`apps/web/src/app/profile/page.tsx`):
1. Add file `<input type="file" accept="image/jpeg,image/png,image/webp">` (hidden).
2. On file select: validate client-side with `uploadAvatarSchema`, show preview via
   `URL.createObjectURL(file)`.
3. On confirm: `POST /api/users/avatar` with `FormData`; on success, invalidate
   `getProfile` query.
4. On remove: call `trpc.users.removeAvatar.mutate()`; hide button when `avatarUrl` is null.

**Navigation user menu** (`apps/web/src/layouts/DefaultLayout/Header/user-menu/`):
1. Read `avatarUrl` from `getProfile` query.
2. Render MUI `<Avatar src={avatarUrl ?? undefined}>{initials}</Avatar>`.

---

## Step 5 — Run Tests

```bash
npm run test
```

Each use case has a co-located `.spec.ts`. The two new use cases each have:
- One happy-path test scenario (`should be able to...`)
- One test per domain error path (`should not be able to...`)

---

## Step 6 — Type Check & Lint

```bash
npm run check-types
npm run lint
```

Both must pass with zero errors before merging.

---

## Upload Flow — Quick Reference

```
Browser                          Server (Fastify)            Object Storage (S3)
  │                                    │                            │
  │─ select file ──────────────────────┤                            │
  │  validate (type + size, client)    │                            │
  │                                    │                            │
  │─ POST /api/users/avatar ──────────►│                            │
  │  multipart/form-data               │─ validate (type + size) ───┤
  │                                    │─ delete old key (if any) ──►│
  │                                    │─ generateUUID ─────────────┤
  │                                    │─ upload stream ────────────►│
  │                                    │─ UPDATE users.avatar ──────►│ (DB)
  │◄──────── { avatarUrl } ────────────│                            │
  │                                    │                            │
  │  invalidate getProfile query       │                            │
```
