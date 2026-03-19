# Data Model: User Avatar Upload

**Branch**: `001-user-avatar-upload` | **Date**: 2026-03-16

---

## Entities

### User (existing — modified)

No new table. The avatar is stored as a nullable key on the existing `users` row.

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | `String` | No | — | UUIDv7, existing PK |
| `name` | `String` | No | — | existing |
| `lastName` | `String` | No | — | existing |
| `email` | `String` | No | — | existing, unique |
| `hashedPassword` | `String` | No | — | existing |
| `emailVerified` | `Boolean` | No | `false` | existing |
| `createdAt` | `DateTime` | No | `now()` | existing |
| `avatar` | `String?` | **Yes** | `null` | **Modified** — UUIDv7 storage key; `null` = no avatar |

> **Note**: The previous migration (`20260313231706_add_avatar_url_to_users`) added
> `"avatarUrl" TEXT`. The schema on this branch renamed the field to `avatar` and removed
> `@default("")`. A reconciliation migration is required to rename the DB column.

### Avatar (logical, not a DB table)

The avatar is not persisted as a separate entity. Its properties are:

| Property | Source | Description |
|----------|--------|-------------|
| `key` | `users.avatar` (DB) | UUIDv7 identifier; used as the object storage key |
| `url` | Derived at read time | `${STORAGE_PUBLIC_URL}/${key}` — constructed in use case / repository read path |
| `contentType` | S3 object metadata | Set when uploading; not stored in DB |

---

## Prisma Schema Changes

```prisma
model User {
  id             String   @id
  name           String
  lastName       String
  email          String   @unique
  hashedPassword String
  emailVerified  Boolean  @default(false)
  createdAt      DateTime @default(now())
  avatar         String?  // UUIDv7 storage key; null = no avatar

  @@map("users")
}
```

Changes from current schema:
- Remove `@default("")` from `avatar` — `null` is the correct sentinel for "no avatar".
- Rename underlying DB column from `avatarUrl` to `avatar` (see migration below).

---

## Migration

```sql
-- Rename column avatarUrl → avatar and set null default
ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar";
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT NULL;

-- Update any existing empty-string values to null
UPDATE "users" SET "avatar" = NULL WHERE "avatar" = '';
```

*(Prisma `db migrate` will generate this from the schema diff. The UPDATE guard handles
any rows written before this migration.)*

---

## IUsersRepository Interface — New Method

```typescript
// packages/api/src/repositories/interfaces/users-repository.ts
updateAvatar(params: {
  userId: string
  avatarKey: string | null   // null = remove avatar
}): Promise<void>
```

Also, `findById` returns `UserWithoutPassword` which includes `avatar: string | null`.
The public-facing user type already carries the `avatar` field; no new type is needed.

---

## State Transitions

```
No avatar (avatar = null)
    │
    ├─ uploadAvatar(file) → Has avatar (avatar = UUIDv7 key)
    │
    └─ (remove button hidden)

Has avatar (avatar = UUIDv7 key)
    │
    ├─ uploadAvatar(file) → Has avatar (avatar = newKey)
    │                       [old key deleted from storage before upload]
    │
    └─ removeAvatar → No avatar (avatar = null)
                      [old key deleted from storage]
```

---

## Validation Rules

| Rule | Enforced At | Detail |
|------|-------------|--------|
| Accepted MIME types | Client + `UploadAvatarUseCase` | `image/jpeg`, `image/png`, `image/webp` |
| Max file size | Client + `@fastify/multipart` limits + `UploadAvatarUseCase` | ≤ 5,242,880 bytes (5 MB) |
| Authenticated | Fastify auth middleware + `authenticatedProcedure` | Upload route + removeAvatar |
| User exists | `UploadAvatarUseCase`, `RemoveAvatarUseCase` | Throws `UserDoesNotExistsError` |

---

## Object Storage Layout

```
{STORAGE_BUCKET}/
└── {uuidv7}          ← flat structure; each avatar is a root-level object
```

- Key: UUIDv7 (e.g., `019613ab-5f3e-7000-b123-0242ac130002`)
- Content-Type: provided by client in the multipart `Content-Type` field
- Public URL: `{STORAGE_PUBLIC_URL}/{key}`
- No expiry: objects persist until explicitly deleted via `removeAvatar` or avatar replacement

---

## New Domain Error Classes

| Class | File | Thrown When |
|-------|------|-------------|
| `InvalidImageTypeError` | `packages/api/src/use-cases/errors/invalid-image-type-error.ts` | `contentType` not in accepted list |
| `ImageTooLargeError` | `packages/api/src/use-cases/errors/image-too-large-error.ts` | `fileSize` > 5 MB |
