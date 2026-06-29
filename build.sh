#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  ModelHub — Linux Build Script
#
#  Usage:
#    ./build.sh                   # 使用 VERSION 文件中的版本号
#    ./build.sh 1.2.0             # 指定版本号（同时写入 VERSION 文件）
#    ./build.sh 1.2.0 --release   # 指定版本号 + 打 git tag
#    ./build.sh --server-only     # 只编译后端
#    ./build.sh --web-only        # 只编译前端
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION_FILE="$SCRIPT_DIR/VERSION"
DIST_DIR="$SCRIPT_DIR/dist"

# ── 参数解析 ────────────────────────────────────────────────
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
      echo "    VERSION          版本号，例如 1.2.0（留空则读取 VERSION 文件）"
      echo ""
      echo "  Options:"
      echo "    --server-only    只编译 Go 后端"
      echo "    --web-only       只编译前端"
      echo "    --release        编译完成后打 git tag 并推送"
      echo "    -h, --help       显示帮助"
      echo ""
      exit 0
      ;;
    --*) echo "未知选项: $arg"; exit 1 ;;
    *)   INPUT_VERSION="$arg" ;;
  esac
done

# ── 确定版本号 ──────────────────────────────────────────────
if [[ -n "$INPUT_VERSION" ]]; then
  VERSION="$INPUT_VERSION"
  echo "$VERSION" > "$VERSION_FILE"
  echo "  → 版本号已更新至 $VERSION 并写入 VERSION 文件"
elif [[ -f "$VERSION_FILE" ]]; then
  VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
else
  echo "错误：未指定版本号且 VERSION 文件不存在。" >&2
  exit 1
fi

# ── 构建元信息 ──────────────────────────────────────────────
GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

LDFLAGS="-s -w \
  -X modelhub/server/internal/version.Version=${VERSION} \
  -X modelhub/server/internal/version.GitCommit=${GIT_COMMIT} \
  -X modelhub/server/internal/version.BuildTime=${BUILD_TIME}"

# ── 打印摘要 ────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  ModelHub Build"
echo "  Version  : $VERSION"
echo "  Commit   : $GIT_COMMIT"
echo "  Time     : $BUILD_TIME"
echo "══════════════════════════════════════════"
echo ""

mkdir -p "$DIST_DIR"

# ── 编译后端 ────────────────────────────────────────────────
if [[ "$BUILD_SERVER" == true ]]; then
  echo "▸ 编译后端 Go 服务..."
  cd "$SCRIPT_DIR/server"
  go build -ldflags "$LDFLAGS" -o "$DIST_DIR/modelhub-server" ./main.go
  chmod +x "$DIST_DIR/modelhub-server"
  echo "  → $DIST_DIR/modelhub-server  ✓"
  cd "$SCRIPT_DIR"
fi

# ── 编译前端 ────────────────────────────────────────────────
if [[ "$BUILD_WEB" == true ]]; then
  echo ""
  echo "▸ 编译前端 Next.js..."
  cd "$SCRIPT_DIR/web"
  npm run build
  echo "  → web/.next  ✓"
  cd "$SCRIPT_DIR"
fi

# ── 打包产物（可选）────────────────────────────────────────
echo ""
echo "▸ 生成发行包..."
ARCHIVE="$DIST_DIR/modelhub-${VERSION}-linux-amd64.tar.gz"
tar -czf "$ARCHIVE" \
  -C "$DIST_DIR" modelhub-server \
  -C "$SCRIPT_DIR" VERSION
echo "  → $ARCHIVE  ✓"

# ── Git Tag（--release 模式）────────────────────────────────
if [[ "$DO_RELEASE" == true ]]; then
  echo ""
  echo "▸ 打 git tag v${VERSION}..."
  git tag -a "v${VERSION}" -m "Release v${VERSION}"
  git push origin "v${VERSION}"
  echo "  → tag v${VERSION} 已推送  ✓"
fi

# ── 完成 ────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  ✓ 构建完成  v${VERSION}"
echo "══════════════════════════════════════════"
echo ""
echo "  后端二进制 : $DIST_DIR/modelhub-server"
echo "  发行包     : $ARCHIVE"
echo ""
echo "  启动命令："
echo "    cd server && $DIST_DIR/modelhub-server"
echo ""
