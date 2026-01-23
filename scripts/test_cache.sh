#!/bin/bash
# scripts/test_cache.sh - Test cache system functionality
# Version: 1.0.0

set -euo pipefail

# Load cache library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/cache.sh"

echo "=== Testing Cache System ==="
echo ""

# Test 1: Cache initialization
echo "Test 1: Cache Initialization"
echo "  Cache DB location: $CACHE_DB"
if [ -f "$CACHE_DB" ]; then
  echo "  ✓ Cache DB exists"
else
  echo "  ✗ Cache DB does not exist"
  exit 1
fi

# Test 2: Add entry to cache
echo ""
echo "Test 2: Adding Cache Entry"
update_cache "crate" "test-crate" "1.0.0" "sha256:abc123def456" "/tmp/test-crate-1.0.0.crate"
echo "  ✓ Entry added"

# Test 3: Retrieve entry from cache
echo ""
echo "Test 3: Retrieving Cache Entry"
result=$(check_cache "crate" "test-crate" "1.0.0" "sha256:abc123def456")
if [ "$result" = "/tmp/test-crate-1.0.0.crate" ]; then
  echo "  ✓ Entry retrieved correctly: $result"
else
  echo "  ✗ Entry not found or incorrect: '$result'"
  exit 1
fi

# Test 4: Update existing entry
echo ""
echo "Test 4: Updating Existing Entry"
update_cache "crate" "test-crate" "1.0.0" "sha256:newsha789" "/tmp/test-crate-1.0.0-new.crate"
result=$(check_cache "crate" "test-crate" "1.0.0" "sha256:newsha789")
if [ "$result" = "/tmp/test-crate-1.0.0-new.crate" ]; then
  echo "  ✓ Entry updated correctly"
else
  echo "  ✗ Entry update failed"
  exit 1
fi

# Test 5: Add different artifact types
echo ""
echo "Test 5: Multiple Artifact Types"
update_cache "npm" "test-pkg" "2.0.0" "sha1:987654321" "/tmp/test-pkg-2.0.0.tgz"
update_cache "repo" "test-repo" "main" "git:abcdef123456" "/tmp/repos/test-repo"
update_cache "gist" "123abc" "HEAD" "git:fedcba654321" "/tmp/gists/123abc"

npm_result=$(check_cache "npm" "test-pkg" "2.0.0" "sha1:987654321")
repo_result=$(check_cache "repo" "test-repo" "main" "git:abcdef123456")
gist_result=$(check_cache "gist" "123abc" "HEAD" "git:fedcba654321")

if [ -n "$npm_result" ] && [ -n "$repo_result" ] && [ -n "$gist_result" ]; then
  echo "  ✓ All artifact types work correctly"
else
  echo "  ✗ Some artifact types failed"
  exit 1
fi

# Test 6: display cache stats
echo ""
echo "Test 6: Cache Statistics"
get_cache_stats

# Test 7: Cleanup test entries
echo ""
echo "Test 7: Cleaning Test Data"
# Remove test entries
grep -v "test-crate\|test-pkg\|test-repo\|123abc" "$CACHE_DB" > "${CACHE_DB}.tmp" || true
mv "${CACHE_DB}.tmp" "$CACHE_DB"
echo "  ✓ Test entries cleaned"

echo ""
echo "=== All Tests Passed! ==="
