# CLAUDE.md — `apps/web`

Technical reference document for LLM sessions. Based exclusively on the app's actual code.

---

## App role

`apps/web` is the **Next.js 15 App Router frontend** (port 3001). It contains no business logic —
it consumes the `AppRouter` type exported by `packages/trpc` through `@trpc/tanstack-react-query`
and renders UI with MUI + Tailwind.

```
apps/web (Next.js)
  ├── src/app/(auth)/*    → sign-in, sign-up, unverified-email (public)
  ├── src/app/(main)/*    → editor, projects, settings (protected, session-refreshed on mount)
  ├── src/app/reset-password, verify-email, openrouter-callback  → standalone token-handling pages
  └── trpc client (src/utils/trpc.ts) → @python-editor/trpc's AppRouter (HTTP, batched)
```

---

## Directory structure (`src/`)

```
app/                   Next.js App Router segments (see routing table below)
api/                   Non-tRPC HTTP clients
  server/              axios calls to apps/server's custom REST routes (upload/download/update project, avatar)
  open-router/         OpenRouter OAuth2 PKCE client
components/            Reusable components, one folder per component with index.tsx
  Editor/              VSEditor, Terminal, FileTabBar, etc. — Python editor UI
  Header/, Alert/, ConfirmationDialog/, ShareProjectDialog/, Loading/, Markdown/, ...
context/               React Context providers (no Redux/Zustand/Jotai in this app)
  AlertContext.tsx      global toast/snackbar state
  EditorContext.tsx     Python editor state (files, terminal, execution status)
hooks/                 Custom hooks (useEditor, usePyodide, useChatSessions, useOpenRouter, ...)
lib/                   Utilities: axios.ts (axios instances), utils.ts (cn()), chat-sessions.ts, open-router.ts
providers/             Providers wrapping the app tree
  TanstackProvider/     QueryClientProvider + React Query Devtools (dev only)
  MaterialProvider/     MUI ThemeProvider + CssBaseline
  EditorProvider/       EditorContext.Provider, instantiates usePyodide
permissions/           Route-protection helpers
  onlyUserPage.tsx       OnlyUserPage HOC
utils/                 trpc.ts, access-token-store.ts, theme.ts
errors/                app-error.ts — AppError class with status-code mapping
```

---

## Routing (App Router)

No `middleware.ts` exists — all auth gating happens in layouts/components, not at the edge.

| Route | Group | Notes |
|---|---|---|
| `/` | — | `app/page.tsx` |
| `/sign-in`, `/sign-up`, `/unverified-email` | `(auth)` | Public, shared layout, no header |
| `/editor` (layout), `/editor/[id]` | `(main)` | Protected; layout runs `auth.sessionRefresh` on mount |
| `/projects/personal`, `/projects/shared-with-me` | `(main)` | Protected, paginated/sortable tables |
| `/settings/profile`, `/settings/sessions` | `(main)` | Protected |
| `/reset-password` | — | Standalone, token from email query param |
| `/verify-email` | — | Standalone, token from email query param |
| `/openrouter-callback` | — | OAuth2 PKCE redirect target for the OpenRouter integration |
| `app/error.tsx`, `app/not-found.tsx` | — | Global error boundary / 404 |

**Adding a new protected page:** put it under `src/app/(main)/...` so it inherits
`(main)/layout.tsx`'s session-refresh gate, or wrap the page content in
`<OnlyUserPage>` (`src/permissions/onlyUserPage.tsx`) if it lives outside that group.

---

## tRPC client (`src/utils/trpc.ts`)

```typescript
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(error.message, {
        action: { label: 'retry', onClick: query.invalidate },
      })
    },
  }),
})

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, { ...options, credentials: 'include' }) // sends the refresh-token cookie
      },
      headers() {
        const token = getAccessToken()
        if (!token) return {}
        return { Authorization: `Bearer ${token}` }
      },
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient })
```

**Usage patterns (always go through `trpc`, never call `trpcClient` directly):**

