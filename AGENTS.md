# AI Logger — Agent Notes

## Project Overview

AI Logger is a self-hosted, open-source error logging tool with AI-powered explanations.

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **API**: Fastify 5.8 (apps/api)
- **Dashboard**: Next.js 16.2 App Router (apps/dashboard)
- **Database**: PostgreSQL 17 with node-pg-migrate (packages/database)
- **SDK**: Browser-only TypeScript library (packages/sdk)
- **AI**: Vercel AI SDK v4 with multi-provider support (Google, OpenAI, Anthropic)

## Key Conventions

### Package Tasks (Turborepo)
- All task logic lives in package `package.json` scripts
- Root `package.json` ONLY delegates via `turbo run <task>`
- No root tasks or `&&` chains

### Environment Variables
- No root `.env` file
- Each app/package has its own `.env` if needed
- `apps/api/.env` for API config
- `apps/dashboard/.env` for dashboard config

### Database
- Migrations in `packages/database/migrations/`
- Use `pnpm --filter @ai-logger/database db:migrate`
- Seed script creates default admin user

### AI Providers
- Configured via `AI_PROVIDER` and `AI_MODEL` env vars
- Supported: `google`, `openai`, `anthropic`
- Default: Google Gemini Flash

## Build Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start dev servers
pnpm dev

# Database
pnpm --filter @ai-logger/database db:migrate
pnpm --filter @ai-logger/database db:seed
```

## File Structure

```
apps/
  api/           # Fastify REST API
    src/
      server.ts
      routes/
        auth.ts
        logs.ts
      services/
        ai.ts
      lib/
        jwt.ts
  dashboard/     # Next.js 16.2 dashboard
    app/
      layout.tsx
      login/
      logs/
      logs/[id]/
    middleware.ts
packages/
  database/      # DB client + migrations
    src/
      index.ts
      seed.ts
    migrations/
  sdk/           # Browser SDK
    src/
      index.ts
```

## Testing

Use `test.html` in the repo root to test SDK integration:
1. Start API server
2. Open `test.html` in browser
3. Click buttons to trigger errors
4. Verify logs appear in dashboard

## Security Notes

- SDK uses open ingestion (no API key required)
- Dashboard protected by JWT auth
- Admin user seeded on first migration
- CORS configured for dashboard origin only
