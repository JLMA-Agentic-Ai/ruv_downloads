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
ARCHIVE_DIR="$PROJECT_ROOT/artifacts/npm/archives"
EXTRACTED_DIR="$PROJECT_ROOT/artifacts/npm/extracted"
LEGACY_DIR="$PROJECT_ROOT/artifacts/npm/legacy"

mkdir -p "$ARCHIVE_DIR" "$EXTRACTED_DIR" "$LEGACY_DIR"

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

# Step 4: Download with cache
for pkg in "${PACKAGES[@]}"; do
  echo "Checking: $pkg"
  
  latest_version=$(npm view "$pkg" version 2>/dev/null || true)
  if [ -z "$latest_version" ]; then
    echo "  Warning: package not found on npm: $pkg -- skipping"
    continue
  fi
  
  checksum=$(get_npm_checksum "$pkg" "$latest_version")
  if [ -z "$checksum" ]; then
    checksum="sha1:pending"
  fi
  
  # Check cache
  cached_path=$(check_cache "npm" "$pkg" "$latest_version" "$checksum")
  
  if [ -n "$cached_path" ] && [ -f "$cached_path" ]; then
    if verify_npm_checksum "$cached_path" "$checksum"; then
      echo "  ✓ Cache hit: $pkg@$latest_version"
      
      # Ensure extracted
      name_dash=${pkg//@/}
      name_dash=${name_dash//\//-}
      extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting from cache..."
        tar -xzf "$cached_path" -C "$EXTRACTED_DIR"
        [ -d "$EXTRACTED_DIR/package" ] && mv "$EXTRACTED_DIR/package" "$extracted_path"
      fi
      continue
    fi
  fi
  
  #Prepare paths
  name_no_at=${pkg//@/}
  name_dash=${name_no_at//\//-}
  archive_path="$ARCHIVE_DIR/${name_dash}-${latest_version}.tgz"
  
  if [ -f "$archive_path" ]; then
    if verify_npm_checksum "$archive_path" "$checksum"; then
      echo "  ✓ Already downloaded: $pkg@$latest_version"
      update_cache "npm" "$pkg" "$latest_version" "$checksum" "$archive_path"
      
      extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
      if [ ! -d "$extracted_path" ]; then
        echo "  Extracting..."
        tar -xzf "$archive_path" -C "$EXTRACTED_DIR"
        [ -d "$EXTRACTED_DIR/package" ] && mv "$EXTRACTED_DIR/package" "$extracted_path"
      fi
      continue
    else
      mv "$archive_path" "$LEGACY_DIR/" || rm -f "$archive_path"
    fi
  fi
  
  # Download
  echo "  Downloading: $pkg@$latest_version"
  if ! npm pack "$pkg@$latest_version" --pack-destination "$ARCHIVE_DIR"; then
    echo "  Warning: failed to download $pkg@$latest_version -- skipping"
    continue
  fi
  
  # Find downloaded file
  downloaded_file=$(ls "$ARCHIVE_DIR/${name_dash}-${latest_version}.tgz" 2>/dev/null || ls "$ARCHIVE_DIR"/${name_dash}*.tgz 2>/dev/null | head -1 || true)
  
  if [ -z "$downloaded_file" ]; then
    echo "  Warning: could not find downloaded file"
    continue
  fi
  
  # Verify and extract
  if ! verify_npm_checksum "$downloaded_file" "$checksum"; then
    echo "  Error: download failed checksum"
    mv "$downloaded_file" "$LEGACY_DIR/"
    continue
  fi
  
  echo "  ✓ Downloaded and verified: $pkg@$latest_version"
  
  echo "  Extracting..."
  tar -xzf "$downloaded_file" -C "$EXTRACTED_DIR"
  extracted_path="$EXTRACTED_DIR/${name_dash}-${latest_version}"
  [ -d "$EXTRACTED_DIR/package" ] && mv "$EXTRACTED_DIR/package" "$extracted_path"
  
  # Rename if needed
  if [ "$downloaded_file" != "$archive_path" ]; then
    mv "$downloaded_file" "$archive_path"
  fi
  
  update_cache "npm" "$pkg" "$latest_version" "$checksum" "$archive_path"
  
  # Cleanup old versions
  for old_file in "$ARCHIVE_DIR/${name_dash}"-*.tgz; do
    if [ -e "$old_file" ] && [ "$(basename "$old_file")" != "${name_dash}-${latest_version}.tgz" ]; then
      echo "  Cleanup: Moving old version to legacy/"
      mv "$old_file" "$LEGACY_DIR/"
    fi
  done
done

echo "All npm package downloads complete!"
echo "Cache stats:"
get_cache_stats | grep "NPM:"
