#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  Prism — Linux/macOS Build Script
#
#  Usage:
#    ./build.sh                    # read version from VERSION file
#    ./build.sh 1.2.0              # specify version (writes VERSION file)
#    ./build.sh 1.2.0 --release    # build + create git tag
#    ./build.sh --server-only      # build Go server only
#    ./build.sh --web-only         # build Next.js only
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION_FILE="$SCRIPT_DIR/VERSION"
DIST_DIR="$SCRIPT_DIR/dist"

# ── Parse arguments ────────────────────────────────────────────
BUILD_SERVER=true
BUILD_WEB=true
DO_RELEASE=false
INPUT_VERSION=""

for arg in "$@"; do
  case "$arg" in
    --server-only) BUILD_WEB=false ;;
    --web-only)    BUILD_SERVER=false ;;
    --release)     DO_RELEASE=true ;;
    --help|-h)
      echo ""
      echo "  Usage: ./build.sh [VERSION] [OPTIONS]"
      echo ""
      echo "  Arguments:"
      echo "    VERSION          e.g. 1.2.0 (empty = read from VERSION file)"
      echo ""
      echo "  Options:"
      echo "    --server-only    Build Go server only"
      echo "    --web-only       Build Next.js only"
      echo "    --release        Build then create and push git tag"
      echo "    -h, --help       Show help"
      echo ""
      exit 0
      ;;
    --*) echo "Unknown option: $arg"; exit 1 ;;
    *)   INPUT_VERSION="$arg" ;;
  esac
done

# ── Determine version ──────────────────────────────────────────
if [[ -n "$INPUT_VERSION" ]]; then
  VERSION="$INPUT_VERSION"
  echo "$VERSION" > "$VERSION_FILE"
  echo "  -> VERSION file updated to $VERSION"
elif [[ -f "$VERSION_FILE" ]]; then
  VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
else
  echo "Error: no version specified and VERSION file not found." >&2
  exit 1
fi

# ── Build metadata ─────────────────────────────────────────────
GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

LDFLAGS="-s -w \
  -X modelhub/server/internal/version.Version=${VERSION} \
  -X modelhub/server/internal/version.GitCommit=${GIT_COMMIT} \
  -X modelhub/server/internal/version.BuildTime=${BUILD_TIME}"

# ── Print summary ──────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────"
echo "  Prism Build"
echo "  Version  : $VERSION"
echo "  Commit   : $GIT_COMMIT"
echo "  Time     : $BUILD_TIME"
echo "────────────────────────────────────────"
echo ""

mkdir -p "$DIST_DIR"

# ── Build server ───────────────────────────────────────────────
if [[ "$BUILD_SERVER" == true ]]; then
  echo "▸ Building Go server..."
  cd "$SCRIPT_DIR/server"
  go build -ldflags "$LDFLAGS" -o "$DIST_DIR/prism-server" ./main.go
  chmod +x "$DIST_DIR/prism-server"
  echo "  -> $DIST_DIR/prism-server"
  cd "$SCRIPT_DIR"
fi

# ── Build web ──────────────────────────────────────────────────
if [[ "$BUILD_WEB" == true ]]; then
  echo ""
  echo "▸ Building Next.js frontend..."
  cd "$SCRIPT_DIR/web"
  npm run build
  echo "  -> web/.next"
  cd "$SCRIPT_DIR"
fi

# ── Package release archive ────────────────────────────────────
if [[ "$BUILD_SERVER" == true ]]; then
  echo ""
  echo "▸ Creating release archive..."
  ARCHIVE="$DIST_DIR/prism-${VERSION}-linux-amd64.tar.gz"
  tar -czf "$ARCHIVE" \
    -C "$DIST_DIR" prism-server \
    -C "$SCRIPT_DIR" VERSION
  echo "  -> $ARCHIVE"
fi

# ── Git tag (--release mode) ───────────────────────────────────
if [[ "$DO_RELEASE" == true ]]; then
  echo ""
  echo "▸ Tagging v${VERSION}..."
  git tag -a "v${VERSION}" -m "Release v${VERSION}"
  git push origin "v${VERSION}"
  echo "  -> tag v${VERSION} pushed"
fi

# ── Done ───────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────"
echo "  Build complete: v${VERSION}"
echo "────────────────────────────────────────"
echo ""
if [[ "$BUILD_SERVER" == true ]]; then
  echo "  Server binary : $DIST_DIR/prism-server"
fi
if [[ "$BUILD_SERVER" == true ]]; then
  echo "  Release archive: $DIST_DIR/prism-${VERSION}-linux-amd64.tar.gz"
fi
echo ""
echo "  Start command:"
echo "    $DIST_DIR/prism-server"
echo ""