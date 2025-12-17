# NPM Packages Download Management

## Single Source of Truth: `packagelist.dynamic.txt`

The `packagelist.dynamic.txt` file is the **unified manifest** that consolidates all npm packages to be managed:

- **Packages already downloaded** (auto-detected from `*.tgz` files in this folder)
- **Packages discovered from npm registry** (maintained by `ruvnet` user)
- **Packages that will be downloaded in future runs**

### No More Hardcoded Lists

Previously, there was a hardcoded `PACKAGES=()` array in the script. This has been **removed** and replaced with a dynamic approach:

1. **Load existing**: The script reads `packagelist.dynamic.txt` on startup
2. **Discover new**: If `--discover` flag is used, the script queries npm registry and adds new discoveries
3. **Detect local**: Any `*.tgz` files already in the folder are automatically included (scoped and unscoped package names are normalized)
4. **Merge & deduplicate**: All sources are merged and deduplicated
5. **Update manifest**: The unified list is saved back to `packagelist.dynamic.txt`
6. **Download missing**: The script then uses `npm pack` to download only packages with versions not already present

## Usage

### Download all (no discovery updates):
```bash
./download_ruvnet_packages.sh
```
Uses the list in `packagelist.dynamic.txt` to check and download any missing versions.

### Download + discover new packages:
```bash
./download_ruvnet_packages.sh --discover
```
Queries npm registry for new packages by maintainer `ruvnet`, updates `packagelist.dynamic.txt`, then downloads missing versions.

### Discover only (no downloads):
```bash
./download_ruvnet_packages.sh --discover-only
```
Shows what would be discovered without performing downloads.

## Current Manifest

**File**: `packagelist.dynamic.txt`  
**Format**: One package name per line (no versions)  
**Maintained by**: The script automatically (when run with `--discover`)  
**Manual edits**: Generally not needed, but safe if you want to exclude or add specific packages.

### Supported Package Name Formats
- Plain packages: `react`, `express`, `lodash`
- Scoped packages: `@angular/core`, `@babel/preset-env`, `@ruvnet/bmssp`

## Downloaded Artifacts

- **Format**: `{package-name}-{version}.tgz` (npm's standard tarball format)
  - Scoped: `@neural-trader-core-2.0.0.tgz` (@ replaced with -)
  - Unscoped: `agentic-jujutsu-2.3.6.tgz`
- **Location**: Current directory (same folder as this README)
- **Auto-detection**: The script automatically detects which packages are already present by version

Example:
- `agentic-jujutsu-2.3.6.tgz` (already present)
- `neural-trader-2.6.3.tgz` (just downloaded)
- `ruvector-extensions-0.1.0.tgz` (already present)

## Current Statistics

- **Total packages in manifest**: 155 (as of last discovery)
- **Downloaded tarballs**: Various versions of packages listed above
- **Manifest file size**: ~4 KB (one package name per line)

## Integration with Extracted Directories

Some packages can be **extracted** into directories for direct code inspection by AI agents or tooling. These are created as-needed; the `.tgz` tarballs remain as the canonical archive format.

### Extract a specific package (example):
```bash
npm pack agentic-jujutsu
tar -xzf agentic-jujutsu-2.3.6.tgz
# Now code available at ./package/
```
