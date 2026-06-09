# Deploy

This folder contains the production deployment configuration for Python Editor. The stack runs on a server managed via Docker Compose, with Nginx as a reverse proxy in front of the `web` and `server` containers.

## Architecture

```
Nginx (80)  → redirect to HTTPS
Nginx (443) → web (Next.js)
            → server (Fastify) at /api/
```

## Services

| Service | Image |
|---|---|
| `nginx` | `nginx:stable-alpine` |
| `web` | `brunoscastilho/python-editor-web:latest` |
| `server` | `brunoscastilho/python-editor-server:latest` |

All containers are configured with `restart: always`.

## SSL Certificate

The Nginx container expects the Let's Encrypt certificate and private key to be present on the host at `/etc/letsencrypt/archive/python-editor.com/` before starting. Generate them with Certbot in standalone mode (run this **before** starting the stack for the first time, or while the stack is stopped):

```bash
certbot certonly --standalone \
  -d python-editor.com \
  -d www.python-editor.com
```

Certbot will place `fullchain.pem` and `privkey.pem` in `/etc/letsencrypt/archive/python-editor.com/`, which Docker Compose mounts into the Nginx container at `/etc/nginx/certs/`.

To renew the certificate, stop the stack, run `certbot renew`, then restart:

```bash
docker compose down
certbot renew
docker compose up -d
```

## Running

Create a `.env` file in this folder with all required variables (see [Environment Variables](#environment-variables) below), then start the stack:

```bash
docker compose up -d
```

To pull the latest images and recreate the containers:

```bash
docker compose pull
docker compose up -d --remove-orphans
```

## Environment Variables

Create a `.env` file alongside `docker-compose.yml` with the following variables:

| Variable | Description |
|---|---|
| `APP_BASE_URL` | Public base URL of the server (e.g. `https://api.example.com`) |
| `CORS_ORIGIN` | Allowed CORS origin (e.g. `https://example.com`) |
| `ACCESS_TOKEN_SECRET` | Secret for signing short-lived access JWTs |
| `REFRESH_TOKEN_SECRET` | Secret for signing long-lived refresh JWTs |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASSWORD` | SMTP authentication password |
| `SMTP_FROM` | Sender address for outgoing emails |
| `SMTP_SECURE` | Use TLS — `true` or `false` |
| `STORAGE_ENDPOINT` | S3-compatible endpoint URL |
| `STORAGE_REGION` | S3 region |
| `STORAGE_ACCESS_KEY_ID` | S3 access key ID |
| `STORAGE_SECRET_ACCESS_KEY` | S3 secret access key |
| `STORAGE_AVATARS_BUCKET` | S3 bucket for user avatars |
| `STORAGE_PROJECTS_BUCKET` | S3 bucket for project files |
| `STORAGE_PUBLIC_URL` | Public base URL for stored files |

## Nginx

[`nginx/config/default.conf`](nginx/config/default.conf) configures two upstreams and two server blocks:

- Port **80** redirects all HTTP traffic to HTTPS (`301`).
- Port **443** terminates TLS using the certificate mounted at `/etc/nginx/certs/` and proxies:
  - `/` → `web` container
  - `/api/` → `server` container (trailing slash strips `/api` from the upstream path)

All upstreams forward `Host`, `X-Real-IP`, and `X-Forwarded-Proto` headers. The `server` upstream also sets `proxy_http_version 1.1` for keep-alive support.
