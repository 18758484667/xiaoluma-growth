# Phase 3.3A｜五脑 Ontology 与映射基础设施实施报告

日期：2026-10-28。范围仅为静态产品语义、只读 API、未来映射 schema 与校验；没有把新脚本加载到现有页面，没有生成一条用户 evidence 或 mapping。

## 1. Ontology 文件与结构

- 唯一配置：`assets/five-brain-ontology.js`。采用项目现有的静态 JavaScript 数据形式（与脑科学知识底座一致），可在本地 `file://` 页面和 Node 测试中读取；不复制 JSON 和页面内数组。
- 顶层字段：`version`、`review_status`、`brains`、`abilities`、`age_windows`、`mechanism_links`、`legacy_domain_links`。
- 每项能力包含 `ability_id`、`brain_id`、`name_zh`、`parent_definition`、`age_observation_rules`、`evidence_policy`、`related_legacy_domains`、`related_mechanisms`、`review_status`。
- 五脑只表示产品整理视角，不对应五个独立解剖脑区，不承载分数、诊断或官方筛查规则。

## 2. 五个 brain ID

`intelligence`（智力脑）、`creativity`（创意脑）、`language`（语言脑）、`emotion`（情绪脑）、`movement`（运动脑）。

## 3. 十九个 ability ID

| 五脑 | 稳定 ability ID |
| --- | --- |
| 智力脑 | `int_perceptual_attention`、`int_problem_solving`、`int_memory_learning`、`int_executive_function` |
| 创意脑 | `cre_divergent_thinking`、`cre_growth_mindset`、`cre_counterfactual_thinking` |
| 语言脑 | `lang_comprehension`、`lang_expression`、`lang_reading_readiness`、`lang_writing_readiness` |
| 情绪脑 | `emo_recognition`、`emo_regulation`、`emo_social_cognition`、`emo_social_relationships` |
| 运动脑 | `mov_gross_motor`、`mov_fine_motor`、`mov_fitness`、`mov_health_context` |

## 4. 年龄规则与 pending review

六个连续、无重叠阶段：18–23、24–29、30–35、36–47、48–59、60+ 月。17 月及更早明确返回 `out_of_scope`。18–23 月采用已确认的 **21 个月产品设计基线**：active 9、early 6、future 3、support 1；这不是新的专业发展门槛。

24 月以后各项都标为 `pending_review`。数据中存放的 `age_observation_status` 只是沿用 21 个月状态以供逐项人工审核的**不生效占位候选**，不声称 24、36、48 或 60 月已完成专业校准。统一 API 对这些阶段返回 `age_observation_status: null`，另给 `candidate_status` 与 `review_status: pending_review`；未来模块不能把候选读成生效状态。`mov_health_context` 在所有候选窗口始终为 `support_context`，不变成能力等级。完整创意构念在 21 个月仍为 `future`。

## 5. 映射 schema

`assets/five-brain-mapping-schema.js` 定义未来一条映射所需字段：`mapping_id`、`source_type`、`source_id`、`ability_id`、`observed_behavior`、`observed_at`、`age_months_at_time`、`mapping_reason`、`age_status_at_time`、`mapping_source`、`review_status`、`confidence`。来源仅允许 `manual`、`reviewed_rule`、`legacy_mapping`。校验器拒绝缺少依据、年龄状态不一致、重复 mapping ID，以及把 `future` / `support_context` 批准为能力证据。本阶段没有实际映射记录；旧五维领域连接只是 metadata，不根据领域自动生成五脑 evidence。

## 6. 统一只读 API

`assets/five-brain-ontology-api.js` 提供 `getFiveBrainOntology()`、`getBrainById()`、`getAbilityById()`、`getAgeObservationStatus()`、`getAbilitiesForBrain()`、`getAbilitiesAvailableAtAge()` 和 `validateOntology()`。读取结果返回副本，调用方无法修改共享配置。未来页面应从此处读取，不另造 19 项数组；当前页面暂未接入。

## 7. Validator

校验 5 脑、19 项唯一 ID、能力归属和脑内列表一致、六阶段连续及全能力覆盖、合法年龄状态、后续窗口未擅自生效、健康管理不变成能力、创意三项 21 月仍为 future、旧五域覆盖、机制连接存在或保持待审核。机制 ID 与现有 `BRAIN_MECHANISMS` taxonomy 对照；当前 ontology 中机制连接全为 `pending_review`，不是已批准知识或正式游戏映射。

## 8. 文档差异及处理

- 本轮提示建议的 `intelligence_brain` / `perception_attention` 等 ID，与前一轮已确认设计文档中的 `intelligence` / `int_perceptual_attention` 等不同。按本轮“设计文档 ID 优先”要求，沿用既有稳定 ID，不重命名。
- 前一轮设计只细述 18–23、24–29、30–35、36+ 的**候选审核阶段**，本轮要求细分 36–47、48–59、60+。已细分数据窗口，但没有据此发明新的专业适用状态；这些窗口一律待审核。
- 前一轮文档强调 21 个月初始配置，不代表整个 18–23 月阶段的专业门槛。本阶段将其标为产品设计基线，禁止当作官方筛查阈值。

## 9. 向后兼容与业务边界

Ontology 是应用静态配置，不加入用户 JSON / IndexedDB 备份。旧备份缺少 five-brain 字段时仍走原导入路径；未来用户自有映射若实施，须单独版本化。本轮未修改原五维 capability/evidence ID、assessment、官方 checkpoint、Phase 1.10A、成长页、游戏推荐、周计划、Today、脑科学页或历史 snapshot。`check.sh` 仅增加新脚本语法检查和专项测试。

## 10. 测试结果

- `node scripts/five-brain-foundation.test.js`：11 项通过，0 失败。覆盖数量/唯一性、设计 ID、17/18/23/24/29/30/35/36/47/48/59/60+ 边界、21 月状态、creative future、health support、pending 不生效、只读副本、validator 反例、映射 schema、旧五维和页面无接入、浏览器脚本加载。
- `bash check.sh`：完整现有自动化检查通过，包含成长 Golden Cases、备份兼容、推荐、周计划、游戏库、Growth V2 和脑科学底座；新增专项亦通过。
- 当前用户页面没有加载五脑脚本，因此本轮没有可见 UI 变化或业务行为变化。

**进入 3.3B 的门：**后续年龄状态须先经人工审核；映射试点必须逐条保存来源与理由，只读运行，不能由旧 domain 批量生成正式能力证据。
