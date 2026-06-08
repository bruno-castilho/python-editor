# Python Editor

A web-based Python code editor designed for developers who want a fast, intelligent coding experience directly in the browser — no local setup required.

The editor runs Python in-browser via Pyodide and integrates an AI chat assistant powered by [OpenRouter](https://openrouter.ai/). Users connect their own OpenRouter API key, choose any supported model, and the assistant automatically receives the content of the open files as context — making it useful for explaining code, debugging errors, or generating new snippets.

Projects (collections of `.py` files) are saved to the cloud on demand and can be shared with other registered users by email invite. The owner controls who has access and can revoke it at any time.

Built as a full-stack TypeScript monorepo, it combines a Next.js frontend with a Fastify backend connected via end-to-end type-safe tRPC APIs.

## Tech Stack

- **TypeScript** — strict mode across the entire codebase
- **Next.js 15** — App Router frontend
- **Fastify 5** — fast, low-overhead HTTP server
- **tRPC** — end-to-end type-safe APIs
- **Prisma** — TypeScript-first ORM
- **PostgreSQL** — relational database
- **Redis** — session storage and caching
- **S3** — object storage (file uploads)
- **Mailer** — transactional email
- **Turborepo** — optimized monorepo build system
- **Vitest** — fast unit, integration and end-to-end testing
- **Playwright** — end-to-end browser testing

## Getting Started

The fastest way to get a fully working environment with all services (Postgres, Redis, MinIO, MailHog) is via [Dev Containers](https://containers.dev/).

**Prerequisites:** [Docker](https://docs.docker.com/engine/install/) and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code.

1. Open the repository in VS Code.
2. When prompted, click **Reopen in Container** — or open the Command Palette (`Ctrl/Cmd+Shift+P`) and run **Dev Containers: Reopen in Container**.
3. VS Code will build the container image and start all services defined in `.devcontainer/docker-compose.yml` (Postgres, Redis, MinIO, MailHog).
4. Once inside the container, install the dependencies, apply the database schema, and generate the Prisma Client.:

```bash
npm install
npm run db:push
npm run db:generate
```

5. Start the development servers:

```bash
npm run dev
```

6. Once running, the services are available at:

| Service | URL |
|---|---|
| Web | http://localhost:3001 |
| Server | http://localhost:3000 |
| MailHog | http://localhost:8025 |
| MinIO | http://localhost:9001 |

7. Open the MinIO console at http://localhost:9001, sign in with username `admin` and password `password`, and create two buckets: **avatars** and **projects**.

8. Create an account at http://localhost:3001/sign-up, then open MailHog at http://localhost:8025 to find the verification email and confirm your address.

## Project Structure

```
python-editor/
├── apps/
│   ├── web/              # Next.js 15 App Router frontend (port 3001)
│   └── server/           # Fastify 5 backend, tRPC endpoint at /trpc (port 3000)
├── packages/
│   ├── trpc/             # tRPC API
│   ├── core/             # Core shared logic
│   ├── db/               # Prisma client + generated types (PostgreSQL)
│   ├── env/              # t3-oss env validation (server and web envs)
│   ├── schemas/          # Shared Zod schemas
│   ├── redis/            # ioredis wrapper
│   ├── s3/               # AWS SDK S3 client
│   ├── mailer/           # Nodemailer wrapper
│   ├── config/           # Shared TypeScript / tooling configuration
│   └── eslint/           # Shared ESLint configuration
```

## Available Scripts

### Development

| Script | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run dev:web` | Start only the web app |
| `npm run dev:server` | Start only the server |

### Build & Type checking

| Script | Description |
|---|---|
| `npm run build` | Build all applications |
| `npm run check-types` | TypeScript type check across the monorepo |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Lint and auto-fix |

### Database

| Script | Description |
|---|---|
| `npm run db:push` | Push schema changes without creating a migration |
| `npm run db:migrate` | Create and apply a migration interactively |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:studio` | Open Prisma Studio |

### Testing

| Script | Description |
|---|---|
| `npm test` | Run all units tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:debug` | Run tests with Node inspector (`--inspect-brk`) |
| `npm run test:e2e:server` | Run server e2e tests |
| `npm run test:e2e:web` | Run web e2e tests (Playwright) |
| `npm run test:e2e:ui:web` | Open Playwright UI mode |
| `npm run test:e2e:report:web` | Open last Playwright HTML report |

## Environment Variables

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_BASE_URL` | Yes | — | Public base URL of the server (e.g. `http://localhost:3000`) |
| `PORT` | No | `3000` | HTTP port the server listens on |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `CORS_ORIGIN` | Yes | — | Allowed CORS origin (e.g. `http://localhost:3001`) |
| `ACCESS_TOKEN_SECRET` | Yes | — | Secret used to sign short-lived access JWTs |
| `REFRESH_TOKEN_SECRET` | Yes | — | Secret used to sign long-lived refresh JWTs |
| `REDIS_URL` | Yes | — | Redis connection string (e.g. `redis://localhost:6379`) |
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | Yes | — | SMTP server port |
| `SMTP_SECURE` | Yes | `true` | Use TLS (`true` / `false`) |
| `SMTP_USER` | No | `""` | SMTP authentication username |
| `SMTP_PASSWORD` | No | `""` | SMTP authentication password |
| `SMTP_FROM` | Yes | — | Sender address for outgoing emails |
| `STORAGE_ENDPOINT` | No | — | S3-compatible endpoint URL |
| `STORAGE_REGION` | Yes | — | S3 region |
| `STORAGE_ACCESS_KEY_ID` | Yes | — | S3 access key ID |
| `STORAGE_SECRET_ACCESS_KEY` | Yes | — | S3 secret access key |
| `STORAGE_AVATARS_BUCKET` | Yes | — | S3 bucket name for user avatars |
| `STORAGE_PROJECTS_BUCKET` | Yes | — | S3 bucket name for project files |

### Web

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | Yes | — | Public URL of the Fastify server (e.g. `http://localhost:3000`) |

## Features

### Authentication & Account

- **Sign up** with email and password
- **Email verification** — activation link sent on registration; option to resend
- **Sign in / Sign out**
- **Forgot password** — reset link delivered by email
- **Session management** — JWT access token (short-lived) in the baseAuth header + refresh token ( long-lived) in `httpOnly` cookie; sessions stored in Redis so they can be listed and individually revoked
- **Active sessions page** — view all logged-in devices and revoke any session remotely

### Profile

- Edit name and last name
- Upload or remove profile avatar (stored in S3)

### Editor

- **Monaco editor** (the same engine as VS Code) with Python syntax highlighting
- **In-browser Python execution** via Pyodide — no server round-trip needed
- **Interactive terminal** — supports `input()` calls; shows stdout and stderr inline
- **Multiple files** — open and switch between `.py` files via a tab bar
- **Add new file** — create additional `.py` files within the current project
- **Run / Stop** — execute the active file or interrupt a running process

### AI Assistant

- **Chat panel** powered by [OpenRouter](https://openrouter.ai/) — connects via OAuth PKCE flow; the API key never leaves the browser
- **Model selection** — choose from any model available on the user's OpenRouter account
- **File context** — the assistant receives the content of selected open files as context for every message
- **Streaming responses** — replies render token by token with a stop button
- **Multiple chat sessions** — create, rename, delete, and switch between sessions; history is persisted locally

### Projects

- **Save project** — bundle all open files and upload to the cloud (S3) as a new project or overwrite an existing one
- **Personal projects** — paginated and sortable list of the user's own projects
- **Open project** — load any saved project back into the editor
- **Delete project**
- **Share with users** — invite other registered users by email; each invitee sees the project under *Shared with me*
- **Revoke access** — remove a previously invited user at any time
- **Shared with me** — paginated list of projects shared by other users
