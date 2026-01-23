#!/bin/bash
# scripts/download_npm_optimized.sh - NPM download stub (Phase 2 TODO)
set -euo pipefail
echo "NPM download (stub - using legacy script)"
cd "$(dirname "$0")/../npmjs"
./download_ruvnet_packages.sh "$@"
