#!/bin/bash

################################################################################
# ruv_world.sh - Centralized Ruvnet Ecosystem Downloader
#
# This script runs all three download scripts (crates, npmjs, github) and
# automatically updates documentation when artifact counts change.
#
# Usage:
#   ./ruv_world.sh              # Run with discovery and doc updates
#   ./ruv_world.sh --no-discover  # Update existing artifacts only
#   ./ruv_world.sh --no-update-docs  # Skip documentation updates
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DISCOVER_FLAG="--discover"
UPDATE_DOCS=true

# Parse arguments
for arg in "$@"; do
  case $arg in
    --no-discover)
      DISCOVER_FLAG=""
      shift
      ;;
    --no-update-docs)
      UPDATE_DOCS=false
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --no-discover      Update existing artifacts only (no discovery)"
      echo "  --no-update-docs   Skip automatic documentation updates"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}"
      exit 1
      ;;
  esac
done

################################################################################
# Helper Functions
################################################################################

print_header() {
  echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${MAGENTA}$1${NC}"
  echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_section() {
  echo -e "\n${CYAN}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

get_manifest_count() {
  local file=$1
  if [[ -f "$file" ]]; then
    wc -l < "$file" | tr -d ' '
  else
    echo "0"
  fi
}

update_documentation() {
  local crates_count=$1
  local npm_count=$2
  local github_count=$3
  local gists_count=$4
  local total_count=$((crates_count + npm_count + github_count + gists_count))
  local current_date=$(date +"%B %-d, %Y")
  
  print_section "Updating documentation with new counts..."
  
  # Update README.md
  if [[ -f "README.md" ]]; then
    print_success "Updating README.md..."
    
    # Update stats badge
    sed -i "s/[0-9]\+ total artifacts/${total_count} total artifacts/g" README.md
    sed -i "s/[0-9]\+ Rust crates/${crates_count} Rust crates/g" README.md
    sed -i "s/[0-9]\+ NPM packages/${npm_count} NPM packages/g" README.md
    sed -i "s/[0-9]\+ GitHub repositories/${github_count} GitHub repositories/g" README.md
    sed -i "s/[0-9]\+ GitHub gists/${gists_count} GitHub gists/g" README.md || sed -i "s/GitHub repositories/GitHub repositories | ${gists_count} GitHub gists/g" README.md
    
    # Update structure comments
    sed -i "s/# [0-9]\+ Rust crates/# ${crates_count} Rust crates/g" README.md
    sed -i "s/# [0-9]\+ NPM packages/# ${npm_count} NPM packages/g" README.md
    sed -i "s/# [0-9]\+ GitHub repositories/# ${github_count} GitHub repositories/g" README.md
    sed -i "s/# [0-9]\+ GitHub gists/# ${gists_count} GitHub gists/g" README.md || true
    
    # Update verification counts
    sed -i "/manifests\/crates.txt/s/Should be ~[0-9]\+/Should be ~${crates_count}/g" README.md || true
    sed -i "/manifests\/packages.txt/s/Should be ~[0-9]\+/Should be ~${npm_count}/g" README.md || true
    sed -i "/manifests\/repos.txt/s/Should be ~[0-9]\+/Should be ~${github_count}/g" README.md || true
    sed -i "/manifests\/gists.txt/s/Should be ~[0-9]\+/Should be ~${gists_count}/g" README.md || true
    
    # Update timestamp
    sed -i "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: ${current_date}/g" README.md
    
    print_success "  ✓ README.md updated"
  fi
  
  # Update RUV_DOWNLOADS_COMPLETE_GUIDE.md
  if [[ -f "RUV_DOWNLOADS_COMPLETE_GUIDE.md" ]]; then
    print_success "Updating RUV_DOWNLOADS_COMPLETE_GUIDE.md..."
    
    # Update executive summary
    sed -i "s/\*\*[0-9]\+ total artifacts\*\*/\*\*${total_count} total artifacts\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    sed -i "s/\*\*[0-9]\+ Rust crates\*\*/\*\*${crates_count} Rust crates\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    sed -i "s/\*\*[0-9]\+ NPM packages\*\*/\*\*${npm_count} NPM packages\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    sed -i "s/\*\*[0-9]\+ GitHub repositories\*\*/\*\*${github_count} GitHub repositories\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    sed -i "s/\*\*[0-9]\+ GitHub gists\*\*/\*\*${gists_count} GitHub gists\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md || sed -i "s/GitHub repositories/GitHub repositories, and \*\*${gists_count} GitHub gists\*\*/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    
    # Update scope line
    sed -i "s/[0-9]\+ artifacts ([0-9]\+ Rust crates + [0-9]\+ NPM packages + [0-9]\+ GitHub repositories)/${total_count} artifacts (${crates_count} Rust crates + ${npm_count} NPM packages + ${github_count} GitHub repositories + ${gists_count} GitHub gists)/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    
    # Update verification counts in usage section
    sed -i "/manifests\/crates.txt/s/Should be ~[0-9]\+/Should be ~${crates_count}/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md || true
    sed -i "/manifests\/packages.txt/s/Should be ~[0-9]\+/Should be ~${npm_count}/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md || true
    sed -i "/manifests\/repos.txt/s/Should be ~[0-9]\+/Should be ~${github_count}/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md || true
    sed -i "/manifests\/gists.txt/s/Should be ~[0-9]\+/Should be ~${gists_count}/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md || true

    
    # Update timestamp
    sed -i "s/\\*\\*Last Updated\\*\\*: .*/\\*\\*Last Updated\\*\\*: ${current_date}/g" RUV_DOWNLOADS_COMPLETE_GUIDE.md
    
    print_success "  ✓ RUV_DOWNLOADS_COMPLETE_GUIDE.md updated"
  fi
}

################################################################################
# Main Script
################################################################################

print_header "🌍 RUV WORLD - Ruvnet Ecosystem Downloader"

echo -e "${BLUE}Configuration:${NC}"
echo -e "  Discovery Mode: ${CYAN}$([ -n "$DISCOVER_FLAG" ] && echo "ENABLED" || echo "DISABLED")${NC}"
echo -e "  Auto-Update Docs: ${CYAN}$([ "$UPDATE_DOCS" = true ] && echo "ENABLED" || echo "DISABLED")${NC}"

# Capture initial counts
print_section "Capturing initial artifact counts..."

INITIAL_CRATES=$(get_manifest_count "manifests/crates.txt")
INITIAL_NPM=$(get_manifest_count "manifests/packages.txt")
INITIAL_GITHUB=$(get_manifest_count "manifests/repos.txt")
# Gists were added recently, let's include them in the total calculation if needed, 
# but for README/Guide compatibility we'll stick to the original 3 for the main stats 
# or update them as well.
INITIAL_GISTS=$(get_manifest_count "manifests/gists.txt")
INITIAL_TOTAL=$((INITIAL_CRATES + INITIAL_NPM + INITIAL_GITHUB + INITIAL_GISTS))

echo -e "  Rust Crates: ${YELLOW}${INITIAL_CRATES}${NC}"
echo -e "  NPM Packages: ${YELLOW}${INITIAL_NPM}${NC}"
echo -e "  GitHub Repos: ${YELLOW}${INITIAL_GITHUB}${NC}"
echo -e "  GitHub Gists: ${YELLOW}${INITIAL_GISTS}${NC}"
echo -e "  ${BLUE}Total: ${YELLOW}${INITIAL_TOTAL}${NC}"

# Run download scripts
print_header "📦 Running Optimized Parallel Downloader"

# Execute the new orchestrator
if [[ -x "scripts/download_all_optimized.sh" ]]; then
  ./scripts/download_all_optimized.sh $DISCOVER_FLAG || print_warning "Optimized downloader reported some issues"
  
  # Run indexer after downloads
  if [[ -x "scripts/ruv_index.sh" ]]; then
    print_section "Updating metadata index..."
    ./scripts/ruv_index.sh
  fi
else
  print_error "scripts/download_all_optimized.sh not found or not executable"
  exit 1
fi

# Capture final counts
print_header "📊 Analyzing Changes"

FINAL_CRATES=$(get_manifest_count "manifests/crates.txt")
FINAL_NPM=$(get_manifest_count "manifests/packages.txt")
FINAL_GITHUB=$(get_manifest_count "manifests/repos.txt")
FINAL_GISTS=$(get_manifest_count "manifests/gists.txt")
FINAL_TOTAL=$((FINAL_CRATES + FINAL_NPM + FINAL_GITHUB + FINAL_GISTS))

# Calculate changes
CRATES_CHANGE=$((FINAL_CRATES - INITIAL_CRATES))
NPM_CHANGE=$((FINAL_NPM - INITIAL_NPM))
GITHUB_CHANGE=$((FINAL_GITHUB - INITIAL_GITHUB))
GISTS_CHANGE=$((FINAL_GISTS - INITIAL_GISTS))
TOTAL_CHANGE=$((FINAL_TOTAL - INITIAL_TOTAL))

# Display changes
echo -e "${BLUE}Artifact Counts:${NC}"
echo -e "  Rust Crates:  ${INITIAL_CRATES} → ${YELLOW}${FINAL_CRATES}${NC} $([ $CRATES_CHANGE -eq 0 ] && echo "" || echo "(${GREEN}+${CRATES_CHANGE}${NC})")"
echo -e "  NPM Packages: ${INITIAL_NPM} → ${YELLOW}${FINAL_NPM}${NC} $([ $NPM_CHANGE -eq 0 ] && echo "" || echo "(${GREEN}+${NPM_CHANGE}${NC})")"
echo -e "  GitHub Repos: ${INITIAL_GITHUB} → ${YELLOW}${FINAL_GITHUB}${NC} $([ $GITHUB_CHANGE -eq 0 ] && echo "" || echo "(${GREEN}+${GITHUB_CHANGE}${NC})")"
echo -e "  GitHub Gists: ${INITIAL_GISTS} → ${YELLOW}${FINAL_GISTS}${NC} $([ $GISTS_CHANGE -eq 0 ] && echo "" || echo "(${GREEN}+${GISTS_CHANGE}${NC})")"
echo -e "  ${BLUE}Total:        ${INITIAL_TOTAL} → ${YELLOW}${FINAL_TOTAL}${NC} $([ $TOTAL_CHANGE -eq 0 ] && echo "" || echo "(${GREEN}+${TOTAL_CHANGE}${NC})")"

# Update documentation if changes detected
if [[ $TOTAL_CHANGE -ne 0 && "$UPDATE_DOCS" = true ]]; then
  print_header "📝 Updating Documentation"
  update_documentation "$FINAL_CRATES" "$FINAL_NPM" "$FINAL_GITHUB" "$FINAL_GISTS"
  print_success "Documentation successfully updated!"
elif [[ $TOTAL_CHANGE -eq 0 ]]; then
  print_section "No changes detected - documentation unchanged"
elif [[ "$UPDATE_DOCS" = false ]]; then
  print_section "Documentation updates skipped (--no-update-docs flag)"
fi

# Final summary
print_header "✨ Summary"

if [[ $TOTAL_CHANGE -gt 0 ]]; then
  echo -e "${GREEN}✓ Successfully discovered and downloaded ${TOTAL_CHANGE} new artifact(s)!${NC}"
  if [[ "$UPDATE_DOCS" = true ]]; then
    echo -e "${GREEN}✓ Documentation automatically updated${NC}"
  fi
elif [[ $TOTAL_CHANGE -eq 0 ]]; then
  echo -e "${BLUE}ℹ All artifacts are up to date${NC}"
else
  echo -e "${YELLOW}⚠ Some artifacts may have been removed (${TOTAL_CHANGE} change)${NC}"
fi

echo -e "\n${CYAN}Final Count: ${YELLOW}${FINAL_TOTAL}${CYAN} total artifacts${NC}"
echo -e "  ${FINAL_CRATES} Rust crates | ${FINAL_NPM} NPM packages | ${FINAL_GITHUB} GitHub repos | ${FINAL_GISTS} Gists\n"

print_success "RUV WORLD complete! 🚀"

exit 0
