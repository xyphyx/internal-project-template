# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | ✓         |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing **security@xyphyx.com**. Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested mitigations (optional)

You will receive an acknowledgment within 48 hours and a resolution timeline within 7 days.

## Security Practices

- All secrets are managed via environment variables and never committed to the repo.
- Dependencies are scanned for known CVEs on every PR using [OSV Scanner](https://github.com/google/osv-scanner).
- Secret scanning runs on every PR via [Gitleaks](https://github.com/gitleaks/gitleaks).
- Static analysis is performed by [Biome](https://biomejs.dev/) (lint + type-safety) on every PR. Full CodeQL SAST will be enabled once GitHub Advanced Security (GHAS) is activated for this organization.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are enforced at the CDN and Next.js layers.
- Authentication is delegated to Clerk; no passwords are stored in this application.
- All database access is through Convex's type-safe query/mutation API.

## Dependency Disclosure

This project uses the following third-party services that handle user data:

- **Clerk** — authentication and user management
- **Convex** — backend database and real-time sync

Refer to each vendor's security documentation for their respective practices.
