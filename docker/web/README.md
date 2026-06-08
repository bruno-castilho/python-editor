# Web Docker Image

Next.js 15 App Router frontend. The image is built in three stages: clones the source from a Git repository, compiles a Next.js standalone bundle with Bun, and serves it with Node.js on a `node:24-bullseye-slim` base.

The server listens on port **80** by default.

> `NEXT_PUBLIC_SERVER_URL` is a **build argument** because Next.js bakes public env vars into the client bundle at build time. It must be provided during `docker build`, not at runtime.

## Build arguments

| Argument | Default | Description |
|---|---|---|
| `REPO_URL` | `https://github.com/bruno-castilho/python-editor.git` | Git repository to clone |
| `GIT_REF` | `main` | Branch, tag, or commit to checkout |
| `NEXT_PUBLIC_SERVER_URL` | — | **Required.** Public URL of the API server (e.g. `https://api.example.com`) |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `80` | Port the Next.js server listens on |
| `NODE_ENV` | `production` | Node environment |
| `HOSTNAME` | `0.0.0.0` | Address the server binds to |

## Build

```bash
docker build \
  --build-arg REPO_URL=https://github.com/bruno-castilho/python-editor.git \
  --build-arg GIT_REF=main \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://api.example.com \
  -t web:latest \
  -f docker/web/Dockerfile \
  .
```

## Run

### docker run

```bash
docker run -d \
  --name web \
  -p 80:80 \
  web:latest
```

### docker compose

```yaml
services:
  web:
    image: web:latest
    ports:
      - "80:80"
    restart: unless-stopped
```

The app will be available at `http://localhost`.
