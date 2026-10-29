# Phase 3.2B｜脑科学知识底座重建报告

完成日期：2026-10-28。本轮只建立结构化数据、审核入口和只读准入规则；没有新增脑科学结论、文献、游戏知识连接或正式“为什么这样陪”页面。

## 1. Knowledge 数据结构

采用本地 JS 数据文件 `assets/brain-knowledge-data.js`，使 `file://` 打开的现有单页应用可直接读取；没有使用 `fetch()` 读取本地 JSON。每条包含 `knowledge_id`、`title`、`summary`、`age_range`、`related_domains`、`related_mechanisms`、`source_type`、`source_short_name`、`source_title`、`source_url`、`source_date`、`review_status`、`reviewed_at`、`review_note`、`use_mode`、`legacy_source`，并保留旧卡的 `metaphor`、`scene`、`why`、`action`。审查状态约定：`unreviewed` / `reviewed` / `approved` / `rejected`。

准入函数在 `assets/brain-knowledge-foundation.js`。未来只有 `approved`、有审核时间与摘要、完整来源类型/标题/URL/日期、明确机制、适用月龄和允许的 `use_mode` 同时满足，才可能返回知识。`legacy_unverified` 来源类型永不直接通过。`forTheme` 和 `forActivity` 只读；二者不被当前正式页面或推荐算法调用。

## 2. 12 张旧卡迁移

旧 HTML 中的 `var theories` 已移除，`#theoryBrain` 和 `#theoryMem` 改从 `BRAIN_KNOWLEDGE` 渲染。原始标题、来源简称、比喻、场景、原因、做法逐字保留；六字段串联 SHA-256 与迁移前相同（`7cc436036f078a79e76e3068bf082df48c2ca159836280c4d1412ba5476bd724`）。

- 总数：12；脑发育 6、记忆学习 6。
- 稳定 ID：`legacy-brain-01`～`06`、`legacy-mem-01`～`06`。
- 全部：`review_status=unreviewed`、`summary=null`、`age_range=null`、`related_mechanisms=[]`、`use_mode=[]`。
- 原来源简称保存在 `source_short_name`；`source_url/source_title/source_date` 保持 `null`，没有猜测原始出处。
- 原脑科学页面及一级导航保留，旧内容仍可手动阅读。

## 3. 陪伴机制 taxonomy

`assets/brain-knowledge-foundation.js` 中有 10 个只描述实际互动行为的内部机制：

| ID | 名称 | ID | 名称 |
| --- | --- | --- | --- |
| `active_movement` | 主动移动 | `search_and_find` | 藏找与寻找 |
| `simple_matching` | 简单配对 | `self_choice` | 自己选择 |
| `turn_taking` | 轮流互动 | `wait_for_response` | 等待回应 |
| `language_expansion` | 自然扩展表达 | `imitation` | 示范与模仿 |
| `hands_on_action` | 自己动手 | `joint_attention` | 共同关注 |

每项有名称、行为定义、可关联领域、例子、状态。五个 `experience_theme` 到候选机制的映射同文件保存。领域仅是机制元数据；**没有 domain → knowledge 直接映射**。

## 4. Activity mechanism 试点与人工审核入口

`activity-mechanism-review.json` 选了 **15 个** canonical 主游戏，覆盖当前计划可能引用的滚球/藏找、已有显式 `core_play` 的 Phase 2.5B 游戏，以及绘本、模仿等高频玩法。每项保存当前标题与玩法摘要、`suggested_mechanism_ids`、正式 `mechanism_ids` 和审核状态。

当前 **15/15 都是 `pending_human_review`；正式 `mechanism_ids=[]`**。有建议不等于已经确认；其中“并行玩”等没有合适机制的条目，建议列表也可为空。没有批量标注 158 个游戏。

开发审核入口是命令行：`node scripts/review-activity-mechanisms.js --list` 只读查看；审核人自行在终端运行 `--review`，逐项看到名称、现有描述、候选机制，并输入确认的机制 ID、跳过或退出。只有输入审核人、明确机制 ID，且再输入 `yes` 才写入正式标签及审核时间。已确认结果会生成到 `assets/activity-mechanism-confirmed.js`，以 canonical `activity_id` 关联；目前该映射为空。未确认活动的机制读取结果为空。此入口是开发/编辑工具，不对普通用户展示。

## 5. Knowledge gap

`knowledge-gaps.json` 记录 **4 项 open 缺口**：21个月主动移动的自然机会、藏找/寻找、简单配对、以及为什么不必把陪玩变成训练或测试。每项有 `gap_id`、`mechanism_id`（跨机制问题为 `null`）、问题、优先级、相关主题、相关主游戏 ID 和状态。没有为缺口生成解释。

## 6. 发布准入与当前状态

- `approved knowledge`：**0**；当前正式自动连接：**关闭，查询返回空**。
- 主题连接：`experience theme → taxonomy mechanism → approved knowledge`。
- 游戏连接：`canonical activity_id → 人工确认 mechanism_ids → approved knowledge`。
- 额外检查：年龄范围、完整来源、`use_mode`。没有合格内容时返回空，不退化为 domain 或标题关键词匹配。
- 未来知识审核需要逐条核对原始来源和具体论断，再填写摘要、适用年龄、机制、使用方式、审核信息；仅补来源简称或猜测 URL 不可通过。

知识卡与机制 taxonomy 是随应用发布的**静态内容**；审核队列也是开发仓库文件，不是用户个人记录。因此现有 JSON 导入导出和 IndexedDB 备份没有新增这几类静态数据，也没有改变备份结构。未来如果引入用户自定义知识，需另行设计备份；本轮没有此功能。

## 7. 算法与测试

没有修改周计划引擎、Today 权重、游戏推荐、成长判定、evidence 或用户数据写入逻辑。`check.sh` 全量通过，包含原有周计划 25 项和本轮知识底座 15 项；本轮单独的隔离浏览器测试 **6 项通过**，确认旧脑科学页仍显示 12 张原卡片、自动连接为空、浏览不写成长/周计划/游戏反馈、无脚本错误。

测试文件：`scripts/brain-knowledge-foundation.test.js`、`scripts/brain-knowledge.browser.test.js`。本轮未进入 Phase 3.2C。
