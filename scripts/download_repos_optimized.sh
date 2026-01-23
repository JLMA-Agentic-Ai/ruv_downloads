#!/bin/bash
# scripts/download_repos_optimized.sh - GitHub repos download with cache integration
# Version: 2.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load libraries
source "$PROJECT_ROOT/lib/cache.sh"  
source "$PROJECT_ROOT/lib/checksum.sh"

# Configuration
GITHUB_USER="ruvnet"
MANIFEST_FILE="$PROJECT_ROOT/manifests/repos.txt"
REPOS_DIR="$PROJECT_ROOT/artifacts/repos/by-tier/tier-1-active"
METADATA_DIR="$PROJECT_ROOT/artifacts/repos/.metadata"

mkdir -p "$REPOS_DIR" "$METADATA_DIR"

echo "Checking repositories from GitHub user: $GITHUB_USER"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing repos
EXISTING_REPOS=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_REPOS+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery
DISCOVERED_REPOS=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering repositories from GitHub for user: $GITHUB_USER ..."
  
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "  Using gh CLI..."
    gh_repos=$(gh repo list "$GITHUB_USER" --limit 1000 --json name --jq '.[].name')
    if [ -n "$gh_repos" ]; then
      IFS=$'\n'
      for name in $gh_repos; do
        DISCOVERED_REPOS+=("$name")
      done
      unset IFS
    fi
  fi
  
  echo "  Discovered ${#DISCOVERED_REPOS[@]} repositories from GitHub"
fi

# Step 3: Merge
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_REPOS[@]}"
  printf "%s\n" "${DISCOVERED_REPOS[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_REPOS=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_REPOS+=("$line")
done < "$TEMP_MERGED"

echo "  Total repositories (merged): ${#MERGED_REPOS[@]}"
printf "%s\n" "${MERGED_REPOS[@]}" | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified repository manifest:"
  printf "%s\n" "${MERGED_REPOS[@]}" | sort
  exit 0
fi

REPOS=("${MERGED_REPOS[@]}")

# Step 4: Download with cache (Parallel)
MAX_JOBS=10
current_jobs=0

process_repo() {
  local repo=$1
  echo "Checking: $repo"
  
  local repo_url="https://github.com/${GITHUB_USER}/${repo}.git"
  local target_dir="$REPOS_DIR/$repo"
  
  # Get remote hash
  local remote_hash=$(git ls-remote "$repo_url" HEAD 2>/dev/null | awk '{print $1}' || true)
  
  if [ -z "$remote_hash" ]; then
    echo "  Warning: Could not fetch remote hash for $repo -- skipping"
    return
  fi
  
  local checksum="git:$remote_hash"
  
  # Check cache
  local cached_path=$(check_cache "repo" "$repo" "HEAD" "$checksum")
  
  if [ -n "$cached_path" ] && [ -d "$cached_path" ]; then
    local local_hash=$(get_git_commit_hash "$cached_path")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Cache hit: $repo ($remote_hash)"
      return
    fi
  fi
  
  # Check if exists locally
  if [ -d "$target_dir" ]; then
    local local_hash=$(get_git_commit_hash "$target_dir")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Up-to-date: $repo ($remote_hash)"
      update_cache "repo" "$repo" "HEAD" "$checksum" "$target_dir"
      return
    else
      echo "  Updating: $repo (local: ${local_hash#git:} → remote: $remote_hash)"
      rm -rf "$target_dir"
    fi
  fi
  
  # Clone
  echo "  Cloning: $repo"
  if git clone --depth=1 --quiet "$repo_url" "$target_dir"; then
    echo "  ✓ Cloned: $repo"
    
    # Save commit hash
    echo "$remote_hash" > "$target_dir/.ruv_commit"
    
    # Generate metadata safely using jq
    jq -n \
      --arg name "$repo" \
      --arg lastUpdated "$(date -Iseconds)" \
      --arg commit "$remote_hash" \
      --arg url "$repo_url" \
      '{name: $name, type: "repository", lastUpdated: $lastUpdated, commit: $commit, url: $url, tier: "tier-1-active"}' \
      > "$METADATA_DIR/${repo}.json"
    
    update_cache "repo" "$repo" "HEAD" "$checksum" "$target_dir"
  else
    echo "  Warning: failed to clone $repo"
  fi
}

for repo in "${REPOS[@]}"; do
  process_repo "$repo" &
  current_jobs=$((current_jobs + 1))
  
  if [ "$current_jobs" -ge "$MAX_JOBS" ]; then
    wait -n || true
    current_jobs=$((current_jobs - 1))
  fi
done

wait # Wait for all remaining jobs

echo "All repository downloads complete!"
echo "Cache stats:"
get_cache_stats | grep "Repos:"
