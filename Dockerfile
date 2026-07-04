FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/ilhamspace.db
ENV PORT=3000
ENV HOST=0.0.0.0

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY server.ts ./
COPY server ./server
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY scripts/docker-entrypoint.sh scripts/db.ts scripts/check-migrations.ts scripts/has-admin.ts scripts/ensure-admin.ts scripts/verify-admin.ts scripts/seed-admin.ts ./scripts/
COPY src/lib/db/schema.ts ./src/lib/db/schema.ts

RUN DATABASE_PATH=/app/ilhamspace.db pnpm exec drizzle-kit migrate \
  && chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]