# Agent Worktree Workflow

Agents use isolated git worktrees for all implementation tasks. This keeps the main working directory clean and makes it possible to run multiple tasks concurrently without interference.

## Why Worktrees

- **Isolation**: each task gets its own branch and filesystem tree — no cross-task contamination.
- **Clean main**: the repo root always tracks `main`; worktree branches are ephemeral.
- **Concurrent tasks**: different agents (or heartbeats) can work in separate worktrees simultaneously.

## Step-by-step Workflow

### 1. Check out the Paperclip task

```
POST /api/issues/{issueId}/checkout
```

### 2. Enter a worktree

Use the `EnterWorktree` Claude Code tool with the Paperclip issue identifier as the name:

```
EnterWorktree({ name: "XYP-58" })
```

This creates `.claude/worktrees/XYP-58/` on a new branch (`worktree-XYP-58`) based on `main`.

### 3. Rename the branch (follow conventions)

Inside the worktree, rename the auto-generated branch to match the project pattern:

```bash
git branch -m worktree-XYP-58 feat/XYP-58-short-description
```

Branch naming conventions:
- `feat/XYP-XX-description` — new features
- `fix/XYP-XX-description` — bug fixes
- `chore/XYP-XX-description` — maintenance
- `docs/XYP-XX-description` — documentation only

### 4. Do the work

Edit files, commit frequently. Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard and always add the co-author trailer:

```
Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

### 5. Push the branch

```bash
git push -u origin feat/XYP-58-short-description
```

### 6. Open a PR via `scripts/agent-pr.sh`

**Always use this script — not `gh pr create` directly.** It opens the PR under the XyphyX Bot identity so the board user can review and approve (GitHub blocks self-approval).

```bash
./scripts/agent-pr.sh \
  --title "feat: short description (XYP-58)" \
  --body "$(cat <<'EOF'
## Summary
- bullet points of what changed

## Test plan
- [ ] CI passes
- [ ] Manually verified XYZ

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Closes XYP-58
EOF
)" \
  --base main
```

Required env vars (pre-configured as Windows user env vars):
- `XYPHYX_BOT_APP_ID`
- `XYPHYX_BOT_PRIVATE_KEY`
- `XYPHYX_BOT_INSTALLATION_ID`

See `docs/github-app-setup.md` for setup details.

### 7. Update Paperclip task to `in_review`

After the PR is created, update the Paperclip issue:

```bash
PATCH /api/issues/{issueId}  { "status": "in_review", "comment": "PR opened: <url>" }
```

### 8. After PR is merged — exit and remove the worktree

Once the board user has approved and merged the PR:

```
ExitWorktree({ action: "remove" })
```

This deletes `.claude/worktrees/XYP-58/` and the branch. Mark the Paperclip issue `done`.

## Worktree Lifecycle Summary

```
main checkout → EnterWorktree("XYP-XX") → rename branch → implement
             → push → agent-pr.sh → in_review → merge → ExitWorktree(remove)
```

## CI/CD Compatibility

Worktree branches are regular git branches pushed to `origin`. All existing CI workflows (lint, typecheck, unit tests, CodeQL, dependency audit) trigger on `push` and `pull_request` events as normal. No special configuration is needed.

## Tips

- Always base worktrees off `main` (check out `main` before calling `EnterWorktree`).
- Use `git log --oneline -5` after entering to verify you're on the right base.
- Never commit directly to `main` — always work in a worktree branch.
- `.claude/worktrees/` is git-ignored; worktree folders never appear in the main index.
