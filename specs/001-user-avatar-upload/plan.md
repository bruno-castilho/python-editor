# Implementation Plan: User Avatar Upload

**Branch**: `001-user-avatar-upload` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-avatar-upload/spec.md`

## Summary

Allow authenticated users to upload, view, and remove a profile avatar image. The image is
uploaded directly from the browser to the server via a multipart `POST /api/users/avatar`
Fastify endpoint; the server then stores the file in an S3-compatible object storage service
and persists a UUIDv7 storage key in PostgreSQL on the `users` table. The full public URL is
derived at read time from the key and a configured base URL. The storage layer is abstracted
behind `IStorageService` (in the new `packages/storage` package) so any S3-compatible
provider (AWS S3, Cloudflare R2, MinIO, etc.) can be wired in without touching use-case
logic.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `verbatimModuleSyntax`)
**Primary Dependencies**: tRPC v11 (Fastify adapter), Next.js 15 (App Router), MUI v6,
React Hook Form + Zod, Prisma 6, `@fastify/multipart` (new), `@aws-sdk/client-s3` (new,
in `packages/storage`), `uuid` (UUIDv7 already used)
**Storage**: PostgreSQL via Prisma (avatar key on `users` table) + S3-compatible object
storage for image files
**Testing**: Vitest, manual fakes (`FakeStorageService`) — no mocking framework
**Target Platform**: Linux server (Node.js 22) + Web browser
**Project Type**: Web application — monorepo (Turborepo): Next.js frontend (`apps/web`)
+ Fastify backend (`apps/server`) + shared packages (`packages/`)
**Performance Goals**: tRPC procedures p95 ≤ 200ms (avatar upload is a multipart REST
endpoint, exempt from tRPC latency budget); image upload routes through server — ≤5 MB
**Constraints**: Max file size 5 MB enforced client-side + use-case layer; accepted MIME
types: `image/jpeg`, `image/png`, `image/webp`; animated GIF out of scope
**Scale/Scope**: Per-user avatar; one avatar per user at a time; no batch operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design ✅.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture | ✅ Pass | `IStorageService` interface in `packages/storage/src/interfaces/`; use cases depend on the interface; `S3StorageService` concrete impl in `packages/storage/`; Fastify multipart handler is a thin route; no business logic in route handler |
| II. Testing Standards | ✅ Pass | Co-located `.spec.ts` per use case; Vitest; `FakeStorageService` manual fake in `packages/api/test/storage/`; no `vi.mock` |
| III. UX Consistency | ✅ Pass | All messages in English (en-US); Zod schema from `@python-editor/schemas`; MUI `Avatar` component; `use client` on interactive components |
| IV. Performance | ✅ Pass | Upload is a dedicated multipart REST route (exempt from tRPC 200ms budget); tRPC procedures (removeAvatar, getProfile) ≤ 200ms; DB queries filter on indexed `id`; no N+1 |
| V. Type Safety | ✅ Pass | UUIDv7 for avatar key (consistent with project convention); `import type` throughout; Zod schema from `@python-editor/schemas`; no `any` |
| Security | ✅ Pass | `STORAGE_*` env vars validated at startup via `@t3-oss/env-core`; authenticated route only; multipart size limit enforced by `@fastify/multipart` |

**No violations.** Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-avatar-upload/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
│   └── trpc-users-avatar.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/storage/
├── package.json                        # new package: @python-editor/storage
└── src/
    ├── interfaces/
    │   └── storage-service.ts          # IStorageService (new)
    └── s3-storage-service.ts           # @aws-sdk/client-s3 impl (new)

packages/api/src/
├── use-cases/
│   ├── upload-avatar.ts                # new (single-step; replaces request + confirm)
│   ├── upload-avatar.spec.ts           # new
│   ├── remove-avatar.ts                # new
│   ├── remove-avatar.spec.ts           # new
│   ├── errors/
│   │   ├── invalid-image-type-error.ts # new
│   │   └── image-too-large-error.ts    # new
│   └── factories/
│       ├── make-upload-avatar.ts       # new
│       └── make-remove-avatar.ts       # new
├── repositories/
│   └── interfaces/
│       └── users-repository.ts         # add updateAvatar()
├── routers/
│   ├── users.ts                        # add removeAvatar procedure; update getProfile
│   └── error-handlers/
│       └── remove-avatar-error-handler.ts  # new

packages/api/test/
└── storage/
    └── fake-storage-service.ts         # new

packages/schemas/src/
└── upload-avatar.ts                    # new (replaces request + confirm schemas)

packages/env/
└── server.ts                           # add STORAGE_* vars

packages/db/prisma/
├── schema/schema.prisma                # rename avatarUrl → avatar, drop @default("")
└── migrations/
    └── [timestamp]_rename_avatar_url_to_avatar/
        └── migration.sql               # new

apps/server/src/
└── index.ts                            # register @fastify/multipart + POST /api/users/avatar

apps/web/src/
├── app/profile/
│   └── page.tsx                        # add avatar upload UI (preview + single-step upload)
└── layouts/DefaultLayout/Header/
    └── user-menu/                      # show avatar in navigation
```

**Structure Decision**: Web application (Option 2 variant adapted for monorepo). Backend
logic entirely in `packages/api/`; storage abstraction in new `packages/storage/`;
frontend in `apps/web/`. The multipart upload route lives in `apps/server/src/index.ts`
as a thin Fastify handler. No business logic outside `packages/api/`.

## Complexity Tracking

> No violations — table not required for this feature.
