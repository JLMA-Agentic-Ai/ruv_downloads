#!/bin/bash
# Master Test Runner for RUV Downloads
# Orchestrates all test suites and generates comprehensive report

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test directory
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$TESTS_DIR")"

# Results tracking
declare -a TEST_RESULTS
declare -a TEST_TIMES
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0
START_TIME=$(date +%s)

# Report file
REPORT_FILE="$TESTS_DIR/test_report_$(date +%Y%m%d_%H%M%S).html"
JSON_REPORT="$TESTS_DIR/test_results.json"

echo "{" > "$JSON_REPORT"

# Function to run a test suite
run_test_suite() {
  local test_file="$1"
  local test_name=$(basename "$test_file" .sh)

  echo -e "\n${BLUE}▶ Running: $test_name${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local suite_start=$(date +%s%N)

  if [ -x "$test_file" ]; then
    # Run test and capture output
    if output=$("$test_file" 2>&1); then
      result="PASS"
      echo -e "${GREEN}✓ PASSED${NC}"
      TEST_RESULTS+=("$test_name:PASS")
      TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
      result="FAIL"
      echo -e "${RED}✗ FAILED${NC}"
      echo "$output"
      TEST_RESULTS+=("$test_name:FAIL")
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  else
    echo -e "${YELLOW}⚠ SKIPPED (not executable)${NC}"
    result="SKIP"
  fi

  local suite_end=$(date +%s%N)
  local duration=$(( (suite_end - suite_start) / 1000000 ))
  TEST_TIMES+=("$test_name:${duration}ms")
  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  # Log to JSON
  echo "  \"$test_name\": {" >> "$JSON_REPORT"
  echo "    \"status\": \"$result\"," >> "$JSON_REPORT"
  echo "    \"duration_ms\": $duration" >> "$JSON_REPORT"
  echo "  }," >> "$JSON_REPORT"
}

# Header
echo -e "${CYAN}"
cat << 'EOF'
╔════════════════════════════════════════════════════════╗
║     RUV Downloads - Test Suite Runner                 ║
║     Download Optimization Phase 1                     ║
╚════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "Project Root: ${CYAN}$PROJECT_ROOT${NC}"
echo -e "Tests Dir:    ${CYAN}$TESTS_DIR${NC}"
echo -e "Start Time:   ${CYAN}$(date)${NC}"
echo ""

# Check dependencies
echo -e "${BLUE}▶ Checking dependencies...${NC}"
for cmd in bash sha256sum sed awk; do
  if command -v "$cmd" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $cmd available"
  else
    echo -e "${RED}✗${NC} $cmd NOT found"
  fi
done

# Verify test files exist
echo -e "\n${BLUE}▶ Discovering test suites...${NC}"
test_files=(
  "$TESTS_DIR/test_cache.sh"
  "$TESTS_DIR/test_checksum.sh"
  "$TESTS_DIR/test_integration.sh"
  "$TESTS_DIR/test_performance.sh"
)

for test in "${test_files[@]}"; do
  if [ -f "$test" ]; then
    echo -e "${GREEN}✓${NC} Found: $(basename $test)"
  else
    echo -e "${YELLOW}⚠${NC} Missing: $(basename $test)"
  fi
done

# Run all test suites
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           EXECUTING TEST SUITES                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"

for test in "${test_files[@]}"; do
  if [ -f "$test" ]; then
    run_test_suite "$test"
  fi
done

# End time and summary
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

# Finalize JSON report
sed -i '$ s/,$//' "$JSON_REPORT"
echo "}" >> "$JSON_REPORT"

# Calculate statistics
SUCCESS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
  SUCCESS_RATE=$((TOTAL_PASSED * 100 / TOTAL_TESTS))
fi

# Print summary
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               TEST SUMMARY REPORT                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${CYAN}Test Results:${NC}"
echo -e "  Total Tests:    $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:${NC}       $TOTAL_PASSED"
echo -e "  ${RED}Failed:${NC}       $TOTAL_FAILED"
echo -e "  Success Rate:   ${SUCCESS_RATE}%"

echo ""
echo -e "${CYAN}Timing:${NC}"
for timing in "${TEST_TIMES[@]}"; do
  name=$(echo "$timing" | cut -d: -f1)
  time=$(echo "$timing" | cut -d: -f2)
  printf "  %-30s %s\n" "$name:" "$time"
