FROM node:24-alpine AS base

RUN npm install -g pnpm@10.10.0

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @ai-logger/database build
RUN pnpm --filter @ai-logger/api build

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
