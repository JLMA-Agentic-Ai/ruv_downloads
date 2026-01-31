#!/bin/bash
# Validation and Publishing Script
# Validates npx cache fix in Docker, then publishes point release

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CURRENT_VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agentic Payments - Validation & Release${NC}"
echo -e "${BLUE}Current Version: ${CURRENT_VERSION}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Build the package
echo -e "${YELLOW}Step 1: Building package...${NC}"
cd "$PROJECT_ROOT"
npm run clean
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 2: Run tests
echo -e "${YELLOW}Step 2: Running tests...${NC}"
npm run test || {
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Tests passed${NC}"
echo ""

# Step 3: Docker validation
echo -e "${YELLOW}Step 3: Running Docker validation...${NC}"
cd "$PROJECT_ROOT/tests/docker"

# Build and run validation container
echo "Building validation container..."
docker build -f npx-cache-validation.Dockerfile -t agentic-payments-validation . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}

echo "Running validation tests..."
docker run --rm agentic-payments-validation || {
    echo -e "${RED}❌ Docker validation failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Docker validation passed${NC}"
echo ""

# Step 4: Version bump prompt
cd "$PROJECT_ROOT"
echo -e "${YELLOW}Step 4: Version update${NC}"
echo "Current version: ${CURRENT_VERSION}"
echo ""
echo "What type of release is this?"
echo "  1) Patch (bug fix, e.g., 0.1.7 -> 0.1.8)"
echo "  2) Minor (new feature, e.g., 0.1.7 -> 0.2.0)"
echo "  3) Major (breaking change, e.g., 0.1.7 -> 1.0.0)"
echo "  4) Custom version"
echo "  5) Skip version bump"
echo ""
read -p "Enter choice (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        echo "Bumping patch version..."
        npm version patch --no-git-tag-version
        ;;
    2)
        echo "Bumping minor version..."
        npm version minor --no-git-tag-version
        ;;
    3)
        echo "Bumping major version..."
        npm version major --no-git-tag-version
        ;;
    4)
        read -p "Enter custom version (e.g., 0.1.8): " CUSTOM_VERSION
        npm version "$CUSTOM_VERSION" --no-git-tag-version
        ;;
    5)
        echo "Skipping version bump"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")
echo -e "${GREEN}✓ Version updated: ${CURRENT_VERSION} -> ${NEW_VERSION}${NC}"
echo ""

# Step 5: Update CHANGELOG
echo -e "${YELLOW}Step 5: Updating CHANGELOG...${NC}"
CHANGELOG_ENTRY="## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### Fixed
- Enhanced npx cache cleanup to prevent ENOTEMPTY errors in remote environments
- Added stale cache detection (24-hour threshold)
- Improved retry logic with 5 retries and 100ms delay
- Added comprehensive Docker validation tests

### Added
- Triple-layer cache cleanup protection (preinstall, runtime, age-based)
- Detailed NPX_CACHE_FIX.md documentation
- Docker validation environment and scripts

### Changed
- Increased cache cleanup robustness in all binary entry points
- Enhanced error handling in cleanup scripts
"

if [ -f "$PROJECT_ROOT/CHANGELOG.md" ]; then
    # Prepend to existing CHANGELOG
    echo "$CHANGELOG_ENTRY" | cat - "$PROJECT_ROOT/CHANGELOG.md" > "$PROJECT_ROOT/CHANGELOG.tmp"
    mv "$PROJECT_ROOT/CHANGELOG.tmp" "$PROJECT_ROOT/CHANGELOG.md"
else
    # Create new CHANGELOG
    echo "# Changelog" > "$PROJECT_ROOT/CHANGELOG.md"
    echo "" >> "$PROJECT_ROOT/CHANGELOG.md"
    echo "$CHANGELOG_ENTRY" >> "$PROJECT_ROOT/CHANGELOG.md"
fi
echo -e "${GREEN}✓ CHANGELOG updated${NC}"
echo ""

# Step 6: Rebuild with new version
echo -e "${YELLOW}Step 6: Rebuilding with new version...${NC}"
npm run build || {
    echo -e "${RED}❌ Rebuild failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Rebuild successful${NC}"
echo ""

# Step 7: Publish confirmation
echo -e "${YELLOW}Step 7: Ready to publish${NC}"
echo ""
echo "Package: agentic-payments"
echo "Version: ${NEW_VERSION}"
echo "Registry: https://registry.npmjs.org/"
echo ""
echo "Files to be published:"
npm pack --dry-run 2>&1 | grep -E "^\s+(dist|bin|scripts)" | head -n 10
echo ""
read -p "Proceed with npm publish? (y/N): " PUBLISH_CONFIRM

if [[ "$PUBLISH_CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Publishing to npm...${NC}"
    npm publish --access public || {
        echo -e "${RED}❌ Publish failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Published to npm registry${NC}"
    echo ""

    # Step 8: Git tag
    echo -e "${YELLOW}Step 8: Creating git tag...${NC}"
    git add package.json CHANGELOG.md
    git commit -m "chore(release): v${NEW_VERSION} - NPX cache fix improvements" || true
    git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}: NPX cache fix improvements"

    echo -e "${GREEN}✓ Git tag created${NC}"
    echo ""

    read -p "Push to remote? (y/N): " PUSH_CONFIRM
    if [[ "$PUSH_CONFIRM" =~ ^[Yy]$ ]]; then
        git push origin HEAD
        git push origin "v${NEW_VERSION}"
        echo -e "${GREEN}✓ Pushed to remote${NC}"
    fi
else
    echo -e "${YELLOW}Publish cancelled${NC}"
    exit 0
fi

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Release Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Package: agentic-payments@${NEW_VERSION}"
echo "Registry: https://www.npmjs.com/package/agentic-payments"
echo "Install: npx agentic-payments@latest"
echo ""
echo "Next steps:"
echo "  1. Verify on npm: npm view agentic-payments@${NEW_VERSION}"
echo "  2. Test install: npx agentic-payments@${NEW_VERSION} mcp --help"
echo "  3. Monitor for issues: https://github.com/agentic-catalog/agentic-payments/issues"
echo ""
echo -e "${GREEN}🎉 Release published successfully!${NC}"
