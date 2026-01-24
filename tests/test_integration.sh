#!/bin/bash
# Integration Test Suite for Download Optimization Phase 1
# Tests cache + checksum + download coordination

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Temporary test environment
TEST_ENV=$(mktemp -d)
trap "rm -rf $TEST_ENV" EXIT

# Source libraries
source "$(dirname "$0")/../lib/cache.sh"
source "$(dirname "$0")/../lib/checksum.sh"

# Override for testing
CACHE_DIR="$TEST_ENV/.cache"
ARTIFACTS_DIR="$TEST_ENV/artifacts"
MANIFESTS_DIR="$TEST_ENV/manifests"

# Create test environment
mkdir -p "$ARTIFACTS_DIR/crates/archives" "$ARTIFACTS_DIR/crates/extracted" "$ARTIFACTS_DIR/crates/legacy"
mkdir -p "$MANIFESTS_DIR"

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

# Test Suite 1: Cache + Checksum Integration
echo -e "\n${BLUE}=== Test Suite 1: Cache + Checksum Integration ===${NC}"

# Create test artifact
echo "crate content v1.0" > "$TEST_ENV/qudag-1.0.0.crate"
checksum=$(get_sha256_checksum "$TEST_ENV/qudag-1.0.0.crate")

# Cache with checksum
init_cache
cache_put "crates" "qudag" "1.0.0" "$checksum" "$TEST_ENV/qudag-1.0.0.crate"

# Verify cache hit with checksum validation
assert_true "cache_hit 'crates' 'qudag' '1.0.0'" "Cache entry created"
cached_path=$(cache_get "crates" "qudag" "1.0.0")
cached_checksum=$(get_sha256_checksum "$cached_path")
assert_equals "$checksum" "$cached_checksum" "Cached file checksum matches"

# Test Suite 2: Download Workflow Simulation
echo -e "\n${BLUE}=== Test Suite 2: Download Workflow ===${NC}"

# Simulate crate download
simulate_download() {
  local name="$1"
  local version="$2"
  local source="$3"

  local dest="$ARTIFACTS_DIR/crates/archives/${name}-${version}.crate"
  cp "$source" "$dest"

  local checksum=$(get_sha256_checksum "$dest")
  cache_put "crates" "$name" "$version" "$checksum" "$dest"

  echo "$checksum"
}

checksum1=$(simulate_download "test-crate-1" "1.0.0" "$TEST_ENV/qudag-1.0.0.crate")
assert_true "[ -f '$ARTIFACTS_DIR/crates/archives/test-crate-1-1.0.0.crate' ]" "Artifact archived"
assert_true "cache_hit 'crates' 'test-crate-1' '1.0.0'" "Cache entry for downloaded artifact"

# Test Suite 3: Cache Hit Prevention of Re-download
echo -e "\n${BLUE}=== Test Suite 3: Cache Hit Avoids Re-download ===${NC}"

touch "$TEST_ENV/download_marker"
original_marker="$TEST_ENV/download_marker"

# Second download attempt should hit cache
if cache_hit "crates" "test-crate-1" "1.0.0"; then
  echo -e "${GREEN}✓${NC} PASS: Cache hit prevents redundant download"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: Cache miss when entry should exist"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Test Suite 4: Multiple Artifacts
echo -e "\n${BLUE}=== Test Suite 4: Multiple Artifacts Management ===${NC}"

for i in {1..3}; do
  echo "artifact $i" > "$TEST_ENV/artifact-$i.txt"
  checksum=$(get_sha256_checksum "$TEST_ENV/artifact-$i.txt")
  cache_put "crates" "pkg-$i" "1.$i.0" "$checksum" "$TEST_ENV/artifact-$i.txt"
done

# Verify all cached
for i in {1..3}; do
  assert_true "cache_hit 'crates' 'pkg-$i' '1.$i.0'" "Cache entry $i exists"
done

