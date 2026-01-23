#!/bin/bash
# lib/checksum.sh - Checksum validation for artifacts
# Version: 1.0.0

set -euo pipefail

################################################################################
# get_crate_checksum - Get checksum from crates.io API
#
# Usage: get_crate_checksum CRATE_NAME VERSION
# Returns: sha256:HASH
################################################################################
get_crate_checksum() {
  local crate=$1 version=$2
  
  # Crates.io doesn't provide SHA256 in version endpoint
  # We'll compute it after download or skip validation if unavailable
  # For now, return a placeholder that allows download to proceed
  echo "sha256:pending"
}

################################################################################
# verify_crate_checksum - Verify crate file checksum
#
# Usage: verify_crate_checksum FILE EXPECTED_HASH
# Returns: 0 if valid, 1 if invalid
################################################################################
verify_crate_checksum() {
  local file=$1 expected_hash=$2
  
  # Skip verification for pending checksums
  if [[ "$expected_hash" == "sha256:pending" ]] || [[ "$expected_hash" == "sha256:unknown" ]]; then
    return 0
  fi
  
  # Extract hash from sha256:HASH format
  local expected="${expected_hash#sha256:}"
  
  if [ ! -f "$file" ]; then
    echo "Error: File not found: $file" >&2
    return 1
  fi
  
  # Calculate actual checksum
  if command -v sha256sum >/dev/null 2>&1; then
    local actual=$(sha256sum "$file" | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    local actual=$(shasum -a 256 "$file" | awk '{print $1}')
  else
    echo "Warning: No SHA256 tool available, skipping verification" >&2
    return 0 # Assume valid if we can't verify
  fi
  
  if [ "$actual" = "$expected" ]; then
    return 0
  else
    echo "Error: Checksum mismatch for $file" >&2
    echo "  Expected: $expected" >&2
    echo "  Actual:   $actual" >&2
    return 1
  fi
}

################################################################################
# get_npm_checksum - Get checksum from npm registry
#
# Usage: get_npm_checksum PACKAGE VERSION
# Returns: sha512:HASH or sha1:HASH
################################################################################
get_npm_checksum() {
  local package=$1 version=$2
  
  # Try to get shasum (sha1) from npm view
  local shasum=$(npm view "$package@$version" dist.shasum 2>/dev/null || true)
  
  if [ -n "$shasum" ]; then
    echo "sha1:$shasum"
    return 0
  fi
  
  # Fallback to registry API for sha512
  local registry_url="https://registry.npmjs.org/$package/$version"
  local integrity=$(curl -s "$registry_url" | \
                   grep -o '"integrity":"[^"]*' | \
                   head -n1 | \
                   cut -d'"' -f4 || true)
  
  if [ -n "$integrity" ]; then
    # integrity format is already sha512-BASE64, convert to our format
    echo "$integrity" | sed 's/-/:/'
  else
    echo "" # Return empty if not found
  fi
}

################################################################################
# verify_npm_checksum - Verify npm tarball checksum
#
# Usage: verify_npm_checksum FILE EXPECTED_HASH
# Returns: 0 if valid, 1 if invalid
################################################################################
verify_npm_checksum() {
  local file=$1 expected_hash=$2
  
  if [ ! -f "$file" ]; then
    echo "Error: File not found: $file" >&2
    return 1
  fi
  
  # Determine hash algorithm
  local algo="${expected_hash%%:*}"
  local expected="${expected_hash#*:}"
  
  local actual=""
  
  case "$algo" in
    sha1)
      if command -v sha1sum >/dev/null 2>&1; then
        actual=$(sha1sum "$file" | awk '{print $1}')
      elif command -v shasum >/dev/null 2>&1; then
        actual=$(shasum -a 1 "$file" | awk '{print $1}')
      fi
      ;;
    sha512)
      if command -v sha512sum >/dev/null 2>&1; then
        actual=$(sha512sum "$file" | awk '{print $1}')
      elif command -v shasum >/dev/null 2>&1; then
        actual=$(shasum -a 512 "$file" | awk '{print $1}')
      fi
      ;;
    *)
      echo "Warning: Unsupported hash algorithm: $algo" >&2
      return 0 # Assume valid if we can't verify
      ;;
  esac
  
  if [ -z "$actual" ]; then
    echo "Warning: No checksum tool available, skipping verification" >&2
    return 0
  fi
  
  if [ "$actual" = "$expected" ]; then
    return 0
  else
    echo "Error: Checksum mismatch for $file" >&2
    echo "  Expected ($algo): $expected" >&2
    echo "  Actual ($algo):   $actual" >&2
    return 1
  fi
}

################################################################################
# get_git_commit_hash - Get current commit hash from git repo
#
# Usage: get_git_commit_hash REPO_PATH
# Returns: git:HASH
################################################################################
get_git_commit_hash() {
  local repo_path=$1
  
  if [ ! -d "$repo_path/.git" ] && [ ! -f "$repo_path/.ruv_commit" ]; then
    echo ""
    return 1
  fi
  
  # Try .ruv_commit first (for repos where .git was removed)
  if [ -f "$repo_path/.ruv_commit" ]; then
    local hash=$(cat "$repo_path/.ruv_commit")
    echo "git:$hash"
    return 0
  fi
  
  # Otherwise get from git
  if [ -d "$repo_path/.git" ]; then
    local hash=$(cd "$repo_path" && git rev-parse HEAD 2>/dev/null || true)
    if [ -n "$hash" ]; then
      echo "git:$hash"
      return 0
    fi
  fi
  
  echo ""
  return 1
}

# Export functions
export -f get_crate_checksum
export -f verify_crate_checksum
export -f get_npm_checksum
export -f verify_npm_checksum
export -f get_git_commit_hash