```typescript
// Query
const { data, isPending } = useQuery(trpc.users.getProfile.queryOptions())

// Mutation
const { mutate, isPending } = useMutation(
  trpc.auth.signIn.mutationOptions({
    onSuccess(data) { /* ... */ },
    onError(error) { /* ... */ },
  }),
)

// Manual invalidation after a mutation succeeds elsewhere
queryClient.invalidateQueries({
  queryKey: trpc.projects.findPersonalProjects.queryKey(),
})
```

Any query error that isn't handled by an explicit `onError` bubbles up to the global
`queryCache.onError` and shows a `sonner` toast with a "retry" action automatically — you don't
need to add your own generic error toast in every component, only domain-specific handling
(redirects, field errors, etc.) via `onError`.

---

## Auth / session handling

- **Access token** — short-lived JWT, kept **only in memory** via `src/utils/access-token-store.ts`
  (`getAccessToken()` / `setAccessToken()`). Never persisted to `localStorage`, `sessionStorage`,
  or a non-`httpOnly` cookie.
- **Refresh token** — long-lived, set by the server as an `httpOnly` cookie; the browser sends it
  automatically because every tRPC `fetch` call uses `credentials: 'include'`.
- **Session refresh on load** — `(main)/layout.tsx` calls `auth.sessionRefresh` in a `useEffect` on
  mount and shows a full-screen `<Loading />` until it resolves:

```typescript
const { mutate: sessionRefreshMutate, status } = useMutation(
  trpc.auth.sessionRefresh.mutationOptions({
    onSuccess(data) { setAccessToken(data?.accessToken || '') },
    onError() {},
  }),
)
useEffect(() => { sessionRefreshMutate() }, [])
```

- **Protected pages outside `(main)`** use the `OnlyUserPage` HOC:

```typescript
export function OnlyUserPage({ children }: { children: React.ReactNode }) {
  const accessToken = getAccessToken()
  if (!accessToken) return redirect('/sign-in')
  return children
}
```

- **There is no automatic 401 retry/refresh interceptor.** The only refresh happens once, on
  `(main)/layout.tsx` mount. If a mutation/query fails with `UNAUTHORIZED` after that, the current
  pattern is to handle it explicitly in that call's `onError` (e.g. `SignInCard` redirects to
  `/unverified-email` on a `FORBIDDEN` code) — don't assume a global retry will save you.

---

## State management

- **React Context only** for client-side global state: `AlertContext` (toast/snackbar — `error`,
  `info`, `success`, `warning`, `onClose`) and `EditorContext` (Python editor: files, active file,
  terminal entries, execution status). No Redux, Zustand, or Jotai anywhere in this app.
- **Server state** lives entirely in TanStack Query, populated through the `trpc` proxy above —
  don't introduce a second cache (SWR, manual `useState` + `useEffect` fetch, etc.) for data that
  is already a tRPC procedure.
- Local UI state (dialog open/closed, form step, etc.) is plain `useState` at the component level.

---

## Forms

`react-hook-form` + `@hookform/resolvers/zod`, validating against schemas imported from
`@python-editor/schemas/*` (the same schemas the backend uses):

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type SignInDTO, signInSchema } from '@python-editor/schemas/sign-in'

const { register, handleSubmit, reset, formState: { isSubmitting, errors } } =
  useForm<SignInDTO>({ resolver: zodResolver(signInSchema) })

<TextField
  error={!!errors.email}
  helperText={errors.email?.message ?? ''}
  {...register('email')}
/>

<Button type="submit" loading={isSubmitting || isPending} onClick={handleSubmit(onSubmit)}>
  Sign in
