#!/bin/bash
set -e
set -o pipefail

# Ensure we are running in the script's directory
cd "$(dirname "$0")"

# GitHub user/org to download from
GITHUB_USER="ruvnet"
MANIFEST_FILE="repos.dynamic.txt"
BY_TIER_DIR="by-tier"

# Function to URL encode strings (handles spaces, etc.)
url_encode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * )               printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

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
    # Get list of repos (limit 1000 to be safe)
    gh_repos=$(gh repo list "$GITHUB_USER" --limit 1000 --json name --jq '.[].name')
    if [ -n "$gh_repos" ]; then
        IFS=$'\n'
        for name in $gh_repos; do
            DISCOVERED_REPOS+=("$name")
        done
        unset IFS
    fi
  else
    echo "  gh CLI not authenticated or not found. Falling back to public API via curl..."
    page=1
    while true; do
        echo "    Fetching page $page..."
        # GitHub API (public) - rate limited to 60/hr without token
        AUTH_HEADER=""
        if [ -n "$GITHUB_TOKEN" ]; then
            AUTH_HEADER="-H \"Authorization: token $GITHUB_TOKEN\""
        fi
        
        response=$(eval curl -s $AUTH_HEADER "https://api.github.com/users/$GITHUB_USER/repos?per_page=100\&page=$page")
        
        # Check for errors or empty list
        if echo "$response" | grep -q "\"message\":"; then
             echo "    API Error or Rate Limit: $(echo "$response" | grep -o '"message": "[^"]*"' | cut -d'"' -f4)"
             break
        fi
        
        # Extract names
        page_names=$(echo "$response" | grep -o '"name": "[^"]*"' | cut -d'"' -f4 | sort -u || true)
        
        if [ -z "$page_names" ]; then
            break
        fi
        
        IFS=$'\n'
        for name in $page_names; do
            DISCOVERED_REPOS+=("$name")
        done
        unset IFS
        
        # Simple pagination check: if we got less than 100, we are done
        count=$(echo "$page_names" | wc -l)
        if [ "$count" -lt 100 ]; then
            break
        fi
        ((page++))
        if [ "$page" -gt 20 ]; then break; fi # Safety break
    done
  fi
  
  echo "  Discovered ${#DISCOVERED_REPOS[@]} repositories from GitHub"
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

# Step 4: Download/Update
for repo in "${MERGED_REPOS[@]}"; do
  echo "Checking: $repo"

  # Check if repo exists in any tier
  existing_path=$(find_repo "$repo" || true)
  
  # Determine target directory
  if [ -n "$existing_path" ] && [ -d "$existing_path" ]; then
<<<<<<< HEAD
    # Validation: Check if it's actually a git repo
    if [ ! -d "$existing_path/.git" ]; then
      echo "  Warning: $existing_path exists but is not a git repository (missing .git). Removing and re-cloning..."
      rm -rf "$existing_path"
      existing_path=""
    fi
  fi

  if [ -n "$existing_path" ] && [ -d "$existing_path" ]; then
    # Update existing repo
    echo "  Updating: $repo"
    # Use stash to handle local changes/dirty state safely
    if (cd "$existing_path" && git stash >/dev/null 2>&1 && git pull --quiet); then
      echo "  Updated: $repo"
    else
      echo "  Warning: failed to update $repo"
    fi
=======
      target_dir="$existing_path"
>>>>>>> 75f44ba53f5f041fb89aef7d2eb62c09c1b0de5b
  else
      # Clone new repo to tier-1-active (will be re-tiered by organize script)
      target_dir="$BY_TIER_DIR/tier-1-active/$repo"
  fi

  # URL Encode the repo name for the URL
  encoded_repo=$(url_encode "$repo")
  repo_url="https://github.com/${GITHUB_USER}/${encoded_repo}.git"

  # --- Smart Sync Logic ---
  
  # 1. Get Remote HEAD Commit Hash
  # We use git ls-remote to check the latest commit without downloading
  # This might fail if the repo doesn't exist or is private/auth fails
  remote_hash=$(git ls-remote "$repo_url" HEAD 2>/dev/null | awk '{print $1}' || true)

  if [ -z "$remote_hash" ]; then
      echo "  Warning: Could not fetch remote hash for $repo (Repo not found or auth error). Skipping."
      continue
  fi

  # 2. Check Local Commit Hash
  local_hash=""
  commit_file="$target_dir/.ruv_commit"
  if [ -f "$commit_file" ]; then
      local_hash=$(cat "$commit_file")
  fi

  # 3. Compare and Decide
  if [ -d "$target_dir" ] && [ "$remote_hash" == "$local_hash" ]; then
      echo "  Up-to-date: $repo ($remote_hash)"
      continue
  fi

  if [ -d "$target_dir" ]; then
      echo "  Updating: $repo (New commit: $remote_hash)"
      # Remove existing to ensure clean state
      rm -rf "$target_dir"
  else
      echo "  Cloning: $repo"
  fi

  # 4. Clone and Update State
  if git clone --depth 1 --quiet "$repo_url" "$target_dir"; then
      echo "  Cloned: $repo"
      # Remove .git directory
      rm -rf "$target_dir/.git"
      # Save the remote hash to mark this version
      echo "$remote_hash" > "$target_dir/.ruv_commit"
  else
      echo "  Warning: failed to clone $repo"
  fi
done

echo "All repository checks complete."

# Step 5: Cleanup Root Directory (Enforce Strict Tiered Structure)
echo "Cleaning up root directory to enforce strict tiered organization..."
# Loop through all directories in the script's directory (github root)
for item in */ ; do
    # Skip the by-tier directory itself and the scripts directory
    if [[ "$item" == "$BY_TIER_DIR/" ]] || [[ "$item" == "scripts/" ]]; then
        continue
    fi
    
    # Remove trailing slash
    repo_name="${item%/}"
    
    # Check if it's a directory (repo)
    if [ -d "$repo_name" ]; then
        # Check if it exists in any tier
        existing_tier_path=$(find_repo "$repo_name" || true)
        
        if [ -n "$existing_tier_path" ] && [ -d "$existing_tier_path" ]; then
            # Case 1: Duplicate exists in tier -> Delete root copy
            echo "  Removing duplicate from root: $repo_name (exists in $existing_tier_path)"
            rm -rf "$repo_name"
        else
            # Case 2: Only in root -> Move to tier-1-active
            echo "  Moving untiered repo to active: $repo_name -> $BY_TIER_DIR/tier-1-active/"
            mv "$repo_name" "$BY_TIER_DIR/tier-1-active/"
        fi
    fi
done

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
