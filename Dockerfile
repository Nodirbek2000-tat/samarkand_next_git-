# Yangi Samarqand — Next.js site (standalone server)
# exact Node (bundled npm 11.6.1) that produced package-lock.json — a newer npm rejects it in `npm ci`
FROM node:24.11.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24.11.0-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# rewrites (/api, /media -> Django) are fixed at build time; inside Docker Django is "backend"
ARG DJANGO_URL=http://backend:8000
ENV DJANGO_URL=$DJANGO_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.11.0-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
# the optimized-image cache lives on a volume (docker-compose.yml): it starts out owned by the app user
RUN mkdir -p .next/cache && chown nextjs:nodejs .next/cache
USER nextjs
EXPOSE 3000
CMD ["sh", "./docker-entrypoint.sh"]
