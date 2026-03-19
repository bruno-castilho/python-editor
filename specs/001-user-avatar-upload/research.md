# Research: User Avatar Upload

**Branch**: `001-user-avatar-upload` | **Date**: 2026-03-16

---

## 1. Upload Strategy — Server-Side Multipart

**Decision**: Single-step server-side upload via `POST /api/users/avatar` (Fastify multipart)

**Rationale**:
The avatar is limited to 5 MB, making it lightweight enough to route through the server
without significant memory pressure. A single Fastify multipart endpoint receives the file,
validates it, uploads it to S3 on behalf of the client, and saves the key to the DB — all
in one round trip. This eliminates the two-step pre-signed URL flow (request → PUT → confirm)
and results in a simpler client and a simpler use-case surface.

`@fastify/multipart` is the canonical Fastify plugin for this; it exposes the file as a
`Readable` stream that can be piped directly to `S3Client.send(PutObjectCommand)`, avoiding
full in-memory buffering for large files.

**Upload flow**:
1. Client selects file → shows local preview via `URL.createObjectURL()` — no server call.
2. Client validates MIME type and size client-side (Zod schema) → immediate feedback.
3. Client `POST /api/users/avatar` with `Content-Type: multipart/form-data`, file in field `avatar`.
4. Server parses multipart, re-validates (type, size), generates UUIDv7 key.
5. Server deletes old avatar from storage (if one exists).
6. Server uploads file stream to S3 via `IStorageService.upload()`.
7. Server saves new key to `users.avatar`; responds `{ avatarUrl }`.
8. Client invalidates `getProfile` React Query cache → avatar updates across UI.

**Alternatives considered**:
- *Pre-signed URL (two-step: request + confirm)*: adds round-trip complexity and a separate
  confirm mutation just to persist the key. Unnecessary for ≤5 MB files. Rejected.
- *Base64 in tRPC mutation*: payload 33% larger, hits 200ms p95 budget. Rejected.
- *Direct Fastify multipart without S3 piping (full buffer)*: acceptable for 5 MB but
  piping the stream is strictly better. Kept piping approach.

---

## 2. S3-Compatible Abstraction — `packages/storage`

**Decision**: New `packages/storage` package with `IStorageService` interface +
`S3StorageService` concrete implementation using `@aws-sdk/client-s3`

**Rationale**:
The constitution mandates dependency inversion and shared logic in `packages/`. A dedicated
`packages/storage` package owns the S3 dependencies and keeps `packages/api/` free from
direct SDK imports. `IStorageService` is injected into use cases via the factory; switching
providers (AWS S3 → Cloudflare R2 → MinIO) requires only changing env vars.

**`IStorageService` interface** (server-side upload; no pre-signed URL needed):
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

**`S3Client` configuration pattern** (provider-agnostic):
```typescript
new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT ?? undefined,  // omit for native AWS S3
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: !!env.STORAGE_ENDPOINT,  // required for MinIO / R2
})
```

**`package.json` for `packages/storage`**:
- `name`: `@python-editor/storage`
- `type`: `module`
- `exports`: `"./*": { "default": "./src/*.ts" }`
- `dependencies`: `@aws-sdk/client-s3`, `@python-editor/env`

**Alternatives considered**:
- *Keep storage impl in `packages/api/`*: works, but buries S3 SDK imports inside the
  business logic package. A separate `packages/storage` is cleaner and consistent with
  how `packages/mailer` and `packages/redis` isolate infrastructure. Rejected in-package
  approach.
- *Hardcode AWS S3 SDK directly in use case*: violates Dependency Inversion (Principle I).
  Rejected.

---

## 3. Storage Key Strategy — UUIDv7

**Decision**: UUIDv7 generated server-side at upload time

**Rationale**:
The constitution mandates UUIDv7 for all new entity IDs. A UUIDv7 key is time-ordered,
unpredictable (not sequential integers), suitable as an object storage key, and consistent
with the project's existing ID strategy (`v7 as uuidv7` from `uuid` package). Only this
key is stored in `users.avatar` — no full URL in the database. The public URL is
constructed at read time: `${STORAGE_PUBLIC_URL}/${avatarKey}`.

**Key pattern**: `{uuidv7}` (e.g., `019613ab-5f3e-7000-b123-0242ac130002`)
**Object storage path**: `{bucket}/{uuidv7}` (flat; no prefix needed for single-entity use)

**Alternatives considered**:
- *UUID + file extension*: adds complexity without benefit (content type tracked via S3
  metadata). Rejected.
- *User ID as key*: predictable, leaks user identity. Rejected.

---

## 4. Database Field — `users.avatar`

