<!--
Sync Impact Report
==================
Version change: N/A (initial template population) → 1.0.0
Modified principles:
  - [PRINCIPLE_1_NAME] → I. Clean Architecture & Code Quality
  - [PRINCIPLE_2_NAME] → II. Testing Standards
  - [PRINCIPLE_3_NAME] → III. User Experience Consistency
  - [PRINCIPLE_4_NAME] → IV. Performance Requirements
  - [PRINCIPLE_5_NAME] → V. Type Safety & Contracts
Added sections:
  - Security & Integrity (replaces generic [SECTION_2_NAME])
  - Development Workflow (replaces generic [SECTION_3_NAME])
Removed sections: N/A — all template sections were placeholders with no prior content
Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file (fully populated)
  ⚠ .specify/templates/plan-template.md — Constitution Check gate still uses
    generic "[Gates determined based on constitution file]"; should enumerate
    the five principle gates explicitly in a future PATCH amendment.
  ✅ .specify/templates/spec-template.md — Success Criteria section aligns with
    Principle IV performance targets; no structural change required.
  ✅ .specify/templates/tasks-template.md — test tasks marked OPTIONAL, consistent
    with Principle II (tests co-located, Vitest, manual fakes); no change required.
Follow-up TODOs:
  - TODO(PLAN_TEMPLATE_GATES): Enumerate per-principle constitution check gates in
    .specify/templates/plan-template.md Constitution Check section.
-->

# Python IDE Constitution

## Core Principles

### I. Clean Architecture & Code Quality

All business logic MUST live in `packages/api/` following strict clean architecture
layers: use cases → interfaces (e.g.,
`IUsersRepositry`) → concrete implementations → tRPC routers.
Use cases MUST expose a single `execute()` method and MUST be framework-agnostic.
Domain errors MUST be explicit typed classes extending `Error` (e.g.,
`UserAlreadyExistsError`) and MUST NOT leak implementation details to callers.
tRPC routers MUST be thin translation layers only — no business logic is permitted
inside a router.

- **SRP**: Each module and class MUST have exactly one reason to change.
- **DRY**: Shared logic MUST live in `packages/` — duplication across apps is
  prohibited.
- **Dependency Inversion**: Use cases MUST depend on interfaces (`IUsersRepository`,
  `IHasher`, `IToken`, etc.), never on concrete implementations.
- **Password Safety**: `findByEmail()` MUST omit `hashedPassword`; only
  `findByEmailWithPassword()` may include it. Raw passwords MUST never be logged.
- **Interfaces**: MUST live in `interfaces/` subdirectories and be prefixed with `I`.
- **Factories**: `make-*.ts` files MUST wire real implementations into use cases
  without a DI container.
- `import type` MUST be used for all type-only imports (`verbatimModuleSyntax`
  is enforced across all packages).

**Rationale**: Isolating all business logic in `packages/api/` allows use cases to
be tested without HTTP overhead and swapped independently of the delivery mechanism
(Fastify, CLI, etc.).

### II. Testing Standards

Tests MUST be co-located with source files as `.spec.ts` siblings. All tests use
Vitest. Manual fakes (in-memory implementations of interfaces) MUST be used —
no mocking framework (e.g., `vi.mock`, Jest mocks) is permitted for unit tests.

- Unit tests MUST construct the SUT manually using fakes from `test/` — no
  auto-mocking.
- Integration tests MAY hit real infrastructure (PostgreSQL, Redis) and MUST NOT
  mock those layers.
- Domain errors thrown by use cases MUST each have at least one test scenario
  covering the error path.
- New use cases MUST include co-located `.spec.ts` tests before merging to `main`.
- Test coverage for `packages/api/` MUST NOT regress below the current baseline.
- Fake implementations MUST live in `packages/api/test/` and be organized to mirror
  the `src/` directory structure.
- There should be only one test case for the happy path, verifying that everything works as expected.
- Test descriptions should always start with "should be able to..." for success scenarios and "should not be able to..." for failure scenarios.

**Rationale**: Manual fakes make interface contracts explicit and prevent the
mock/production divergence that masked real failures in prior incidents. Co-location
keeps tests discoverable and immediately adjacent to the code they verify.

### III. User Experience Consistency

All user-facing messages rendered in the web application MUST be in
English (en-US). API-layer error messages and response bodies are in English
(en-US) following the recent migration. Forms MUST use React Hook Form with a Zod
resolver backed by schemas from `@python-editor/schemas`. Interactive components
MUST use `use client`; server components are the default in the App Router.

- UI validation schemas MUST be the same Zod schemas used for API input validation
  — no duplication of validation rules between client and server.
- Error messages displayed to end users MUST be human-readable en-US strings, not
  raw error codes.
- React Compiler (Babel plugin) is enabled — manual `useMemo`/`useCallback` MUST
  NOT be added unless profiling demonstrates a measurable regression.
- Monaco Editor is the canonical code editor component; alternative editors MUST NOT
  be introduced without constitution amendment.

**Rationale**: Shared Zod schemas from `@python-editor/schemas` guarantee that the
same validation rules apply client-side and server-side, eliminating divergence
between UI feedback and API rejection messages.

### IV. Performance Requirements

