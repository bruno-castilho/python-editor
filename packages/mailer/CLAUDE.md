# Mailer Package

Package name: `@python-editor/mailer`

## Architecture Overview

Thin email-sending abstraction with a provider-based structure:

```
packages/mailer/
├── nodemailer/
│   └── nodemailer-mailer.ts   # Nodemailer implementation
├── src/
│   └── index.ts               # Public entry point — instantiates and exports a singleton
└── package.json
```

- `nodemailer/nodemailer-mailer.ts` — `NodemailerMailer` class wraps `nodemailer` transport. Reads SMTP config from `@python-editor/env` at construction time.
- `src/index.ts` — creates a singleton `NodemailerMailer` instance and exports it as default. Consumers import from `@python-editor/mailer/index`.

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Singleton export — import this to send emails |
| `nodemailer/nodemailer-mailer.ts` | SMTP transport implementation |

## Usage

```ts
import mailer from '@python-editor/mailer/index'

await mailer.send({ to: '...', subject: '...', html: '...' })
```

## Coding Conventions

- ESM module (`"type": "module"`)
- TypeScript only — no compiled output checked in; consumers resolve `.ts` sources directly via `exports` map
- `dotenv/config` is imported in the implementation file (not the entry point) to ensure env vars are loaded
- Env vars accessed exclusively through `@python-editor/env/server` (never `process.env` directly)
- `send()` accepts a single `params` object: `{ to, subject, html }`
- SMTP auth is optional — if `SMTP_USER` and `SMTP_PASSWORD` are both absent, auth is omitted from the transport config

## Required Env Vars

Defined in `@python-editor/env/server`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` (optional)
- `SMTP_PASSWORD` (optional)
- `SMTP_FROM`
