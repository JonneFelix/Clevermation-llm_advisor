FROM oven/bun:1-slim
WORKDIR /app

# Dependencies installieren
COPY package.json bun.lock* ./
RUN bun install --production

# Source kopieren
COPY src ./src
COPY tsconfig.json ./

EXPOSE 8080

ENV PORT=8080

CMD ["bun", "run", "src/index.ts"]
