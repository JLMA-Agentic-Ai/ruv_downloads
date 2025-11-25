# RUV Downloads - Centralized Archive Architecture

## Overview

This repository maintains a **unified, automatically-managed archive** of:
- **NPM packages** (`npmjs/`) from the `ruvnet` maintainer
- **Rust crates** (`crates/`) from the `ruvnet` user on crates.io

## Key Principles

### ✅ Single Source of Truth

Instead of hardcoded lists scattered across scripts, each registry type maintains **one manifest file**:

- **`npmjs/packagelist.dynamic.txt`** — All npm packages to track
- **`crates/crates.dynamic.txt`** — All rust crates to track

These manifests are **automatically generated and updated** by the download scripts. They consolidate:
1. Packages already downloaded (detected from local files)
2. Packages discovered via API queries
3. Any manually added entries

### ✅ No Hardcoding

- ❌ **Old**: `PACKAGES=("pkg1" "pkg2" ... "pkg100")` hardcoded in script → requires manual edits
- ✅ **New**: Read dynamic manifest file → always up-to-date

### ✅ Automatic Discovery

Run with `--discover` flag to:
1. Query registries for new packages/crates by user `ruvnet`
2. Merge with existing manifest
3. Download only missing/new versions

Example:
```bash
cd npmjs
./download_ruvnet_packages.sh --discover    # discovers + downloads

cd ../crates
./download_ruvnet_crates.sh --discover       # discovers + downloads
```

### ✅ Version-Aware Caching

Scripts are smart about **what's already present**:
- Checks `agentic-jujutsu-1.0.1.crate` exists → skips download
- Detects new version `agentic-jujutsu-1.0.2.crate` → downloads only new one

## Directory Structure

```
ruv_downloads/
├── npmjs/
│   ├── download_ruvnet_packages.sh    # Main script (uses packagelist.dynamic.txt)
│   ├── packagelist.dynamic.txt        # Manifest of all npm packages to track
│   ├── README.md                      # NPM-specific documentation
│   ├── *.tgz                          # Downloaded package tarballs
│   └── (extracted directories)        # Optional: extracted packages for AI inspection
│
├── crates/
│   ├── download_ruvnet_crates.sh      # Main script (uses crates.dynamic.txt)
│   ├── crates.dynamic.txt             # Manifest of all crates to track
│   ├── README.md                      # Crates-specific documentation
│   ├── *.crate                        # Downloaded crate archives
│   └── (extracted directories)        # Optional: extracted crates for inspection
│
└── MANIFEST.md                        # This file
```

## Workflow

### Initial Setup (Already Done ✓)

1. Discover available packages/crates from registries
2. Generate `packagelist.dynamic.txt` and `crates.dynamic.txt`
3. Download all missing versions
4. Store tarballs/crates locally

### Regular Maintenance

Run periodically (manually or via cron):

```bash
# Check for new npm packages + download missing versions
cd npmjs && ./download_ruvnet_packages.sh --discover

# Check for new crates + download missing versions
cd crates && ./download_ruvnet_crates.sh --discover

# Commit if there are changes
git add -A && git commit -m "Update: discover new packages/crates"
```

### Manual Adjustments

Edit the manifest files to:
- **Remove** packages you don't want: delete line from manifest
- **Add** packages manually: append line to manifest, then re-run script
- **Exclude** a specific version: delete just that `.tgz`/`.crate` file

Manifests are **human-readable** (one name per line):
```
# crates.dynamic.txt example
agentic-jujutsu
agentic-payments
bit-parallel-search
...
```

## Discovery Only Mode

To see what would be discovered **without downloading**:

```bash
./download_ruvnet_packages.sh --discover-only
./download_ruvnet_crates.sh --discover-only
```

Output shows the merged manifest (existing + discovered), helpful for review before running full download.

## Statistics

### NPM Packages
- **Manifest size**: ~155 packages
- **Downloaded**: Multiple versions of packages maintained by `@ruvnet`

### Rust Crates
- **Manifest size**: ~28 crates
- **Downloaded**: Multiple versions from crates.io user `ruvnet`

## Benefits of This Architecture

| Aspect | Before (Hardcoded) | After (Dynamic) |
|--------|-------------------|-----------------|
| **Adding new packages** | Edit script manually | Run with `--discover` |
| **Finding what's tracked** | Grep through script | Read manifest file |
| **Versioning** | Manual → easy to miss updates | Automatic → always current |
| **Maintenance burden** | High | Low |
| **Reproducibility** | Per-run varies | Consistent & auditable |

## Tools & Dependencies

- **Bash 3.x+** (macOS compatible, no `declare -A` arrays)
- **curl** — for HTTP queries to registries
- **npm** — for npm package discovery and packing
- **grep, sed, sort** — standard Unix utilities
- **git** — for tracking changes

## Integration with AI Agents

Both downloaded packages and crates can be **extracted on-demand** for AI agent inspection:

### Extract NPM package:
```bash
cd npmjs
tar -xzf agentic-jujutsu-2.3.6.tgz  # Extracts to ./package/
```

### Extract Rust crate:
```bash
cd crates
tar -xzf agentic-jujutsu-1.0.1.crate -C ./agentic-jujutsu-1.0.1.from_crate/
```

Extracted directories can then be indexed or analyzed by tools that work with source code.

## Next Steps (Optional Enhancements)

- [ ] Add checksums/manifest (`sha256.txt`) for integrity verification
- [ ] Add `--clean` flag to remove old/unused versions
- [ ] Add scheduled discovery via GitHub Actions or cron
- [ ] Add filtering/whitelisting by version, size, or date
- [ ] Add metrics tracking (total size, counts, last updated)

## Questions?

Refer to:
- `npmjs/README.md` — NPM-specific details
- `crates/README.md` — Crates-specific details
- Script headers — inline documentation