**Decision**: Store only the UUIDv7 key in `users.avatar` (`String?`, null = no avatar)

**Rationale**:
The last migration (`20260313231706_add_avatar_url_to_users`) added column `avatarUrl TEXT`
but the Prisma schema on this branch was already modified to `avatar String? @default("")`.
A reconciliation migration must rename the DB column from `"avatarUrl"` to `"avatar"` and
drop the `@default("")` (null is the correct sentinel for "no avatar"). No new table is
needed; the user's avatar belongs directly to the `users` row.

**Migration action**: `ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar";`
(Prisma will generate this from schema diff)

**Alternatives considered**:
- *Separate `avatars` table*: unnecessary for a 1-to-1 relationship with no history
  requirement. Adds JOIN on every profile read. Rejected.
- *Store full URL in DB*: violates user requirement ("only the identifier is persisted").
  Breaks on CDN/domain change. Rejected.

---

## 5. File Validation Strategy

**Decision**: Double validation — client-side (Zod + File API) + server-side (use case)

**Rationale**:
- **Client-side** (immediate UX feedback): Zod schema validates `contentType` and
  `fileSize` before the fetch call. Accepted types: `image/jpeg`, `image/png`,
  `image/webp`. Max size: 5 MB (5 × 1024 × 1024 bytes). This is the same Zod schema
  (`@python-editor/schemas/upload-avatar`) used conceptually on the server — one source
  of truth per Principle III.
- **Server-side** (trust boundary): `UploadAvatarUseCase.execute()` re-validates the
  same constraints after parsing the multipart payload. Throws `InvalidImageTypeError`
  or `ImageTooLargeError` as typed domain errors.
- **Transport-level**: `@fastify/multipart` is configured with `limits.fileSize` set to
  5 MB as a hard server-side cap before the use case is even reached.

**Accepted MIME types** (FR-002 + spec): `image/jpeg`, `image/png`, `image/webp`
**Max file size** (FR-003): 5 × 1024 × 1024 = 5,242,880 bytes

**Alternatives considered**:
- *Server-only validation*: poor UX — user waits for round-trip before seeing error.
  Rejected.

---

## 6. Avatar Replacement & Orphaned Files

**Decision**: Inside `UploadAvatarUseCase`, delete the previous avatar key from storage
before uploading the new file and saving the new key to the DB.

**Rationale**:
When a user replaces their avatar, the old file in object storage must be removed to avoid
accumulating orphaned objects. The `UploadAvatarUseCase` fetches the user's current
`avatar` key, issues a `IStorageService.delete()` call if a key exists, then uploads
the new file and updates the DB with the new key. This is done in the use case (not the
router) to keep the operation atomic from the application's perspective.

**Edge case — rapid successive uploads**: Because the upload now goes through the server,
the server naturally serializes requests per user. Concurrent uploads from the same user
are unlikely at 5 MB; this edge case is out of scope for this iteration.

---

## 7. Frontend Avatar Display Locations

**Minimum required** (from spec Assumptions section):
1. **Profile settings page** (`apps/web/src/app/profile/page.tsx`) — add file input,
   preview, and single `fetch` to `POST /api/users/avatar`.
2. **Top navigation bar** — `apps/web/src/layouts/DefaultLayout/Header/user-menu/` renders
   user identity; add MUI `Avatar` with `avatarUrl` from `getProfile` query.

**Placeholder**: MUI `Avatar` with `children` set to user initials when `avatarUrl` is
null. No broken-image states.

---

## 8. New Environment Variables

Added to `packages/env/server.ts` (validated at startup — hard failure if missing):

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_ENDPOINT` | Optional | Custom endpoint URL (Cloudflare R2, MinIO). Omit for native AWS S3. |
| `STORAGE_REGION` | Required | e.g., `us-east-1`, `auto` (R2) |
| `STORAGE_ACCESS_KEY_ID` | Required | S3 access key |
| `STORAGE_SECRET_ACCESS_KEY` | Required | S3 secret key |
| `STORAGE_BUCKET` | Required | Bucket name |
| `STORAGE_PUBLIC_URL` | Required | Base URL for public avatar URLs (e.g., CDN or bucket URL) |

---

## 9. New Packages Required

| Package | Where | Purpose |
|---------|-------|---------|
| `@aws-sdk/client-s3` | `packages/storage` | S3-compatible SDK for upload and delete |
| `@fastify/multipart` | `apps/server` | Parse multipart/form-data in Fastify |

`packages/storage` itself is a new workspace package added to `packages/storage/package.json`
and referenced from `packages/api/package.json` as `@python-editor/storage: "*"`.
