# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 – Clone source code
# ──────────────────────────────────────────────────────────────────────────────
FROM alpine/git AS source

ARG REPO_URL=https://github.com/bruno-castilho/python-editor.git
ARG GIT_REF=main

WORKDIR /src

RUN test -n "${REPO_URL}" || (echo "ERROR: REPO_URL build arg is required" && exit 1) \
    && git clone --depth=1 --branch "${GIT_REF}" "${REPO_URL}" . \
    && rm -rf .git

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 – Build
# ──────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

ARG NEXT_PUBLIC_SERVER_URL

COPY --from=source /src      /src

# # # Install dependencies
WORKDIR /src
RUN bun install

# # # Generate Prisma client and database schemas
WORKDIR /src/packages/db
RUN bun run db:generate

# # # Build and compile the web into a standalone executable
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

WORKDIR /src/apps/web
RUN bun run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 – Run
# ──────────────────────────────────────────────────────────────────────────────
FROM node:24.16.0-bullseye-slim AS runner

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# Standalone output (mirrors monorepo root, includes server.js and node_modules)
COPY --from=builder /src/apps/web/.next/standalone ./

# Static assets must be served from the path Next.js expects
COPY --from=builder /src/apps/web/.next/static     ./apps/web/.next/static

# Public folder
COPY --from=builder /src/apps/web/public           ./apps/web/public

EXPOSE 80

CMD ["node", "apps/web/server.js"]
