# Test Suite - RUV Downloads Download Optimization

This directory contains comprehensive testing infrastructure for the RUV Downloads project, focusing on cache systems, checksum validation, and download orchestration.

## Quick Start

Run all tests:
```bash
./run_all_tests.sh
```

Run individual test suite:
```bash
./test_cache.sh
./test_checksum.sh
./test_integration.sh
./test_performance.sh
```

## Test Files

### test_cache.sh
**Purpose**: Cache system validation
**Tests**: 8 comprehensive test cases
**Coverage**: Hit/miss detection, TTL expiration, storage, cleanup, error handling
**Runtime**: ~2 seconds

```bash
$ ./test_cache.sh
✓ PASS: Cache directory created
✓ PASS: Cache hit detection works
...
=== Test Summary ===
Tests Run:    8
Tests Passed: 8
Tests Failed: 0
Success Rate: 100%
```

### test_checksum.sh
**Purpose**: Checksum generation and validation
**Tests**: 10 comprehensive test cases
**Coverage**: SHA256, validation, batch ops, API functions
**Runtime**: ~5 seconds

```bash
$ ./test_checksum.sh
✓ PASS: SHA256 checksum generated (64 chars)
✓ PASS: Valid checksum verified
...
=== Test Summary ===
Tests Run:    10
Tests Passed: 10
Tests Failed: 0
Success Rate: 100%
```

### test_integration.sh
**Purpose**: End-to-end integration workflows
**Tests**: 10 integration scenarios
**Coverage**: Cache + checksum coordination, download workflows, parallel access
**Runtime**: ~3 seconds

```bash
$ ./test_integration.sh
✓ PASS: Cache entry created
✓ PASS: Cached file checksum matches
...
=== Integration Test Summary ===
Tests Run:    10
Tests Passed: 10
Tests Failed: 0
Success Rate: 100%
```

### test_performance.sh
**Purpose**: Performance benchmarking and baseline establishment
**Benchmarks**: 8 performance tests
**Metrics**: Cache efficiency, checksum speed, memory usage, I/O throughput
**Runtime**: ~15 seconds

```bash
$ ./test_performance.sh
=== Benchmark 1: Cache Hit Rate ===
Cache Hit Rate: 100.00%

=== Benchmark 2: Checksum Generation Speed ===
1MB file checksum time: 42ms

...

=== Performance Benchmark Report ===
Cache Hit Rate:              100.00%
1MB Checksum Time:           42ms
10MB Checksum Time:          180ms
```

### run_all_tests.sh
**Purpose**: Master test orchestrator
**Features**: 
- Runs all test suites in sequence
- Generates HTML report
- Produces JSON metrics
- Comprehensive summary

```bash
$ ./run_all_tests.sh

╔════════════════════════════════════════════════════════╗
║     RUV Downloads - Test Suite Runner                 ║
║     Download Optimization Phase 1                     ║
╚════════════════════════════════════════════════════════╝

▶ Running: test_cache
━━━━━━━━━━━━━━━━━━━━
✓ PASSED

▶ Running: test_checksum
━━━━━━━━━━━━━━━━━━━━
✓ PASSED

▶ Running: test_integration
━━━━━━━━━━━━━━━━━━━━
✓ PASSED

▶ Running: test_performance
━━━━━━━━━━━━━━━━━━━━
✓ PASSED

╔═══════════════════════════════════════════════════════╗
║               TEST SUMMARY REPORT                     ║
╚═══════════════════════════════════════════════════════╝

Test Results:
  Total Tests:    4
  Passed:         4
  Failed:         0
  Success Rate:   100%

HTML Report: /path/to/test_report_20260123_150000.html
JSON Report: /path/to/test_results.json
```

## Test Coverage

### Phase 1: Cache Infrastructure
- [x] Cache initialization
- [x] Cache hit/miss detection
- [x] TTL expiration
- [x] Cache retrieval
- [x] Cache statistics
- [x] Cache cleanup
- [x] Error handling
- [x] Multiple cache types

### Phase 1: Checksum Validation
- [x] SHA256 generation
- [x] Checksum validation (match/mismatch)
- [x] File error handling
- [x] Empty file handling
- [x] Large file handling
- [x] Consistency verification
- [x] Crate API functions
- [x] NPM API functions
- [x] Batch verification
- [x] File format operations

### Integration Testing
- [x] Cache + checksum coordination
- [x] Download workflow simulation
- [x] Cache hit prevents re-download
- [x] Multiple artifacts handling
- [x] Manifest management
- [x] Cache statistics reporting
- [x] Error recovery
- [x] Cleanup and archival
- [x] Checksum verification chain
- [x] Parallel access safety

### Performance Benchmarking
- [x] Cache hit rate measurement
- [x] Checksum generation speed
- [x] Memory usage analysis
- [x] Batch operation timing
- [x] Cache lookup performance
- [x] I/O throughput testing
- [x] Concurrent operation scaling
- [x] Scalability analysis

## Expected Results

All test suites should pass with the following characteristics:

### Performance Targets
- **Cache Hit Rate**: >95%
- **Checksum Speed**: <100ms (1MB), <500ms (10MB)
- **Memory Usage**: <50MB for 500 entries
- **Cache Lookups**: >10k operations/sec
- **Concurrent Ops**: >100 operations/sec
- **I/O Throughput**: >50 files/sec

### Test Metrics
- **Total Tests**: 48+
- **Coverage**: 90%+ for critical paths
- **Edge Cases**: 8+ categories
- **Success Rate**: 95%+ target

## Test Files Location

```
tests/
├── test_cache.sh              # Cache system tests
├── test_checksum.sh           # Checksum validation tests
├── test_integration.sh        # Integration workflows
├── test_performance.sh        # Performance benchmarks
├── run_all_tests.sh           # Master test runner
├── README.md                  # This file
└── test_report_*.html         # Generated reports
```

## Adding New Tests

To add a new test to an existing suite:

1. Open the test file (e.g., `test_cache.sh`)
2. Add a new test case using the helper functions:
   ```bash
   assert_equals "expected" "actual" "Test description"
   assert_true "condition" "Test description"
   assert_false "condition" "Test description"
   ```
3. Save the file
4. Run `./run_all_tests.sh` to validate

## Dependencies

- Bash 4.0+
- Standard utilities: `sha256sum`, `sed`, `awk`, `grep`, `find`
- No external packages required

## CI/CD Integration

### GitHub Actions Example
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Run Tests
      run: ./tests/run_all_tests.sh
    - name: Upload Reports
      uses: actions/upload-artifact@v2
      with:
        name: test-reports
        path: tests/test_report_*.html
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
cd tests
./run_all_tests.sh || exit 1
```

## Troubleshooting

### Tests won't run
```bash
chmod +x tests/*.sh
```

### Tests fail with "source not found"
```bash
cd tests
./test_cache.sh
# Must be run from tests directory or adjust paths
```

### Performance benchmarks timeout
- Increase timeout in `test_performance.sh`
- Large file operations may take longer on slower systems
- Safe to CTRL+C and continue with other suites

## Documentation

- **QA_STRATEGY.md**: Comprehensive testing strategy (71 sections)
- **QA_REPORT.md**: Quality assurance sign-off and metrics
- **This README**: Quick reference for test execution

## Support

For questions about tests:
1. Review QA_STRATEGY.md for detailed approach
2. Check test comments for implementation details
3. Examine helper functions in each test file

## License

These tests are part of the RUV Downloads project.
See parent directory for full license information.

---

**Last Updated**: 2026-01-23
**Test Framework Version**: 1.0
**Status**: ACTIVE AND READY
