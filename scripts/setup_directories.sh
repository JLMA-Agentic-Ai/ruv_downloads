#!/bin/bash
# scripts/setup_directories.sh - Initialize optimized directory structure
# Version: 1.0.0

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Setting up optimized directory structure..."
echo "Project root: $PROJECT_ROOT"

# Create new directory structure
mkdir -p "$PROJECT_ROOT"/{cache,logs,manifests}
mkdir -p "$PROJECT_ROOT/artifacts"/{crates,npm,repos,gists}
mkdir -p "$PROJECT_ROOT/artifacts/crates"/{archives,extracted,legacy}
mkdir -p "$PROJECT_ROOT/artifacts/npm"/{archives,extracted,legacy}
mkdir -p "$PROJECT_ROOT/artifacts/repos"/{by-tier,.metadata}
mkdir -p "$PROJECT_ROOT/artifacts/gists"/{by-id,.metadata}
mkdir -p "$PROJECT_ROOT/lib"

echo "✓ Created cache/ directory"
echo "✓ Created logs/ directory"
echo "✓ Created manifests/ directory"
echo "✓ Created artifacts/ hierarchy"
echo "✓ Created lib/ directory"

# Create .gitignore for artifacts (data shouldn't be in git)
cat > "$PROJECT_ROOT/artifacts/.gitignore" <<'EOF'
# Ignore all artifacts (too large for git)
*

# But track the directory structure
!.gitignore
!crates/
!crates/.gitkeep
!npm/
!npm/.gitkeep
!repos/
!repos/.gitkeep
!repos/.metadata/
!gists/
!gists/.gitkeep
!gists/.metadata/
EOF

# Create .gitkeep files to preserve empty directories
touch "$PROJECT_ROOT/artifacts/crates/.gitkeep"
touch "$PROJECT_ROOT/artifacts/npm/.gitkeep"
touch "$PROJECT_ROOT/artifacts/repos/.gitkeep"
touch "$PROJECT_ROOT/artifacts/gists/.gitkeep"

echo "✓ Created .gitignore for artifacts/"

# Create cache .gitignore
cat > "$PROJECT_ROOT/cache/.gitignore" <<'EOF'
# Ignore cache database
*
!.gitignore
EOF

echo "✓ Created .gitignore for cache/"

# Create logs .gitignore
cat > "$PROJECT_ROOT/logs/.gitignore" <<'EOF'
# Ignore log files
*.log
*
!.gitignore
!README.md
EOF

cat > "$PROJECT_ROOT/logs/README.md" <<'EOF'
# Execution Logs

This directory contains execution logs from ruv_world.sh and individual download scripts.

## Log Format

Logs are named: `YYYYMMDD_HHMMSS_[script-name].log`

## Retention

Logs older than 30 days are automatically cleaned up.
EOF

echo "✓ Created logs/ README"

echo ""
echo "Directory structure setup complete!"
echo ""
echo "Structure:"
echo "  cache/          - Global cache database"
echo "  artifacts/      - All downloaded artifacts"
echo "    ├── crates/   - Rust crates (archives + extracted)"
echo "    ├── npm/      - NPM packages (archives + extracted)"
echo "    ├── repos/    - GitHub repositories (by-tier + metadata)"
echo "    └── gists/    - GitHub gists (by-id + metadata)"
echo "  manifests/      - Centralized manifests"
echo "  logs/           - Execution logs"
echo "  lib/            - Shared libraries"
