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
DISCOVERED_DATA=$(mktemp)
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering gists from GitHub for user: $GITHUB_USER ..."
  
  if command -v gh >/dev/null 2>&1 && { gh auth status >/dev/null 2>&1 || [ -n "${GITHUB_TOKEN:-}" ]; }; then
    gh api "users/$GITHUB_USER/gists" --paginate --jq '.[] | [.id, .updated_at, .description] | @tsv' > "$DISCOVERED_DATA"
    
    while IFS=$'\t' read -r gist_id updated_at gist_desc; do
      [ -z "$gist_id" ] && continue
      # Extract date YYYY-MM-DD
      gist_date=$(echo "$updated_at" | cut -d'T' -f1)
      DISCOVERED_GISTS+=("$gist_id|$gist_date")
    done < "$DISCOVERED_DATA"
  fi
  
  echo "  Discovered ${#DISCOVERED_GISTS[@]} gists from GitHub"
fi

# Step 3: Merge
# We keep the manifest as just IDs for compatibility, but we use the date for processing
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED $DISCOVERED_DATA" EXIT

{
  # Add existing from manifest (with placeholder date if unknown)
  for id in "${EXISTING_GISTS[@]}"; do
    echo "$id|0000-00-00"
  done
  printf "%s\n" "${DISCOVERED_GISTS[@]}"
} | grep -v '^$' | sort -t'|' -k1,1 -u > "$TEMP_MERGED"

MERGED_GISTS_DATA=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_GISTS_DATA+=("$line")
done < "$TEMP_MERGED"

echo "  Total gists (merged): ${#MERGED_GISTS_DATA[@]}"
# Update manifest with just IDs
printf "%s\n" "${MERGED_GISTS_DATA[@]}" | cut -d'|' -f1 | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified gists manifest:"
  printf "%s\n" "${MERGED_GISTS_DATA[@]}" | sort
  exit 0
fi

GISTS_DATA=("${MERGED_GISTS_DATA[@]}")

# Step 4: Download with cache (Parallel)
MAX_JOBS=10
current_jobs=0

process_gist() {
  local data=$1
  local gist_id=$(echo "$data" | cut -d'|' -f1)
  local gist_date=$(echo "$data" | cut -d'|' -f2)
  
  # If date is unknown, try to fetch it
  if [ "$gist_date" = "0000-00-00" ]; then
    gist_date=$(gh api "gists/$gist_id" --jq '.updated_at' | cut -d'T' -f1 || echo "unknown")
  fi

  echo "Checking Gist: $gist_id (Date: $gist_date)"
  
  local gist_url="https://gist.github.com/${gist_id}.git"
  local date_dir="$PROJECT_ROOT/artifacts/gists/by-date/$gist_date"
  local target_dir="$date_dir/$gist_id"
  
  mkdir -p "$date_dir"
  
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
      # Ensure it's in the right date folder (in case it moved)
      if [ "$cached_path" != "$target_dir" ]; then
         echo "  Moving to new date folder: $target_dir"
         mkdir -p "$date_dir"
         mv "$cached_path" "$target_dir"
         update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
      fi
      return
    fi
  fi
  
  # Check if exists locally in ANY date folder (cleanup old versions)
  local found_old=0
  for old_dir in "$PROJECT_ROOT/artifacts/gists/by-date"/*/"$gist_id"; do
    if [ -d "$old_dir" ]; then
      if [ "$old_dir" = "$target_dir" ]; then
        local local_hash=$(get_git_commit_hash "$target_dir")
        if [ "$local_hash" = "$checksum" ]; then
          echo "  ✓ Up-to-date: $gist_id ($remote_hash)"
          update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
          return
        fi
      else
        echo "  Found older version/different date: $old_dir"
        rm -rf "$old_dir"
        found_old=1
      fi
    fi
  done
  
  # Fallback for old structure (by-id)
  if [ -d "$GISTS_DIR/$gist_id" ]; then
     echo "  Migrating from old ID structure: $gist_id"
     rm -rf "$target_dir"
     mv "$GISTS_DIR/$gist_id" "$target_dir"
     local local_hash=$(get_git_commit_hash "$target_dir")
     if [ "$local_hash" = "$checksum" ]; then
       echo "  ✓ Migrated and Up-to-date"
       update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
       return
     fi
  fi

  # Clone
  echo "  Cloning: $gist_id into $target_dir"
  rm -rf "$target_dir" # Clean up any failed clones
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
      --arg created "$(gh api "gists/$gist_id" --jq '.created_at')" \
      --arg updated "$(gh api "gists/$gist_id" --jq '.updated_at')" \
      --arg lastUpdated "$(date -Iseconds)" \
      --arg commit "$remote_hash" \
      --arg url "https://gist.github.com/$gist_id" \
      '{id: $id, type: "gist", description: $description, created: $created, updated: $updated, lastUpdated: $lastUpdated, commit: $commit, url: $url}' \
      > "$METADATA_DIR/${gist_id}.json"
    
    update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
  else
    echo "  Warning: failed to clone gist $gist_id"
  fi
}

for data in "${GISTS_DATA[@]}"; do
  process_gist "$data" &

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

