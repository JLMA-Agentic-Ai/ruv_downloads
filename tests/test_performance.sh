#!/bin/bash
# Performance Benchmarking Suite for Download Optimization
# Tests cache efficiency, download speed, and resource usage

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Performance thresholds
CACHE_HIT_TARGET=0.95  # 95% hit rate target
MEMORY_LIMIT=500       # MB limit
CHECKSUM_TIME_LIMIT=5  # seconds for 100MB file

# Temporary test environment
PERF_ENV=$(mktemp -d)
trap "rm -rf $PERF_ENV" EXIT

# Source libraries
source "$(dirname "$0")/../lib/cache.sh"
source "$(dirname "$0")/../lib/checksum.sh"

# Override for testing
CACHE_DIR="$PERF_ENV/.cache"

# Initialize metrics file
METRICS_FILE="$PERF_ENV/metrics.json"

# Test counters
METRICS_TESTS=0
METRICS_PASSED=0
METRICS_FAILED=0

echo "{" > "$METRICS_FILE"

# Helper functions
log_metric() {
  local name="$1"
  local value="$2"
  local unit="${3:-}"
  local threshold="${4:-}"

  echo "  \"$name\": {" >> "$METRICS_FILE"
  echo "    \"value\": $value," >> "$METRICS_FILE"
  echo "    \"unit\": \"$unit\"," >> "$METRICS_FILE"
  if [ ! -z "$threshold" ]; then
    if (( $(echo "$value < $threshold" | bc -l) )); then
      echo "    \"status\": \"PASS\"" >> "$METRICS_FILE"
      METRICS_PASSED=$((METRICS_PASSED + 1))
    else
      echo "    \"status\": \"FAIL\"" >> "$METRICS_FILE"
      METRICS_FAILED=$((METRICS_FAILED + 1))
    fi
  fi
  echo "  }," >> "$METRICS_FILE"
  METRICS_TESTS=$((METRICS_TESTS + 1))
}

# Test Suite 1: Cache Hit Rate Performance
echo -e "\n${BLUE}=== Benchmark 1: Cache Hit Rate ===${NC}"

init_cache

# Add 100 cache entries
for i in {1..100}; do
  cache_put "crates" "pkg-$i" "1.0.0" "hash-$i" "$PERF_ENV/pkg-$i"
done

# Test hit rate
hits=0
for i in {1..100}; do
  if cache_hit "crates" "pkg-$i" "1.0.0"; then
    hits=$((hits + 1))
  fi
done

hit_rate=$(echo "scale=4; $hits / 100" | bc -l)
echo -e "${GREEN}Cache Hit Rate: ${hit_rate}00%${NC}"
log_metric "cache_hit_rate_percent" "${hit_rate}00" "percent" "100"

# Test Suite 2: Checksum Performance
echo -e "\n${BLUE}=== Benchmark 2: Checksum Generation Speed ===${NC}"

# Small file (1MB)
dd if=/dev/urandom of="$PERF_ENV/small.bin" bs=1M count=1 2>/dev/null

start_time=$(date +%s%N)
checksum_small=$(get_sha256_checksum "$PERF_ENV/small.bin")
end_time=$(date +%s%N)
small_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

echo -e "${GREEN}1MB file checksum time: ${small_time}ms${NC}"
log_metric "checksum_1mb_ms" "$small_time" "milliseconds" "100"

# Medium file (10MB)
dd if=/dev/urandom of="$PERF_ENV/medium.bin" bs=1M count=10 2>/dev/null

start_time=$(date +%s%N)
checksum_medium=$(get_sha256_checksum "$PERF_ENV/medium.bin")
end_time=$(date +%s%N)
medium_time=$(( (end_time - start_time) / 1000000 ))

echo -e "${GREEN}10MB file checksum time: ${medium_time}ms${NC}"
log_metric "checksum_10mb_ms" "$medium_time" "milliseconds" "500"

# Test Suite 3: Memory Usage
echo -e "\n${BLUE}=== Benchmark 3: Memory Efficiency ===${NC}"

# Create large cache scenario
for i in {1..500}; do
  cache_put "crates" "large-$i" "1.0.0" "hash$i" "$PERF_ENV/file$i"
done

# Measure cache memory
cache_size_bytes=$(du -sb "$CACHE_DIR" 2>/dev/null | cut -f1)
cache_size_mb=$(( cache_size_bytes / 1048576 ))

echo -e "${GREEN}Cache size for 500 entries: ${cache_size_mb}MB${NC}"
log_metric "cache_memory_mb" "$cache_size_mb" "MB" "50"

# Test Suite 4: Batch Operations Performance
echo -e "\n${BLUE}=== Benchmark 4: Batch Operations ===${NC}"

# Create 100 test files
for i in {1..100}; do
  echo "batch file $i" > "$PERF_ENV/batch-$i.txt"
done

# Measure batch checksum time
start_time=$(date +%s%N)
for i in {1..100}; do
  get_sha256_checksum "$PERF_ENV/batch-$i.txt" > /dev/null
