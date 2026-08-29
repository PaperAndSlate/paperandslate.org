FROM node:22-bookworm-slim AS builder

WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/content/package.json packages/content/package.json
COPY packages/design-system/package.json packages/design-system/package.json
COPY packages/docs-ingestion/package.json packages/docs-ingestion/package.json
COPY packages/search/package.json packages/search/package.json
COPY patches/extract-zip@2.0.1.patch patches/extract-zip@2.0.1.patch
RUN pnpm install --frozen-lockfile

COPY . .
# Sibling-local standards sources are validated before the image build in CI, but are
# intentionally outside this repository's Docker context. The generated docs bundle
# is the immutable build input; search records are regenerated from that bundle here.
RUN pnpm security:scan && pnpm search:index && pnpm build:web

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Coolify's in-container HTTP health probe uses curl or wget even when the
# image declares a native Docker healthcheck. Keep the runtime image slim, but
# provide the probe client required by the staging deployment contract.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /workspace/apps/web/.next/standalone ./
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /workspace/apps/web/public ./apps/web/public
RUN chown -R node:node /app

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then((r) => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"
CMD ["node", "apps/web/server.js"]
