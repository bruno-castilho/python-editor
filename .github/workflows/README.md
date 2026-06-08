# Workflows

## tests.yml

Triggered on every **pull request targeting `main`**. Runs three jobs in parallel:

### unit-tests

Installs dependencies and runs `npm test` (Vitest unit tests). No external services required.

### e2e-server

Runs the server e2e suite (`npm run test:e2e:server`) against real infrastructure spun up inside the runner:

| Service | Image | Port |
|---|---|---|
| PostgreSQL 17 | `postgres:17` | 5432 |
| Redis | `redis:alpine` | 6379 |
| MailHog | `mailhog/mailhog` | 1025 / 8025 |
| MinIO | `minio/minio` | 9000 / 9001 |

PostgreSQL and Redis are started as Docker service containers with health checks. MinIO is started manually via `docker run` and the `mc` CLI is used to create the `avatars` and `projects` buckets before the tests run.

### e2e-web

Runs the Playwright end-to-end web suite (`npm run test:e2e:web`) using Chromium. The browser binary is cached by `package-lock.json` hash to speed up subsequent runs. The Playwright HTML report is uploaded as an artifact (`playwright-report`, retained for 7 days) on every run, including failures.

---

## deploy.yml

Triggered on every **push to `main`** and via **workflow_dispatch**. Runs three jobs in order:

### build-server-image

Builds `docker/server/Dockerfile` and pushes two tags to Docker Hub:
- `brunoscastilho/python-editor-server:latest`
- `brunoscastilho/python-editor-server:<sha>`

### build-web-image

Builds `docker/web/Dockerfile` with `NEXT_PUBLIC_SERVER_URL` injected as a build argument (baked into the Next.js static output), then pushes:
- `brunoscastilho/python-editor-web:latest`
- `brunoscastilho/python-editor-web:<sha>`

### deploy

Runs after both image jobs succeed. Authenticates to AWS and sends an SSM Run Command (`deploy-python-editor`) targeting EC2 instances tagged `DeployTarget=python-editor`. The job then polls every 10 seconds (up to 5 minutes) and exits non-zero if the command fails or times out.

See [`aws/ssm/README.md`](../../aws/ssm/README.md) for details on what the SSM document does on the instance.

### Required secrets

| Secret | Used by |
|---|---|
| `DOCKERHUB_USERNAME` | build-server-image, build-web-image |
| `DOCKERHUB_TOKEN` | build-server-image, build-web-image |
| `NEXT_PUBLIC_SERVER_URL` | build-web-image |
| `AWS_ACCESS_KEY_ID` | deploy |
| `AWS_SECRET_ACCESS_KEY` | deploy |
| `AWS_REGION` | deploy |
