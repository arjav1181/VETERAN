FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat git openssh
WORKDIR /app
COPY package.json tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache \
    nginx \
    supervisor \
    git \
    openssh \
    openssh-sftp-server \
    bash \
    curl \
    tzdata \
    logrotate

RUN addgroup -g 1001 -S veteran && \
    adduser -S veteran -u 1001 -G veteran

WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/package.json ./frontend/

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/supervisord.conf

RUN mkdir -p /data/repos /data/repos-wiki /data/lfs /data/uploads \
    /data/packages /data/codespaces /data/ci /data/backups /data/logs /data/ssh && \
    chown -R veteran:veteran /data /app

USER veteran

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 7860 2222 4873

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:7860/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
