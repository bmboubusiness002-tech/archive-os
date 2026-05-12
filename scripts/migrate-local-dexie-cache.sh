#!/usr/bin/env bash
set -euo pipefail

SOURCE_REPO="${SOURCE_REPO:-bmboubusiness002-tech/Local-Dexie-Cache}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main}"
SOURCE_PATH="${SOURCE_PATH:-artifacts}"
TARGET_PATH="${TARGET_PATH:-legacy/local-dexie-cache}"
WORKDIR="${RUNNER_TEMP:-/tmp}/archive-os-migration"

if [[ -z "${MIGRATION_TOKEN:-}" ]]; then
  echo "MIGRATION_TOKEN is required. Use a GitHub token that can read the source repo and write this repo."
  exit 1
fi

rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"

echo "Cloning source repo: $SOURCE_REPO"
git clone --depth 1 --branch "$SOURCE_BRANCH" "https://x-access-token:${MIGRATION_TOKEN}@github.com/${SOURCE_REPO}.git" "$WORKDIR/source"

if [[ ! -d "$WORKDIR/source/$SOURCE_PATH" ]]; then
  echo "Source path not found: $SOURCE_PATH"
  exit 1
fi

echo "Preparing target path: $TARGET_PATH"
rm -rf "$TARGET_PATH"
mkdir -p "$TARGET_PATH"
cp -R "$WORKDIR/source/$SOURCE_PATH/." "$TARGET_PATH/"

cat > "$TARGET_PATH/MIGRATION_README.md" <<'EOF'
# Local Dexie Cache Migration

This directory contains the migrated `artifacts/` source from `bmboubusiness002-tech/Local-Dexie-Cache`.

It is intentionally placed under `legacy/local-dexie-cache/` first so the project can be reviewed, mapped, and integrated into the new Archive OS / BMBOU ERP architecture without overwriting the current monorepo foundation.

Next integration steps:

1. Inspect artifact applications and identify the real runnable app.
2. Map existing IndexedDB/Dexie data model into the new domain architecture.
3. Extract reusable domain logic into packages.
4. Move UI screens gradually into `apps/web`.
5. Preserve business behavior before redesigning components.
EOF

echo "Migration copy completed. Files staged under $TARGET_PATH"
