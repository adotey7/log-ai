# AI Logger — Execution Plan

> **Decisions Log**
> - **Repo type**: Open-source, self-hosted, monorepo
> - **Default AI provider**: Google Gemini Flash (via Vercel AI SDK)
> - **Next.js version**: 16.2
> - **Deployment**: Docker Compose (primary), Vercel-compatible dashboard (optional)
> - **SDK auth**: Open ingestion (no API key required to post logs)
> - **Dashboard auth**: Seeded admin user (no registration page)
> - **SDK scope**: Browser-only, framework-agnostic
> - **OpenAI key**: BYO — set as backend env var per deployment

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  SDK Layer   │────▶│  API Layer   │────▶│  PostgreSQL  │
│  (Any App)   │     │ @ai-logger/sdk│     │  Fastify API │     │   Database   │
└──────────────┘     └──────────────┘     └──────┬───────┘     └──────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │  AI Service  │
                                           │  (Vercel     │
                                           │   AI SDK)    │
                                           └──────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │  Dashboard   │
                                           │  Next.js 16.2│
                                           └──────────────┘
```

---

## Tech Stack (Latest Versions — April 2026)

| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Node.js | 24.15.0 LTS |
| **Package Manager** | pnpm | 10.x |
| **Monorepo** | pnpm workspaces | — |
| **API** | Fastify | 5.8.x |
| **Database** | PostgreSQL | 17.9 |
| **Migrations** | node-pg-migrate | latest |
| **Dashboard** | Next.js | 16.2 |
| **Styling** | Tailwind CSS | 4.x |
| **AI Abstraction** | Vercel AI SDK | 6.x |
| **AI Provider** | @ai-sdk/google | latest |
| **Validation** | Zod | latest |
| **SDK Bundle** | tsup | latest |
| **Auth** | bcrypt + JWT | — |

---

## Directory Structure

```
ai-logger/
├── apps/
│   ├── api/                  # Fastify REST API
│   └── dashboard/            # Next.js 16.2 admin dashboard
├── packages/
│   └── sdk/                  # Browser error capture SDK
├── packages/database/        # Shared DB client & migrations
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── docs/
    └── phases.md             # This file
```

---

## Phase 1: Foundation & API (Days 1–2)

### 1.1 Monorepo Setup
- Initialize root `package.json` with pnpm workspaces
- Configure `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'apps/*'
    - 'packages/*'
  ```
- Add shared dev dependencies: `typescript`, `vitest`, `prettier`, `eslint`
- Create `.env.example` with all required variables

### 1.2 Docker Compose
- `docker-compose.yml` with three services:
  - `postgres`: PostgreSQL 17.9, volume for persistence
  - `api`: Fastify API, hot-reload in dev
  - `dashboard`: Next.js 16.2 dev server
- Health checks and dependency ordering

### 1.3 Database Layer (`packages/database`)
- Schema:
  ```sql
  CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    stack TEXT,
    url TEXT,
    metadata JSONB,
    explanation TEXT,
    causes JSONB,
    fix TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- Migration system with `node-pg-migrate`
- Seed script for default admin user
- Shared `pg` client exported for API/Dashboard usage

