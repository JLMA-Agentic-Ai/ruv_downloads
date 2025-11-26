#!/bin/bash
set -e
set -o pipefail

# Crates.io user/profile URL (source of crates)
CRATES_IO_USER_URL="https://crates.io/users/ruvnet"
MANIFEST_FILE="crates.dynamic.txt"

# Basic runtime checks to fail fast and provide helpful errors
required_cmds=(curl grep sed sort mktemp)
for _cmd in "${required_cmds[@]}"; do
  if ! command -v "$_cmd" >/dev/null 2>&1; then
    echo "Error: required command '$_cmd' not found in PATH. Please install it and retry." >&2
    exit 1
  fi
done

echo "Checking crates from: $CRATES_IO_USER_URL"

# Arg parsing: support --discover and --discover-only
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing crates from manifest file (or initialize)
EXISTING_CRATES=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_CRATES+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: If discovery is enabled, discover new crates from crates.io
DISCOVERED_CRATES=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering crates from crates.io for user: ruvnet ..."
    user_json=$(curl -s "https://crates.io/api/v1/users/ruvnet")
    # Use the crates.io search API to find crates related to the user/login.
    # This is more reliable than trying to parse the user id and then using
    # another API path. Handle empty results safely so `set -e` doesn't abort.
    search_json=$(curl -s "https://crates.io/api/v1/crates?page=1&per_page=250&q=ruvnet")
    names=$(echo "$search_json" | grep -o '"name":"[^\"]\+' | sed -E 's/"name":"//' | sort -u || true)
    if [ -n "$names" ]; then
      IFS=$'\n' DISCOVERED_CRATES=( $names )
      unset IFS
    else
      DISCOVERED_CRATES=()
    fi

  # If empty, fallback to search API and HTML parsing
  if [ ${#DISCOVERED_CRATES[@]} -eq 0 ]; then
    echo "  API did not return crates; falling back to search API and HTML parsing"
    search_json=$(curl -s "https://crates.io/api/v1/crates?page=1&per_page=100&q=ruvnet")
    IFS=$'\n' DISCOVERED_CRATES=( $(echo "$search_json" | grep -o '"name":"[^"]\+' | sed -E 's/"name":"//' | sort -u) )
    unset IFS
    if [ ${#DISCOVERED_CRATES[@]} -eq 0 ]; then
      DISCOVERED_CRATES=( $(curl -s "https://crates.io/users/ruvnet" | grep -o 'href="/crates/[^" ]\+' | sed -E 's/href="\/crates\/(.+)/\1/' | sed 's/"//' | sort -u) )
    fi
  fi

  if [ ${#DISCOVERED_CRATES[@]} -gt 0 ]; then
    echo "  Discovered ${#DISCOVERED_CRATES[@]} crates from crates.io"
  else
    echo "  Warning: no crates discovered from crates.io API"
  fi
fi

# Step 3: Merge existing + discovered crates into unified list (remove duplicates)
# Use a temporary file for deduplication instead of associative arrays (macOS bash compatibility)
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

# Build merged list: existing + discovered + already-downloaded crate files
{
  printf "%s\n" "${EXISTING_CRATES[@]}"
  printf "%s\n" "${DISCOVERED_CRATES[@]}"
  # Also auto-discover crates that are already present as *.crate files in folder
  for crate_file in *.crate; do
    if [ -e "$crate_file" ]; then
      echo "$crate_file" | sed 's/-[0-9.]*\.crate$//'
    fi
  done
} | grep -v '^$' | grep -v '^[0-9]\+$' | sort -u > "$TEMP_MERGED"

MERGED_CRATES=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_CRATES+=("$line")
done < "$TEMP_MERGED"

# Step 5: Save merged list to manifest (this is the SINGLE SOURCE OF TRUTH)
echo "  Total crates (merged): ${#MERGED_CRATES[@]}"
printf "%s\n" "${MERGED_CRATES[@]}" | sort -u > "$MANIFEST_FILE"

# Step 6: If discovery-only mode, show and exit
if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified crates manifest:"
  printf "%s\n" "${MERGED_CRATES[@]}" | sort
  exit 0
fi

CRATES=("${MERGED_CRATES[@]}")

for crate in "${CRATES[@]}"
do
  echo "Checking: $crate"

  # Query crates.io API for latest published version
  latest_version=$(curl -s "https://crates.io/api/v1/crates/${crate}" | grep -o '"max_version":"[^"]\+' | head -n1 | sed -E 's/"max_version":"(.*)/\1/')

  if [ -z "$latest_version" ]; then
    echo "  Warning: crate not found on crates.io: $crate -- skipping"
    continue
  fi

  # Candidate file patterns that might already be present
  candidates=(
    "${crate}-${latest_version}.crate"
  )

  found=0
  for candidate in "${candidates[@]}"; do
    if [ -e "$candidate" ]; then
      echo "  Up-to-date: $crate@$latest_version"
      found=1
      break
    fi
  done

  if [ "$found" -eq 1 ]; then
    continue
  fi

  echo "  Downloading: $crate@$latest_version"
  # Download the specific crate version via crates.io API. If download fails
  # (e.g. 403 for yanked or restricted crates), skip and continue.
  download_url="https://crates.io/api/v1/crates/${crate}/${latest_version}/download"
  out_file="${crate}-${latest_version}.crate"
  if ! curl -L --fail -o "$out_file" "$download_url"; then
    echo "  Warning: failed to download $crate@$latest_version (HTTP error) -- skipping"
    continue
  fi
  echo "  Saved: $out_file"
done

echo "All crate checks complete. Only missing/new versions were downloaded."
