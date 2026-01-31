#!/bin/bash
# scripts/download_npm_optimized.sh - NPM package download with cache integration
# Version: 2.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load libraries
source "$PROJECT_ROOT/lib/cache.sh"
source "$PROJECT_ROOT/lib/checksum.sh"

# Configuration
NPM_USER_URL="https://www.npmjs.com/~ruvnet"
MANIFEST_FILE="$PROJECT_ROOT/manifests/packages.txt"
ARCHIVE_DIR="$PROJECT_ROOT/artifacts/archives/npm"
EXTRACTED_DIR="$PROJECT_ROOT/artifacts/npm/extracted"
LEGACY_DIR="$ARCHIVE_DIR/00_legacy"

METADATA_DIR="$ARCHIVE_DIR/.metadata"
mkdir -p "$ARCHIVE_DIR" "$EXTRACTED_DIR" "$LEGACY_DIR" "$METADATA_DIR"

echo "Checking packages from: $NPM_USER_URL"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing packages
EXISTING_PACKAGES=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_PACKAGES+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery
DISCOVERED_PACKAGES=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering packages from npm registry for user: ruvnet ..."
  pkg_json=$(curl -s -A "ruvnet-downloader (github-actions)" "https://registry.npmjs.org/-/v1/search?text=maintainer:ruvnet&size=250")
  IFS=$'\n' DISCOVERED_PACKAGES=( $(echo "$pkg_json" | grep -o '"name":"[^\"]\+' | sed -E 's/"name":"//' | sort -u || true) )
  unset IFS
  echo "  Discovered ${#DISCOVERED_PACKAGES[@]} packages from npm registry"
fi

# Step 3: Merge
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_PACKAGES[@]}"
  printf "%s\n" "${DISCOVERED_PACKAGES[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_PACKAGES=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_PACKAGES+=("$line")
done < "$TEMP_MERGED"

echo "  Total packages (merged): ${#MERGED_PACKAGES[@]}"
printf "%s\n" "${MERGED_PACKAGES[@]}" | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified packages manifest:"
  printf "%s\n" "${MERGED_PACKAGES[@]}" | sort
  exit 0
fi

PACKAGES=("${MERGED_PACKAGES[@]}")

# Step 4: Download with cache (Parallel)
MAX_JOBS=10
current_jobs=0