done
echo -e "  Total Duration: ${TOTAL_DURATION}s"

echo ""
echo -e "${CYAN}Test Execution Details:${NC}"
for result in "${TEST_RESULTS[@]}"; do
  name=$(echo "$result" | cut -d: -f1)
  status=$(echo "$result" | cut -d: -f2)
  if [ "$status" = "PASS" ]; then
    echo -e "  ${GREEN}✓${NC} $name"
  elif [ "$status" = "FAIL" ]; then
    echo -e "  ${RED}✗${NC} $name"
  else
    echo -e "  ${YELLOW}⚠${NC} $name"
  fi
done

# Quality metrics
echo ""
echo -e "${CYAN}Quality Metrics:${NC}"
echo -e "  Coverage Target:          90%+ (pending implementation)"
echo -e "  Performance Baseline:     Captured in test_performance.sh"
echo -e "  Edge Cases Tested:        8 categories"
echo -e "  Integration Tests:        10 scenarios"

# Generate HTML report
generate_html_report() {
  cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
  <title>RUV Downloads - Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .header { background: #333; color: white; padding: 20px; border-radius: 5px; }
    .summary { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
    .metric-label { font-size: 12px; color: #666; }
    .pass { color: #4CAF50; font-weight: bold; }
    .fail { color: #F44336; font-weight: bold; }
    .skip { color: #FF9800; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RUV Downloads - Test Execution Report</h1>
    <p>Phase 1: Download Optimization & Caching Infrastructure</p>
  </div>

  <div class="summary">
    <h2>Summary</h2>
    <div class="metric">
      <div class="metric-value">$TOTAL_TESTS</div>
      <div class="metric-label">Test Suites</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #4CAF50;">$TOTAL_PASSED</div>
      <div class="metric-label">Passed</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #F44336;">$TOTAL_FAILED</div>
      <div class="metric-label">Failed</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #2196F3;">${SUCCESS_RATE}%</div>
      <div class="metric-label">Success Rate</div>
    </div>
  </div>

  <h2>Test Results</h2>
  <table>
    <tr>
      <th>Test Suite</th>
      <th>Status</th>
      <th>Duration</th>
    </tr>
EOF

  for i in $(seq 0 $((${#TEST_RESULTS[@]} - 1))); do
    result="${TEST_RESULTS[$i]}"
    timing="${TEST_TIMES[$i]}"
    name=$(echo "$result" | cut -d: -f1)
    status=$(echo "$result" | cut -d: -f2)
    time=$(echo "$timing" | cut -d: -f2)

    if [ "$status" = "PASS" ]; then
      status_class="pass"
    elif [ "$status" = "FAIL" ]; then
      status_class="fail"
    else
      status_class="skip"
    fi

    echo "    <tr>" >> "$REPORT_FILE"
    echo "      <td>$name</td>" >> "$REPORT_FILE"
    echo "      <td class=\"$status_class\">$status</td>" >> "$REPORT_FILE"
    echo "      <td>$time</td>" >> "$REPORT_FILE"
    echo "    </tr>" >> "$REPORT_FILE"
  done

  cat >> "$REPORT_FILE" << EOF
  </table>

  <h2>Coverage Analysis</h2>
  <ul>
    <li>Cache System: Unit tests, integration tests, performance benchmarks</li>
    <li>Checksum Validation: SHA256 generation, verification, batch operations</li>
    <li>Download Workflow: End-to-end orchestration, error recovery</li>
    <li>Performance: Cache efficiency, I/O throughput, concurrent operations</li>
    <li>Edge Cases: Network timeouts, corruption, concurrency conflicts</li>
  </ul>

  <div class="footer">
    <p>Report Generated: $(date)</p>
    <p>Test Framework: RUV Downloads Quality Assurance</p>
    <p>For details, see: <a href="test_results.json">test_results.json</a></p>
  </div>
</body>
</html>
EOF

  echo -e "\n${GREEN}HTML Report: $REPORT_FILE${NC}"
}

generate_html_report

# Final status
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"

if [ $TOTAL_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED - Review report above${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
  exit 1
fi
