#!/bin/bash
set -e
set -o pipefail

# Ensure we are running in the script's directory (which should be ruv_downloads/github)
cd "$(dirname "$0")"

# GitHub user to download from
GITHUB_USER="ruvnet"
MANIFEST_FILE="repos.dynamic.txt"

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

# Step 1: Discover repositories
DISCOVERED_REPOS=()

if [ "$DISCOVER" -eq 1 ]; then
    echo "Discovering repositories from GitHub for user: $GITHUB_USER ..."
    
    # Try using gh CLI first if available
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
            # GitHub API (public) - rate limited to 60/hr without token, but usually enough for one run if not frequent
            # If we have GITHUB_TOKEN env var (from Actions), use it
            AUTH_HEADER=""
            if [ -n "$GITHUB_TOKEN" ]; then
                AUTH_HEADER="-H \"Authorization: token $GITHUB_TOKEN\""
            fi
            
            # Note: Using eval to handle the optional AUTH_HEADER correctly
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
    
    echo "  Discovered ${#DISCOVERED_REPOS[@]} repositories"
fi

# Step 2: Load existing from manifest if exists
EXISTING_REPOS=()
if [ -f "$MANIFEST_FILE" ]; then
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        EXISTING_REPOS+=("$line")
    done < "$MANIFEST_FILE"
fi

# Step 3: Merge
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
    printf "%s\n" "${EXISTING_REPOS[@]}"
    printf "%s\n" "${DISCOVERED_REPOS[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_REPOS=()
while IFS= read -r line; do
    MERGED_REPOS+=("$line")
done < "$TEMP_MERGED"

echo "  Total repositories (merged): ${#MERGED_REPOS[@]}"
printf "%s\n" "${MERGED_REPOS[@]}" > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
    exit 0
fi

# Step 4: Download/Update
for repo in "${MERGED_REPOS[@]}"; do
    echo "Checking: $repo"
    
    # Check if directory exists
    if [ -d "$repo" ]; then
        # If it exists, we want to update. 
        # Since we are doing depth=1 and removing .git, "update" means "replace".
        # But only if we want to force update. 
        # For now, let's assume we want to keep it fresh.
        echo "  Updating: $repo (Re-cloning)"
        rm -rf "$repo"
    fi
    
    # URL Encode the repo name for the URL
    encoded_repo=$(url_encode "$repo")
    url="https://github.com/$GITHUB_USER/$encoded_repo.git"
    
    echo "  Cloning: $repo"
    if git clone --depth 1 --quiet "$url" "$repo"; then
        echo "  Cloned: $repo"
        # Remove .git directory to prevent submodule issues and reduce size
        rm -rf "$repo/.git"
    else
        echo "  Warning: failed to clone $repo"
    fi
done

echo "All repository checks complete."
