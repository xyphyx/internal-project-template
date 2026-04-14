# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

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
