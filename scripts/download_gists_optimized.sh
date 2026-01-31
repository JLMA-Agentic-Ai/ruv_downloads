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
GISTS_DIR="$PROJECT_ROOT/artifacts/extracted/github/gists"
METADATA_DIR="$PROJECT_ROOT/artifacts/archives/github/gists/.metadata"

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

# Helper: Sanitize description for directory name
sanitize_description() {
  local desc=$1
  if [ -z "$desc" ] || [ "$desc" = "null" ]; then
    echo "Untitled"
    return
  fi
  # Remove special characters, replace spaces with underscores, limit length
  echo "$desc" | sed 's/[^a-zA-Z0-9 ]//g' | sed 's/ /_/g' | cut -c1-50
}

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
      safe_desc=$(sanitize_description "$gist_desc")
      DISCOVERED_GISTS+=("$gist_id|$gist_date|$safe_desc")
    done < "$DISCOVERED_DATA"
  fi
  
  echo "  Discovered ${#DISCOVERED_GISTS[@]} gists from GitHub"
fi

# Step 3: Merge
# We keep the manifest as just IDs for compatibility
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED $DISCOVERED_DATA" EXIT

{
  # Add existing from manifest (with placeholder data if unknown)
  for id in "${EXISTING_GISTS[@]}"; do
    echo "$id|0000-00-00|unknown"
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
  local safe_desc=$(echo "$data" | cut -d'|' -f3)
  
  # If data is unknown, try to fetch it
  if [ "$gist_date" = "0000-00-00" ] || [ "$safe_desc" = "unknown" ]; then
    gist_json=$(gh api "gists/$gist_id" --jq '{updated_at: .updated_at, description: .description}' 2>/dev/null || echo "")
    if [ -n "$gist_json" ]; then
      gist_date=$(echo "$gist_json" | jq -r '.updated_at' | cut -d'T' -f1)
      gist_desc=$(echo "$gist_json" | jq -r '.description')
      safe_desc=$(sanitize_description "$gist_desc")
    else
      gist_date="unknown"
      safe_desc="unknown"
    fi
  fi

  local folder_name="${safe_desc}_(${gist_id})"
  echo "Checking Gist: $folder_name (Date: $gist_date)"
  
  local gist_url="https://gist.github.com/${gist_id}.git"
  local date_dir="$GISTS_DIR/by-date/$gist_date"
  local target_dir="$date_dir/$folder_name"
  
  # Get remote hash
  local remote_hash=$(git ls-remote "$gist_url" HEAD 2>/dev/null | awk '{print $1}' || true)
  
  if [ -z "$remote_hash" ]; then
    echo "  Warning: Could not fetch remote hash for gist $gist_id -- skipping"
    return
  fi
  
  local checksum="git:$remote_hash"
  local metadata_file="$METADATA_DIR/${gist_id}.json"
  
  # Step A: Check metadata receipt for skip (crucial for CI)
  if [ -f "$metadata_file" ]; then
    last_hash=$(jq -r '.commit' "$metadata_file" 2>/dev/null || echo "")
    if [ "$remote_hash" == "$last_hash" ]; then
      echo "  ✓ Skip-check passed (receipt matches): $gist_id"
      update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
      return
    fi
  fi

  # Step B: Check cache
  local cached_path=$(check_cache "gist" "$gist_id" "HEAD" "$checksum")
  
  if [ -n "$cached_path" ] && [ -d "$cached_path" ]; then
    local local_hash=$(get_git_commit_hash "$cached_path")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Cache hit: $gist_id"

      # Update metadata receipt (ensure consistency)
      gist_json=$(gh api "gists/$gist_id" 2>/dev/null || echo "")
      if [ -n "$gist_json" ]; then
        echo "$gist_json" | jq -r \
          --arg commit "$remote_hash" \
          --arg lastUpdated "$(date -Iseconds)" \
          '. + {type: "gist", commit: $commit, lastUpdated: $lastUpdated}' \
          > "$metadata_file"
      fi

      # Migration/Reorganization: Move to the new descriptive folder if needed
      if [ "$(basename "$cached_path")" != "$folder_name" ] || [[ "$cached_path" != *"/by-date/$gist_date/"* ]]; then
         echo "  Re-organizing to: $target_dir"
         mkdir -p "$date_dir"
         mv "$cached_path" "$target_dir"
         update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
      fi
      return
    fi
  fi
  
  # Deep check locally for migration 
  local found_local=""
  if [ -d "$date_dir" ]; then
    found_local=$(find "$date_dir" -maxdepth 1 -type d -name "*($gist_id)*" | head -n 1)
  fi
  
  if [ -z "$found_local" ]; then
    found_local=$(find "$GISTS_DIR" -type d -name "*($gist_id)*" -o -name "$gist_id" | head -n 1)
  fi
  
  if [ -n "$found_local" ] && [ -d "$found_local" ]; then
    local local_hash=$(get_git_commit_hash "$found_local")
    if [ "$local_hash" = "$checksum" ]; then
      echo "  ✓ Found and Up-to-date: $(basename "$found_local")"
      if [ "$found_local" != "$target_dir" ]; then
        echo "    Migrating to new target: $target_dir"
        mkdir -p "$date_dir"
        mv "$found_local" "$target_dir"
      fi
      update_cache "gist" "$gist_id" "HEAD" "$checksum" "$target_dir"
      return
    else
      echo "  Updating existing: $(basename "$found_local")"
      rm -rf "$found_local"
    fi
  fi

  # Clone
  echo "  Cloning: $gist_id into $target_dir"
  mkdir -p "$date_dir"
  rm -rf "$target_dir" # Clean up any failed clones
  if git clone --depth=1 --quiet "$gist_url" "$target_dir"; then
    echo "  ✓ Cloned: $gist_id"
    # Remove .git to prevent it from appearing as a submodule in the main repo
    rm -rf "$target_dir/.git"
    
    # Save commit hash
    echo "$remote_hash" > "$target_dir/.ruv_commit"
    
    # Get metadata
    gist_full_json=$(gh api "gists/$gist_id" 2>/dev/null || echo "")
    
    # Generate metadata safely using jq
    if [ -n "$gist_full_json" ]; then
      echo "$gist_full_json" | jq -r \
        --arg commit "$remote_hash" \
        --arg lastUpdated "$(date -Iseconds)" \
        --arg path "artifacts/extracted/github/gists/by-date/$gist_date/$folder_name" \
        '. + {type: "gist", commit: $commit, lastUpdated: $lastUpdated, path: $path}' \
        > "$metadata_file"
    fi
    
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

# Cleanup empty directories in by-date
find "$GISTS_DIR/by-date" -type d -empty -delete 2>/dev/null || true

echo "All gist downloads and reorganization complete!"
echo "Cache stats:"
get_cache_stats | grep "Gists:" || true

