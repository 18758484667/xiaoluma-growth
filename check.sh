#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

html="育儿系统看板.html"
[ -f "$html" ] || { echo "缺少入口文件 $html"; exit 1; }
[ -f "index.html" ] || { echo "缺少 GitHub Pages 入口 index.html"; exit 1; }
if ! grep -q "url=育儿系统看板.html" "index.html"; then
  echo "index.html 没有跳转到 $html"; exit 1;
fi
[ -f "assets/monthly-growth.js" ] || { echo "缺少月度总结脚本 assets/monthly-growth.js"; exit 1; }
[ -f "assets/development-guide-content.js" ] || { echo "缺少月龄指南内容 assets/development-guide-content.js"; exit 1; }
[ -f "assets/development-guide.js" ] || { echo "缺少月龄指南脚本 assets/development-guide.js"; exit 1; }
[ -f "assets/development-safety.js" ] || { echo "缺少成长判定安全边界脚本 assets/development-safety.js"; exit 1; }
[ -f "assets/activity-content-cleanup.js" ] || { echo "缺少游戏内容治理脚本 assets/activity-content-cleanup.js"; exit 1; }
[ -f "assets/activity-gap-content.js" ] || { echo "缺少内容缺口补充脚本 assets/activity-gap-content.js"; exit 1; }
[ -f "assets/five-brain-gap-content.js" ] || { echo "缺少已审核内容脚本 assets/five-brain-gap-content.js"; exit 1; }
node scripts/build-five-brain-gap-content.js --check
[ -f "assets/activity-recommendation-learning.js" ] || { echo "缺少推荐轮换脚本 assets/activity-recommendation-learning.js"; exit 1; }
[ -f "assets/brain-knowledge-data.js" ] || { echo "缺少知识底座数据"; exit 1; }
[ -f "assets/brain-knowledge-foundation.js" ] || { echo "缺少知识底座规则"; exit 1; }
[ -f "assets/activity-mechanism-confirmed.js" ] || { echo "缺少已确认游戏机制映射"; exit 1; }
for css in assets/design-system.css assets/today-sky.css assets/development-guide.css assets/activity-favorites.css assets/game-library.css assets/growth-plan-v2.css; do
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
  echo "页面仍引用远程 CDN"; exit 1;
fi

awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' "$html" > /tmp/xlma_check_$$.js
node --check /tmp/xlma_check_$$.js
node --check assets/growth-view-model.js
node --check assets/growth-plan-v2.js
node --check assets/monthly-growth.js
node --check assets/development-guide-content.js
node --check assets/development-guide.js
node --check assets/development-safety.js
node --check assets/activity-content-cleanup.js
node --check assets/activity-gap-content.js
node --check assets/five-brain-gap-content.js
node --check assets/activity-recommendation-learning.js
node --check assets/weekly-learning-plan.js
node --check assets/weekly-learning-plan-ui.js
node --check assets/brain-knowledge-data.js
node --check assets/brain-knowledge-foundation.js
node --check assets/five-brain-ontology.js
node --check assets/five-brain-ontology-api.js
node --check assets/five-brain-mapping-schema.js
node --check assets/five-brain-evidence-pilot.js
node --check assets/five-brain-activity-pilot.js
node --check assets/five-brain-activity-coverage.js
node --check assets/five-brain-growth-view-model.js
node --check assets/five-brain-companion-shadow.js
node --check assets/experience-theme-mechanism-bridge.js
node --check assets/weekly-theme-compatible-shadow.js
node --check scripts/review-five-brain-evidence.js
node --check assets/activity-mechanism-confirmed.js
rm -f /tmp/xlma_check_$$.js

node scripts/smoke.test.js
node scripts/development-golden.test.js
node scripts/activity-favorites.test.js
node scripts/activity-canonical.test.js
node scripts/activity-cleanup.test.js
node scripts/age21-game-safety-gap.test.js
node scripts/five-brain-gap-content-pilot.test.js
node scripts/five-brain-gap-content-review.test.js
node scripts/deferred-imitation-review.test.js
node scripts/five-brain-gap-content-integration.test.js
node scripts/activity-gap.test.js
node scripts/activity-rotation.test.js
node scripts/game-library-visual.test.js
node scripts/growth-v2.test.js
node scripts/weekly-plan.test.js
node scripts/brain-knowledge-foundation.test.js
node scripts/five-brain-foundation.test.js
node scripts/five-brain-evidence-pilot.test.js
if [ -f "local-data/five-brain-evidence-mappings.json" ] && [ -f "${HOME}/Downloads/小鹿玛成长数据_2026-10-28_0930.json" ]; then
  node scripts/build-five-brain-growth-map-data.js --check
  node scripts/five-brain-evidence-review.test.js
  node scripts/five-brain-growth-map.test.js
fi
node scripts/five-brain-activity-pilot.test.js
node scripts/five-brain-activity-coverage.test.js
node scripts/five-brain-activity-gap-final.test.js
node scripts/five-brain-companion-shadow.test.js
node scripts/experience-theme-mechanism-bridge.test.js
node scripts/weekly-theme-compatible-shadow.test.js
node scripts/weekly-theme-fallback-rotation-shadow.test.js > /dev/null
echo "检查通过"
