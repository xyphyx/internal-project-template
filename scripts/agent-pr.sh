#!/usr/bin/env bash
# agent-pr.sh — Create a GitHub PR as the XyphyX Bot identity.
#
# This script wraps `gh pr create` so that PRs appear as authored by the
# XyphyX Bot GitHub App rather than the board user account.  This lets the
# board user review and approve agent-created PRs (GitHub blocks self-approval).
#
# Required env vars (set in your shell profile or .env.local):
#   XYPHYX_BOT_APP_ID           - GitHub App numeric ID
#   XYPHYX_BOT_PRIVATE_KEY      - PEM text or path to .pem file
#   XYPHYX_BOT_INSTALLATION_ID  - Installation ID for this repo
#
# Usage:
#   ./scripts/agent-pr.sh --title "feat: ..." --body "..." --base main
#
# All additional arguments are forwarded to `gh pr create`.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Validate required env ────────────────────────────────────────────────────
for var in XYPHYX_BOT_APP_ID XYPHYX_BOT_PRIVATE_KEY XYPHYX_BOT_INSTALLATION_ID; do
  if [[ -z "${!var:-}" ]]; then
    echo "Error: $var is not set." >&2
    echo "See docs/github-app-setup.md for setup instructions." >&2
    exit 1
  fi
done

# ── Generate bot token ───────────────────────────────────────────────────────
echo "Generating bot token..." >&2
BOT_TOKEN=$(node "$SCRIPT_DIR/get-bot-token.mjs")

if [[ -z "$BOT_TOKEN" ]]; then
  echo "Error: Failed to generate bot token." >&2
  exit 1
fi

# ── Configure git author as bot for this session ─────────────────────────────
# Scoped to this repo only (--local), won't affect global git config.
git -C "$REPO_ROOT" config --local user.name "XyphyX Bot"
git -C "$REPO_ROOT" config --local user.email "xyphyx-bot[bot]@users.noreply.github.com"

# ── Create the PR using the bot token ────────────────────────────────────────
echo "Creating PR as XyphyX Bot..." >&2
GH_TOKEN="$BOT_TOKEN" gh pr create "$@"

echo "" >&2
echo "PR created. Board user can now review and approve." >&2
