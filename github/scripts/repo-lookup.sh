#!/bin/bash
# repo-lookup.sh - Quick repo lookup and navigation helper
# Usage: ./repo-lookup.sh [command] [args]

set -e
cd "$(dirname "$0")/.."

INDEX_FILE="repo-index.json"
BY_TIER_DIR="by-tier"

show_help() {
  cat <<EOF
Ruvnet Repo Lookup Tool
=======================

Usage: ./scripts/repo-lookup.sh [command] [args]

Commands:
  list [filter]         List all repos (optionally filter by name)
  tier <tier>           List repos in tier (1-4 or tier-1-active, etc.)
  search <term>         Search repos by name or description
  info <repo>           Show detailed info about a repo
  active                List only tier-1-active repos
  stats                 Show organization statistics
  open <repo>           Print path to repo (for cd)
  json                  Output full index as JSON

Tiers:
  1 / tier-1-active       Recently updated (< 90 days)
  2 / tier-2-stable       Stable (90-365 days)
  3 / tier-3-maintenance  Maintenance mode (1-2 years)
  4 / tier-4-archive      Archived (> 2 years)

Examples:
  ./scripts/repo-lookup.sh active
  ./scripts/repo-lookup.sh tier 1
  ./scripts/repo-lookup.sh search flow
  ./scripts/repo-lookup.sh info claude-flow
  cd \$(./scripts/repo-lookup.sh open claude-flow)
EOF
}

check_index() {
  if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: $INDEX_FILE not found. Run organize_repos.sh first." >&2
    exit 1
  fi
}

list_repos() {
  check_index
  local filter="$1"
  if [ -n "$filter" ]; then
    jq -r ".[] | select(.name | test(\"$filter\"; \"i\")) | \"\(.tierNum) \(.name)\"" "$INDEX_FILE" | sort
  else
    jq -r '.[] | "\(.tierNum) \(.name)"' "$INDEX_FILE" | sort -k2
  fi
}

list_by_tier() {
  check_index
  local tier="$1"
  # Normalize tier input
  case "$tier" in
    1|tier-1-active) tier="tier-1-active" ;;
    2|tier-2-stable) tier="tier-2-stable" ;;
    3|tier-3-maintenance) tier="tier-3-maintenance" ;;
    4|tier-4-archive) tier="tier-4-archive" ;;
    *) echo "Invalid tier: $tier" >&2; exit 1 ;;
  esac

  echo "=== $tier ==="
  jq -r ".[] | select(.tier == \"$tier\") | \"\(.name)\t\(.lastCommitDate)\"" "$INDEX_FILE" | \
    column -t -s $'\t' | sort
}

search_repos() {
  check_index
  local term="$1"
  echo "=== Searching for: $term ==="
  jq -r ".[] | select((.name | test(\"$term\"; \"i\")) or (.description | test(\"$term\"; \"i\"))) | \"[\(.tier)] \(.name) - \(.description[:60])...\"" "$INDEX_FILE" 2>/dev/null || \
  jq -r ".[] | select(.name | test(\"$term\"; \"i\")) | \"[\(.tier)] \(.name)\"" "$INDEX_FILE"
}

show_info() {
  check_index
  local repo="$1"
  jq ".[] | select(.name == \"$repo\")" "$INDEX_FILE"
}

show_stats() {
  check_index
  echo "=== Ruvnet Repos Statistics ==="
  echo ""
  echo "Total repos: $(jq 'length' "$INDEX_FILE")"
  echo ""
  echo "By Tier:"
  for t in 1 2 3 4; do
    count=$(jq "[.[] | select(.tierNum == $t)] | length" "$INDEX_FILE")
    case $t in
      1) name="tier-1-active" ;;
      2) name="tier-2-stable" ;;
      3) name="tier-3-maintenance" ;;
      4) name="tier-4-archive" ;;
    esac
    printf "  %-20s %d\n" "$name:" "$count"
  done
  echo ""
  echo "By Tech Stack:"
  jq -r '[.[] | .tech[]] | group_by(.) | .[] | select(.[0] != "") | "  \(.[0]): \(length)"' "$INDEX_FILE" | sort -t: -k2 -rn
}

open_repo() {
  local repo="$1"
  # Search in all tier directories
  for tier_dir in "$BY_TIER_DIR"/tier-*/; do
    if [ -d "$tier_dir$repo" ]; then
      echo "$(cd "$tier_dir$repo" && pwd)"
      return 0
    fi
  done
  echo "Repo not found: $repo" >&2
  exit 1
}

# Main
case "${1:-help}" in
  list)
    list_repos "$2"
    ;;
  tier)
    list_by_tier "$2"
    ;;
  search)
    search_repos "$2"
    ;;
  info)
    show_info "$2"
    ;;
  active)
    list_by_tier 1
    ;;
  stats)
    show_stats
    ;;
  open)
    open_repo "$2"
    ;;
  json)
    check_index
    cat "$INDEX_FILE"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown command: $1" >&2
    show_help
    exit 1
    ;;
esac
