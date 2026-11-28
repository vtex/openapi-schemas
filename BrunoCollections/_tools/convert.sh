#!/usr/bin/env bash
#
# Regenerates BrunoCollections/ from PostmanCollections/.
#
# Stage 1 (python) turns the Postman v2.1 JSON into Bruno .bru files in a scratch
# directory; stage 2 (node) rewrites those into the OpenCollection .yml format that
# actually ships. The .bru tree is an intermediate and is discarded.
#
#   ./_tools/convert.sh            # regenerate in place
#   ./_tools/convert.sh /some/dir  # regenerate into another directory
set -euo pipefail

TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-$(cd "$TOOLS/.." && pwd)}"

if [ ! -d "$TOOLS/node_modules" ]; then
  echo "==> installing converter dependencies"
  (cd "$TOOLS" && npm install --silent)
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "==> stage 1: Postman -> .bru"
python3 "$TOOLS/postman-to-bruno.py" "$STAGE"

echo "==> stage 2: .bru -> OpenCollection .yml"
mkdir -p "$OUT"
# Drop the previously generated collections but keep README.md and _tools/.
find "$OUT" -mindepth 1 -maxdepth 1 -type d ! -name '_*' -exec rm -rf {} +
node "$TOOLS/bru-to-opencollection.js" "$STAGE" "$OUT"

echo "==> stage 3: workspace file linking the collections"
node "$TOOLS/make-workspace.js" "$OUT"

echo "==> done: $OUT"
