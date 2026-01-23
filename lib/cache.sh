#!/bin/bash
# lib/cache.sh - Unified cache system for ruv_downloads
# Version: 1.0.0

set -euo pipefail

# Cache database location
# Try global cache first, fallback to project-local
if [ -n "${XDG_CACHE_HOME:-}" ]; then
  CACHE_DIR="$XDG_CACHE_HOME/ruv_downloads"
elif [ -d "$HOME/.cache" ]; then
  CACHE_DIR="$HOME/.cache/ruv_downloads"
else
  # Fallback to project root
  CACHE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/cache"
fi

CACHE_DB="$CACHE_DIR/cache.db"

# Ensure cache directory exists
mkdir -p "$CACHE_DIR"

# Initialize cache DB if it doesn't exist
if [ ! -f "$CACHE_DB" ]; then
  cat > "$CACHE_DB" <<'EOF'
# RUV Downloads Cache Database
# Format: type|name|version|hash|path|timestamp
# Types: crate, npm, repo, gist
# Hash format: sha256:... for crates/npm, git:... for repos/gists
EOF
fi

################################################################################
# check_cache - Check if an artifact exists in cache
#
# Usage: check_cache TYPE NAME VERSION HASH
# Returns: Path to cached artifact (empty if not found)
################################################################################
check_cache() {
  local type=$1 name=$2 version=$3 hash=$4
  
  # Escape pipes in arguments for grep
  local safe_type="${type//|/\\|}"
  local safe_name="${name//|/\\|}"
  local safe_version="${version//|/\\|}"
  local safe_hash="${hash//|/\\|}"
  
  # Search for exact match
  grep "^${safe_type}|${safe_name}|${safe_version}|${safe_hash}|" "$CACHE_DB" 2>/dev/null | \
    cut -d'|' -f5 | \
    head -n1
}

################################################################################
# update_cache - Add or update an artifact in cache
#
# Usage: update_cache TYPE NAME VERSION HASH PATH
################################################################################
update_cache() {
  local type=$1 name=$2 version=$3 hash=$4 path=$5
  local timestamp=$(date +%s)
  
  # Remove old entry if exists (same type, name, version)
  local temp_db=$(mktemp)
  grep -v "^${type}|${name}|${version}|" "$CACHE_DB" > "$temp_db" 2>/dev/null || true
  
  # Add new entry
  echo "${type}|${name}|${version}|${hash}|${path}|${timestamp}" >> "$temp_db"
  
  # Replace cache DB atomically
  mv "$temp_db" "$CACHE_DB"
}

################################################################################
# validate_cache_entry - Check if cached file still exists and is valid
#
# Usage: validate_cache_entry PATH HASH
# Returns: 0 if valid, 1 if invalid
################################################################################
validate_cache_entry() {
  local path=$1 hash=$2
  
  # Check if file/directory exists
  if [ ! -e "$path" ]; then
    return 1
  fi
  
  # For git hashes, we assume validity if path exists
  # (git repos self-validate)
  if [[ "$hash" == git:* ]]; then
    return 0
  fi
  
  # For file hashes, we'd need to verify checksum
  # (implemented in checksum.sh)
  # For now, assume valid if file exists
  return 0
}

################################################################################
# cleanup_cache - Remove invalid entries from cache
#
# Usage: cleanup_cache
################################################################################
cleanup_cache() {
  local temp_db=$(mktemp)
  local cleaned=0
  
  while IFS='|' read -r type name version hash path timestamp; do
    # Skip comments and empty lines
    [[ "$type" =~ ^#.*$ ]] && echo "$type|$name|$version|$hash|$path|$timestamp" >> "$temp_db" && continue
    [ -z "$type" ] && continue
    
    # Validate entry
    if validate_cache_entry "$path" "$hash"; then
      echo "$type|$name|$version|$hash|$path|$timestamp" >> "$temp_db"
    else
      ((cleaned++))
    fi
  done < "$CACHE_DB"
  
  mv "$temp_db" "$CACHE_DB"
  
  if [ $cleaned -gt 0 ]; then
    echo "Cache cleanup: removed $cleaned invalid entries" >&2
  fi
}

################################################################################
# get_cache_stats - Display cache statistics
#
# Usage: get_cache_stats
################################################################################
get_cache_stats() {
  local total=$(grep -v '^#' "$CACHE_DB" | grep -v '^$' | wc -l | tr -d ' ')
  local crates=$(grep '^crate|' "$CACHE_DB" | wc -l | tr -d ' ')
  local npm=$(grep '^npm|' "$CACHE_DB" | wc -l | tr -d ' ')
  local repos=$(grep '^repo|' "$CACHE_DB" | wc -l | tr -d ' ')
  local gists=$(grep '^gist|' "$CACHE_DB" | wc -l | tr -d ' ')
  
  cat <<EOF
Cache Statistics:
  Location: $CACHE_DB
  Total Entries: $total
  - Crates: $crates
  - NPM Packages: $npm
  - Git Repos: $repos
  - Gists: $gists
EOF
}

# Export functions for use in other scripts
export -f check_cache
export -f update_cache
export -f validate_cache_entry
export -f cleanup_cache
export -f get_cache_stats
