# API Contract: Users Avatar

**Branch**: `001-user-avatar-upload` | **Date**: 2026-03-16

---

## REST Endpoint: Upload Avatar

### `POST /api/users/avatar`

**Handler**: Fastify multipart route in `apps/server/src/index.ts`
**Auth**: Bearer JWT (`Authorization` header) — same token used by tRPC calls
**Content-Type**: `multipart/form-data`
**Field name**: `avatar` (file)

#### Request

```
POST /api/users/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data; boundary=...

--boundary
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<binary file data>
--boundary--
```

#### Output (success — 200)

```typescript
{
  avatarUrl: string  // full public URL: `${STORAGE_PUBLIC_URL}/${key}`
}
```

#### Errors

| HTTP Status | Condition | Body |
|-------------|-----------|------|
| `400` | Invalid MIME type (`InvalidImageTypeError`) | `{ message: 'Only JPEG, PNG, and WebP images are accepted.' }` |
| `400` | File too large (> 5 MB) — caught by `@fastify/multipart` or use case | `{ message: 'File must be smaller than 5 MB.' }` |
| `401` | Missing or invalid JWT | `{ message: 'Unauthorized.' }` |
| `404` | User not found (`UserDoesNotExistsError`) | `{ message: 'User not found.' }` |

#### Side effects

1. Reads the user's current `avatar` key from DB.
2. If a previous key exists, deletes the corresponding object from storage.
3. Generates a new UUIDv7 key.
4. Uploads the file stream to S3 via `IStorageService.upload()`.
5. Saves the new key to `users.avatar`.

#### Client usage

```typescript
const formData = new FormData()
formData.append('avatar', file)

const response = await fetch('/api/users/avatar', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  body: formData,
})

const { avatarUrl } = await response.json()
queryClient.invalidateQueries(trpc.users.getProfile.queryOptions())
```

---

## Zod Schema (client-side validation)

**File**: `packages/schemas/src/upload-avatar.ts`
**Package**: `@python-editor/schemas`

```typescript
import z from 'zod'

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  // 5 MB

export const uploadAvatarSchema = z.object({
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    message: 'Only JPEG, PNG, and WebP images are accepted.',
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, {
      message: 'File must be smaller than 5 MB.',
    }),
})

export type UploadAvatarDTO = z.infer<typeof uploadAvatarSchema>
```

Used by the profile page component to validate before the `fetch` call.
The same constraints are enforced server-side by `UploadAvatarUseCase`.

---

## tRPC Procedures (Users Router)

**Router file**: `packages/api/src/routers/users.ts`
**Schema package**: `@python-editor/schemas`

All procedures require authentication (`authenticatedProcedure`). `userId` is taken
from `ctx.session.userId` — never passed as input.

---

### `users.removeAvatar`

**Type**: `authenticatedProcedure` → mutation
**Schema**: none (no input)

#### Input

None.

#### Output (success)

```typescript
{
  message: string  // 'Avatar removed successfully!'
}
```

#### Errors (tRPC BAD_REQUEST)

| Domain Error | Message |
|--------------|---------|
| `UserDoesNotExistsError` | `'User not found.'` |

#### Side effects

1. Fetches the user's current `avatar` key.
2. If a key exists, deletes the object from storage.
3. Sets `users.avatar = null`.

#### Client usage

```typescript
await trpc.users.removeAvatar.mutate()
queryClient.invalidateQueries(trpc.users.getProfile.queryOptions())
```

---

## Modified tRPC Procedure

### `users.getProfile` — output change

The existing `getProfile` procedure returns `{ user }`. After this feature, the router
enriches the response with a derived `avatarUrl`:

```typescript
// Before:
return { user }

// After:
return {
  user: {
    ...user,
    avatarUrl: user.avatar
      ? storageService.getPublicUrl({ key: user.avatar })
      : null,
  },
}
```

---

## Error Handler Pattern

The `removeAvatar` procedure gets a co-located error handler following the existing pattern:

```typescript
// packages/api/src/routers/error-handlers/remove-avatar-error-handler.ts
import { TRPCError } from '@trpc/server'
import { UserDoesNotExistsError } from '../../use-cases/errors/user-does-not-exists-error'

export function removeAvatarErrorHandler(error: unknown): never {
  if (error instanceof UserDoesNotExistsError) {
    throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
  }
  throw error
}
```

The `POST /api/users/avatar` Fastify handler catches domain errors directly and maps
them to HTTP status codes (no tRPC error layer involved).
