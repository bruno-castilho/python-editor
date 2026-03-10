# CLAUDE.md — apps/web

## Build & Dev Commands

```bash
# Development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

> No test suite is configured. There are no `.test.ts` or `.spec.ts` files.

---

## Architecture Overview

Next.js 15 App Router frontend for a browser-based Python IDE. Python execution runs entirely client-side via **Pyodide** in a Web Worker (`public/pyodide.worker.js`). The backend is reached through **tRPC** (server at `NEXT_PUBLIC_SERVER_URL`, default `http://localhost:3000`).

Part of a monorepo — shared packages:
- `@python-editor/api` — tRPC routers
- `@python-editor/schemas` — Zod DTOs (shared with backend)
- `@python-editor/env` — environment config
- `@python-editor/config` — shared config

**CORS headers** (COOP: same-origin, COEP: credentialless) are set in `next.config.ts` to enable `SharedArrayBuffer` for the Python Web Worker.

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/editor` |
| `/editor` | Main Python IDE |
| `/sign-in` | Auth page |
| `/register` | Registration |
| `/verify-email` | Email verification (token via URL) |
| `/forgot-password` | Request password reset (email form) |
| `/reset-password` | Set new password (token via URL) |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — wraps with all providers |
| `src/app/editor/page.tsx` | Main editor page |
| `src/app/editor/components/VSEditor/` | Monaco editor wrapper (themes, Python, responsive) |
| `src/app/editor/components/Terminal/` | stdout/stderr/stdin display |
| `src/app/editor/components/FileTabBar/` | File tab management (main.py protected) |
| `src/hooks/usePyodide.ts` | Pyodide Web Worker hook (stdin/stdout/stderr, status) |
| `public/pyodide.worker.js` | Web Worker for Python execution |
| `src/context/AlertContext.tsx` | Global alert/notification state |
| `src/providers/MaterialProvider/` | MUI theme provider (light/dark) |
| `src/providers/TanstackProvider/` | React Query provider |
| `src/utils/trpc.ts` | tRPC client setup with Sonner toast error handling |
| `src/utils/theme.ts` | MUI theme (Python blue #3776AB, yellow #FFD43B) |
| `src/lib/utils.ts` | `cn()` — clsx + tailwind-merge utility |
| `src/layouts/DefaultLayout/` | App shell with Header |

---

## Coding Conventions

- **Components**: `'use client'` directive on all interactive components; colocated in feature subdirectories
- **Forms**: React Hook Form + Zod via `@hookform/resolvers/zod`; schemas imported from `@python-editor/schemas`
- **Styling**: MUI `sx` prop + Tailwind utility classes together; `cn()` for conditional class merging
- **State**: `AlertContext` for global UI alerts; React Query (via tRPC) for server state
- **API calls**: Always via tRPC mutations/queries; errors handled globally in `trpc.ts` with `sonner` toasts
- **Responsive**: MUI `useMediaQuery` for mobile/tablet breakpoints
- **TypeScript**: Strict mode, path alias `@/*` → `src/*`
- **React Compiler**: Babel plugin enabled — avoid manual `useMemo`/`useCallback` where compiler handles it
- **No test files** — new features do not need test scaffolding currently
