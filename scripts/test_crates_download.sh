#!/bin/bash
# scripts/test_crates_download.sh - Small test for crates download system
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Testing Crates Download System ==="
echo ""

# Create a minimal test manifest with just 2 crates
TEST_MANIFEST="$PROJECT_ROOT/manifests/crates.txt"
cat > "$TEST_MANIFEST" <<'EOF'
agentic-jujutsu
ruvector
EOF

echo "Test manifest created with 2 crates"
echo ""

# Run download without discovery
echo "Running download (no discovery)..."
"$SCRIPT_DIR/download_crates_optimized.sh"

echo ""
echo "=== Results ==="
echo "Downloaded crates:"
ls -lh "$PROJECT_ROOT/artifacts/crates/archives/" 2>/dev/null | tail -n +2 || echo "No archives found"

echo ""
echo "Cache entries:"
grep "^crate|" ~/.cache/ruv_downloads/cache.db 2>/dev/null || echo "No cache entries"

echo ""
echo "=== Test Complete ==="
