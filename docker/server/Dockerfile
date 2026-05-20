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

COPY --from=source /src      /src

# Install only production dependencies
WORKDIR /src/apps/server

RUN bun install -p


# Generate Prisma client and database schemas
WORKDIR /src/packages/db

RUN bun db:generate


# Build and compile the server into a standalone executable
WORKDIR /src/apps/server

RUN bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile server


# # ──────────────────────────────────────────────────────────────────────────────
# # Stage 3 – Minimal production runtime image
# # ──────────────────────────────────────────────────────────────────────────────
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 server \
    && adduser --system --uid 1001 --ingroup server appuser

COPY --from=builder --chown=appuser:server /src/node_modules/geoip-lite/data /src/node_modules/geoip-lite/data
COPY --from=builder --chown=appuser:server /src/apps/server/server ./server

RUN chmod +x ./server

USER appuser

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80
CMD ["./server"]
