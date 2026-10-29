# Growth Page V2 Cleanup 报告

完成日期：2026-10-27。范围仅为成长计划展示层、备份提醒位置与数据管理入口；成长判定、评估答案、证据和快照算法未调整。

## 正式入口与旧 DOM

- `#page-brain` 现在仅包含 `#growthV2Root`，由 `assets/growth-plan-v2.js` 创建正式页面；默认打开「本月总结」。
- 原 `#growthLegacyView` 整块删除，涉及 7 个旧 `<section>` 和 42 个静态 ID，包括旧总结、指南、五维展示、观察、月档案、评估和页签。必要的观察输入、评估答题、官方核对、能力倒退及打印容器改由 V2 直接创建，继续调用原保存函数。
- 四个一级 Tab 固定为「本月总结 / 成长观察 / 月度档案 / 成长评估」。没有旧版入口、旧页回退或 `GROWTH_VIEW_V2`、`setGrowthViewV2` 开关。

## CSS 与 JS 清理

- 删除旧版专用的 `assets/growth-plan.css`（182 行），移除其 HTML 引用；清理 HTML 中旧周观察、诊断、趋势图、成长画像等专用规则。V2 样式仅使用 `assets/growth-plan-v2.css` 与全站设计 token。
- 删除无人引用的旧雷达图依赖 `assets/chart.umd.min.js`，同时移除检查脚本对它的要求。
- 从 HTML 内联脚本删除 22 个仅服务旧展示的函数，包括 `renderBrain`、`showBrainSub`、`renderGrowthProfile`、`renderGrowthTrend`、`renderTrend`、`renderObserve`、`renderObsHistory`、`renderDx`、`renderDxHistory`、`renderAssessmentResult`、`renderAssessmentHistory` 与旧周观察输入函数。旧「本周弱项」按钮专用的 `recommendGames` 随旧视图一起移除；当前首页和游戏库推荐路径没有改变。
- 从 `assets/monthly-growth.js` 删除旧总结 HTML、历史 HTML 及对应展开/关闭展示函数；保留 `growthDisplayExcerpt` 与月度快照生成/更新函数。
- V2 脚本移除 `mount`、`unmount`、节点搬移及旧版开关；保留 `growth-plan-v2.js`、`growth-plan-v2.css` 文件名，以免为重命名增加引用风险。
- `growthTimelineStage`、`growthTimelineItems`、`growthTimelinePointHtml` 仍被 V2 轨迹使用；`genGrowthArchive` 仍用于显式按月整理/打印，因此保留了限定在 `#archiveArea` 的打印样式。

## 业务函数与数据边界

保留原有 `renderAssessment`、`finishAssessment`、`beginAssessmentEdit`、`saveAssessmentEdit`、`addObservation`、`renderDevelopmentGuide`、`renderMilestoneCheckpoint`、`saveMilestoneCheckpoint`、`saveRegressionReport`、`updateCurrentMonthSummary`、`genGrowthArchive`、`exportData`、`importData`、`autoBackup`，以及 capability/evidence 判定、Phase 1.10A、历史 snapshot、游戏推荐和旧备份迁移函数。V2 只读取 view model，并在原写入操作后刷新展示。

## 备份与月度档案

- 首次未备份或距上次导出较久时显示一条中性的轻提醒；关闭状态记在 `xlma_backup_reminder_dismissed_v1`，刷新后同一提醒不再反复出现。
- 成长页页头的「数据管理」打开最小弹层，显示「数据尚未备份」或上次导出日期，并提供原有 JSON 导出、导入入口。导入导出函数和备份格式不变。
- 月度档案中不再出现数据备份按钮；显式生成/打印当月成长档案仍保留。

## 回归与浏览器验收

- `./check.sh`：通过，覆盖原有 smoke、Golden Cases、收藏/别名/安全、推荐轮换、游戏库及 V2 view model 等测试。`scripts/smoke.test.js` 为 **225 通过、0 失败**。
- `scripts/growth-v2.browser.test.js`：隔离 Chrome **38 通过、0 失败**。覆盖四 Tab、原评估完成/修改、总结更新、观察保存、官方核对、历史快照只读、旧视图不存在、数据管理入口及备份提醒关闭后不重复。
- 390px、430px、1440px：四 Tab 均无页面横向滚动；PC 成长内容宽度不超过 800px。截图见 `qa-screenshots/growth-v2-390.png`、`growth-v2-430.png`、`growth-v2-desktop.png`。
- 打开、切 Tab、展开依据、查看历史、返回及刷新均未写入 observation、evidence、assessment 或 summary。明确点击保存/更新仍沿原写入路径。

## 保留的兼容代码

仍保留旧 `xlma_weeklyobs_v1`、旧评估/观察读取及迁移函数，供老备份导入和已有本地数据恢复使用。这些是数据兼容代码，不会渲染旧成长页。`genGrowthArchive` 的 `growth-*` 类名只用于按月打印内容，不是第二套成长页面。