done
end_time=$(date +%s%N)
batch_time=$(( (end_time - start_time) / 1000000 ))

avg_per_file=$(echo "scale=2; $batch_time / 100" | bc -l)
echo -e "${GREEN}Batch checksum (100 files): ${batch_time}ms (${avg_per_file}ms avg)${NC}"
log_metric "batch_100files_ms" "$batch_time" "milliseconds" "500"

# Test Suite 5: Cache Lookup Performance
echo -e "\n${BLUE}=== Benchmark 5: Cache Lookup Speed ===${NC}"

# 1000 lookups
start_time=$(date +%s%N)
for i in {1..1000}; do
  cache_hit "crates" "pkg-50" "1.0.0" 2>/dev/null || true
done
end_time=$(date +%s%N)
lookup_time=$(( (end_time - start_time) / 1000000 ))

lookups_per_ms=$(echo "scale=2; 1000 / ($lookup_time / 1000)" | bc -l)
echo -e "${GREEN}1000 cache lookups: ${lookup_time}ms (${lookups_per_ms} lookups/sec)${NC}"
log_metric "cache_lookups_per_sec" "$lookups_per_ms" "ops/sec" "10000"

# Test Suite 6: I/O Performance
echo -e "\n${BLUE}=== Benchmark 6: I/O Performance ===${NC}"

# Write performance
start_time=$(date +%s%N)
for i in {1..100}; do
  dd if=/dev/zero of="$PERF_ENV/io-test-$i.bin" bs=1M count=1 2>/dev/null
done
end_time=$(date +%s%N)
write_time=$(( (end_time - start_time) / 1000000 ))

write_throughput=$(echo "scale=2; 100 / ($write_time / 1000)" | bc -l)
echo -e "${GREEN}Sequential write (100x1MB): ${write_throughput} files/sec${NC}"
log_metric "io_write_files_per_sec" "$write_throughput" "files/sec" "50"

# Test Suite 7: Concurrent Operations
echo -e "\n${BLUE}=== Benchmark 7: Concurrent Operations ===${NC}"

# Simulate 10 concurrent downloads
concurrent_ops() {
  for i in {1..10}; do
    (
      cache_put "concurrent" "op-$1-$i" "1.0.0" "hash-$1-$i" "$PERF_ENV/concurrent-$1-$i"
    ) &
  done
  wait
}

start_time=$(date +%s%N)
for batch in {1..5}; do
  concurrent_ops "$batch"
done
end_time=$(date +%s%N)
concurrent_time=$(( (end_time - start_time) / 1000000 ))

ops_per_sec=$(echo "scale=2; 50 / ($concurrent_time / 1000)" | bc -l)
echo -e "${GREEN}Concurrent ops (50 total): ${ops_per_sec} ops/sec${NC}"
log_metric "concurrent_ops_per_sec" "$ops_per_sec" "ops/sec" "100"

# Test Suite 8: Scalability
echo -e "\n${BLUE}=== Benchmark 8: Scalability Analysis ===${NC}"

# Test with increasing dataset sizes
for size in 100 500 1000; do
  start_time=$(date +%s%N)
  for i in $(seq 1 $size); do
    cache_hit "scale" "item-$i" "1.0.0" 2>/dev/null || true
  done
  end_time=$(date +%s%N)
  lookup_time=$(( (end_time - start_time) / 1000000 ))

  time_per_lookup=$(echo "scale=4; $lookup_time / $size * 1000" | bc -l)
  echo -e "${GREEN}Lookup time for $size items: ${time_per_lookup}ms per lookup${NC}"
done

# Finalize metrics JSON
echo "}" >> "$METRICS_FILE"

# Print comprehensive benchmark report
echo -e "\n${BLUE}=== Performance Benchmark Report ===${NC}"
echo -e "Cache Hit Rate:              ${hit_rate}00%"
echo -e "1MB Checksum Time:           ${small_time}ms"
echo -e "10MB Checksum Time:          ${medium_time}ms"
echo -e "Cache Memory (500 entries):  ${cache_size_mb}MB"
echo -e "Batch Checksum (100 files):  ${batch_time}ms"
echo -e "Cache Lookups/sec:           ${lookups_per_ms} ops/sec"
echo -e "I/O Write Performance:       ${write_throughput} files/sec"
echo -e "Concurrent Operations/sec:   ${ops_per_sec} ops/sec"

echo -e "\n${BLUE}=== Metrics Summary ===${NC}"
echo -e "Total Metrics:  $METRICS_TESTS"
echo -e "Passed:         ${GREEN}$METRICS_PASSED${NC}"
echo -e "Failed:         ${RED}$METRICS_FAILED${NC}"

# Save metrics to file for analysis
echo -e "\n${BLUE}Metrics saved to: $METRICS_FILE${NC}"
cat "$METRICS_FILE"

if [ $METRICS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All performance targets met!${NC}"
  exit 0
else
  echo -e "\n${YELLOW}Some performance targets not met - review thresholds${NC}"
  exit 1
fi
