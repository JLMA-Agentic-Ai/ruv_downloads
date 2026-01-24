# Integration Guide - RUV Downloads Phase 1

**Document**: Integration patterns and recommendations
**Phase**: Phase 1 Architecture
**Date**: 2026-01-23
**Audience**: Developers, system architects, DevOps engineers

---

## 1. Using the RUV Downloads System

### 1.1 Quick Start

```bash
# Clone the repository
git clone https://github.com/ruvnet/ruv_downloads.git
cd ruv_downloads

# Run discovery and download all artifacts
./scripts/download_all_optimized.sh --discover

# Or run individually
./scripts/download_crates_optimized.sh --discover
./scripts/download_npm_optimized.sh --discover
./scripts/download_repos_optimized.sh --discover

# Check cache statistics
source lib/cache.sh
get_cache_stats
```

### 1.2 Command Reference

**Download with discovery** (finds new packages):
```bash
./scripts/download_crates_optimized.sh --discover
```

**Download without discovery** (uses existing manifest):
```bash
./scripts/download_crates_optimized.sh
```

**Discovery only** (show new packages, don't download):
```bash
./scripts/download_crates_optimized.sh --discover-only
```

### 1.3 Output Format

```bash
$ ./scripts/download_crates_optimized.sh --discover

Checking crates from: https://crates.io/users/ruvnet
Discovering crates from crates.io for user: ruvnet ...
    Fetching page 1...
    Fetching page 2...
    ...
  Discovered 193 crates from crates.io
  Total crates (merged): 193
Downloaded: 13 crates
Cache Hits: 180 crates
Errors: 0
Total Time: 42s
Bandwidth Used: 842 MB
```

---

## 2. Extending the System

### 2.1 Adding a New Artifact Type

**Example: Adding support for new artifact type "widgets"**

#### Step 1: Create Manifest File

```bash
# Create empty manifest
touch manifests/widgets.txt
```

#### Step 2: Create Download Script

Use this template: `scripts/download_widgets_optimized.sh`

```bash
#!/bin/bash
# scripts/download_widgets_optimized.sh - Widget download with cache integration
# Version: 1.0.0

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load libraries
source "$PROJECT_ROOT/lib/cache.sh"
source "$PROJECT_ROOT/lib/checksum.sh"

# Configuration
DISCOVERY_URL="https://registry.example.com/api/v1/search?maintainer=ruvnet"
MANIFEST_FILE="$PROJECT_ROOT/manifests/widgets.txt"
ARCHIVE_DIR="$PROJECT_ROOT/artifacts/widgets/archives"
EXTRACTED_DIR="$PROJECT_ROOT/artifacts/widgets/extracted"
LEGACY_DIR="$PROJECT_ROOT/artifacts/widgets/legacy"

# Create directories
mkdir -p "$ARCHIVE_DIR" "$EXTRACTED_DIR" "$LEGACY_DIR"

echo "Checking widgets from: $DISCOVERY_URL"

# Arg parsing
DISCOVER=0
DISCOVER_ONLY=0
for a in "$@"; do
  case "$a" in
    --discover) DISCOVER=1 ;;
    --discover-only) DISCOVER=1; DISCOVER_ONLY=1 ;;
  esac
done

# Step 1: Load existing widgets
EXISTING_WIDGETS=()
if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    EXISTING_WIDGETS+=("$line")
  done < "$MANIFEST_FILE"
fi

# Step 2: Discovery
DISCOVERED_WIDGETS=()
if [ "$DISCOVER" -eq 1 ]; then
  echo "Discovering widgets from registry for user: ruvnet ..."
  widget_json=$(curl -s "$DISCOVERY_URL")
  IFS=$'\n' DISCOVERED_WIDGETS=( $(echo "$widget_json" | grep -o '"name":"[^\"]\+' | sed -E 's/"name":"//' | sort -u || true) )
  unset IFS
  echo "  Discovered ${#DISCOVERED_WIDGETS[@]} widgets from registry"
fi

# Step 3: Merge widgets
TEMP_MERGED=$(mktemp)
trap "rm -f $TEMP_MERGED" EXIT

{
  printf "%s\n" "${EXISTING_WIDGETS[@]}"
  printf "%s\n" "${DISCOVERED_WIDGETS[@]}"
} | grep -v '^$' | sort -u > "$TEMP_MERGED"

MERGED_WIDGETS=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  MERGED_WIDGETS+=("$line")
done < "$TEMP_MERGED"

echo "  Total widgets (merged): ${#MERGED_WIDGETS[@]}"
printf "%s\n" "${MERGED_WIDGETS[@]}" | sort -u > "$MANIFEST_FILE"

if [ "$DISCOVER_ONLY" -eq 1 ]; then
  echo "Discovery-only mode; listing unified widgets manifest:"
  printf "%s\n" "${MERGED_WIDGETS[@]}" | sort
  exit 0
fi

WIDGETS=("${MERGED_WIDGETS[@]}")

# Step 4: Download with cache integration
DOWNLOADED=0
CACHE_HITS=0
ERRORS=0

for widget in "${WIDGETS[@]}"; do
  [ -z "$widget" ] && continue

  # Get latest version
  VERSION=$(curl -s "https://registry.example.com/api/v1/widgets/$widget/latest" | grep -o '"version":"[^"]*' | cut -d'"' -f4)
  [ -z "$VERSION" ] && { ((ERRORS++)); continue; }

  # Check cache
  HASH=$(curl -s "https://registry.example.com/api/v1/widgets/$widget/$VERSION" | grep -o '"checksum":"[^"]*' | cut -d'"' -f4)
  if [ -n "$HASH" ]; then
    CACHED=$(check_cache "widget" "$widget" "$VERSION" "sha256:$HASH")
    if [ -n "$CACHED" ]; then
      ((CACHE_HITS++))
      echo "  Cache hit: $widget@$VERSION"
      continue
    fi
  fi

  # Download
  ARCHIVE="$ARCHIVE_DIR/${widget}-${VERSION}.widget"
  echo "  Downloading: $widget@$VERSION..."

  if ! curl -s -L "https://registry.example.com/download/$widget/$VERSION" -o "$ARCHIVE"; then
    echo "    Error downloading $widget@$VERSION" >&2
    ((ERRORS++))
    continue
  fi

  # Verify checksum
  if [ -n "$HASH" ]; then
    if ! verify_crate_checksum "$ARCHIVE" "sha256:$HASH"; then
      echo "    Error: Checksum mismatch for $widget@$VERSION" >&2
      rm -f "$ARCHIVE"
      ((ERRORS++))
      continue
    fi
  fi

  # Extract
  EXTRACT_DIR="$EXTRACTED_DIR/${widget}-${VERSION}"
  mkdir -p "$EXTRACT_DIR"
  if ! unzip -q "$ARCHIVE" -d "$EXTRACT_DIR"; then
    echo "    Error extracting $widget@$VERSION" >&2
    rm -rf "$EXTRACT_DIR"
    ((ERRORS++))
    continue
  fi

  # Move old versions to legacy
  for old_dir in "$EXTRACTED_DIR/${widget}"-*/; do
    if [ -d "$old_dir" ] && [ "$(basename "$old_dir")" != "$(basename "$EXTRACT_DIR")" ]; then
      old_archive="$ARCHIVE_DIR/$(basename "$old_dir").widget"
      if [ -f "$old_archive" ]; then
        mkdir -p "$LEGACY_DIR"
        mv "$old_archive" "$LEGACY_DIR/"
        rm -rf "$old_dir"
      fi
    fi
  done

  # Update cache
  update_cache "widget" "$widget" "$VERSION" "sha256:$HASH" "$EXTRACT_DIR"
  ((DOWNLOADED++))
done

# Step 5: Report
echo ""
echo "Downloaded: $DOWNLOADED widgets"
echo "Cache Hits: $CACHE_HITS widgets"
echo "Errors: $ERRORS"

# Show cache stats
get_cache_stats
```

#### Step 3: Make Script Executable

```bash
chmod +x scripts/download_widgets_optimized.sh
```

#### Step 4: Update Orchestrator

Edit `scripts/download_all_optimized.sh` to include:

```bash
# Add widgets download
"$PROJECT_ROOT/scripts/download_widgets_optimized.sh" "$@"
```

#### Step 5: Test

```bash
# Test discovery only
./scripts/download_widgets_optimized.sh --discover-only

# Test full download
./scripts/download_widgets_optimized.sh --discover
```

---

## 3. Library Integration

### 3.1 Using Cache System in Your Script

```bash
#!/bin/bash
source "lib/cache.sh"

# Check if artifact is cached
CACHED_PATH=$(check_cache "mytype" "myname" "1.0.0" "sha256:abc123")
if [ -n "$CACHED_PATH" ]; then
  echo "Using cached version at: $CACHED_PATH"
  exit 0
fi

# Download and validate...

# Update cache with new artifact
update_cache "mytype" "myname" "1.0.0" "sha256:abc123" "/path/to/artifact"

# Get cache statistics
get_cache_stats
```

### 3.2 Using Checksum Validation

```bash
#!/bin/bash
source "lib/checksum.sh"

# For Rust crates
CHECKSUM=$(get_crate_checksum "my-crate" "1.0.0")
if verify_crate_checksum "/path/to/crate.crate" "$CHECKSUM"; then
  echo "Crate verified!"
fi

# For NPM packages
CHECKSUM=$(get_npm_checksum "my-package" "1.0.0")
if verify_npm_checksum "/path/to/package.tgz" "$CHECKSUM"; then
  echo "Package verified!"
fi

# For Git repositories
HASH=$(get_git_commit_hash "/path/to/repo")
echo "Repository at commit: $HASH"
```

---

## 4. Parallel Execution (Phase 1.1)

### 4.1 Current: Sequential

```bash
for crate in "${CRATES[@]}"; do
  # Download one at a time
  download_crate "$crate"
done
```

**Time**: 180s for 193 crates

### 4.2 Future: Parallel (via lib/parallel.sh)

```bash
# Will be available in Phase 1.1
source "lib/parallel.sh"

# Process 5 at a time
parallel_execute 5 "download_crate" "${CRATES[@]}"
```

**Expected time**: 40-50s for 193 crates (4-5x speedup)

---

## 5. Integration with CI/CD

### 5.1 GitHub Actions Example

```yaml
name: Update RUV Downloads

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run discovery and download
        run: |
          cd ruv_downloads
          ./scripts/download_all_optimized.sh --discover

      - name: Commit and push changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add -A
          git commit -m "chore: update ruvnet ecosystem [automated]" || true
          git push
```

### 5.2 GitLab CI Example

```yaml
update_ruvnet:
  stage: deploy
  image: debian:latest
  script:
    - cd ruv_downloads
    - ./scripts/download_all_optimized.sh --discover
    - git config user.name "GitLab CI"
    - git config user.email "ci@gitlab.com"
    - git add -A
    - git commit -m "chore: update ruvnet ecosystem [automated]" || true
    - git push https://oauth2:${CI_JOB_TOKEN}@gitlab.com/${CI_PROJECT_PATH}.git HEAD:main
  only:
    - schedules
```

---

## 6. Monitoring & Observability

### 6.1 Cache Statistics

```bash
source lib/cache.sh

# Get all cache statistics
get_cache_stats

# Output:
# Cache Statistics:
#   Location: ~/.cache/ruv_downloads/cache.db
#   Total Entries: 567
#   - Crates: 193
#   - NPM Packages: 198
#   - Git Repos: 166
#   - Gists: 10
```

### 6.2 Parse Download Output

```bash
# Capture statistics from download run
output=$(./scripts/download_crates_optimized.sh)

# Extract specific metrics
downloaded=$(echo "$output" | grep "^Downloaded:" | awk '{print $2}')
cache_hits=$(echo "$output" | grep "^Cache Hits:" | awk '{print $3}')
errors=$(echo "$output" | grep "^Errors:" | awk '{print $2}')

echo "Downloaded: $downloaded | Cache hits: $cache_hits | Errors: $errors"
```

### 6.3 Monitoring Health

```bash
#!/bin/bash
# check_health.sh

source lib/cache.sh

# Check cache database
if [ ! -f "$CACHE_DB" ]; then
  echo "ERROR: Cache database missing"
  exit 1
fi

# Check manifest files
for manifest in manifests/*.txt; do
  if [ ! -f "$manifest" ]; then
    echo "ERROR: Manifest missing: $manifest"
    exit 1
  fi
done

# Check artifact directories
for dir in artifacts/*/extracted; do
  if [ ! -d "$dir" ]; then
    echo "ERROR: Artifact directory missing: $dir"
    exit 1
  fi
done

# Get stats
get_cache_stats

echo "Health check: PASSED"
exit 0
```

---

## 7. Troubleshooting

### 7.1 Cache Corruption

```bash
# Detect corruption
source lib/cache.sh
cleanup_cache

# This will remove entries where files no longer exist
# Output shows: "Cache cleanup: removed X invalid entries"
```

### 7.2 Redownload Everything

```bash
# Clear cache database
rm cache/cache.db

# Clear artifacts
rm -rf artifacts/*/extracted
rm -rf artifacts/*/archives

# Run download again (will download everything)
./scripts/download_all_optimized.sh
```

### 7.3 Check Specific Artifact

```bash
# Was crate downloaded?
grep "^crate|my-crate|" cache/cache.db

# Where is it stored?
grep "^crate|my-crate|" cache/cache.db | cut -d'|' -f5

# List manifest
cat manifests/crates.txt | grep "my-crate"
```

---

## 8. Performance Tuning

### 8.1 Bandwidth Optimization

**Current**: Downloads everything, stores expanded source

**Option 1: Archive-only mode** (future)
```bash
# Modify script to skip extraction
# Saves: 60% of storage
# Tradeoff: Can't inspect source without extraction
```

**Option 2: Selective extraction** (future)
```bash
# Only extract packages that are frequently used
# Saves: 30-40% of storage
# Tradeoff: Extra step needed when first using package
```

### 8.2 API Rate Limiting

**Current limits** (approximate):
- Crates.io: 100 requests per second
- npmjs.org: 100 requests per second
- GitHub: 60 requests per minute (unauthenticated)

**Current usage**: Well below limits

**Future**: Implement in `lib/parallel.sh` if needed

---

## 9. Security Hardening

### 9.1 Transport Security

```bash
# Always use HTTPS (default in scripts)
curl -s "https://crates.io/api/v1/crates"

# Verify certificate (optional, can cause issues with proxies)
curl --cacert /etc/ssl/certs/ca-certificates.crt ...
```

### 9.2 Input Validation

```bash
# Sanitize artifact names (future enhancement)
validate_artifact_name() {
  local name=$1
  # Only allow alphanumeric, hyphen, underscore
  if [[ ! "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Invalid artifact name: $name" >&2
    return 1
  fi
  return 0
}
```

### 9.3 Audit Logging

```bash
# Log all cache updates (future)
update_cache() {
  local type=$1 name=$2 version=$3 hash=$4 path=$5

  # Log to audit file
  echo "[$(date)] Updated cache: $type|$name|$version|$hash|$path" >> logs/audit.log

  # ... existing update_cache logic ...
}
```

---

## 10. Future Integration Points

### 10.1 GraphQL API (Phase 2)

```graphql
query {
  artifacts(type: "crate") {
    name
    version
    checksum
    downloadedAt
    extractedPath
  }
}

mutation {
  downloadArtifacts(type: "crate", names: ["agentic-jujutsu"]) {
    success
    message
  }
}
```

### 10.2 Kubernetes Integration (Phase 2)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ruv-downloads-update
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: downloader
            image: ruv-downloads:latest
            volumeMounts:
            - name: cache
              mountPath: /root/.cache/ruv_downloads
            - name: artifacts
              mountPath: /app/artifacts
          volumes:
          - name: cache
            persistentVolumeClaim:
              claimName: ruv-cache-pvc
          - name: artifacts
            persistentVolumeClaim:
              claimName: ruv-artifacts-pvc
          restartPolicy: OnFailure
```

### 10.3 S3 Backend (Phase 2)

```bash
# Sync cache to S3
aws s3 sync cache/ s3://ruv-cache-bucket/cache/

# Sync artifacts to S3
aws s3 sync artifacts/ s3://ruv-artifacts-bucket/artifacts/ --storage-class GLACIER
```

---

## Conclusion

The RUV Downloads architecture is designed for **easy integration** and **straightforward extension**. The modular library approach and standardized script template make it simple to:

- Add new artifact types
- Integrate with CI/CD systems
- Extend with new features
- Monitor and troubleshoot
- Scale to larger deployments

For questions or feature requests, open an issue on GitHub or contact the Ruvnet community.