### 1.4 Fastify API (`apps/api`)
Endpoints:

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/login` | Public | Admin login → JWT |
| POST | `/logs` | Open | Ingest error log |
| GET | `/logs` | JWT | List all logs |
| GET | `/logs/:id` | JWT | Get single log |
| POST | `/logs/:id/explain` | JWT | Trigger AI explanation |

- CORS configured for dashboard origin
- Zod validation on all inputs
- Error handling middleware

### 1.5 AI Integration (`apps/api`)
- Use Vercel AI SDK with `@ai-sdk/google`
- Provider/model configured via env:
  ```
  AI_PROVIDER=google
  AI_MODEL=gemini-2.0-flash
  GOOGLE_GENERATIVE_AI_API_KEY=...
  ```
- Structured output with Zod schema:
  ```ts
  const ExplanationSchema = z.object({
    explanation: z.string(),
    causes: z.array(z.string()).length(3),
    fix: z.string(),
  });
  ```
- Prompt template:
  ```
  You are a senior software engineer. Explain this error clearly and concisely.

  Error: {{message}}
  Stack: {{stack}}

  Return JSON only. No extra text, no markdown, no generic advice.
  ```
- Store result in `logs` table, return to client

**Done when:**
- [ ] `docker-compose up` starts all services
- [ ] POST `/logs` stores a log in Postgres
- [ ] POST `/logs/:id/explain` returns structured AI output

---

## Phase 2: Browser SDK (Days 2–3)

### 2.1 Package Setup (`packages/sdk`)
- Package name: `@ai-logger/sdk`
- Build outputs: ESM, CJS, IIFE (via `tsup`)
- Zero runtime dependencies

### 2.2 SDK API
```ts
interface SDKConfig {
  endpoint: string;          // API URL
  autoCapture?: boolean;     // Enable global handlers (default: true)
  maxStackLines?: number;    // Truncate stack traces (default: 50)
}

class AiLogger {
  static init(config: SDKConfig): void
  static log(error: Error, context?: Record<string, any>): Promise<void>
  static captureMessage(message: string, context?: Record<string, any>): Promise<void>
}
```

### 2.3 Features
- **Global error capture**:
  - `window.onerror` → uncaught exceptions
  - `window.onunhandledrejection` → unhandled promise rejections
- **Manual logging** via `AiLogger.log(error)`
- **Metadata collection**:
  - `url` (window.location.href)
  - `timestamp` (ISO 8601)
  - `userAgent` (navigator.userAgent)
  - `language` (navigator.language)
  - `viewport` (`{ width, height }`)
  - Custom `context` object (dev-defined)
- **Stack trace truncation** to keep payloads small
- **Silent failures** — SDK never throws, never crashes host app

### 2.4 Usage Example
```html
<script type="module">
  import { AiLogger } from '@ai-logger/sdk';

  AiLogger.init({
    endpoint: 'https://your-api.com/logs',
    autoCapture: true
  });

  // Manual logging
  try {
    riskyOperation();
  } catch (err) {
    AiLogger.log(err, { userId: '123', feature: 'checkout' });
  }
