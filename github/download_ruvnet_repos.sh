#!/bin/bash
set -e
set -o pipefail

# Ensure we are running in the script's directory
cd "$(dirname "$0")"

# GitHub user/org to download from
GITHUB_USER="ruvnet"
MANIFEST_FILE="repos.dynamic.txt"
BY_TIER_DIR="by-tier"

# Basic runtime checks
required_cmds=(gh git grep sed sort mktemp)
for _cmd in "${required_cmds[@]}"; do
  if ! command -v "$_cmd" >/dev/null 2>&1; then
    echo "Error: required command '$_cmd' not found in PATH. Please install it and retry." >&2
    exit 1
  fi
done

echo "Checking repositories from GitHub user: $GITHUB_USER"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing repos from manifest file
EXISTING_REPOS=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_REPOS+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery
DISCOVERED_REPOS=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering repositories from GitHub for user: $GITHUB_USER ..."

  # Try gh cli first
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "  Using gh CLI..."
    repo_list=$(gh repo list "$GITHUB_USER" --limit 1000 --json name --jq '.[].name' | sort -u)
  else
    echo "  gh CLI not authenticated or not found. Falling back to public API via curl..."
    # Fetch all pages
    page=1
    repo_list=""
    while true; do
      echo "    Fetching page $page..."
      response=$(curl -s "https://api.github.com/users/${GITHUB_USER}/repos?page=${page}&per_page=100")

      # Check for empty array or error
      if echo "$response" | grep -q "\[\]"; then
        break
      fi

      # Extract names using grep/sed (avoiding jq dependency if possible, though jq is better)
      # API returns "name": "repo-name",
      page_names=$(echo "$response" | grep -o '"name": "[^"]\+"' | sed -E 's/"name": "([^"]+)"/\1/' | sort -u || true)

      if [ -z "$page_names" ]; then
        break
      fi

      repo_list="${repo_list}
${page_names}"

      ((page++))
      if [ "$page" -gt 10 ]; then break; fi # Safety break
    done
  fi

  if [ -n "$repo_list" ]; then
    IFS=$'\n'
    for name in $repo_list; do
      [ -z "$name" ] && continue
      DISCOVERED_REPOS+=("$name")
    done
    unset IFS
    echo "  Discovered ${#DISCOVERED_REPOS[@]} repositories from GitHub"
  else
    echo "  Warning: no repositories discovered from GitHub API"
  fi
fi

# Step 3: Merge - also auto-discover repos from existing tier directories
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_REPOS[@]}"
  printf "%s\n" "${DISCOVERED_REPOS[@]}"
  # Auto-discover repos that are already present in by-tier/*/
  for tier_dir in "$BY_TIER_DIR"/tier-*/; do
    if [ -d "$tier_dir" ]; then
      for repo_dir in "$tier_dir"*/; do
        if [ -d "$repo_dir" ]; then
          basename "$repo_dir"
        fi
      done
    fi
  done
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_REPOS=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_REPOS+=("$line")
done < "$TEMP_MERGED"

# Step 4: Save manifest
echo "  Total repositories (merged): ${#MERGED_REPOS[@]}"
printf "%s\n" "${MERGED_REPOS[@]}" | sort -u > "$MANIFEST_FILE"

# Step 5: Discovery-only exit
if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified repository manifest:"
  printf "%s\n" "${MERGED_REPOS[@]}" | sort
  exit 0
fi

REPOS=("${MERGED_REPOS[@]}")

# Ensure tier directories exist
mkdir -p "$BY_TIER_DIR"/{tier-1-active,tier-2-stable,tier-3-maintenance,tier-4-archive}

# Helper function to find repo in any tier
find_repo() {
  local repo="$1"
  for tier_dir in "$BY_TIER_DIR"/tier-*/; do
    if [ -d "${tier_dir}${repo}" ]; then
      echo "${tier_dir}${repo}"
      return 0
    fi
  done
  return 1
}

for repo in "${REPOS[@]}"; do
  echo "Checking: $repo"

  # Check if repo exists in any tier
  existing_path=$(find_repo "$repo" || true)

  if [ -n "$existing_path" ] && [ -d "$existing_path" ]; then
    # Update existing repo
    echo "  Updating: $repo"
    if (cd "$existing_path" && git pull --quiet); then
      echo "  Updated: $repo"
    else
      echo "  Warning: failed to update $repo"
    fi
  else
    # Clone new repo to tier-1-active (will be re-tiered by organize script)
    target_dir="$BY_TIER_DIR/tier-1-active/$repo"
    echo "  Cloning: $repo"
    repo_url="https://github.com/${GITHUB_USER}/${repo}.git"
    if git clone --quiet "$repo_url" "$target_dir"; then
      echo "  Cloned: $repo"
    else
      echo "  Warning: failed to clone $repo"
    fi
  fi
done

echo "All repository checks complete."

# Step 6: Re-organize repos (update tiers and index)
ORGANIZE_SCRIPT="$(dirname "$0")/scripts/organize_repos.sh"
if [ -x "$ORGANIZE_SCRIPT" ]; then
  echo ""
  echo "Running organization script to update tiers and index..."
  "$ORGANIZE_SCRIPT"
else
  echo "Note: Organization script not found at $ORGANIZE_SCRIPT"
  echo "      Run 'scripts/organize_repos.sh' manually to update repo organization."
fi
