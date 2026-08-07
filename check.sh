#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

html="育儿系统看板.html"
[ -f "$html" ] || { echo "缺少入口文件 $html"; exit 1; }
[ -f "assets/chart.umd.min.js" ] || { echo "缺少本地图表库 assets/chart.umd.min.js"; exit 1; }
if grep -q "cdn.jsdelivr" "$html"; then
  echo "页面仍引用远程 CDN，请改为本地 assets/chart.umd.min.js"; exit 1;
fi

awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' "$html" > /tmp/xlma_check_$$.js
node --check /tmp/xlma_check_$$.js
rm -f /tmp/xlma_check_$$.js

node scripts/smoke.test.js
echo "检查通过"
