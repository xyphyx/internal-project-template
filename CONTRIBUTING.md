# Contributing

Thank you for contributing to this project. This document covers the development workflow, conventions, and standards.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9 — install with `corepack enable && corepack prepare pnpm@latest --activate`
- [Git](https://git-scm.com/)

## Getting started

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-name>

# 2. Install dependencies
pnpm install

# 3. Copy env file and fill in values
cp .env.example .env.local

# 4. Start Convex dev server (separate terminal)
pnpm convex:dev

# 5. Start the Next.js dev server
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Project structure

```
.
├── apps/
│   └── web/          # Next.js 16 app (App Router)
├── packages/
│   └── shared/       # Shared utilities and types
├── convex/           # Convex backend (schema, functions)
├── tests/
│   ├── e2e/          # Playwright end-to-end tests
│   └── unit/         # Vitest unit tests
└── .github/
    └── workflows/    # CI/CD pipelines
```

## Development workflow

### Branch model

We use a three-tier branching model:

| Branch | Purpose | Merges into |
|--------|---------|-------------|
| `main` | Production-ready code | — (release target) |
| `dev` | Integration / staging | `main` (via release PR) |
| `feature/*` | New features | `dev` |
| `fix/*` | Bug fixes | `dev` |
| `hotfix/*` | Critical production patches | `main` + backmerge to `dev` |
| `chore/*` | Tooling / deps / config | `dev` |
| `docs/*` | Documentation only | `dev` |

**Branch naming:** `<type>/<kebab-description>` — e.g. `feature/user-auth` or `fix/XYP-42-login-error`

Allowed types: `feature`, `fix`, `hotfix`, `chore`, `docs`, `refactor`, `perf`, `test`

Branch names are validated by the `pre-push` hook and CI on pull requests. Direct pushes to `main` or `dev` are blocked.

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`

Examples:
```
feat(auth): add Google OAuth provider
fix(dashboard): resolve task list flickering on load
chore: update biome to 1.9.1
```

### Pull requests

1. Branch from `dev` (or `main` for hotfixes)
2. Make your changes
3. Ensure all checks pass locally:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
4. Open a PR targeting `dev` (or `main` for hotfixes) using the [PR template](.github/pull_request_template.md)
5. Request a review — 1 approval required for `dev`, 2 for `main`

### Release process

1. Ensure `dev` is green with all planned work merged
2. Bump version: open `chore/vX.Y.Z-release-prep` PR → `dev`
3. Open release PR: `dev → main`, title `release: vX.Y.Z`
4. CI runs all checks; obtain 2 approvals (engineering + platform)
5. Merge to `main` (merge commit)
6. Push annotated tag: `git tag -a vX.Y.Z -m "release: vX.Y.Z" && git push origin vX.Y.Z`
7. `release.yml` generates changelog and creates a GitHub Release automatically

## Code style

Formatting and linting are handled by [Biome](https://biomejs.dev/). Pre-commit hooks run automatically via Husky + lint-staged.

To run manually:
```bash
pnpm lint        # Check
pnpm lint:fix    # Auto-fix
pnpm format      # Format only
```

## Testing

```bash
# Unit tests (Vitest)
pnpm test

# Unit tests with coverage
pnpm test -- --coverage

# E2E tests (Playwright) — requires dev server running
pnpm test:e2e

# E2E tests with UI
pnpm exec playwright test --ui
```

## Environment variables

See [`.env.example`](.env.example) for all required variables. Never commit `.env.local` or any file with real credentials.

## Convex

```bash
# Start the Convex dev watcher (required for local development)
pnpm convex:dev

# Deploy Convex to production
pnpm convex:deploy
```

Convex generates types automatically in `convex/_generated/` — do not edit those files manually.

## Self-hosted Convex (optional)

For teams that need a fully self-hosted backend:

```bash
# Start both the Convex backend and the web app
docker compose up
```

See `docker-compose.yml` for the full configuration.

## Questions?

Open a discussion or post in the team Slack channel.
