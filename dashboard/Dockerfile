# Build Stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Build-Dependencies für better-sqlite3 (native addon)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Dependencies installieren
COPY package.json bun.lock* ./
RUN bun install

# Source kopieren und bauen
COPY . .
RUN bun run build

# Production Stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Standalone Output kopieren
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Daten-Verzeichnis erstellen
RUN mkdir -p /data

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "server.js"]
