#!/bin/bash
# scripts/download_repos_optimized.sh - Repos download stub (Phase 2 TODO)
set -euo pipefail
echo "Repos download (stub - using legacy script)"
cd "$(dirname "$0")/../github"
./download_ruvnet_repos.sh "$@"
