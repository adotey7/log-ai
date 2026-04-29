# Contributing to AI Logger

Thanks for your interest in contributing! AI Logger is a self-hosted, open-source error logging tool with AI-powered explanations. This guide covers how to set up your development environment, make changes, and submit contributions.

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Development Setup

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** 10.x
- **PostgreSQL** 17 (local or Docker)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/ai-logger.git
cd ai-logger

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up postgres -d
# Or use your local PostgreSQL instance

# Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env:
#   - Add your AI API key (Google Gemini free tier works)
#   - Set DATABASE_URL to your PostgreSQL connection

# Run migrations and seed
pnpm --filter @ai-logger/database db:migrate
pnpm --filter @ai-logger/database db:seed

# Start dev servers
pnpm dev
```

### Services

| Service | URL | Port |
|---------|-----|------|
| Dashboard | http://localhost:3000 | 3000 |
| API | http://localhost:3001 | 3001 |
| Docs | http://localhost:3002 | 3002 |

## Project Structure

```
apps/
├── api/                  # Fastify REST API
│   └── src/
│       ├── server.ts     # Entry point
│       ├── routes/       # API route handlers
│       └── services/     # Business logic (AI, auth)
├── dashboard/            # Next.js admin dashboard
│   ├── app/              # App Router pages & layouts
│   ├── components/       # Shared React components
│   └── lib/              # API client & utilities
└── docs/                 # Documentation site
    ├── app/              # App Router pages
    ├── components/       # Shared doc components
    ├── hooks/            # Custom React hooks
    └── data/             # Static content data

packages/
├── database/             # DB client, migrations, seed
│   ├── src/
│   └── migrations/
└── sdk/                  # Browser error capture SDK
    └── src/
```

## Development Workflow

### Branching

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the conventions below.

3. Build and test:
   ```bash
   pnpm build        # Build all packages
   pnpm lint         # Lint all packages
   pnpm test         # Run all tests
   ```

4. Commit with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add error grouping by stack fingerprint
   fix: handle empty stack traces in AI explanation
   docs: update SDK integration guide
   ```

5. Push and open a Pull Request.

### Code Conventions

#### General

- **TypeScript** throughout — no `any` without justification
- Use `const` and `let`, never `var`
- Prefer `async/await` over raw Promises
- Use descriptive variable names

#### React / Next.js

- **Server Components by default** — only add `"use client"` when needed (hooks, event handlers, browser APIs)
- Use `next/font` for fonts, never `<link>` tags
- Routes-only inside `app/` directory — components, hooks, libs live at the project root
- Use `@/` path alias for all imports
- Export `metadata` and `viewport` from server components

#### Turborepo

- Package tasks in package `package.json`, root **only** delegates via `turbo run <task>`
- No `&&` chains in root scripts
- Cross-platform scripts (no `rm -rf`)

#### CSS / Styling

- Tailwind CSS 4 utility classes
- Custom CSS in `globals.css` only for Tailwind-inaccessible features
- Use CSS custom properties from `@theme` for design tokens

### Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @ai-logger/api test
pnpm --filter @ai-logger/sdk test
```

Test the SDK end-to-end:

1. Start the stack: `pnpm dev`
2. Open `test.html` in a browser
3. Click "Trigger Error" buttons
4. Verify errors appear in the dashboard at http://localhost:3000/logs

## Environment Variables

Never commit `.env` files. Each app has its own `.env`:

| File | Purpose |
|------|---------|
| `apps/api/.env` | API server config, database URL, AI keys, JWT secret |
| `apps/dashboard/.env` | API URL (`NEXT_PUBLIC_API_URL`) |
| `packages/database/.env` | Database URL, admin seed credentials |

See `.env.example` for all available variables.

## Database Migrations

Migrations live in `packages/database/migrations/`. To create a new migration:

```bash
pnpm --filter @ai-logger/database db:migrate create migration-name
```

This generates a timestamped SQL file. Write your up/down migration, then:

```bash
pnpm --filter @ai-logger/database db:migrate
```

## AI Providers

The AI service uses [Vercel AI SDK](https://sdk.vercel.ai/) to support multiple providers. To add a new provider:

1. Install the provider package in `apps/api/`
2. Add provider configuration in `apps/api/src/services/ai.ts`
3. Update `.env.example` with the new provider's env vars
4. Add docs to the provider configuration table

## Pull Request Checklist

- [ ] Code follows project conventions
- [ ] TypeScript compiles without errors (`pnpm build` passes)
- [ ] Lint passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] No `.env` files committed
- [ ] PR description explains the change and motivation
- [ ] Breaking changes are documented

## Getting Help

- **Issues**: Open a [GitHub issue](https://github.com/yourusername/ai-logger/issues)
- **Discussions**: Start a [GitHub discussion](https://github.com/yourusername/ai-logger/discussions)
- **Docs**: See `apps/docs/` for the full documentation site

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
