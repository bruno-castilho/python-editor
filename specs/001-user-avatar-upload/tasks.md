---

description: "Task list for User Avatar Upload feature implementation"
---

# Tasks: User Avatar Upload

**Input**: Design documents from `/specs/001-user-avatar-upload/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New package scaffolding, dependency installation, and environment configuration

- [X] T001 Create `packages/storage/package.json` with name `@python-editor/storage`, `"type": "module"`, exports `"./*": { "default": "./src/*.ts" }`, dependencies `@aws-sdk/client-s3` and `@python-editor/env`, devDependencies `@python-editor/config`, `@types/node`, `typescript`
- [X] T002 [P] Add `"@python-editor/storage": "*"` to dependencies in `packages/api/package.json`
- [X] T003 [P] Install `@fastify/multipart` in `apps/server` workspace (`npm install @fastify/multipart --workspace=apps/server`)
- [X] T004 [P] Add `STORAGE_ENDPOINT` (optional), `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_BUCKET`, and `STORAGE_PUBLIC_URL` to `packages/env/server.ts` validated at startup via `@t3-oss/env-core`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema reconciliation, storage abstraction layer, domain errors, and repository interface changes that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Update `packages/db/prisma/schema/schema.prisma`: remove `@default("")` from the `avatar` field so it becomes `avatar String?`
- [X] T006 Create reconciliation migration `packages/db/prisma/migrations/[timestamp]_rename_avatar_url_to_avatar/migration.sql` with: `ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar";`, `ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT NULL;`, `UPDATE "users" SET "avatar" = NULL WHERE "avatar" = '';`
- [X] T007 [P] Create `IStorageService` interface in `packages/storage/src/interfaces/storage-service.ts` with `upload(params: { key: string; body: Buffer | NodeJS.ReadableStream; contentType: string }): Promise<void>`, `getPublicUrl(params: { key: string }): string`, and `delete(params: { key: string }): Promise<void>`
- [X] T008 Create `S3StorageService` in `packages/storage/src/s3-storage-service.ts` implementing `IStorageService` using `@aws-sdk/client-s3` `PutObjectCommand` and `DeleteObjectCommand`; configure `S3Client` with `forcePathStyle: !!env.STORAGE_ENDPOINT`; `getPublicUrl` returns `` `${env.STORAGE_PUBLIC_URL}/${key}` ``
- [X] T009 [P] Create `FakeStorageService` in `packages/api/test/storage/fake-storage-service.ts` implementing `IStorageService`: in-memory `Map<string, { contentType: string }>` for `upload`/`delete`; `getPublicUrl` returns `` `https://fake-storage.test/${key}` ``
- [X] T010 [P] Create `uploadAvatarSchema` in `packages/schemas/src/upload-avatar.ts`: Zod object with `contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'])` and `fileSize: z.number().int().positive().max(5242880)`; export `UploadAvatarDTO` type
- [X] T011 [P] Create `InvalidImageTypeError` in `packages/api/src/use-cases/errors/invalid-image-type-error.ts` extending `Error` with message `'Only JPEG, PNG, and WebP images are accepted.'`
- [X] T012 [P] Create `ImageTooLargeError` in `packages/api/src/use-cases/errors/image-too-large-error.ts` extending `Error` with message `'File must be smaller than 5 MB.'`
- [X] T013 Add `updateAvatar(params: { userId: string; avatarKey: string | null }): Promise<void>` to `IUsersRepository` interface in `packages/api/src/repositories/interfaces/users-repository.ts`
- [X] T014 [P] Implement `updateAvatar()` in `UsersRepository` in `packages/api/src/repositories/users-repository.ts` using Prisma `users.update({ where: { id: userId }, data: { avatar: avatarKey } })`
- [X] T015 [P] Add `updateAvatar()` implementation to `FakeUsersRepository` in `packages/api/test/repositories/fake-users-repository.ts` updating the in-memory user record

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Upload Profile Avatar (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can upload a JPEG, PNG, or WebP image (≤ 5 MB) as their avatar, with client-side preview, server-side validation, S3 storage, and immediate UI feedback.

**Independent Test**: Navigate to profile settings → select a valid JPEG/PNG/WebP file under 5 MB → confirm upload → avatar appears in the profile area. Also verify: invalid file type is rejected with error, file over 5 MB is rejected with error, uploading a new image replaces the previous avatar.

- [X] T016 [US1] Create `UploadAvatarUseCase` in `packages/api/src/use-cases/upload-avatar.ts`: constructor receives `IUsersRepository` and `IStorageService`; `execute({ userId, fileBuffer, contentType, fileSize })` validates `contentType` (throws `InvalidImageTypeError`), validates `fileSize` (throws `ImageTooLargeError`), finds user by id (throws `UserDoesNotExistsError`), deletes existing `avatar` key from storage if present, generates UUIDv7 key via `v7 as uuidv7` from `uuid`, uploads buffer, calls `updateAvatar`, returns `{ avatarUrl: storageService.getPublicUrl({ key }) }`
- [X] T017 [US1] Create `UploadAvatarUseCase` tests in `packages/api/src/use-cases/upload-avatar.spec.ts` using `FakeUsersRepository` and `FakeStorageService`: happy path (avatar key saved, old key deleted), invalid MIME type, file too large, user not found, replaces existing avatar (old key deleted from storage before new upload)
- [X] T018 [US1] Create `makeUploadAvatar` factory in `packages/api/src/use-cases/factories/make-upload-avatar.ts` wiring `UsersRepository` and `S3StorageService`, returning a new `UploadAvatarUseCase` instance
- [X] T019 [US1] Register `@fastify/multipart` (with `limits: { fileSize: 5 * 1024 * 1024 }`) and `POST /api/users/avatar` authenticated route in `apps/server/src/index.ts`: parse multipart `avatar` field, convert to `Buffer`, call `makeUploadAvatar().execute()`, map `InvalidImageTypeError` → 400, `ImageTooLargeError` → 400, `UserDoesNotExistsError` → 404, return `{ avatarUrl }` on success
- [X] T020 [US1] Add avatar upload UI to `apps/web/src/app/profile/page.tsx`: hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`, client-side validation using `uploadAvatarSchema` (MIME type from `file.type`, size from `file.size`), image preview via `URL.createObjectURL(file)`, on confirm `POST /api/users/avatar` with `FormData`, on success invalidate `trpc.users.getProfile` query; show validation error messages inline

**Checkpoint**: User Story 1 fully functional — avatar upload works end-to-end

---

## Phase 4: User Story 2 — View Avatar Across the Application (Priority: P2)

**Goal**: After uploading an avatar, it appears consistently in the profile page and top navigation bar; users without an avatar see their initials as the placeholder in both locations.

**Independent Test**: After uploading an avatar (US1), confirm the avatar image appears in both the profile page header and the navigation bar without any additional action. Confirm that a user without an avatar sees initials (not a broken image) in both locations.

- [X] T021 [US2] Update `getProfile` tRPC procedure in `packages/api/src/routers/users.ts` to inject `S3StorageService` via `makeUploadAvatar` or a dedicated getter, derive `avatarUrl: user.avatar ? storageService.getPublicUrl({ key: user.avatar }) : null`, and return it alongside the user object
- [X] T022 [US2] Update navigation user menu in `apps/web/src/layouts/DefaultLayout/Header/user-menu/` to read `avatarUrl` from the `getProfile` tRPC query and render MUI `<Avatar src={avatarUrl ?? undefined}>{initials}</Avatar>` where initials are derived from `user.name`
- [X] T023 [US2] Display the current avatar (or initials placeholder) in the profile page header in `apps/web/src/app/profile/page.tsx` using MUI `<Avatar src={avatarUrl ?? undefined}>{initials}</Avatar>` from the `getProfile` query result

**Checkpoint**: User Stories 1 and 2 fully functional — avatar visible in profile and navigation

---

## Phase 5: User Story 3 — Remove Avatar (Priority: P3)

**Goal**: Authenticated users with an existing avatar can remove it, reverting to the initials placeholder across all application areas. The remove option is hidden when no avatar exists.

**Independent Test**: As a user with an existing avatar, click the remove button → avatar deleted from storage → `users.avatar` set to null → initials placeholder appears in profile page and navigation. Verify remove button is hidden when user has no avatar.

- [X] T024 [US3] Create `RemoveAvatarUseCase` in `packages/api/src/use-cases/remove-avatar.ts`: constructor receives `IUsersRepository` and `IStorageService`; `execute({ userId })` finds user by id (throws `UserDoesNotExistsError`), deletes `avatar` key from storage if present, calls `updateAvatar({ userId, avatarKey: null })`
- [X] T025 [US3] Create `RemoveAvatarUseCase` tests in `packages/api/src/use-cases/remove-avatar.spec.ts` using `FakeUsersRepository` and `FakeStorageService`: happy path (key deleted from storage, avatar set to null), user not found, no-op when user has no avatar (storage delete not called)
- [X] T026 [US3] Create `makeRemoveAvatar` factory in `packages/api/src/use-cases/factories/make-remove-avatar.ts` wiring `UsersRepository` and `S3StorageService`, returning a new `RemoveAvatarUseCase` instance
- [X] T027 [US3] Create `removeAvatarErrorHandler` in `packages/api/src/routers/error-handlers/remove-avatar-error-handler.ts`: maps `UserDoesNotExistsError` → `TRPCError({ code: 'NOT_FOUND', message: error.message })`, rethrows unknown errors
- [X] T028 [US3] Add `removeAvatar` authenticated mutation to `packages/api/src/routers/users.ts` using `makeRemoveAvatar().execute({ userId: ctx.session.userId })`, wrapped with `removeAvatarErrorHandler`, returning `{ message: 'Avatar removed successfully!' }`
- [X] T029 [US3] Add remove avatar button to `apps/web/src/app/profile/page.tsx`: visible only when `avatarUrl` is not null; on click calls `trpc.users.removeAvatar.mutate()` and invalidates the `getProfile` query on success

**Checkpoint**: All three user stories fully functional — upload, display, and removal work end-to-end

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup across all user stories

- [X] T030 Run `npm test && npm run lint` from repo root and fix any TypeScript type errors or lint violations introduced by this feature
- [X] T031 [P] Validate quickstart.md scenarios manually: install deps, configure STORAGE_* env vars, run migration, upload avatar via profile page, confirm avatar appears in navigation bar, remove avatar and confirm initials placeholder is restored

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase; proceed in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T007–T015). Must complete first — core feature.
- **US2 (P2)**: Depends on US1 (`getProfile` must expose `avatarUrl` derived from `S3StorageService`, which is wired in US1's factory).
- **US3 (P3)**: Depends on Foundational only at the use-case layer. The remove button in the UI requires the profile page from US1/US2 to be in place.

### Within Each User Story

- Use case (T016/T024) before tests (T017/T025) — or write tests first if practicing TDD
- Use case before factory (T018/T026)
- Factory before route/router wiring (T019/T028)
- Backend wiring before frontend (T020/T022/T023/T029)

### Parallel Opportunities

**Phase 1 (after T001)**:
- T002, T003, T004 can all run in parallel

**Phase 2 (after T005/T006)**:
- T007 first (interface); then T008 and T009 in parallel
- T010, T011, T012 are fully independent — run in parallel with each other and with T007–T009
- T013 first; then T014 and T015 in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T007 (IStorageService interface):
Task: T008 — Create S3StorageService in packages/storage/src/s3-storage-service.ts
Task: T009 — Create FakeStorageService in packages/api/test/storage/fake-storage-service.ts

# Fully independent (any order, parallel with each other and above):
Task: T010 — uploadAvatarSchema in packages/schemas/src/upload-avatar.ts
Task: T011 — InvalidImageTypeError in packages/api/src/use-cases/errors/invalid-image-type-error.ts
Task: T012 — ImageTooLargeError in packages/api/src/use-cases/errors/image-too-large-error.ts

# After T013 (IUsersRepository.updateAvatar added):
Task: T014 — Implement updateAvatar in UsersRepository
Task: T015 — Add updateAvatar to FakeUsersRepository
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: User Story 1 (T016–T020)
4. **STOP and VALIDATE**: Upload avatar end-to-end, verify error cases
5. Continue with US2 and US3

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → Avatar upload works (MVP)
3. US2 → Avatar visible across app
4. US3 → Avatar removal
5. Polish → Tests pass, lint clean

---

## Notes

- [P] tasks touch different files and have no dependency on incomplete tasks in the same phase
- UUIDv7 generated server-side via `v7 as uuidv7` from `uuid` package (already a project dependency)
- `getPublicUrl` is synchronous — pure string concatenation: `` `${env.STORAGE_PUBLIC_URL}/${key}` ``
- The reconciliation migration (T006) must be created manually since Prisma cannot auto-detect a column rename vs drop+add; the migration file name timestamp should match the current date
- `packages/storage` is a new Turborepo workspace package — verify it is picked up by the root `package.json` `workspaces` field (or `turbo.json`)
- `FakeStorageService` and `FakeUsersRepository` are manual fakes — no `vi.mock` usage per project constitution
- All error messages must be in English (en-US) per Principle III
