#!/usr/bin/env bash
# Fails when the Payload config has schema changes that no migration covers.
# migrate:create diffs the config against the latest migration snapshot (no database
# writes) and, with --skip-empty, only writes a file when something changed.
set -euo pipefail
cd "$(dirname "$0")/.."

before=$(ls src/migrations)
pnpm payload migrate:create schema-drift-check --skip-empty >/dev/null
after=$(ls src/migrations)

if [ "$before" != "$after" ]; then
  echo "Schema changes without a migration. Run: pnpm payload migrate:create <name>" >&2
  diff <(echo "$before") <(echo "$after") >&2 || true
  git checkout -- src/migrations/index.ts 2>/dev/null || true
  git clean -fq src/migrations
  exit 1
fi
echo "Migrations match the schema."
