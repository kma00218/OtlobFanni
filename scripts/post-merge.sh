#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Run SQL migrations in order
MIGRATIONS_DIR="lib/db/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  for f in "$MIGRATIONS_DIR"/*.sql; do
    [ -f "$f" ] || continue
    echo "Running migration: $f"
    psql "$DATABASE_URL" -f "$f"
  done
fi

pnpm --filter db push
