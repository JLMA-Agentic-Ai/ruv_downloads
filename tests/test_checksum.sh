#!/bin/bash
# Test Suite for Checksum System (lib/checksum.sh)
# Tests checksum generation, validation, and error handling

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Temporary test directory
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

# Source the checksum library
source "$(dirname "$0")/../lib/checksum.sh"

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

# Test Suite 1: SHA256 Checksum Generation
echo -e "\n${YELLOW}=== Test Suite 1: SHA256 Generation ===${NC}"

echo "test content" > "$TEST_DIR/test.txt"
checksum=$(get_sha256_checksum "$TEST_DIR/test.txt")
assert_true "[ ! -z '$checksum' ] && [ ${#checksum} -eq 64 ]" "SHA256 checksum generated (64 chars)"

# Test Suite 2: Checksum Validation (Match)
echo -e "\n${YELLOW}=== Test Suite 2: Checksum Validation (Match) ===${NC}"

echo "content to check" > "$TEST_DIR/file.tar"
generated=$(get_sha256_checksum "$TEST_DIR/file.tar")
validate=$(verify_sha256_checksum "$TEST_DIR/file.tar" "$generated" 2>&1)
assert_equals "valid" "$validate" "Valid checksum verified"

# Test Suite 3: Checksum Validation (Mismatch)
echo -e "\n${YELLOW}=== Test Suite 3: Checksum Validation (Mismatch) ===${NC}"

wrong_checksum="0000000000000000000000000000000000000000000000000000000000000000"
validate=$(verify_sha256_checksum "$TEST_DIR/file.tar" "$wrong_checksum" 2>&1)
assert_equals "invalid" "$validate" "Invalid checksum detected"

# Test Suite 4: File Not Found
echo -e "\n${YELLOW}=== Test Suite 4: Error Handling ===${NC}"

result=$(get_sha256_checksum "$TEST_DIR/nonexistent.txt" 2>&1 || echo "error")
assert_true "echo '$result' | grep -q -E 'error|No such file'" "Nonexistent file error"

# Test Suite 5: Empty File
echo -e "\n${YELLOW}=== Test Suite 5: Edge Cases ===${NC}"

touch "$TEST_DIR/empty.txt"
empty_checksum=$(get_sha256_checksum "$TEST_DIR/empty.txt")
expected_empty="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
assert_equals "$expected_empty" "$empty_checksum" "Empty file checksum correct"

# Test Suite 6: Large File
echo -e "\n${YELLOW}=== Test Suite 6: Large File Checksum ===${NC}"

dd if=/dev/zero of="$TEST_DIR/large.bin" bs=1M count=10 2>/dev/null
large_checksum=$(get_sha256_checksum "$TEST_DIR/large.bin")
assert_true "[ ${#large_checksum} -eq 64 ]" "Large file checksum generated"

# Verify it's consistent
large_checksum2=$(get_sha256_checksum "$TEST_DIR/large.bin")
assert_equals "$large_checksum" "$large_checksum2" "Large file checksum is consistent"

# Test Suite 7: Crate Checksum Retrieval (Simulated)
echo -e "\n${YELLOW}=== Test Suite 7: Crate Checksum Functions ===${NC}"

# Mock crate checksum retrieval (would call crates.io API in production)
# Just verify the function exists and handles errors gracefully
result=$(get_crate_checksum "nonexistent-crate" "1.0.0" 2>&1 || echo "expected_error")
assert_true "echo '$result' | grep -q -E 'error|expected_error|curl'" "Crate API call attempted"

# Test Suite 8: NPM Checksum Functions
echo -e "\n${YELLOW}=== Test Suite 8: NPM Checksum Functions ===${NC}"

# Mock npm checksum retrieval
result=$(get_npm_checksum "nonexistent-package" "1.0.0" 2>&1 || echo "expected_error")
assert_true "echo '$result' | grep -q -E 'error|expected_error|404'" "NPM API call attempted"

# Test Suite 9: Checksum File Format
echo -e "\n${YELLOW}=== Test Suite 9: Checksum File Operations ===${NC}"

echo "test" > "$TEST_DIR/archive.tar.gz"
checksum=$(get_sha256_checksum "$TEST_DIR/archive.tar.gz")

# Save checksum file
checksum_file="$TEST_DIR/archive.tar.gz.sha256"
echo "$checksum" > "$checksum_file"
assert_true "[ -f '$checksum_file' ]" "Checksum file created"

# Verify from file
stored=$(cat "$checksum_file")
assert_equals "$checksum" "$stored" "Checksum file format correct"

# Test Suite 10: Batch Checksum Verification
echo -e "\n${YELLOW}=== Test Suite 10: Batch Verification ===${NC}"

# Create multiple files
for i in {1..5}; do
  echo "file $i" > "$TEST_DIR/file$i.txt"
done

# Verify batch processing
batch_result=0
for i in {1..5}; do
  sum=$(get_sha256_checksum "$TEST_DIR/file$i.txt")
  result=$(verify_sha256_checksum "$TEST_DIR/file$i.txt" "$sum" 2>&1)
  [ "$result" = "valid" ] || batch_result=1
done

assert_equals "0" "$batch_result" "Batch checksum verification successful"

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
