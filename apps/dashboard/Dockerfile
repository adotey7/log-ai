FROM node:24-alpine AS base

RUN npm install -g pnpm@10.10.0

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @ai-logger/dashboard build

EXPOSE 3000

CMD ["pnpm", "--filter", "@ai-logger/dashboard", "start"]
