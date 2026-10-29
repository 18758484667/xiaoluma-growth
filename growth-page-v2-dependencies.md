# Growth Page V2 数据依赖清单

V2 是展示层。原始记录、判定、快照生成及存储继续由现有函数负责。

| V2 模块 | 读取 / 调用的现有能力 | 边界 |
|---|---|---|
| 页头 | ageInfo、fmt | 当前月龄和月份，只读 |
| 本月摘要与重点 | currentAssessment().monthly_growth_summary、growthDisplayExcerpt | 读取已保存 snapshot；最多两项重点；不自动生成或更新 |
| 更新总结 | updateCurrentMonthSummary | 只有明确点击才调用原写入路径 |
| 五维轨迹 | currentDomainStates、growthTimelineStage、growthTimelineItems、growthTimelinePointHtml | 原有年龄窗口、证据选择与状态映射原样复用 |
| 五维详情 | domainState 的结果、growthTimelineEvidenceStatus、observationSuggestions | 整理真实 capability evidence，不把领域状态投射到能力 |
| 本月评估依据 | currentAssessment().answers、capabilityById | 当前月原答案；嵌套在“为什么这样判断”内 |
| 接下来30天 | snapshot.next_30_days | 每组最多三项；不重新推荐 |
| 发育指南 | guideForAge、renderDevelopmentGuide 输出的完整指南正文 | 复用 Phase 1.9 内容和渲染，默认只显示轻入口 |
| 成长观察 | loadEvidence、addObservation | V2 提供输入节点，保存仍用原函数；列表排除评估来源 |
| 月度档案 | loadAssessments、loadEvidence | 有 snapshot 时直接读；观察月无快照时不补写或重算 |
| 原始月档案 / 打印 | archiveMonth、archiveArea、genGrowthArchive | 保留原有显式生成/打印操作，默认折叠 |
| 成长评估 | renderAssessment、assessmentQuestionHtml、setAssessmentAnswer、finishAssessment | 原题目和原事件，不创建第二套评估 |
| 修改评估 | beginAssessmentEdit、setAssessmentEditAnswer、saveAssessmentEdit、cancelAssessmentEdit | 原 draft、证据替换和 snapshot 重建流程；V2 只刷新并导航 |
| 官方关键月龄核对 | renderMilestoneCheckpoint、checkpointDefinition、checkpointReady、saveMilestoneCheckpoint | 原审核状态和官方规则；未到关键月龄显示入口状态说明 |
| 能力倒退记录 | renderRegressionEntry、saveRegressionReport | V2 提供表单节点，沿用原保存机制 |
| 导入导出 / 备份 | exportData、importData、autoBackup | 数据管理弹层复用原导入导出格式；提醒关闭状态使用独立本地键 |

## 文件及隔离方式

- `assets/growth-view-model.js`：只读数据整理，不包含判定、保存、生成快照或推荐函数。
- `assets/growth-plan-v2.js`：新 DOM、四个 Tab、accordion、时间轴和交互适配。
- `assets/growth-plan-v2.css`：唯一成长页样式，复用 `design-system.css` tokens。
- `growthV2Root` 是唯一成长页容器。观察输入、评估答题、核对与倒退记录的必要节点由 V2 直接创建；旧展示 DOM、旧样式文件和回退开关已移除。
- 导入文件输入位于独立数据管理弹层，不再位于月度档案。
- 仅对展示函数增加刷新桥接；评估保存/完成操作只在调用原函数后切换页签，数据写入代码不复制、不替换。
- 打开、切 Tab、展开详情、查看历史、刷新均不调用保存或总结生成函数。
