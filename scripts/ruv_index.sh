#!/bin/bash
# scripts/ruv_index.sh - Metadata index generator for RUV artifacts
# Version: 1.0.1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INDEX_FILE="$PROJECT_ROOT/artifacts/index.json"

echo "Building metadata index..."

# Start JSON
cat > "$INDEX_FILE" <<EOF
{
  "last_indexed": "$(date -Iseconds)",
  "artifacts": [
EOF

first=true

# Index Crates
if [ -d "$PROJECT_ROOT/artifacts/crates/extracted" ]; then
  for dir in "$PROJECT_ROOT/artifacts/crates/extracted"/*/; do
    [ -d "$dir" ] || continue
    name_version=$(basename "$dir")
    name="${name_version%-*}"
    version="${name_version##*-}"
    
    if [ "$first" = true ]; then first=false; else echo "," >> "$INDEX_FILE"; fi
    cat >> "$INDEX_FILE" <<EOF
    {
      "type": "crate",
      "name": "$name",
      "version": "$version",
      "path": "artifacts/crates/extracted/$name_version"
    }
EOF
  done
fi

# Index NPM
if [ -d "$PROJECT_ROOT/artifacts/npm/extracted" ]; then
  for dir in "$PROJECT_ROOT/artifacts/npm/extracted"/*/; do
    [ -d "$dir" ] || continue
    name_version=$(basename "$dir")
    # NPM names might have scopes, but our extracted dir uses name-dash-version
    name="${name_version%-*}"
    version="${name_version##*-}"
    
    if [ "$first" = true ]; then first=false; else echo "," >> "$INDEX_FILE"; fi
    cat >> "$INDEX_FILE" <<EOF
    {
      "type": "npm",
      "name": "$name",
      "version": "$version",
      "path": "artifacts/npm/extracted/$name_version"
    }
EOF
  done
fi

# Index Repos
if [ -d "$PROJECT_ROOT/artifacts/repos/.metadata" ]; then
  for meta in "$PROJECT_ROOT/artifacts/repos/.metadata"/*.json; do
    [ -f "$meta" ] || continue
    if [ "$first" = true ]; then first=false; else echo "," >> "$INDEX_FILE"; fi
    # Just include the metadata content as an object
    cat "$meta" >> "$INDEX_FILE"
  done
fi

# Index Gists
if [ -d "$PROJECT_ROOT/artifacts/gists/.metadata" ]; then
  for meta in "$PROJECT_ROOT/artifacts/gists/.metadata"/*.json; do
    [ -f "$meta" ] || continue
    if [ "$first" = true ]; then first=false; else echo "," >> "$INDEX_FILE"; fi
    cat "$meta" >> "$INDEX_FILE"
  done
fi

# End JSON
cat >> "$INDEX_FILE" <<EOF

  ]
}
EOF

# Prettify with jq if available
if command -v jq >/dev/null 2>&1; then
  jq . "$INDEX_FILE" > "${INDEX_FILE}.tmp" && mv "${INDEX_FILE}.tmp" "$INDEX_FILE"
fi

echo "✓ Index built at: artifacts/index.json"
echo "Total artifacts indexed: $(jq '.artifacts | length' "$INDEX_FILE" 2>/dev/null || grep -c "type" "$INDEX_FILE")"