</script>
```

**Done when:**
- [ ] SDK package builds to ESM/CJS/IIFE
- [ ] Injecting a JS error in a test page appears in the DB
- [ ] SDK does not throw even if API is down

---

## Phase 3: Dashboard (Days 3–5)

### 3.1 Next.js 16.2 Setup (`apps/dashboard`)
- App Router
- Tailwind CSS 4 for styling
- Server Components for data fetching where possible

### 3.2 Authentication
- Login page (`/login`)
- JWT stored in httpOnly cookie (or secure localStorage fallback)
- Protected route middleware
- Default admin seeded on first DB migration

### 3.3 Log List (`/logs`)
- Table view: message preview, timestamp
- Sort by date (newest first)
- Search by message text
- Pagination (20 per page)

### 3.4 Log Detail (`/logs/[id]`)
- Raw error display:
  - Message
  - Stack trace (collapsible, syntax-highlighted)
  - Metadata (formatted JSON)
- **"Explain Error"** button:
  - Shows loading state
  - Displays AI explanation when ready
  - Explanation card with:
    - What broke (explanation)
    - 3 possible causes (list)
    - Suggested fix (code block if applicable)
- **Status indicator**: whether explanation exists or not

### 3.5 UI/UX
- Dark mode by default (dev-friendly)
- Responsive layout
- Loading skeletons
- Error boundaries

**Done when:**
- [ ] Admin can log in
- [ ] Log list loads and paginates
- [ ] Clicking "Explain Error" returns useful output
- [ ] Dashboard feels fast and polished

---

## Phase 4: Polish & DX (Days 5–7)

### 4.1 Edge Cases
- [ ] Empty stack traces → AI still works
- [ ] Minified/stack traces too long → truncate before sending to AI
- [ ] Network failures in SDK → queue and retry (or silently drop)
- [ ] AI returns invalid JSON → retry once, then return error message
- [ ] AI timeout (30s) → return graceful error

### 4.2 Security
- [ ] CORS: only allow dashboard origin + SDK origins
- [ ] Input sanitization via Zod
- [ ] Password hashing with `bcrypt` (cost factor 12)
- [ ] JWT expiration (24h)
- [ ] No sensitive user data logged by default
- [ ] `.env.example` with security warnings

### 4.3 Multi-Provider Support
- [ ] AI provider abstraction via Vercel AI SDK
- [ ] Easy provider switching:
  ```env
  AI_PROVIDER=google      # or openai, anthropic, etc.
  AI_MODEL=gemini-2.0-flash
  GOOGLE_GENERATIVE_AI_API_KEY=...
  ```
- [ ] Install `@ai-sdk/openai`, `@ai-sdk/anthropic` as optional peer deps
- [ ] Document all supported providers

### 4.4 Documentation
- [ ] Root `README.md` with quickstart (`docker-compose up`)
- [ ] `apps/api/README.md` with API reference
- [ ] `apps/dashboard/README.md` with deployment notes
- [ ] `packages/sdk/README.md` with integration examples for React, Vue, Svelte
- [ ] `.env.example` fully documented
- [ ] `AGENTS.md` for contributors

### 4.5 Success Check
Run the end-to-end test:
1. Start stack with `docker-compose up`
2. Open a test HTML page with SDK integrated
3. Trigger a real JS error
4. Open dashboard, find the log
5. Click "Explain Error"
6. Fix the bug in under 2 minutes using the AI output

**Done when:**
- [ ] All edge cases handled
- [ ] Documentation is complete
- [ ] E2E test passes

---

## Post-MVP Roadmap (Do Not Build Yet)

- [ ] Error grouping / deduplication
- [ ] Real-time log streaming (WebSockets)
- [ ] GitHub integration (link to file/line)
- [ ] CLI tool for local log viewing
- [ ] Multiple projects/workspaces
- [ ] Alerting system (email/Slack)
- [ ] Error trending/analytics
- [ ] Source map support for minified stacks

---

## Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ailogger

# API
PORT=3001
JWT_SECRET=change-me-in-production
CORS_ORIGIN=http://localhost:3000

# AI (BYO key — supports multiple providers)
AI_PROVIDER=google
AI_MODEL=gemini-2.0-flash
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here

# Optional: switch to OpenAI
# AI_PROVIDER=openai
# AI_MODEL=gpt-4o-mini
# OPENAI_API_KEY=your-key-here

# Optional: switch to Anthropic
# AI_PROVIDER=anthropic
# AI_MODEL=claude-sonnet-4.6
# ANTHROPIC_API_KEY=your-key-here

# Admin seed (first run only)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-immediately
```

---

## Framework Support Matrix

The SDK is **framework-agnostic** by design. It works with any framework that runs in the browser:

| Framework | Integration | Notes |
|-----------|-------------|-------|
| **React** | `useEffect(() => AiLogger.init(...), [])` | Works in all versions |
| **Next.js** | `use client` directive + `useEffect` | Do not init in RSC |
| **Vue** | `onMounted(() => AiLogger.init(...))` | Composition or Options API |
| **Svelte** | `onMount(() => AiLogger.init(...))` | Svelte 4/5 compatible |
| **Angular** | `ngOnInit() { AiLogger.init(...) }` | Import in app component |
| **Solid** | `onMount(() => AiLogger.init(...))` | Works out of the box |
| **Vanilla JS** | `<script type="module">` | No framework needed |

No framework-specific wrappers needed. Just call `AiLogger.init()` once when your app mounts.

---

*Last updated: April 29, 2026*
