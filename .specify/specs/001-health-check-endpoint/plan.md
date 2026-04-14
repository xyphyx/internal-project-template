# Implementation Plan: Health Check API Endpoint

**Branch**: `001-health-check-endpoint` | **Date**: 2026-04-13 | **Spec**: `spec.md`

## Summary

Enhance the existing stub `GET /api/health` route handler to return version, environment, and timestamp fields; add 405 handling for non-GET methods; exclude the endpoint from Clerk auth middleware; and add unit tests.

## Technical Context

**Language/Version**: TypeScript 5.7, Node.js 22
**Primary Dependencies**: Next.js App Router (Route Handlers), `@clerk/nextjs`
**Storage**: N/A
**Testing**: Vitest (unit)
**Target Platform**: Next.js server (Node.js runtime)
**Project Type**: Web service
**Performance Goals**: < 100ms p99
**Constraints**: Endpoint must be publicly accessible (no auth)

## Constitution Check

- ✅ **Type Safety**: Route handler will be fully typed; `HealthResponse` type defined.
- ✅ **Test-First**: Unit tests written for route handler before final implementation.
- ✅ **Security**: Endpoint is read-only, returns no sensitive data. Excluded from auth middleware explicitly.
- ✅ **Simplicity**: Single file change + one middleware line. No new abstractions needed.
- ✅ **Conventional Commits**: `feat(api): ...`

## Project Structure

```text
apps/web/src/
├── app/
│   └── api/
│       └── health/
│           └── route.ts          ← enhance existing stub
├── middleware.ts                  ← add /api/health to public routes
└── ...

apps/web/src/app/api/health/
└── route.test.ts                  ← new unit tests
```

## Implementation Strategy

### 1. Type definition

Define `HealthResponse` inline in `route.ts` (single-use — no shared package needed per constitution Principle IV).

```typescript
type HealthResponse = {
  status: "ok" | "error";
  version: string;
  environment: string;
  timestamp: string;
  message?: string;
};
```

### 2. Route handler changes

- Read `process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown"` for `version`.
- Read `process.env.NODE_ENV` for `environment`.
- Generate `new Date().toISOString()` for `timestamp`.
- Wrap in try/catch; return 500 with `{ status: "error", message }` on unexpected error.
- Export `GET` (existing) and add exported `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` all returning 405 — or use a single named export `OPTIONS` + a catch-all approach. Simplest: export a named handler per method using Next.js convention of exporting only `GET` and letting the framework return 405 for unlisted methods automatically. *(Note: Next.js App Router returns 405 automatically for HTTP methods not exported from the route module — no extra code needed.)*

### 3. Middleware update

Add `"/api/health"` to the `isPublicRoute` matcher array in `middleware.ts`.

### 4. Tests

Unit tests in `route.test.ts` using Vitest:
- Happy path: returns 200 with correct shape.
- Missing `NEXT_PUBLIC_APP_VERSION`: version is `"unknown"`.
- `NODE_ENV` reflected in environment field.
- Timestamp is valid ISO 8601.

## Complexity Tracking

No constitution violations.