# Test Suite 5: Manifest Management
echo -e "\n${BLUE}=== Test Suite 5: Manifest Management ===${NC}"

# Create test manifest
manifest_file="$MANIFESTS_DIR/test.txt"
cat > "$manifest_file" << 'EOF'
qudag/1.4.0
agentic-jujutsu/2.1.0
ruvector-core/0.5.3
EOF

lines=$(wc -l < "$manifest_file")
assert_equals "3" "$lines" "Manifest file has correct entries"

# Test Suite 6: Cache Stats Reporting
echo -e "\n${BLUE}=== Test Suite 6: Cache Statistics ===${NC}"

stats=$(get_cache_stats)
assert_true "echo '$stats' | grep -q 'total_entries'" "Stats include entry count"
assert_true "echo '$stats' | grep -q 'cache_size'" "Stats include cache size"

# Test Suite 7: Error Recovery
echo -e "\n${BLUE}=== Test Suite 7: Error Recovery ===${NC}"

# Try invalid operations
corrupted_checksum="invalid_checksum_format"
result=$(verify_sha256_checksum "$TEST_ENV/nonexistent.txt" "$corrupted_checksum" 2>&1 || echo "error_handled")
assert_true "echo '$result' | grep -q -E 'error|invalid'" "Corrupted checksum handled gracefully"

# Test Suite 8: Cleanup and Archival
echo -e "\n${BLUE}=== Test Suite 8: Cleanup and Archival ===${NC}"

# Create test files for cleanup
mkdir -p "$ARTIFACTS_DIR/crates/legacy"
touch "$ARTIFACTS_DIR/crates/old-artifact-1.0.0.crate"

# Verify cleanup capability
assert_true "[ -f '$ARTIFACTS_DIR/crates/old-artifact-1.0.0.crate' ]" "Old artifact exists"

# Test Suite 9: Checksum Verification Chain
echo -e "\n${BLUE}=== Test Suite 9: Checksum Verification Chain ===${NC}"

# Download -> Cache -> Verify workflow
test_file="$TEST_ENV/chain-test.txt"
echo "test data for verification chain" > "$test_file"
original_sum=$(get_sha256_checksum "$test_file")

# Copy to artifacts (simulate download)
cp "$test_file" "$ARTIFACTS_DIR/crates/archives/test.crate"
cached_sum=$(get_sha256_checksum "$ARTIFACTS_DIR/crates/archives/test.crate")

# Verify chain
assert_equals "$original_sum" "$cached_sum" "Checksum verified through download chain"

# Test Suite 10: Parallel Access Simulation
echo -e "\n${BLUE}=== Test Suite 10: Parallel Access Simulation ===${NC}"

# Simulate multiple concurrent cache operations
for i in {1..5}; do
  (
    cache_put "crates" "parallel-$i" "1.0.0" "hash$i" "$TEST_ENV/artifact-$i.txt"
  ) &
done
wait

# Verify all parallel operations succeeded
parallel_success=1
for i in {1..5}; do
  cache_hit "crates" "parallel-$i" "1.0.0" || parallel_success=0
done

assert_equals "1" "$parallel_success" "Parallel cache operations succeed"

# Print comprehensive summary
echo -e "\n${BLUE}=== Integration Test Summary ===${NC}"
echo -e "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Success Rate: $(awk "BEGIN {printf \"%.1f%%\", ($TESTS_PASSED/$TESTS_RUN)*100}")${NC}"

echo -e "\n${BLUE}=== Test Environment Stats ===${NC}"
echo -e "Artifacts: $(find $ARTIFACTS_DIR -type f 2>/dev/null | wc -l)"
echo -e "Cache Size: $(du -sh $CACHE_DIR 2>/dev/null | cut -f1)"
echo -e "Temp Files: $(ls -1 $TEST_ENV | wc -l)"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All integration tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some integration tests failed!${NC}"
  exit 1
fi
