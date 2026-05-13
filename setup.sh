#!/usr/bin/env bash
set -euo pipefail
TARGET=${1:-.}
mkdir -p "$TARGET"
cp -R .agent "$TARGET/"
cp -R templates "$TARGET/" 2>/dev/null || true
cp -R docs "$TARGET/" 2>/dev/null || true
echo "LiveShop Antigravity Agent Pack installed into $TARGET"
