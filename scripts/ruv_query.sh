#!/bin/bash
# scripts/ruv_query.sh - CLI search utility for RUV artifacts
# Version: 1.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INDEX_FILE="$PROJECT_ROOT/artifacts/index.json"

if [ ! -f "$INDEX_FILE" ]; then
  echo "Error: Index file not found. Run ./scripts/ruv_index.sh first."
  exit 1
fi

usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -s, --search QUERY    Search by name or description"
  echo "  -t, --type TYPE       Filter by type (crate, npm, repo, gist)"
  echo "  -l, --list            List all artifacts"
  echo "  -st, --status         Show statistics"
  echo "  -h, --help            Show this help"
}

if [ $# -eq 0 ]; then
  usage
  exit 0
fi

# Default values
SEARCH=""
TYPE=""
LIST=0
STATS=0

while [[ $# -gt 0 ]]; do
  case $1 in
    -s|--search) SEARCH="$2"; shift 2 ;;
    -t|--type) TYPE="$2"; shift 2 ;;
    -l|--list) LIST=1; shift ;;
    -st|--status) STATS=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

if [ "$STATS" -eq 1 ]; then
  echo "=== RUV Artifacts Statistics ==="
  echo "Last Indexed: $(jq -r '.last_indexed' "$INDEX_FILE")"
  echo "Total Artifacts: $(jq '.artifacts | length' "$INDEX_FILE")"
  echo "Crates: $(jq '[.artifacts[] | select(.type=="crate")] | length' "$INDEX_FILE")"
  echo "NPM Packages: $(jq '[.artifacts[] | select(.type=="npm")] | length' "$INDEX_FILE")"
  echo "Repositories: $(jq '[.artifacts[] | select(.type=="repository")] | length' "$INDEX_FILE")"
  echo "Gists: $(jq '[.artifacts[] | select(.type=="gist")] | length' "$INDEX_FILE")"
  exit 0
fi

# Building the jq filter
FILTER=".artifacts[]"

if [ -n "$TYPE" ]; then
  # Map 'repo' to 'repository' for consistency with metadata
  [ "$TYPE" = "repo" ] && TYPE="repository"
  FILTER="$FILTER | select(.type==\"$TYPE\")"
fi

if [ -n "$SEARCH" ]; then
  # Search in name, id, or description
  FILTER="$FILTER | select((.name // \"\" | contains(\"$SEARCH\")) or (.id // \"\" | contains(\"$SEARCH\")) or (.description // \"\" | contains(\"$SEARCH\")))"
fi

if [ "$LIST" -eq 1 ] || [ -n "$SEARCH" ] || [ -n "$TYPE" ]; then
  echo "=== Query Results ==="
  echo "TYPE      NAME/ID                          VERSION/COMMIT"
  echo "---------------------------------------------------------"
  jq -r "$FILTER | \"\(.type | ascii_upcase | .[0:8])  \(.name // .id | .[0:30] | . + \" \" * (31 - length))  \(.version // .commit | .[0:20])\"" "$INDEX_FILE"
fi
