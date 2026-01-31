#!/bin/bash
# scripts/download_all_optimized.sh - Parallel download orchestrator
# Version: 2.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load parallel library
source "$PROJECT_ROOT/lib/parallel.sh"

# Configuration
DISCOVER_FLAG="${1:-}" # Allow empty flag to override default
DISCOVER_FLAG="${DISCOVER_FLAG:---discover}" # If truly unset, use --discover
if [ "${1:-}" == "--no-discover" ]; then DISCOVER_FLAG=""; fi # Explicit check
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== RUV World Optimized Downloader ==="
echo "Mode: Parallel execution"
echo "Discover: $DISCOVER_FLAG"
echo "Log directory: $LOG_DIR"
echo ""

# Define download commands
COMMANDS=(
  "$SCRIPT_DIR/download_crates_optimized.sh $DISCOVER_FLAG"
  "$SCRIPT_DIR/download_npm_optimized.sh $DISCOVER_FLAG"
  "$SCRIPT_DIR/download_repos_optimized.sh $DISCOVER_FLAG"
  "$SCRIPT_DIR/download_gists_optimized.sh $DISCOVER_FLAG"
)

# Execute in parallel with logging
echo "Starting parallel downloads..."
run_parallel_with_logging "$LOG_DIR" "${COMMANDS[@]}"
FAILED=$?

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✓ All downloads completed successfully!"
else
  echo "⚠ $FAILED download(s) failed. Check logs in $LOG_DIR/"
fi

# Display cache stats
echo ""
echo "=== Cache Statistics ==="
source "$PROJECT_ROOT/lib/cache.sh"
get_cache_stats

exit $FAILED