</Button>
```

Canonical example: `src/app/(auth)/sign-in/components/SignInCard/index.tsx`. Submit handlers call
a tRPC mutation and route domain-specific outcomes (e.g. an `UNVERIFIED`/`FORBIDDEN` error code) to
a redirect or to `AlertContext`, not just a generic error toast.

---

## UI / styling

- **MUI v7** is the primary component library (`Box`, `TextField`, `Card`, `Dialog`, `Table`, MUI
  icons). Style with the `sx` prop; use `theme.applyStyles('dark', {...})` for dark-mode overrides
  (see `(main)/layout.tsx`'s scrollbar styling for the pattern).
- **Tailwind v4** is available as a utility fallback through `cn()` (`src/lib/utils.ts`, =
  `twMerge(clsx(inputs))`) — reach for it when MUI's `sx`/theme system doesn't fit, not as the
  default styling mechanism.
- **Theme** — `src/utils/theme.ts`: `createTheme()` with light/dark `colorSchemes`
  (`cssVariables: { colorSchemeSelector: 'data' }`), Python-blue/yellow palette, fluid
  `clamp()`-based typography, and per-component `styleOverrides`/`variants`. Add new design tokens
  here rather than inlining magic colors in components.

---

## Testing

**E2E only (Playwright), no unit tests in this app.**

- Config: `playwright.config.ts` — tests in `test/*.e2e-spec.ts`, app served via `npm run dev:test`
  on a dedicated port, global setup in `playwright.global-setup.ts`.
- **Mocking the backend** — `test/mocks/server.ts` exports `MockServer`:

```typescript
const mockServer = new MockServer()
mockServer.setTrpcHandler('auth.signIn', (input) => {
  const { email } = input as { email: string }
  if (email === 'wrong-email@example.com') throw trpcError('Invalid credentials.', 'UNAUTHORIZED')
  return { message: '...', user, accessToken }
})
await mockServer.install(page) // intercepts requests to localhost:3333
```

  `setTrpcHandler(procedure, handler)` keys by `"router.procedure"` (e.g. `"auth.sessionRefresh"`).
  Throwing `trpcError(message, code)` from a handler reproduces a real tRPC error shape/HTTP status.
  `setRestHandler(method, pathPattern, handler)` is the equivalent for the custom REST routes
  (avatar/project upload-download).
- `test/factories/` build fake data (`user.ts`, `token.ts`, `session.ts`, `project.ts`) — not
  DB-backed, pure in-memory objects for mock responses.
- `test/helpers/` hold reusable page interactions (`fill-sign-in-form.ts`,
  `wait-for-editor-ready.ts`, `set-editor-content.ts`, etc.) — reuse these instead of duplicating
  `page.locator()` chains across specs.
- Run with `npm run test:e2e` / `npm run test:e2e:watch`.

---

## Conventions

- **Components**: PascalCase folder with `index.tsx` (`SignInCard/index.tsx`). Subcomponents for a
  feature are grouped under that feature's folder (`Editor/VSEditor`, `Editor/Terminal`).
- **Hooks**: camelCase, `use` prefix, one per file (`useEditor.ts`, `usePyodide.ts`).
- **Utility/non-component files**: kebab-case (`access-token-store.ts`, `chat-sessions.ts`).
- **Loading states**: `<Loading />` for full-section spinners, MUI `Skeleton` for table rows,
  `<Button loading={isPending} />` for in-flight submits.
- **Error surfacing**: unhandled query errors → global toast via `queryCache.onError`
  (`src/utils/trpc.ts`); mutation-specific errors → explicit `onError` callback, usually calling
  `alert.error(...)` from `AlertContext` or redirecting.
- **`AppError`** (`src/errors/app-error.ts`) wraps `{ message, statusCode, code }` as a
  JSON-stringified `Error` — used for non-tRPC error paths (the axios-based REST calls in `src/api`).

---

## How to add a tRPC query/mutation to a component

1. Confirm the procedure exists in `packages/trpc` (add it there first if not — see that
   package's `CLAUDE.md`).
2. `useQuery(trpc.<router>.<procedure>.queryOptions(input))` for reads, or
   `useMutation(trpc.<router>.<procedure>.mutationOptions({ onSuccess, onError }))` for writes.
3. After a mutation that should refresh a list elsewhere, call
   `queryClient.invalidateQueries({ queryKey: trpc.<router>.<procedure>.queryKey() })` rather than
   manually refetching.
4. Let unhandled errors fall through to the global toast; only add `onError` when you need
   domain-specific behavior (redirect, inline field error, etc.).

## How to add a new protected page

1. Create the route under `src/app/(main)/<segment>/page.tsx` so it inherits the session-refresh
   gate in `(main)/layout.tsx` — or wrap standalone content in `<OnlyUserPage>` if it can't live
   under that group.
2. Co-locate page-specific components in a local `components/` folder next to `page.tsx`.
3. Fetch data with `useQuery(trpc...)`; show `<Loading />`/`Skeleton` while pending.

## How to add a form

1. Reuse or add a schema in `@python-editor/schemas/*` (shared with the backend procedure).
2. `useForm<DTO>({ resolver: zodResolver(schema) })`, bind fields with `{...register('field')}`,
   surface `errors.field?.message` via MUI `TextField`'s `helperText`.
3. Submit via `handleSubmit(onSubmit)`, where `onSubmit` calls a `useMutation(trpc...)`.

---

## Pitfalls and anti-patterns

### 1. Persisting the access token

```typescript
// WRONG — defeats the in-memory-only design, exposes the token to XSS/storage inspection
localStorage.setItem('accessToken', token)

// CORRECT
import { setAccessToken } from '@/utils/access-token-store'
setAccessToken(token)
```

### 2. Calling `trpcClient` directly instead of the `trpc` proxy

```typescript
// WRONG — bypasses queryClient caching/invalidation and the global error toast
await trpcClient.users.getProfile.query()

// CORRECT
const { data } = useQuery(trpc.users.getProfile.queryOptions())
```

### 3. Adding a protected page without going through `(main)` or `OnlyUserPage`

A page that reads user data but isn't under `(main)/` and isn't wrapped in `<OnlyUserPage>` will
render before any auth check — there is no `middleware.ts` to catch it.

### 4. Assuming a global 401 retry exists

```typescript
// WRONG — assumes the access token auto-refreshes on expiry
useMutation(trpc.projects.removeProject.mutationOptions({}))

// CORRECT — handle UNAUTHORIZED explicitly if the page can be reached after a long idle period
useMutation(trpc.projects.removeProject.mutationOptions({
  onError(error) {
    if (error.data?.code === 'UNAUTHORIZED') router.push('/sign-in')
  },
}))
```

### 5. Introducing a second client-state library

Don't add Zustand/Jotai/Redux for new global state — use React Context (matching `AlertContext`/
`EditorContext`) for client state, and TanStack Query (via `trpc`) for server state.

---

## Internal references

| What to do | Reference file |
|---|---|
| tRPC client, query client, global error toast | [src/utils/trpc.ts](src/utils/trpc.ts) |
| Access token store | [src/utils/access-token-store.ts](src/utils/access-token-store.ts) |
| Protected-page HOC | [src/permissions/onlyUserPage.tsx](src/permissions/onlyUserPage.tsx) |
| Session refresh on app load | [src/app/(main)/layout.tsx](src/app/(main)/layout.tsx) |
| Form + tRPC mutation + error routing example | [src/app/(auth)/sign-in/components/SignInCard/index.tsx](src/app/(auth)/sign-in/components/SignInCard/index.tsx) |
| Global toast context | [src/context/AlertContext.tsx](src/context/AlertContext.tsx) |
| Editor-specific state | [src/context/EditorContext.tsx](src/context/EditorContext.tsx) |
| Theme / design tokens | [src/utils/theme.ts](src/utils/theme.ts) |
| Tailwind/MUI class merge helper | [src/lib/utils.ts](src/lib/utils.ts) |
| Non-tRPC error wrapper | [src/errors/app-error.ts](src/errors/app-error.ts) |
| E2E mock server (tRPC + REST) | [test/mocks/server.ts](test/mocks/server.ts) |
| E2E spec example | [test/sign-in.e2e-spec.ts](test/sign-in.e2e-spec.ts) |
| Test factories / helpers | `test/factories/`, `test/helpers/` |
| Business logic, routers, error-code mapping | `packages/trpc/CLAUDE.md` |
