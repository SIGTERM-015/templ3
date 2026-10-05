#!/usr/bin/env bash
# Fails when the Payload config has schema changes that no migration covers.
# migrate:create diffs the config against the latest migration snapshot (no database
# connection) and, with --skip-empty, only writes a file when something changed.
set -euo pipefail
cd "$(dirname "$0")/.."

dir=src/migrations
before=$(ls "$dir")
index_backup=$(mktemp)
cp "$dir/index.ts" "$index_backup"

# Remove only what this check wrote, never a migration someone is still working on
cleanup() {
  comm -13 <(echo "$before") <(ls "$dir") | while read -r file; do rm -f "$dir/$file"; done
  cp "$index_backup" "$dir/index.ts"
  rm -f "$index_backup"
}
trap cleanup EXIT

# drizzle-kit prompts when it can't tell a rename from a drop+add; never wait on that in CI
status=0
timeout 180 pnpm payload migrate:create schema-drift-check --skip-empty </dev/null >/dev/null || status=$?
if [ "$status" -eq 124 ]; then
  echo "migrate:create is waiting for input (likely a renamed field). Create the migration locally." >&2
  exit 1
elif [ "$status" -ne 0 ]; then
  exit "$status"
fi

added=$(comm -13 <(echo "$before") <(ls "$dir"))
if [ -n "$added" ]; then
  echo "Schema changes without a migration. Run: pnpm payload migrate:create <name>" >&2
  exit 1
fi
echo "Migrations match the schema."
