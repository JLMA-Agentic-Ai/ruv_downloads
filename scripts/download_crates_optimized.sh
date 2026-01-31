#!/bin/bash
# scripts/download_crates_optimized.sh - Crate download with cache integration
# Version: 2.0.0

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load libraries
source "$PROJECT_ROOT/lib/cache.sh"
source "$PROJECT_ROOT/lib/checksum.sh"

# Configuration
CRATES_IO_USER_URL="https://crates.io/users/ruvnet"
MANIFEST_FILE="$PROJECT_ROOT/manifests/crates.txt"
ARCHIVE_DIR="$PROJECT_ROOT/artifacts/archives/crates"
EXTRACTED_DIR="$PROJECT_ROOT/artifacts/crates/extracted"
LEGACY_DIR="$ARCHIVE_DIR/00_legacy"

# Create directories
mkdir -p "$ARCHIVE_DIR" "$EXTRACTED_DIR" "$LEGACY_DIR"

echo "Checking crates from: $CRATES_IO_USER_URL"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing crates from manifest
EXISTING_CRATES=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_CRATES+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery (same as original)
DISCOVERED_CRATES=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering crates from crates.io for user: ruvnet ..."
  page=1
  while true; do
    echo "    Fetching page $page..."
    search_json=$(curl -s -A "ruvnet-downloader (github-actions)" "https://crates.io/api/v1/crates?page=${page}&per_page=100&user_id=339999")
    
    page_names=$(echo "$search_json" | grep -o '"name":"[^\"]\+' | sed -E 's/"name":"//' | sort -u || true)
    
    if [ -z "$page_names" ]; then
      break
    fi
    
    IFS=$'\n'
    for name in $page_names; do
      DISCOVERED_CRATES+=("$name")
    done
    unset IFS
    
    ((page++))
    if [ "$page" -gt 10 ]; then break; fi
  done
  
  echo "  Discovered ${#DISCOVERED_CRATES[@]} crates from crates.io"
fi

# Step 3: Merge crates
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_CRATES[@]}"
  printf "%s\n" "${DISCOVERED_CRATES[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_CRATES=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_CRATES+=("$line")
done < "$TEMP_MERGED"

echo "  Total crates (merged): ${#MERGED_CRATES[@]}"
printf "%s\n" "${MERGED_CRATES[@]}" | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified crates manifest:"
  printf "%s\n" "${MERGED_CRATES[@]}" | sort
  exit 0
fi

CRATES=("${MERGED_CRATES[@]}")

# Step 4: Download with cache integration (Parallel)
MAX_JOBS=10
current_jobs=0

process_crate() {
  local crate=$1
  echo "Checking: $crate"
  
  # Get latest version from API
  latest_version=$(curl -s -A "ruvnet-downloader (github-actions)" "https://crates.io/api/v1/crates/${crate}" | \
                   grep -o '"max_version":"[^"]\+' | head -n1 | sed -E 's/"max_version":"(.*)/\1/' || true)
  
  if [ -z "$latest_version" ]; then
    echo "  Warning: crate not found on crates.io: $crate -- skipping"
    return
  fi
  
  # Get checksum from API
  checksum=$(get_crate_checksum "$crate" "$latest_version")
  
  if [ -z "$checksum" ]; then
    echo "  Warning: no checksum available for $crate@$latest_version"
    checksum="sha256:unknown"
  fi
  
  # Check cache first
  cached_path=$(check_cache "crate" "$crate" "$latest_version" "$checksum")
  
  if [ -n "$cached_path" ] && [ -f "$cached_path" ]; then
    # Verify cached file
    if verify_crate_checksum "$cached_path" "$checksum"; then
      echo "  ✓ Cache hit: $crate@$latest_version"
      
      # Ensure extracted directory exists
      extracted_path="$EXTRACTED_DIR/${crate}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting from cache: $crate"
        tar -xzf "$cached_path" -C "$EXTRACTED_DIR"
      fi
      return
    else
      echo "  Cache corrupted, re-downloading: $crate"
    fi
  fi
  
  # Not in cache or corrupted, download
  archive_path="$ARCHIVE_DIR/${crate}-${latest_version}.crate"
  
  if [ -f "$archive_path" ]; then
    # Verify existing file
    if verify_crate_checksum "$archive_path" "$checksum"; then
      echo "  ✓ Already downloaded: $crate@$latest_version"
      update_cache "crate" "$crate" "$latest_version" "$checksum" "$archive_path"
      
      # Ensure extracted
      extracted_path="$EXTRACTED_DIR/${crate}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting: $crate"
        tar -xzf "$archive_path" -C "$EXTRACTED_DIR"
      fi
      return
    else
      echo "  Existing file corrupted, re-downloading: $crate"
      mv "$archive_path" "$LEGACY_DIR/" || rm -f "$archive_path"
    fi
  fi
  
  # Download
  echo "  Downloading: $crate@$latest_version"
  download_url="https://crates.io/api/v1/crates/${crate}/${latest_version}/download"
  
  if ! curl -L -s -A "ruvnet-downloader (github-actions)" -o "$archive_path" "$download_url"; then
    echo "  Warning: failed to download $crate@$latest_version -- skipping"
    return
  fi
  
  # Verify download
  if ! verify_crate_checksum "$archive_path" "$checksum"; then
    echo "  Error: downloaded file failed checksum verification: $crate"
    mv "$archive_path" "$LEGACY_DIR/"
    return
  fi
  
  echo "  ✓ Downloaded and verified: $crate@$latest_version"
  
  # Extract
  echo "  Extracting: $crate"
  if tar -xzf "$archive_path" -C "$EXTRACTED_DIR"; then
    echo "  ✓ Extracted: ${crate}-${latest_version}/"
  else
    echo "  Warning: extraction failed: $crate"
  fi
  
  # Update cache
  update_cache "crate" "$crate" "$latest_version" "$checksum" "$archive_path"
  
  # Cleanup old versions
  for old_file in "$ARCHIVE_DIR/${crate}"-*.crate; do
    if [ -e "$old_file" ] && [ "$(basename "$old_file")" != "${crate}-${latest_version}.crate" ]; then
      echo "  Cleanup: Moving old version to legacy: $(basename "$old_file")"
      mv "$old_file" "$LEGACY_DIR/"
    fi
  done
  
  for old_dir in "$EXTRACTED_DIR/${crate}"-*/; do
    if [ -d "$old_dir" ] && [ "$(basename "$old_dir")" != "${crate}-${latest_version}" ]; then
      echo "  Cleanup: Removing old extracted version: $(basename "$old_dir")"
      rm -rf "$old_dir"
    fi
  done
}

export -f process_crate
export EXTRACTED_DIR ARCHIVE_DIR LEGACY_DIR
# Note: functions from lib/cache.sh and lib/checksum.sh might need to be exported or sourced inside
# But since we are using bash for loops and background jobs in the same script, they are available.

for crate in "${CRATES[@]}"; do
  process_crate "$crate" &
  current_jobs=$((current_jobs + 1))
  
  if [ "$current_jobs" -ge "$MAX_JOBS" ]; then
    wait -n || true
    current_jobs=$((current_jobs - 1))
  fi
done

wait # Wait for all remaining jobs

echo "All crate checks complete. Only missing/new versions were downloaded."
echo "Cache stats:"
get_cache_stats | grep "Crates:" || true
