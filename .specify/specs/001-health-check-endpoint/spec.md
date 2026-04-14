# Feature Specification: Health Check API Endpoint

**Feature Branch**: `001-health-check-endpoint`
**Created**: 2026-04-13
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Health Probe (Priority: P1)

An operator or monitoring system sends a request to the app's health check endpoint and receives a JSON response indicating the service is up, along with the deployed version.

**Why this priority**: This is the minimum viable health check — proves the endpoint exists and responds. All other stories build on it.

**Independent Test**: Send `GET /api/health` and verify a 200 response with `status: "ok"` and a `version` string.

**Acceptance Scenarios**:

1. **Given** the Next.js app is running, **When** `GET /api/health` is requested, **Then** the response is HTTP 200 with `Content-Type: application/json` and body `{ "status": "ok", "version": "<semver>" }`.
2. **Given** the app is running, **When** `GET /api/health` is requested with no auth headers, **Then** the response is still 200 (endpoint is public).

---

### User Story 2 - Version and Environment Info (Priority: P2)

A developer or CD pipeline queries the health endpoint to confirm which version and environment is currently deployed without needing shell access to the server.

**Why this priority**: Valuable for deployment verification, but the P1 probe already delivers basic liveness. Adding metadata enriches the response without being essential.

**Independent Test**: Deploy the app with `NEXT_PUBLIC_APP_VERSION` set; confirm `/api/health` reflects that value.

**Acceptance Scenarios**:

1. **Given** `NEXT_PUBLIC_APP_VERSION` is set to `"1.2.3"`, **When** `GET /api/health`, **Then** response body includes `"version": "1.2.3"`.
2. **Given** `NEXT_PUBLIC_APP_VERSION` is not set, **When** `GET /api/health`, **Then** response body includes `"version": "unknown"` (graceful fallback).
3. **Given** `NODE_ENV` is `"production"`, **When** `GET /api/health`, **Then** response body includes `"environment": "production"`.

---

### User Story 3 - Machine-Readable Response Shape (Priority: P3)

An automated uptime monitor (e.g. UptimeRobot, AWS health checks) can parse the JSON response to determine liveness and alert on non-200 responses.

**Why this priority**: Shape consistency matters for tooling integration, but tooling can work with just HTTP status codes, making this lower priority.

**Independent Test**: Validate the response schema matches the documented shape using a TypeScript type or Zod schema in the test.

**Acceptance Scenarios**:

1. **Given** the endpoint is called, **When** the response is parsed, **Then** it matches the shape `{ status: "ok", version: string, environment: string, timestamp: string }`.
2. **Given** an unexpected server error occurs, **When** `GET /api/health`, **Then** the response is HTTP 500 with `{ status: "error", message: string }`.

---

### Edge Cases

- What happens when `NEXT_PUBLIC_APP_VERSION` is set to an empty string? → treat as `"unknown"`.
- How does the system handle a request with an unexpected HTTP method (POST, PUT)? → return 405 Method Not Allowed.
- What if Next.js middleware blocks the route? → health endpoint must be excluded from auth middleware.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a `GET /api/health` route that returns HTTP 200 when the app is running.
- **FR-002**: Response MUST be `application/json` with at minimum `{ status: "ok" }`.
- **FR-003**: Response MUST include `version` field sourced from `NEXT_PUBLIC_APP_VERSION` env var, defaulting to `"unknown"`.
- **FR-004**: Response MUST include `environment` field reflecting `NODE_ENV`.
- **FR-005**: Response MUST include `timestamp` field (ISO 8601) indicating when the response was generated.
- **FR-006**: Endpoint MUST be publicly accessible — no authentication required.
- **FR-007**: Endpoint MUST be excluded from any Clerk auth middleware.
- **FR-008**: Non-GET methods MUST return 405 Method Not Allowed.
- **FR-009**: On unexpected server error, endpoint MUST return 500 with `{ status: "error", message: string }`.

### Key Entities

- **HealthResponse**: `{ status: "ok" | "error", version: string, environment: string, timestamp: string, message?: string }`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `GET /api/health` returns HTTP 200 in under 100ms under normal conditions.
- **SC-002**: Response body always validates against the `HealthResponse` type (enforced by TypeScript).
- **SC-003**: Endpoint remains accessible when Clerk auth middleware is active (no 401/redirect).
- **SC-004**: Unit tests cover: happy path, missing env var fallback, wrong HTTP method.

## Assumptions

- Next.js App Router is used; the endpoint is implemented as a Route Handler (`app/api/health/route.ts`).
- `NEXT_PUBLIC_APP_VERSION` is set at build time (e.g. from CI injecting the package version).
- No database connectivity check is needed in v1 — liveness only, not readiness.
- Clerk middleware is configured in `middleware.ts` and uses a matcher pattern that can be narrowed to exclude `/api/health`.
