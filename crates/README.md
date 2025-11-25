# Crates Download Management

## Single Source of Truth: `crates.dynamic.txt`

The `crates.dynamic.txt` file is the **unified manifest** that consolidates all crates to be managed:

- **Crates already downloaded** (auto-detected from `*.crate` files in this folder)
- **Crates discovered from crates.io API** (from the `ruvnet` user)
- **Crates that will be downloaded in future runs**

### No More Hardcoded Lists

Previously, there was a hardcoded `CRATES=()` array in the script. This has been **removed** and replaced with a dynamic approach:

1. **Load existing**: The script reads `crates.dynamic.txt` on startup
2. **Discover new**: If `--discover` flag is used, the script queries crates.io and adds new discoveries
3. **Detect local**: Any `*.crate` files already in the folder are automatically included
4. **Merge & deduplicate**: All sources are merged and deduplicated
5. **Update manifest**: The unified list is saved back to `crates.dynamic.txt`
6. **Download missing**: The script then downloads only crates with versions not already present

## Usage

### Download all (no discovery updates):
```bash
./download_ruvnet_crates.sh
```
Uses the list in `crates.dynamic.txt` to check and download any missing versions.

### Download + discover new crates:
```bash
./download_ruvnet_crates.sh --discover
```
Queries crates.io for new crates by user `ruvnet`, updates `crates.dynamic.txt`, then downloads missing versions.

### Discover only (no downloads):
```bash
./download_ruvnet_crates.sh --discover-only
```
Shows what would be discovered without performing downloads.

## Current Manifest

**File**: `crates.dynamic.txt`  
**Format**: One crate name per line (no versions)  
**Maintained by**: The script automatically (when run with `--discover`)  
**Manual edits**: Generally not needed, but safe if you want to exclude or add specific crates.

## Downloaded Artifacts

- **Format**: `{crate}-{version}.crate`
- **Location**: Current directory (same folder as this README)
- **Auto-detection**: The script automatically detects which crates are already present by version

Example:
- `agentic-jujutsu-1.0.1.crate` (already present)
- `bit-parallel-search-0.1.0.crate` (just downloaded)
- `qudag-crypto-0.5.1.crate` (already present)

## Integration with Extracted Directories

Some crates are also **extracted** into directories (e.g., `agentic-jujutsu-1.0.1/`, `agentic-payments-0.1.0/`, etc.) for direct code inspection by AI agents or tooling. These are created as-needed; the `.crate` tarballs remain as the canonical archive format.