process_package() {
  local pkg=$1
  echo "Checking: $pkg"
  
  latest_version=$(npm view "$pkg" version 2>/dev/null || true)
  if [ -z "$latest_version" ]; then
    echo "  Warning: package not found on npm: $pkg -- skipping"
    return
  fi
  
  checksum=$(get_npm_checksum "$pkg" "$latest_version")
  if [ -z "$checksum" ]; then
    checksum="sha1:pending"
  fi
  
  local name_no_at=${pkg//@/}
  local name_dash=${name_no_at//\//-}
  metadata_file="$METADATA_DIR/${name_dash}.json"
  archive_path="$ARCHIVE_DIR/${name_dash}-${latest_version}.tgz"

  # Step A: Check metadata receipt for skip (crucial for CI)
  if [ -f "$metadata_file" ]; then
    last_version=$(jq -r '.version' "$metadata_file" 2>/dev/null || echo "")
    last_checksum=$(jq -r '.checksum' "$metadata_file" 2>/dev/null || echo "")
    if [ "$latest_version" == "$last_version" ] && [ "$checksum" == "$last_checksum" ]; then
      echo "  ✓ Skip-check passed (receipt matches): $pkg@$latest_version"
      update_cache "npm" "$pkg" "$latest_version" "$checksum" "$archive_path"
      return
    fi
  fi
  
  # Step B: Check cache
  cached_path=$(check_cache "npm" "$pkg" "$latest_version" "$checksum")
  
  if [ -n "$cached_path" ] && [ -f "$cached_path" ]; then
    if verify_npm_checksum "$cached_path" "$checksum"; then
      echo "  ✓ Cache hit: $pkg@$latest_version"
      
      # Update metadata receipt
      cat > "$metadata_file" <<EOF
{
  "name": "$pkg",
  "type": "npm",
  "version": "$latest_version",
  "checksum": "$checksum",
  "lastUpdated": "$(date -Iseconds)"
}
EOF

      # Ensure extracted
      local extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting from cache: $pkg"
        tar -xzf "$cached_path" -C "$EXTRACTED_DIR"
        [ -d "$EXTRACTED_DIR/package" ] && mv "$EXTRACTED_DIR/package" "$extracted_path"
      fi
      return
    fi
  fi
  
  # Step C: Prepare paths and check existing archive
  if [ -f "$archive_path" ]; then
    if verify_npm_checksum "$archive_path" "$checksum"; then
      echo "  ✓ Already downloaded: $pkg@$latest_version"
      
      # Update metadata receipt
      cat > "$metadata_file" <<EOF
{
  "name": "$pkg",
  "type": "npm",
  "version": "$latest_version",
  "checksum": "$checksum",
  "lastUpdated": "$(date -Iseconds)"
}
EOF
      update_cache "npm" "$pkg" "$latest_version" "$checksum" "$archive_path"
      
      local extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting: $pkg"
        tar -xzf "$archive_path" -C "$EXTRACTED_DIR"
        [ -d "$EXTRACTED_DIR/package" ] && mv "$EXTRACTED_DIR/package" "$extracted_path"
      fi
      return
    else
      mv "$archive_path" "$LEGACY_DIR/" || rm -f "$archive_path"
    fi
  fi
  
  # Download
  echo "  Downloading: $pkg@$latest_version"
  # We need a temp dir to avoid collisions when multiple npm pack run in same dir
  local temp_pack_dir=$(mktemp -d)
  if ! npm pack "$pkg@$latest_version" --pack-destination "$temp_pack_dir" --loglevel error; then
    echo "  Warning: failed to download $pkg@$latest_version -- skipping"
    rm -rf "$temp_pack_dir"
    return
  fi
  
  # Find downloaded file in temp dir
  local downloaded_file=$(ls "$temp_pack_dir"/*.tgz | head -1 || true)
  
  if [ -z "$downloaded_file" ] || [ ! -f "$downloaded_file" ]; then
    echo "  Warning: could not find downloaded file for $pkg"
    rm -rf "$temp_pack_dir"
    return
  fi
  
  # Verify and extract
  if ! verify_npm_checksum "$downloaded_file" "$checksum"; then
    echo "  Error: download failed checksum: $pkg"
    mv "$downloaded_file" "$LEGACY_DIR/"
    rm -rf "$temp_pack_dir"
    return
  fi
  
  echo "  ✓ Downloaded and verified: $pkg@$latest_version"
  
  # Move to final archive path
  mv "$downloaded_file" "$archive_path"
  rm -rf "$temp_pack_dir"
  
  echo "  Extracting: $pkg"
  local temp_extract_dir=$(mktemp -d)
  tar -xzf "$archive_path" -C "$temp_extract_dir"
  local extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
  if [ -d "$temp_extract_dir/package" ]; then
    mv "$temp_extract_dir/package" "$extracted_path"
  fi
  rm -rf "$temp_extract_dir"
  
  # Update metadata receipt
  cat > "$metadata_file" <<EOF
{
  "name": "$pkg",
  "type": "npm",
  "version": "$latest_version",
  "checksum": "$checksum",
  "lastUpdated": "$(date -Iseconds)"
}
EOF

  update_cache "npm" "$pkg" "$latest_version" "$checksum" "$archive_path"
  
  # Cleanup old versions
  for old_file in "$ARCHIVE_DIR/${name_dash}"-*.tgz; do
    if [ -e "$old_file" ] && [ "$(basename "$old_file")" != "${name_dash}-${latest_version}.tgz" ]; then
      echo "  Cleanup: Moving old version to legacy: $(basename "$old_file")"
      mv "$old_file" "$LEGACY_DIR/"
    fi
  done
}

for pkg in "${PACKAGES[@]}"; do
  process_package "$pkg" &
  current_jobs=$((current_jobs + 1))
  
  if [ "$current_jobs" -ge "$MAX_JOBS" ]; then
    wait -n || true
    current_jobs=$((current_jobs - 1))
  fi
done

wait # Wait for all remaining jobs

echo "All npm package downloads complete!"
echo "Cache stats:"
get_cache_stats | grep "NPM Packages:" || true
