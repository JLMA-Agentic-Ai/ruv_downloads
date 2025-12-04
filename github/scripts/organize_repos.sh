#!/bin/bash
# organize_repos.sh - Organizes ruvnet repos by tier based on activity
# Simple tier-based organization (no symlinks, actual directories)

set -e
cd "$(dirname "$0")/.."

BY_TIER_DIR="by-tier"
INDEX_FILE="repo-index.json"

# Tier thresholds (days since last commit)
TIER1_THRESHOLD=90      # Active: < 90 days
TIER2_THRESHOLD=365     # Stable: 90-365 days
TIER3_THRESHOLD=730     # Maintenance: 1-2 years
# Tier 4: Archive: > 2 years

echo "=== Ruvnet Repos Organization Script ==="
echo "Organizing repos by tier..."

# Ensure tier directories exist
mkdir -p "$BY_TIER_DIR"/{tier-1-active,tier-2-stable,tier-3-maintenance,tier-4-archive}

# Current timestamp for tier calculation
NOW_TS=$(date +%s)

# Start JSON index
echo "[" > "$INDEX_FILE.tmp"
first_entry=true

# Process each repo in all tier directories
for tier_path in "$BY_TIER_DIR"/tier-*/; do
  [ ! -d "$tier_path" ] && continue

  for repo_path in "$tier_path"*/; do
    [ ! -d "$repo_path" ] && continue
    repo_name=$(basename "$repo_path")
    [ ! -d "$repo_path/.git" ] && continue

    cd "$repo_path"

    # === Gather Metadata ===
    last_commit_date=$(git log -1 --format="%ci" 2>/dev/null | cut -d' ' -f1 || echo "unknown")
    last_commit_ts=$(git log -1 --format="%ct" 2>/dev/null || echo "0")
    first_commit_date=$(git log --reverse --format="%ci" 2>/dev/null | head -1 | cut -d' ' -f1 || echo "unknown")
    commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")

    # Get description
    description=""
    if [ -f "README.md" ]; then
      description=$(head -10 README.md 2>/dev/null | grep -v "^#" | grep -v "^$" | grep -v "^\[" | grep -v "^<" | head -1 | sed 's/"/\\"/g' | cut -c1-200 || true)
    fi

    # Detect tech stack
    techs=()
    [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ] && techs+=("python")
    [ -f "package.json" ] && techs+=("node")
    [ -f "Cargo.toml" ] && techs+=("rust")
    [ -f "tsconfig.json" ] && techs+=("typescript")
    [ -f "go.mod" ] && techs+=("go")
    tech_json=$(printf '%s\n' "${techs[@]}" | jq -R . | jq -s . 2>/dev/null || echo "[]")

    cd - > /dev/null

    # === Determine Correct Tier ===
    if [ "$last_commit_ts" = "0" ] || [ -z "$last_commit_ts" ]; then
      new_tier="tier-4-archive"
      tier_num=4
    else
      days_old=$(( (NOW_TS - last_commit_ts) / 86400 ))
      if [ "$days_old" -lt "$TIER1_THRESHOLD" ]; then
        new_tier="tier-1-active"
        tier_num=1
      elif [ "$days_old" -lt "$TIER2_THRESHOLD" ]; then
        new_tier="tier-2-stable"
        tier_num=2
      elif [ "$days_old" -lt "$TIER3_THRESHOLD" ]; then
        new_tier="tier-3-maintenance"
        tier_num=3
      else
        new_tier="tier-4-archive"
        tier_num=4
      fi
    fi

    current_tier=$(basename "$(dirname "$repo_path")")

    # Move repo if tier changed
    if [ "$current_tier" != "$new_tier" ]; then
      echo "  ↻ $repo_name: $current_tier → $new_tier"
      mv "$repo_path" "$BY_TIER_DIR/$new_tier/$repo_name"
      repo_path="$BY_TIER_DIR/$new_tier/$repo_name"
    fi

    # === Write JSON Entry ===
    [ "$first_entry" = "true" ] && first_entry=false || echo "," >> "$INDEX_FILE.tmp"

    cat >> "$INDEX_FILE.tmp" <<EOF
  {
    "name": "$repo_name",
    "tier": "$new_tier",
    "tierNum": $tier_num,
    "lastCommitDate": "$last_commit_date",
    "lastCommitTs": $last_commit_ts,
    "firstCommitDate": "$first_commit_date",
    "commitCount": $commit_count,
    "description": "$description",
    "tech": $tech_json
  }
EOF

  done
done

echo "" >> "$INDEX_FILE.tmp"
echo "]" >> "$INDEX_FILE.tmp"

mv "$INDEX_FILE.tmp" "$INDEX_FILE"

# === Generate Summary ===
echo ""
echo "=== Organization Complete ==="
echo ""
echo "Tier Distribution:"
for t in tier-1-active tier-2-stable tier-3-maintenance tier-4-archive; do
  count=$(ls -1 "$BY_TIER_DIR/$t" 2>/dev/null | wc -l || echo 0)
  echo "  $t: $count repos"
done

echo ""
echo "Files:"
echo "  - $INDEX_FILE (metadata index)"
echo "  - $BY_TIER_DIR/ (repos organized by tier)"
