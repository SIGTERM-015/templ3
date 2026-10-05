#!/usr/bin/env bash
# Fails if server-only modules ended up in the browser bundle. A client component importing
# a value from a module that touches cloudflare:workers ships that import to the browser,
# where it can't load and blanks the whole desktop.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d dist/client ]; then
  echo "dist/client not found: run the build first." >&2
  exit 1
fi

leaks=$(grep -rlE '"cloudflare:[a-z]+"|from"cloudflare:' dist/client || true)
if [ -n "$leaks" ]; then
  echo "Server-only cloudflare:* imports in the client bundle:" >&2
  echo "$leaks" >&2
  echo "Import only types from server modules in client components (see src/lib/media.ts)." >&2
  exit 1
fi
echo "Client bundle has no server-only imports."
