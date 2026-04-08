# XyphyX Internal Project Template Constitution

## Core Principles

### I. Type Safety is Non-Negotiable
TypeScript strict mode is always on (`strict: true`, `noUncheckedIndexedAccess: true`). No `any` unless absolutely unavoidable and explicitly suppressed with a justification comment. All function signatures, API boundaries, and data models must be fully typed. Type inference is preferred over explicit annotations where unambiguous.

### II. Test-First for Non-Trivial Logic
Unit tests are required for business logic, utilities, and data transformations. Coverage thresholds are enforced: 80% lines/functions/statements, 70% branches. Integration tests must hit real services — no mocking the database or Convex. E2E tests cover critical user journeys via Playwright. Tests live alongside the code they test.

### III. Security by Default
Security is never an afterthought. Every feature must:
- Never commit secrets, credentials, or `.env` files
- Sanitize all user input at system boundaries
- Avoid OWASP Top 10 vulnerabilities (no SQL injection, XSS, command injection, CSRF)
- Use Convex's type-safe query/mutation API — no raw database access
- Delegate auth to Clerk — never store passwords or roll custom auth
- Respect CSP, HSTS, and security headers configured at the Next.js layer
- Pass CodeQL static analysis on every PR

### IV. Simplicity Over Cleverness
The right amount of complexity is what the task actually requires — no more. Prefer composition over abstraction. Three similar lines of code is better than a premature helper. Do not create utilities, helpers, or abstractions for one-time operations. Do not design for hypothetical future requirements. No backwards-compatibility shims, re-exports, or dead code.

### V. Conventional Commits and Small PRs
Every commit follows Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`). PRs are focused — one concern per change. Commit messages explain *why*, not just *what*. The `commit-msg` hook enforces the format.

### VI. Monorepo Discipline
This is a pnpm monorepo. Packages live in `packages/`. Apps live in `apps/`. Shared code is extracted to packages, not duplicated across apps. Each package has its own `tsconfig.json` extending the root. `pnpm -r` commands run across all packages. Never add a dependency at the root unless it is a dev tool used by all packages.

### VII. Observability and Error Handling
Validate at system boundaries (user input, external APIs). Trust internal code and framework guarantees — do not add fallbacks for scenarios that cannot happen. Errors surface clearly with context. No silent failures.

## Technical Standards

### Stack
- **Frontend**: Next.js (App Router), React, TypeScript
- **Backend**: Convex (real-time database and serverless functions)
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Package Manager**: pnpm
- **CI**: GitHub Actions with CodeQL, dependency audit, coverage enforcement

### Code Quality
- Biome enforces formatting and linting — `pnpm lint:fix` before committing
- TypeScript compilation must pass with zero errors
- No `console.log` in production code
- Components are small and single-purpose
- Server Components by default; Client Components only when interactivity requires it

### Performance
- Images use `next/image`; fonts use `next/font`
- No unnecessary client-side state; prefer server-rendered data
- Bundle size reviewed on significant dependency additions

### Security Standards
- Secrets via environment variables only; never hardcoded
- Dependencies audited weekly via Dependabot and in CI via `pnpm audit`
- All PRs pass CodeQL analysis before merge
- Authentication is Clerk-only; all protected routes verify session server-side

## Development Workflow

### Quality Gates (all PRs must pass)
1. TypeScript compilation — zero errors
2. Biome lint and format
3. Vitest unit tests with coverage thresholds (80/80/70/80)
4. CodeQL analysis
5. `pnpm audit` — no high/critical vulnerabilities

### Spec-Driven Development (SDD)
Features and significant changes use the Spec Kit pipeline:
1. **Constitution** (this document) — governs all decisions
2. **Specify** (`/speckit-specify`) — functional requirements and acceptance criteria
3. **Clarify** (`/speckit-clarify`) — resolve ambiguities before planning
4. **Plan** (`/speckit-plan`) — technical architecture and strategy
5. **Tasks** (`/speckit-tasks`) — actionable, dependency-ordered breakdown
6. **Implement** (`/speckit-implement`) — engineers execute per spec and plan

Bug fixes and trivial changes skip SDD. Features and significant refactors require it.

## Governance

This constitution supersedes all other development practices. Amendments require a written rationale, CTO approval, and an update to this document. All PRs and reviews must verify compliance with these principles. Complexity must be justified — if a reviewer cannot understand why something is complex, it is too complex.

**Version**: 1.0.0 | **Ratified**: 2026-04-07 | **Last Amended**: 2026-04-07
