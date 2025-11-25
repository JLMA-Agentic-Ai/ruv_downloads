#!/bin/bash
set -e

# NPM user/profile URL to indicate the source of the packages
NPM_USER_URL="https://www.npmjs.com/~ruvnet"
MANIFEST_FILE="packagelist.dynamic.txt"

echo "Checking packages from: $NPM_USER_URL"

# Arg parsing: support --discover and --discover-only
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing packages from manifest file (or initialize)
EXISTING_PACKAGES=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_PACKAGES+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: If discovery is enabled, query npm registry for packages maintained by user `ruvnet`
DISCOVERED_PACKAGES=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering packages from npm registry for user: ruvnet ..."
  pkg_json=$(curl -s "https://registry.npmjs.org/-/v1/search?text=maintainer:ruvnet&size=250")
  # extract package names without requiring jq
  IFS=$'\n' DISCOVERED_PACKAGES=( $(echo "$pkg_json" | grep -o '"name":"[^"]\+' | sed -E 's/"name":"//' | sort -u) )
  unset IFS
  
  if [ ${#DISCOVERED_PACKAGES[@]} -gt 0 ]; then
    echo "  Discovered ${#DISCOVERED_PACKAGES[@]} packages from npm registry"
  else
    echo "  Warning: no packages discovered from npm registry"
  fi
fi

# Step 3: Merge existing + discovered packages into unified list (remove duplicates)
# Use a temporary file for deduplication instead of associative arrays (macOS bash compatibility)
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

# Build merged list: existing + discovered + already-downloaded tarball files
{
  printf "%s\n" "${EXISTING_PACKAGES[@]}"
  printf "%s\n" "${DISCOVERED_PACKAGES[@]}"
  # Also auto-discover packages that are already present as *.tgz files in folder
  for tgz_file in *.tgz; do
    if [ -e "$tgz_file" ]; then
      # Extract package name from tarball (format varies: scoped @org/pkg or plain pkg)
      echo "$tgz_file" | sed 's/-[0-9.]*\.tgz$//'
    fi
  done
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_PACKAGES=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_PACKAGES+=("$line")
done < "$TEMP_MERGED"

# Step 4: Save merged list to manifest (this is the SINGLE SOURCE OF TRUTH)
echo "  Total packages (merged): ${#MERGED_PACKAGES[@]}"
printf "%s\n" "${MERGED_PACKAGES[@]}" | sort -u > "$MANIFEST_FILE"

# Step 5: If discovery-only mode, show and exit
if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified packages manifest:"
  printf "%s\n" "${MERGED_PACKAGES[@]}" | sort
  exit 0
fi

PACKAGES=("${MERGED_PACKAGES[@]}")

for pkg in "${PACKAGES[@]}"
do
  echo "Checking: $pkg"
  # Get latest published version from the registry
  latest_version=$(npm view "$pkg" version 2>/dev/null || true)
  if [ -z "$latest_version" ]; then
    echo "  Warning: package not found on npm: $pkg -- skipping"
    continue
  fi

  # Build a few candidate filename patterns that npm pack may produce
  name_no_at=${pkg//@/}
  name_dash=${name_no_at//\//-}
  name_underscore=${name_no_at//\//_}

  candidates=(
    "${name_dash}-${latest_version}.tgz"
    "${name_underscore}-${latest_version}.tgz"
  )

  found=0
  for candidate in "${candidates[@]}"; do
    if [ -e "$candidate" ]; then
      echo "  Up-to-date: $pkg@$latest_version"
      found=1
      break
    fi
  done

  if [ "$found" -eq 1 ]; then
    continue
  fi

  echo "  Downloading: $pkg@$latest_version"
  npm pack "$pkg"
done

echo "All npm package downloads complete! Only missing/new packages were downloaded."