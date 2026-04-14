# CLAUDE.md

## Spec-Kit Extensions

This project uses GitHub Spec-Kit for spec-driven development. Extensions are installed in `.specify/extensions/`.

**Extension catalog:** XyphyX curated catalog — `https://raw.githubusercontent.com/XyphyX/internal-speckit-extensions/main/catalog.json`

### Installed Extensions

| Extension | Command(s) | Purpose |
|-----------|-----------|---------|
| `branch-convention` | `/speckit.branch-convention.configure`, `/speckit.branch-convention.validate` | Enforce gitflow branch naming: `{type}/{seq}-{kebab}` (e.g. `feat/001-user-auth`) |
| `checkpoint` | `/speckit.checkpoint.commit` | Mid-implementation commits to avoid one giant commit at the end |
| `verify` | `/speckit.verify.run` | Validate implementation against spec after completing a feature |
| `review` | `/speckit.review.run`, `/speckit.review.code`, `/speckit.review.tests`, etc. | Comprehensive post-implementation code review |
| `worktree` | `/speckit.worktree.create`, `/speckit.worktree.list`, `/speckit.worktree.clean` | Isolated git worktrees for parallel feature work |
| `ship` | `/speckit.ship.run` | Automated release pipeline: changelog, CI check, PR creation |

### Extension Workflow

For every feature:
1. Use `/speckit.branch-convention.validate` before starting (auto-hooked before `/specify`)
2. Use `/speckit.checkpoint.commit` during implementation for mid-flight commits
3. Run `/speckit.verify.run` after implementation to validate against spec
4. Run `/speckit.review.run` for comprehensive code review
5. Use `/speckit.ship.run` for release automation

### Branch Convention

All feature branches must follow the gitflow pattern configured in `.specify/branch-convention.yml`:

```
{type}/{seq}-{kebab}
```

Examples: `feat/042-user-auth`, `fix/043-login-error`, `chore/044-update-deps`

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

### Extensions with Validation Issues (Not Installed)

The following catalog extensions could not be installed due to spec-kit CLI v0.5.1.dev0 namespace validation errors:

- `status` — invalid alias pattern (`speckit.status` vs required `speckit.status.{command}`)
- `cleanup` — same alias validation issue
- `ci-guard` — command namespace mismatch (`speckit.ci.*` vs required `speckit.ci-guard.*`)
- `pr-bridge` — command namespace mismatch (`speckit.pr.*` vs required `speckit.pr-bridge.*`)

These should be re-evaluated when the extension authors release fixes or the CLI relaxes validation.
