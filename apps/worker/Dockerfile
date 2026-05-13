# syntax=docker/dockerfile:1
# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/bling/package.json ./packages/bling/
COPY packages/security/package.json ./packages/security/

# Install only production deps for worker
RUN pnpm install --frozen-lockfile --filter @liveshop/worker...

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules

COPY . .

# Build shared packages first, then worker
RUN pnpm --filter @liveshop/database build || true
RUN pnpm --filter @liveshop/bling build || true
RUN pnpm --filter @liveshop/worker build

# ── Stage 3: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 liveshop \
 && adduser  --system --uid  1001 worker

# Copy built output
COPY --from=builder --chown=worker:liveshop /app/apps/worker/dist ./dist
COPY --from=builder --chown=worker:liveshop /app/apps/worker/package.json ./package.json
COPY --from=builder --chown=worker:liveshop /app/node_modules ./node_modules

USER worker

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