- Python code execution MUST run client-side via Pyodide in a Web Worker — the
  server MUST NOT execute user Python code under any circumstances.
- COOP/COEP headers MUST be configured in `next.config.ts`; these are required for
  `SharedArrayBuffer` which Pyodide depends on.
- API response time (p95) for authenticated tRPC procedures MUST be ≤ 200 ms
  (excluding cold starts and Pyodide initialisation).
- Individual Next.js route chunks SHOULD remain under 250 kB (gzipped). Exceptions
  (e.g., Monaco Editor) MUST be documented in the relevant `plan.md` Complexity
  Tracking table.
- Database queries MUST filter on indexed fields; N+1 query patterns are prohibited.
- Redis MUST be used for short-lived key-value state (e.g., email verification
  tokens, password-reset tokens with TTL) — PostgreSQL MUST NOT store ephemeral
  token state.

**Rationale**: Offloading Python execution to the client eliminates server-side
compute costs and data-exfiltration risk. Latency budgets and bundle limits ensure
a responsive IDE experience across typical developer hardware.

### V. Type Safety & Contracts

TypeScript strict mode MUST be enabled across all packages and apps.
`verbatimModuleSyntax` is enforced — `import type` MUST be used for type-only
imports. All API inputs MUST be validated by Zod schemas from
`@python-editor/schemas` before reaching use-case logic.

- `any` is prohibited without an inline `// eslint-disable-next-line` comment
  that includes a justification.
- All entity IDs MUST be UUIDv7 (time-ordered); sequential integer IDs are not
  permitted for new entities.
- Schemas in `@python-editor/schemas` are the single source of truth for DTO
  validation — ad-hoc inline Zod definitions in routers or React components are
  prohibited.
- Packages MUST NOT include a build step; they export TypeScript directly and
  consumers resolve types at build time. All packages MUST be ESM-only.
- Path alias `@/*` MUST resolve to `./src/*` in both apps and be used for all
  intra-app imports.

**Rationale**: A single contract layer (shared Zod schemas + TypeScript strict mode)
eliminates drift between client validation, server validation, and implicit API
contracts that only manifest as runtime errors.

## Security & Integrity

- Refresh tokens MUST be stored in `httpOnly` secure cookies; they MUST NOT be
  exposed in response bodies or stored in `localStorage`/`sessionStorage`.
- Access tokens are returned in response bodies and are intentionally short-lived.
- JWT secrets MUST be supplied via environment variables and validated at startup
  via `packages/env/` (`@t3-oss/env`). A missing required env var MUST cause a
  hard startup failure, not a silent default.
- Passwords MUST be hashed exclusively through the `IHasher` interface;
  bcrypt/argon2 implementation details MUST NOT leak out of `packages/api/`.
- All SQL access MUST go through the Prisma client; raw SQL queries require explicit
  code-review approval and must be documented in the PR.
- SMTP credentials and all secrets MUST reside in `apps/server/.env` and MUST NOT
  be committed to version control. `.env` MUST remain in `.gitignore`.

## Development Workflow

- All commands run from the repo root via Turborepo (`npm run dev`, `npm run build`,
  `npm run test`, `npm run check-types`, `npm run lint`).
- `npm run check-types` MUST pass with zero errors before any PR is merged.
- `npm run lint` MUST pass (or `npm run lint:fix` applied and committed) before
  any PR is merged.
- Database schema changes MUST be accompanied by a Prisma migration
  (`npm run db:migrate`); `npm run db:push` is for local development only and
  MUST NOT be used as a substitute for migrations in shared environments.
- Each `apps/` and `packages/` directory MUST maintain its own `CLAUDE.md` with
  package-specific conventions and architecture notes.
- Feature branches use the `###-feature-name` naming convention where `###` is a
  zero-padded sequential number.

## Governance

This constitution supersedes all other informal conventions, README guidance, and
per-package `CLAUDE.md` files where they conflict on matters of principle.
Per-package `CLAUDE.md` files MAY add more specific guidance within the bounds set
here but MUST NOT contradict this constitution.

Amendments follow this process:

1. Propose the change in a PR with rationale and explicit impact assessment.
2. Bump `CONSTITUTION_VERSION` per semantic versioning:
   - **MAJOR**: Principle removal, redefinition, or backward-incompatible governance
     change that requires existing code to be updated.
   - **MINOR**: New principle or section added, or material expansion of guidance
     that adds new obligations.
   - **PATCH**: Clarification, wording refinement, or typo fix with no new obligations.
3. Update `LAST_AMENDED_DATE` to the PR merge date (ISO YYYY-MM-DD).
4. Propagate changes to dependent templates in `.specify/templates/` within the
   same PR (Constitution Check gates in `plan-template.md` are a required update
   target for MINOR/MAJOR bumps).
5. All PRs and code reviews MUST verify compliance with applicable principles.
   Violations require documented justification in the Complexity Tracking table
   of the relevant `plan.md`.

Compliance is reviewed at the start of each feature via the Constitution Check gate
in `plan-template.md` (re-checked after Phase 1 design).

**Version**: 1.0.0 | **Ratified**: 2026-03-16 | **Last Amended**: 2026-03-16
