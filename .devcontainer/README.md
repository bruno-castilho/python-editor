# Dev Container

This project includes a pre-configured Dev Container with all the dependencies needed for development.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed

## How to open the project in the Dev Container

1. Clone the repository and open the folder in VS Code.
2. When VS Code detects the `.devcontainer/devcontainer.json` file, a notification will appear in the bottom-right corner. Click **"Reopen in Container"**.
3. Alternatively, open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:
   ```
   Dev Containers: Reopen in Container
   ```
4. Wait for the image to build and the services to start. The first run may take a few minutes.

Once open, VS Code will be connected to the container with all tools available in the integrated terminal.

## What's included

### Tools installed in the image

| Tool              | Description                                               |
|-------------------|-----------------------------------------------------------|
| Node.js + npm     | Runtime and package manager (base image)                  |
| TypeScript        | Native support via base image                             |
| Docker CLI        | Docker client to run commands inside the container        |
| Docker Compose    | Service orchestration                                     |
| AWS CLI v2        | AWS command-line interface                                |
| Claude Code CLI   | Anthropic's official CLI for Claude Code                  |
| PostgreSQL client | `psql` for direct database access                         |

### Docker inside the container

The host Docker socket is mounted into the container (`/var/run/docker.sock`), allowing the Docker CLI and Docker Compose to be used directly in the container terminal without a separate Docker daemon (Docker-in-Docker via socket pattern).

```bash
docker ps
docker compose up -d
```

### AWS CLI

AWS CLI v2 is installed and ready to use. Configure your credentials before using it:

```bash
aws configure
# or use environment variables:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
```

SSO authentication is also supported:

```bash
aws sso login --profile <your-profile>
```

Once authenticated, all AWS commands work normally inside the container:

```bash
aws s3 ls
aws ssm get-parameter --name /my/parameter
```

### Claude Code CLI

[Claude Code](https://docs.anthropic.com/claude-code) is installed globally (`@anthropic-ai/claude-code`). To use it, authenticate with your Anthropic key:

```bash
claude
```

On the first run it will prompt you to authenticate via browser or API key. After that, you can use Claude Code directly in the terminal:

```bash
claude "explain this file"
claude --help
```

The `anthropic.claude-code` VS Code extension is also installed automatically in the container.

## Docker Compose services

The Dev Container starts the following services alongside the development container:

| Service  | Port(s)     | Description                              |
|----------|-------------|------------------------------------------|
| Postgres | 5432        | Primary database                         |
| Redis    | 6379        | Cache and session storage                |
| MinIO    | 9000 / 9001 | S3-compatible storage (9001 = console)   |
| MailHog  | 1025 / 8025 | Fake SMTP for development emails         |

### Access the MinIO console

Open [http://localhost:9001](http://localhost:9001) in your browser.
- Username: `admin`
- Password: `password`

### Access MailHog

Open [http://localhost:8025](http://localhost:8025) to view emails sent by the application during development.

## Forwarded ports

The Dev Container automatically forwards the following ports to the host:

| Port | Service          |
|------|------------------|
| 3000 | API (Fastify)    |
| 3001 | Frontend (Next)  |

## VS Code extensions installed

- **ms-azuretools.vscode-docker** — Docker support in VS Code
- **prisma.prisma** — syntax and autocomplete for `.prisma` files
- **anthropic.claude-code** — Claude Code integrated into the editor
