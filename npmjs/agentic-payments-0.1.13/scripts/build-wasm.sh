#!/usr/bin/env bash

#
# WASM Build Script - Multi-target WASM compilation
# Builds optimized WASM modules for web, Node.js, and bundler environments
#
# Usage: ./scripts/build-wasm.sh [target]
#   target: web, nodejs, bundler, or all (default: all)
#
# Requirements:
#   - Rust toolchain (1.70+)
#   - wasm-pack (cargo install wasm-pack)
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NPM_DIR="${ROOT_DIR}/npm"
DIST_WASM_DIR="${NPM_DIR}/dist/wasm"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1"
}

log_step() {
    echo -e "${CYAN}▶${RESET} ${BOLD}$1${RESET}"
}

check_dependencies() {
    log_step "Checking dependencies"

    # Check Rust
    if ! command -v cargo &> /dev/null; then
        log_error "Rust not found! Install from https://rustup.rs"
        exit 1
    fi
    log_success "Rust found: $(cargo --version)"

    # Check wasm-pack
    if ! command -v wasm-pack &> /dev/null; then
        log_error "wasm-pack not found!"
        log_info "Install with: cargo install wasm-pack"
        exit 1
    fi
    log_success "wasm-pack found: $(wasm-pack --version)"
}

get_file_size() {
    local filepath="$1"
    if [[ -f "$filepath" ]]; then
        local size=$(du -k "$filepath" | cut -f1)
        echo "${size} KB"
    else
        echo "N/A"
    fi
}

get_gzip_size() {
    local filepath="$1"
    if [[ -f "$filepath" ]]; then
        local size=$(gzip -c "$filepath" | wc -c)
        local kb=$((size / 1024))
        echo "${kb} KB"
    else
        echo "N/A"
    fi
}

build_target() {
    local target="$1"
    local description="$2"

    log_step "Building for ${description}"

    local out_dir="${DIST_WASM_DIR}/${target}"

    cd "${ROOT_DIR}"

    wasm-pack build \
        --target "${target}" \
        --out-dir "${out_dir}" \
        --out-name "agentic_payments" \
        --scope agentic-catalog \
        --release \
        -- \
        --no-default-features \
        --features wasm

    log_success "${target} build complete"

    # Print sizes
    local wasm_path="${out_dir}/agentic_payments_bg.wasm"
    local js_path="${out_dir}/agentic_payments.js"

    if [[ -f "$wasm_path" ]]; then
        echo "  WASM: $(get_file_size "$wasm_path") ($(get_gzip_size "$wasm_path") gzipped)"
        echo "  JS:   $(get_file_size "$js_path") ($(get_gzip_size "$js_path") gzipped)"
    fi
}

print_summary() {
    echo ""
    echo "============================================================"
    log_step "Build Summary"
    echo "============================================================"

    for target in web nodejs bundler; do
        local wasm_path="${DIST_WASM_DIR}/${target}/agentic_payments_bg.wasm"
        local js_path="${DIST_WASM_DIR}/${target}/agentic_payments.js"

        if [[ -f "$wasm_path" ]]; then
            echo ""
            echo "${BOLD}${target}:${RESET}"
            echo "  WASM: $(get_file_size "$wasm_path") ($(get_gzip_size "$wasm_path") gzipped)"
            echo "  JS:   $(get_file_size "$js_path") ($(get_gzip_size "$js_path") gzipped)"
        fi
    done

    echo ""
    echo "============================================================"
}

main() {
    local target="${1:-all}"

    local start_time=$(date +%s)

    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}║  Agentic Payments - WASM Build                            ║${RESET}"
    echo -e "${CYAN}║  Multi-target compilation with size optimization          ║${RESET}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${RESET}"
    echo ""

    # Check dependencies
    check_dependencies

    # Clean previous builds
    log_step "Cleaning previous builds"
    rm -rf "${DIST_WASM_DIR}"
    mkdir -p "${DIST_WASM_DIR}"
    log_success "Cleaned dist/wasm directory"

    # Build targets
    case "$target" in
        web)
            build_target "web" "Browser (ES modules)"
            ;;
        nodejs)
            build_target "nodejs" "Node.js (CommonJS)"
            ;;
        bundler)
            build_target "bundler" "Webpack/Rollup/Vite"
            ;;
        all)
            build_target "web" "Browser (ES modules)"
            build_target "nodejs" "Node.js (CommonJS)"
            build_target "bundler" "Webpack/Rollup/Vite"
            ;;
        *)
            log_error "Unknown target: $target"
            echo "Usage: $0 [web|nodejs|bundler|all]"
            exit 1
            ;;
    esac

    # Print summary
    if [[ "$target" == "all" ]]; then
        print_summary
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    log_success "Build completed in ${duration}s"
}

# Run main function
main "$@"
