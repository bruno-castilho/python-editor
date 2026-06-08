# Server Docker Image

Fastify 5 server with tRPC endpoint. The image is built in three stages: clones the source from a Git repository, compiles a standalone binary with Bun, and runs it on a minimal `debian:bookworm-slim` base.

The binary listens on port **80** by default.

## Build arguments

| Argument | Default | Description |
|---|---|---|
| `REPO_URL` | `https://github.com/bruno-castilho/python-editor.git` | Git repository to clone |
| `GIT_REF` | `main` | Branch, tag, or commit to checkout |

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `80`) | Port the server listens on |
| `NODE_ENV` | No (default `production`) | Node environment |
| `APP_BASE_URL` | Yes | Public base URL of the server (e.g. `https://api.example.com`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CORS_ORIGIN` | Yes | Allowed CORS origin (e.g. `https://example.com`) |
| `ACCESS_TOKEN_SECRET` | Yes | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing refresh tokens |
| `REDIS_URL` | Yes | Redis connection string |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP server port |
| `SMTP_SECURE` | No (default `true`) | `true` or `false` for TLS |
| `SMTP_USER` | No (default `''`)  | SMTP username |
| `SMTP_PASSWORD` | No (default `''`)  | SMTP password |
| `SMTP_FROM` | Yes | Sender address (e.g. `no-reply@example.com`) |
| `STORAGE_ENDPOINT` | No | S3-compatible endpoint URL (omit for AWS) |
| `STORAGE_REGION` | Yes | S3 region |
| `STORAGE_ACCESS_KEY_ID` | Yes | S3 access key |
| `STORAGE_SECRET_ACCESS_KEY` | Yes | S3 secret key |
| `STORAGE_AVATARS_BUCKET` | Yes | S3 bucket for avatars |
| `STORAGE_PROJECTS_BUCKET` | Yes | S3 bucket for projects |

## Build

```bash
docker build \
  --build-arg REPO_URL=https://github.com/bruno-castilho/python-editor.git \
  --build-arg GIT_REF=main \
  -t server:latest \
  -f docker/server/Dockerfile \
  .
```

## Run

### docker run

```bash
docker run -d \
  --name server \
  -p 80:80 \
  -e APP_BASE_URL=https://api.example.com \
  -e DATABASE_URL=postgresql://user:password@db:5432/mydb \
  -e CORS_ORIGIN=https://example.com \
  -e ACCESS_TOKEN_SECRET=your-access-secret \
  -e REFRESH_TOKEN_SECRET=your-refresh-secret \
  -e REDIS_URL=redis://redis:6379 \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_PORT=587 \
  -e SMTP_SECURE=false \
  -e SMTP_FROM=no-reply@example.com \
  -e STORAGE_REGION=us-east-1 \
  -e STORAGE_ACCESS_KEY_ID=your-key-id \
  -e STORAGE_SECRET_ACCESS_KEY=your-secret \
  -e STORAGE_AVATARS_BUCKET=avatars \
  -e STORAGE_PROJECTS_BUCKET=projects \
  server:latest
```



### docker compose

```yaml
services:
  server:
    image: server:latest
    ports:
      - "80:80"
    environment:
      APP_BASE_URL: https://api.example.com
      DATABASE_URL: postgresql://user:password@db:5432/mydb
      CORS_ORIGIN: https://example.com
      ACCESS_TOKEN_SECRET: your-access-secret
      REFRESH_TOKEN_SECRET: your-refresh-secret
      REDIS_URL: redis://redis:6379
      SMTP_HOST: smtp.example.com
      SMTP_PORT: 587
      SMTP_SECURE: "false"
      SMTP_FROM: no-reply@example.com
      STORAGE_REGION: us-east-1
      STORAGE_ACCESS_KEY_ID: your-key-id
      STORAGE_SECRET_ACCESS_KEY: your-secret
      STORAGE_AVATARS_BUCKET: avatars
      STORAGE_PROJECTS_BUCKET: projects
    restart: unless-stopped
```

The server will be available at `http://localhost`.
