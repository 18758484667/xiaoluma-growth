#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

html="育儿系统看板.html"
[ -f "$html" ] || { echo "缺少入口文件 $html"; exit 1; }
[ -f "index.html" ] || { echo "缺少 GitHub Pages 入口 index.html"; exit 1; }
if ! grep -q "url=育儿系统看板.html" "index.html"; then
  echo "index.html 没有跳转到 $html"; exit 1;
fi
[ -f "assets/chart.umd.min.js" ] || { echo "缺少本地图表库 assets/chart.umd.min.js"; exit 1; }
[ -f "assets/monthly-growth.js" ] || { echo "缺少月度总结脚本 assets/monthly-growth.js"; exit 1; }
[ -f "assets/development-guide-content.js" ] || { echo "缺少月龄指南内容 assets/development-guide-content.js"; exit 1; }
[ -f "assets/development-guide.js" ] || { echo "缺少月龄指南脚本 assets/development-guide.js"; exit 1; }
for css in assets/design-system.css assets/today-sky.css assets/growth-plan.css assets/development-guide.css; do
  [ -f "$css" ] || { echo "缺少样式文件 $css"; exit 1; }
done
for asset in \
  assets/illustrations/hero/hero-morning-run.png \
  assets/illustrations/activity/activity-ball-fetch.png \
  assets/illustrations/activity/activity-kick-ball-seated.png \
  assets/illustrations/activity/activity-hide-and-seek.png \
  assets/illustrations/life/life-self-spoon.png; do
  [ -f "$asset" ] || { echo "缺少首页插画 $asset"; exit 1; }
done
if grep -q "cdn.jsdelivr" "$html"; then
  echo "页面仍引用远程 CDN，请改为本地 assets/chart.umd.min.js"; exit 1;
fi

awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' "$html" > /tmp/xlma_check_$$.js
node --check /tmp/xlma_check_$$.js
node --check assets/monthly-growth.js
node --check assets/development-guide-content.js
node --check assets/development-guide.js
rm -f /tmp/xlma_check_$$.js

node scripts/smoke.test.js
echo "检查通过"
