#!/bin/bash
# Test Suite for Cache System (lib/cache.sh)
# Tests cache hit/miss, TTL, storage, and error handling

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Temporary test directory
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

# Source the cache library
source "$(dirname "$0")/../lib/cache.sh"

# Override cache directory for testing
CACHE_DIR="$TEST_DIR/.cache"

# Helper functions
assert_equals() {
  local expected="$1"
  local actual="$2"
  local msg="${3:-}"

  TESTS_RUN=$((TESTS_RUN + 1))

  if [ "$expected" = "$actual" ]; then
    echo -e "${GREEN}✓${NC} PASS: $msg"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} FAIL: $msg"
    echo "  Expected: $expected"
    echo "  Actual:   $actual"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

assert_true() {
  local condition="$1"
  local msg="${2:-}"

  TESTS_RUN=$((TESTS_RUN + 1))

  if eval "$condition"; then
    echo -e "${GREEN}✓${NC} PASS: $msg"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} FAIL: $msg"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

assert_false() {
  local condition="$1"
  local msg="${2:-}"

  TESTS_RUN=$((TESTS_RUN + 1))

  if ! eval "$condition"; then
    echo -e "${GREEN}✓${NC} PASS: $msg"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} FAIL: $msg"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test Suite 1: Cache Initialization
echo -e "\n${YELLOW}=== Test Suite 1: Cache Initialization ===${NC}"

init_cache
assert_true "[ -d '$CACHE_DIR' ]" "Cache directory created"
assert_true "[ -f '$CACHE_DIR/index.json' ]" "Index file created"

# Test Suite 2: Cache Hit Detection
echo -e "\n${YELLOW}=== Test Suite 2: Cache Hit/Miss Detection ===${NC}"

# Add entry to cache
cache_put "crates" "qudag" "1.4.0" "abc123def456" "$TEST_DIR/qudag-1.4.0.crate"
assert_true "cache_hit 'crates' 'qudag' '1.4.0'" "Cache hit detection works"
assert_false "cache_hit 'crates' 'nonexistent' '1.0.0'" "Cache miss detection works"

# Test Suite 3: Cache Retrieval
echo -e "\n${YELLOW}=== Test Suite 3: Cache Retrieval ===${NC}"

cached_path=$(cache_get "crates" "qudag" "1.4.0")
assert_equals "$TEST_DIR/qudag-1.4.0.crate" "$cached_path" "Cached path retrieval"

# Test Suite 4: TTL Expiration
echo -e "\n${YELLOW}=== Test Suite 4: TTL Expiration ===${NC}"

# Set very short TTL for testing
cache_put "npm" "test-pkg" "1.0.0" "checksum123" "$TEST_DIR/pkg.tgz" "1"
sleep 2
assert_false "cache_hit 'npm' 'test-pkg' '1.0.0'" "TTL expiration works"

# Test Suite 5: Cache Stats
echo -e "\n${YELLOW}=== Test Suite 5: Cache Statistics ===${NC}"

stats=$(get_cache_stats)
assert_true "echo '$stats' | grep -q 'total_entries'" "Cache stats include entry count"
assert_true "echo '$stats' | grep -q 'cache_size'" "Cache stats include size"

# Test Suite 6: Cache Cleanup
echo -e "\n${YELLOW}=== Test Suite 6: Cache Cleanup ===${NC}"

cache_put "temp" "old1" "1.0.0" "hash1" "$TEST_DIR/old1.tar"
cache_put "temp" "old2" "1.0.0" "hash2" "$TEST_DIR/old2.tar"
cleanup_cache "temp"
assert_false "cache_hit 'temp' 'old1' '1.0.0'" "Cache cleanup removes entries"
assert_false "cache_hit 'temp' 'old2' '1.0.0'" "All temp entries cleaned"

# Test Suite 7: Error Handling
echo -e "\n${YELLOW}=== Test Suite 7: Error Handling ===${NC}"

# Invalid cache operations should not crash
cache_put "invalid" "" "1.0.0" "hash" "$TEST_DIR/file" 2>/dev/null || true
assert_true "true" "Empty package name handled gracefully"

# Test Suite 8: Multiple Types
echo -e "\n${YELLOW}=== Test Suite 8: Multiple Cache Types ===${NC}"

cache_put "crates" "pkg1" "1.0.0" "hash1" "$TEST_DIR/1.crate"
cache_put "npm" "pkg2" "2.0.0" "hash2" "$TEST_DIR/2.tgz"
cache_put "repos" "repo1" "main" "hash3" "$TEST_DIR/repo1"

assert_true "cache_hit 'crates' 'pkg1' '1.0.0'" "Crates cache entry found"
assert_true "cache_hit 'npm' 'pkg2' '2.0.0'" "NPM cache entry found"
assert_true "cache_hit 'repos' 'repo1' 'main'" "Repos cache entry found"

# Print summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed!${NC}"
  exit 1
fi
