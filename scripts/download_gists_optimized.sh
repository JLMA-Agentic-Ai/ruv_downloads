#!/bin/bash
# scripts/download_gists_optimized.sh - GitHub gists download with cache integration
# Version: 2.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load libraries
source "$PROJECT_ROOT/lib/cache.sh"
source "$PROJECT_ROOT/lib/checksum.sh"

# Configuration
GITHUB_USER="ruvnet"
MANIFEST_FILE="$PROJECT_ROOT/manifests/gists.txt"
GISTS_DIR="$PROJECT_ROOT/artifacts/gists/by-id"
METADATA_DIR="$PROJECT_ROOT/artifacts/gists/.metadata"

mkdir -p "$GISTS_DIR" "$METADATA_DIR"

echo "Checking gists from GitHub user: $GITHUB_USER"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing gists
EXISTING_GISTS=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_GISTS+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery
DISCOVERED_GISTS=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering gists from GitHub for user: $GITHUB_USER ..."
  
  if command -v gh >/dev/null 2>&1 && { gh auth status >/dev/null 2>&1 || [ -n "${GITHUB_TOKEN:-}" ]; }; then
    GIST_TEMP=$(mktemp)
    gh api "users/$GITHUB_USER/gists" --paginate --jq '.[] | [.id, .description] | @tsv' > "$GIST_TEMP"
    
    while IFS=$'\t' read -r gist_id gist_desc; do
      [ -z "$gist_id" ] && continue
      DISCOVERED_GISTS+=("$gist_id")
    done < "$GIST_TEMP"
    rm -f "$GIST_TEMP"
  fi
  
  echo "  Discovered ${#DISCOVERED_GISTS[@]} gists from GitHub"
fi

# Step 3: Merge
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_GISTS[@]}"
  printf "%s\n" "${DISCOVERED_GISTS[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_GISTS=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_GISTS+=("$line")
done < "$TEMP_MERGED"

echo "  Total gists (merged): ${#MERGED_GISTS[@]}"
printf "%s\n" "${MERGED_GISTS[@]}" | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified gists manifest:"
  printf "%s\n" "${MERGED_GISTS[@]}" | sort
  exit 0
fi

GISTS=("${MERGED_GISTS[@]}")

# Step 4: Download with cache (Parallel)
MAX_JOBS=10
current_jobs=0

process_gist() {
  local gist_id=$1
  echo "Checking Gist: $gist_id"
  
  local gist_url="https://gist.github.com/${gist_id}.git"
  local target_dir="$GISTS_DIR/$gist_id"
  
  # Get remote hash
  local remote_hash=$(git ls-remote "$gist_url" HEAD 2>/dev/null | awk '{print $1}' || true)
  
  if [ -z "$remote_hash" ]; then
    echo "  Warning: Could not fetch remote hash for gist $gist_id -- skipping"
    return
  fi
  
  local checksum="git:$remote_hash"
  
  # Check cache
  local cached_path=$(check_cache "gist" "$gist_id" "HEAD" "$checksum")
  
  if [ -n "$cached_path" ] && [ -d "$cached_path" ]; then
    local local_hash=$(get_git_commit_hash "$cached_path")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Cache hit: $gist_id ($remote_hash)"
      return
    fi
  fi
  
  # Check if exists locally
  if [ -d "$target_dir" ]; then
    local local_hash=$(get_git_commit_hash "$target_dir")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Up-to-date: $gist_id ($remote_hash)"
      update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
      return
    else
      echo "  Updating: $gist_id"
      rm -rf "$target_dir"
    fi
  fi
  
  # Clone
  echo "  Cloning: $gist_id"
  if git clone --depth=1 --quiet "$gist_url" "$target_dir"; then
    echo "  ✓ Cloned: $gist_id"
    
    # Save commit hash
    echo "$remote_hash" > "$target_dir/.ruv_commit"
    
    # Get description if available
    local gist_desc=$(gh api "gists/$gist_id" --jq '.description' 2>/dev/null || echo "")
    
    # Generate metadata safely using jq
    jq -n \
      --arg id "$gist_id" \
      --arg description "$gist_desc" \
      --arg lastUpdated "$(date -Iseconds)" \
      --arg commit "$remote_hash" \
      --arg url "https://gist.github.com/$gist_id" \
      '{id: $id, type: "gist", description: $description, lastUpdated: $lastUpdated, commit: $commit, url: $url}' \
      > "$METADATA_DIR/${gist_id}.json"
    
    update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
  else
    echo "  Warning: failed to clone gist $gist_id"
  fi
}

for gist_id in "${GISTS[@]}"; do
  process_gist "$gist_id" &
  current_jobs=$((current_jobs + 1))
  
  if [ "$current_jobs" -ge "$MAX_JOBS" ]; then
    wait -n || true
    current_jobs=$((current_jobs - 1))
  fi
done

wait # Wait for all remaining jobs

echo "All gist downloads complete!"
echo "Cache stats:"
get_cache_stats | grep "Gists:"

