# XyphyX Internal Project Template

A production-ready monorepo template for XyphyX projects.

**Stack:** Next.js 16 · Convex · Clerk · Tailwind v4 · shadcn/ui · TypeScript 5 (strict) · pnpm workspaces · Biome · Vitest · Playwright

---

## Quick start

### Prerequisites

- Node.js >= 22
- pnpm >= 9

```bash
corepack enable && corepack prepare pnpm@latest --activate
```

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the required values:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | [Convex dashboard](https://dashboard.convex.dev) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk dashboard |
| `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks → your endpoint |

### 3. Start development servers

In two separate terminals:

```bash
# Terminal 1 — Convex dev watcher
pnpm convex:dev

# Terminal 2 — Next.js dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
internal-project-template/
├── apps/
│   └── web/                    # Next.js 16 app
│       └── src/
│           ├── app/            # App Router (pages, layouts, API routes)
│           ├── components/
│           │   └── ui/         # shadcn/ui base components
│           ├── middleware.ts   # Clerk auth middleware
│           └── env.ts          # T3 Env — type-safe env vars
├── packages/
│   └── shared/                 # Shared utils & types (workspace:*)
├── convex/
│   ├── schema.ts               # Database schema
│   ├── auth.config.ts          # Clerk JWT config
│   └── functions/              # Queries, mutations, actions
├── tests/
│   ├── e2e/                    # Playwright tests
│   └── unit/                   # Vitest tests
├── .github/
│   ├── workflows/              # CI (lint, test, build) + deploy
│   ├── dependabot.yml
│   └── pull_request_template.md
├── .husky/                     # Pre-commit hooks
├── biome.json                  # Linter + formatter config
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile                  # Multi-stage Next.js image
├── docker-compose.yml          # Self-hosted Convex option
└── vercel.json                 # Vercel deployment config
```

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome checks |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm convex:dev` | Start Convex dev watcher |
| `pnpm convex:deploy` | Deploy Convex to production |

---

## Deployment

### Vercel (primary)

1. Import the repo on [vercel.com](https://vercel.com)
2. Add all env vars from `.env.example` to the Vercel project
3. Set the root directory to `.` (monorepo root)
4. Vercel will use `vercel.json` for build settings

Preview deployments are automatically created for every PR.

### Self-hosted Convex (optional)

```bash
docker compose up
```

This starts the [open-source Convex backend](https://github.com/get-convex/convex-backend) locally alongside the Next.js app.

---

## Auth

Auth is handled by [Clerk](https://clerk.com). The Clerk provider wraps the entire app in `ConvexClientProvider`. Protected routes use the `clerkMiddleware` in `src/middleware.ts`.

Public routes (no auth required):
- `/`
- `/sign-in`, `/sign-up`
- `/api/webhooks/*`

All other routes redirect to `/sign-in` when unauthenticated.

### Clerk → Convex user sync

1. Create a webhook endpoint in the Clerk dashboard pointing to `https://your-domain.com/api/webhooks/clerk`
2. Subscribe to `user.created`, `user.updated`, `user.deleted` events
3. Set `CLERK_WEBHOOK_SECRET` in your env

---

## Observability

- **Vercel Analytics** — page view tracking (zero-config, GDPR-friendly)
- **Vercel Speed Insights** — Core Web Vitals monitoring
- **Convex dashboard** — backend function logs and query performance

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
