#!/bin/bash
# Top 30 Repository Downloader (Flat Structure)
# Keeps strictly the top 30 most recently pushed repositories.

set -euo pipefail

GITHUB_USER="ruvnet"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPOS_DIR="$PROJECT_ROOT/artifacts/repos"

# --- Initial Setup ---
source "$PROJECT_ROOT/lib/cache.sh"
source "$PROJECT_ROOT/lib/checksum.sh"

ARCHIVES_DIR="$PROJECT_ROOT/artifacts/archives/github/repos"
mkdir -p "$REPOS_DIR" "$ARCHIVES_DIR"

echo "Fetching top 30 active repositories from GitHub..."

# Get top 30 repos sorted by push date (descending)
REPOS=$(gh api "users/$GITHUB_USER/repos?per_page=30&sort=pushed&direction=desc" --jq '.[].name')

# Convert to array
mapfile -t REPO_ARRAY <<< "$REPOS"
echo "Found active target list: ${#REPO_ARRAY[@]} repos"

# Clean up legacy monolithic backup if it exists
if [ -f "$PROJECT_ROOT/artifacts/backup_repos.tar.gz" ]; then
    echo "🗑️ Removing legacy monolithic backup..."
    rm "$PROJECT_ROOT/artifacts/backup_repos.tar.gz"
fi

# --- Cleanup Phase (Folder + Archive) ---
echo "Running strict cleanup..."
if [ -d "$REPOS_DIR" ]; then
  for repo_path in "$REPOS_DIR"/*; do
    if [ ! -d "$repo_path" ]; then continue; fi
    repo_name=$(basename "$repo_path")
    
    # Check if existing local repo is in our Top 30 list
    keep=0
    for valid in "${REPO_ARRAY[@]}"; do
      if [ "$valid" == "$repo_name" ]; then
        keep=1
        break
      fi
    done
    
    if [ "$keep" -eq 0 ]; then
      echo "  🗑️  Removing outdated repo: $repo_name (No longer in Top 30)"
      rm -rf "$repo_path"
      # Also remove its backup if exists
      rm -f "$ARCHIVES_DIR/${repo_name}.tar.gz"
    fi
  done
fi

# Also clean up archives for repos that don't exist anymore (orphaned archives)
for archive_path in "$ARCHIVES_DIR"/*.tar.gz; do
    [ -e "$archive_path" ] || continue
    repo_name=$(basename "$archive_path" .tar.gz)
    if [ ! -d "$REPOS_DIR/$repo_name" ]; then
         echo "  🗑️  Removing orphaned archive: ${repo_name}.tar.gz"
         rm -f "$archive_path"
    fi
done


# --- Download Phase ---
echo "Downloading/Updating Top 30..."

for repo in "${REPO_ARRAY[@]}"; do
  repo_url="https://github.com/${GITHUB_USER}/${repo}.git"
  target_dir="$REPOS_DIR/$repo"
  archive_file="$ARCHIVES_DIR/${repo}.tar.gz"
  
  REPO_CHANGED=false
  
  # Get remote hash for efficiency
  remote_hash=$(git ls-remote "$repo_url" HEAD | awk '{print $1}')
  checksum="git:$remote_hash"
  
  # Check cache
  cached_path=$(check_cache "repo" "$repo" "main" "$checksum")
  if [ -n "$cached_path" ] && [ -d "$cached_path" ] && [ -f "$archive_file" ]; then
      echo "  ✓ Cache hit: $repo"
      continue
  fi

  if [ -d "$target_dir" ]; then
    local_hash=$(cd "$target_dir" && git rev-parse HEAD)
    
    if [ "$remote_hash" == "$local_hash" ] && [ -f "$archive_file" ]; then
        echo "  ✓ Up-to-date: $repo"
        update_cache "repo" "$repo" "main" "$checksum" "$target_dir"
        continue
    fi

    echo "  [UPDATE] $repo"
    (cd "$target_dir" && git fetch --quiet --depth=1 origin main && git reset --hard --quiet origin/main) || echo "    ⚠ Update failed for $repo"
    REPO_CHANGED=true
  else
    echo "  [CLONE] $repo"
    git clone --depth=1 --quiet "$repo_url" "$target_dir" || echo "    ⚠ Clone failed for $repo"
    REPO_CHANGED=true
  fi
  
  # Create individual backup if needed
  if [ "$REPO_CHANGED" = true ] || [ ! -f "$archive_file" ]; then
      echo "    📦 Updating backup: ${repo}.tar.gz"
      tar -czf "$archive_file" -C "$REPOS_DIR" "$repo"
  fi

  update_cache "repo" "$repo" "main" "$checksum" "$target_dir"
done

echo ""
echo "check result:"
echo "Repos: $(ls -1 "$REPOS_DIR" | wc -l)"
echo "Archives: $(ls -1 "$ARCHIVES_DIR"/*.tar.gz 2>/dev/null | wc -l)"
echo "Done."
