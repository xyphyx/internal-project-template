# Implementation Tasks: Health Check API Endpoint

## Phase 1: Core Implementation

- [x] 1.1 Enhance `apps/web/src/app/api/health/route.ts`
  - Add `HealthResponse` type
  - Return `version`, `environment`, `timestamp` fields
  - Wrap in try/catch for 500 error handling
  - Keep `runtime = "nodejs"` and `dynamic = "force-dynamic"`
  - **Depends on**: None
  - **Requirement**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-009

- [x] 1.2 [P] Update `apps/web/src/middleware.ts`
  - Add `"/api/health"` to the `isPublicRoute` matcher
  - **Depends on**: None
  - **Requirement**: FR-006, FR-007

## Phase 2: Tests

- [x] 2.1 Write unit tests in `apps/web/src/app/api/health/route.test.ts`
  - Test happy path: 200 with all fields present and correct types
  - Test missing `NEXT_PUBLIC_APP_VERSION`: version defaults to `"unknown"`
  - Test `NODE_ENV` reflected in environment field
  - Test timestamp is valid ISO 8601 string
  - **Depends on**: 1.1
  - **Requirement**: SC-001, SC-002, SC-003, SC-004

## Notes

- `[P]` indicates tasks that can be parallelized
- Next.js App Router returns 405 automatically for HTTP methods not exported — no extra handler needed (FR-008 satisfied by framework)
- No 405 handler export needed; framework handles unlisted methods
