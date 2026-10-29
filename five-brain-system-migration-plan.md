# Phase 3.3｜五脑基座迁移设计

状态：设计稿；本轮不实施、不迁移数据。依据：`five-brain-development-model-v1.md`、`brain-knowledge-foundation-report.md` 与当前项目结构。用户列出的五脑子能力合计 **19 项**，不补造第 20 项。

## 1. 五脑 ontology

五脑是产品统一的成长语义和内容连接坐标，不是官方筛查标准。建议未来建立版本化的 `five-brain-ontology.json`。每项使用稳定 `brain_id` 和 `ability_id`，名称可以调整但 ID 不随文案变化。

| brain_id | 五脑 | ability_id 与子能力 | 21 个月初始年龄状态 |
| --- | --- | --- | --- |
| `intelligence` | 智力脑 | `int_perceptual_attention` 感知注意；`int_problem_solving` 问题解决；`int_memory_learning` 记忆学习；`int_executive_function` 执行功能 | 前三项 `active_observation`；执行功能 `early_signal_only` |
| `creativity` | 创意脑 | `cre_divergent_thinking` 发散性思维；`cre_growth_mindset` 成长型思维；`cre_counterfactual_thinking` 反事实思维 | 三项完整能力均为 `future`；开放探索等前身行为可另作早期叙述，不升级成完整能力判断 |
| `language` | 语言脑 | `lang_comprehension` 语言理解；`lang_expression` 语言表达；`lang_reading_readiness` 阅读准备；`lang_writing_readiness` 书写准备 | 前两项 `active_observation`；后两项 `early_signal_only` |
| `emotion` | 情绪脑 | `emo_recognition` 情绪识别；`emo_regulation` 情绪调节；`emo_social_cognition` 社会认知；`emo_social_relationships` 社会关系 | 前两项 `early_signal_only`；后两项 `active_observation`，仅记录可观察的基础表现 |
| `movement` | 运动脑 | `mov_gross_motor` 粗大运动；`mov_fine_motor` 精细动作；`mov_fitness` 体适能；`mov_health_context` 健康管理 | 前两项 `active_observation`；体适能 `early_signal_only`；健康管理 `support_context` |

以上 21 个月分布为 active 9、early 6、future 3、support 1。具体定义、可观察行为和禁止解读，引用既有五脑设计文档，不在 ontology 中复制另一套专业年龄标准。

建议单条 ontology 记录至少包含：`brain_id`、`brain_name`、`ability_id`、`ability_name`、`definition`、`age_observation_rules`、`evidence_requirements`、`related_legacy_domains`、`related_mechanisms`、`related_activity_tags`、`related_knowledge_ids`、`status`。顶层另有 `ontology_version` 和 `reviewed_at`。`age_observation_rules` 记录阶段窗口、`evidence_basis`、`review_status`；待审核窗口保持 `pending_review`，不可自动生效。`related_*` 是候选连接，不代表能力已出现；`related_knowledge_ids` 当前可为空。`status` 区分设计候选与审核可用，不等于儿童状态。

## 2. 原五维、官方层与五脑的关系

永久保留两条不同职责的数据路径：

```text
原始观察 / assessment / capability evidence
  ├─ 原五维 + official anchors + milestone/checkpoint + Phase 1.10A
  │    └─ 专业安全判定、watch/concern、官方关键月龄核对（规则不变）
  └─ 有出处的只读映射适配层
       └─ 五脑 / 19 项年龄适用的成长叙述与内容连接

canonical activity / variant ──> 体验与陪伴机制；绝不反写能力 evidence
approved knowledge ──> 解释；绝不反写能力状态
```

五脑可以成为页面与内容的最高层语义，但不能替换或重新命名官方五维原始领域。五脑展示不得称为官方发育筛查、医学评估或诊断；安全层的 concern 结论也不能由五脑状态反推。迁移时旧五维入口可以逐步收起，底层记录、官方锚点和判定仍保留。

## 3. 旧 evidence → 五脑的只读映射

映射最小单位是**一条真实行为证据**，而不是领域名。候选映射须同时检查 `source_evidence_id`、capability ID、原始观察文字、行为发生情境和当时月龄；只有行为语义能支持目标能力时才建立映射。无法确定时保留 `unmapped`，不能用旧 `cognitive` 自动填满智力脑四项。一条证据可以对应多个子能力，每个对应关系分别写明 `mapping_reason`。

未来派生记录建议字段：`source_evidence_id`、`ability_id`、`observed_behavior`、`observed_at`、`context`、`mapping_reason`、`age_status_at_time`、`confidence`、`mapping_source`（`manual` / `reviewed_rule` / `legacy_mapping`）。另建议记录 `mapping_rule_version`、`review_status` 和原始来源类型，以便复核；这些是映射元数据，**不修改原 evidence**。AI 生成的候选只能待人工审核，不得直接写正式映射或正式 evidence。

| 已有证据类型 | 可考虑的目标 | 必须验证的语义边界 |
| --- | --- | --- |
| 扶栏上楼梯、真实移动表现 | `mov_gross_motor` | `not_yet` 仍为尚未出现，不得由领域 `emerging` 推为具体能力“正在出现”；未来跳跃不得形成当前负向信息 |
| 开盖、翻页、用勺等实际手部行为 | `mov_fine_motor` | 翻页不自动等于阅读准备，除非观察确有与书互动的相应行为 |
| 自发请求、说词、两词表达 | `lang_expression` | 能表达不自动证明理解；理解需有独立的响应行为 |
| 寻找藏物 | 感知注意、记忆学习或问题解决的候选 | 需分别说明注意目标、过一段时间仍记得、遇到障碍尝试办法的实际证据；一次寻找不能无条件映射三项 |
| 简单假装、不同玩法 | 创意脑前身行为的叙述候选 | 21 个月不得写成发散性思维、成长型思维或反事实思维的完整能力结论 |
| 轮流、向同伴靠近、回应他人 | 社会关系或基础社会认知候选 | 需有人际互动内容；不因 `social` 领域标签自动映射情绪识别或调节 |

游戏完成、收藏、曝光和喜欢反馈都不是能力证据。原始 `not_yet` 不可改写为“不会”或五脑弱项；`no_observation` 不可当 `not_yet`。如果一条旧证据缺原文、行为不明确或无法追溯来源，派生层不展示具体能力结论。

## 4. 游戏 → 五脑的内容映射

游戏映射表达“这个活动提供或会用到什么经验”，不表达孩子已掌握什么。未来在 canonical activity 层增加 `brain_ids`、`ability_ids`、`mechanism_ids`、`experience_tags`、`mapping_status`；具体变体可以覆盖互动方式，但不变成独立主游戏，也不绕过 canonical 的收藏、反馈与曝光。现有 `core_play` / `play_type` 和 Phase 3.2B 陪伴机制 taxonomy 应优先复用；当前机制审核试点仍有待确认项，不能把建议标签当正式标签。

每个游戏标注最核心的 primary ability 1～2 项，secondary 最多 2～3 项。标注需要可复核的实际玩法与人工确认，不能仅由标题或旧领域推断；先做小样本试点，不批量标注约 158 个主游戏。21 个月推荐中，`future` 能力不能成为推荐理由。例如假装游戏可以写“尝试不同玩法”，不能写“发展反事实思维”。映射失败时游戏仍可按现有规则使用，只是不显示五脑解释。

## 5. 本周计划映射

保持已经验收的 weekly plan focus 选择、快照和更新机制。未来只读连接顺序为 `experience_theme → 当前年龄可用的五脑 ability candidates → 已审核机制 → canonical activities`。主题依旧面向家长，如“自己动起来”“把想法说出来”“找一找，看看在哪里”；五脑和子能力是后台连接依据，不是课程标题。生活机会仍属于“日常里顺手做”，不能为补足能力标签变成训练任务。旧周计划 snapshot 原样读取，不因 ontology 更新而改写。

## 6. Today 与推荐如何读取五脑

未来推荐读取五脑时，先沿用现有安全、月龄、场景、时长和照护者精力硬过滤；五脑年龄规则只能进一步限制某项**体验解释/能力连接**是否适用，不能削弱硬过滤。通过硬过滤后，仍按现有当前机会、明确反馈与兴趣、近期玩过/曝光、收藏和多样性处理；引入五脑只作为有审核依据的轻量主题匹配。本设计不规定新分值或重排现有算法。

“证据少”“尚未记录”不是弱项，也不产生补短板加权。`future` 能力不得成为当前推荐目标，`early_signal_only` 只可对应自然前身经验。Today 卡可选呈现“今天会用到：找一找 / 记住在哪里 / 自己想办法”，默认不堆“智力脑 / 记忆学习”等内部分类。曝光和游戏反馈仍不写成长证据。

## 7. Growth V2 的未来展示迁移

在后续独立阶段，现有“五维发展轨迹”才可逐步升级为“小宝的成长地图”：一级是五脑，点入后见子能力。每项明确分开 `age status`（`active_observation` / `early_signal_only` / `future` / `support_context`）与 `evidence status`（`sufficient_observation` / `some_observation` / `limited_observation` / `no_observation`）。后者只说明记录覆盖情况，不是能力高低；不出现评分、排名、“优秀/较弱”或伪定量图形。

创意脑在 21 个月可展示开放探索、不同玩法、简单假装和继续尝试的前身行为，完整三项标为后续阶段，不显示“暂无数据”作为负面暗示。健康管理只显示睡眠、活动机会、饮食、屏幕等支持背景，不产生能力等级。`future` 不显示“尚未出现”或“记录少”；只有经审核且符合年龄条件的证据才进入子能力详情。现有五维详情、官方关键月龄核对和 Phase 1.10A 安全提示继续有明确入口。

## 8. 脑科学知识连接

连接链为 `ability → mechanism → approved knowledge`，也可由 `experience_theme/activity → mechanism → approved knowledge` 找到解释；不采用“旧 domain → 文章”的直接连接。每次连接还须验证机制语义、年龄范围、来源完整度与 `use_mode`。知识只解释为什么这样陪，不参与 evidence、五脑状态或专业安全判断。

Phase 3.2B 迁入的 12 张旧卡目前均为 `unreviewed`，approved 数量为 0，因此目前自动解释应返回空结果。知识 gap 保持 gap，不能由 AI 临时编写脑区、关键窗口或专业结论来填充。

## 9. 未来玩具箱的连接预留

若将来开发玩具箱，建议关系为 `toy → experience_tags → mechanisms → ability candidates → age suitability`。玩具与游戏一样，只提供机会，不生成能力证据。材料安全和适龄是准入条件；“益智”“开发大脑”不应成为核心分类。本轮不建玩具数据、页面或购买功能。

## 10. 成长档案与历史月份

历史原始观察、评估、五维 evidence、summary snapshot 继续作为事实记录。未来档案可将“最近新出现的表现”通过有版本的只读映射归入五脑，但不得制作五脑雷达、分数排行榜，也不能把旧总结改写为五脑措辞。历史月龄须按记录发生日期计算；后来规则更新时，旧 snapshot 仍原样显示，另行呈现的五脑派生视图必须标注其 ontology / mapping 版本，不能伪装成当时已保存的结论。

## 11. 年龄适用规则贯穿所有连接

先读取经过审核的年龄阶段窗口，再允许 evidence、活动解释、计划和 UI 使用相应能力。年龄状态与证据状态独立：

| 年龄状态 | 证据映射与展示 | 活动 / 计划使用 |
| --- | --- | --- |
| `active_observation` | 可以从自然行为积累可追溯观察；仍不等于能力评分 | 可以作为适龄体验候选 |
| `early_signal_only` | 只记录前身行为，不给完整能力强弱结论 | 仅呈现适龄前身经验 |
| `future` | 保留原始行为，不能输出“尚未出现”“记录少”或负向判定 | 不能作为当前推荐理由或本周训练目标 |
| `support_context` | 只记录支持条件，无能力等级 | 可用于照护背景，不作能力目标 |

`age_status_at_time` 用行为发生时月龄判定；当前页面另用当前月龄决定可展示的阶段参考。年龄阶段不是生日当天自动升级的硬开关：18–23、24–29、30–35、36+ 等后续窗口只是审核候选，`pending_review` 不生效。未审核、冲突或缺少依据的规则采取保守空结果，不推断“已到评估年龄”。

## 12. 迁移安全与不可变约束

采取 **additive migration**：新增 ontology、映射和只读 view；不批量改旧 evidence ID、旧 domain、assessment、checkpoint 或历史 snapshot。每条映射可追到原记录与审核规则，重复读取应得同一结果，普通浏览和导入不得写入任何成长记录。专业安全层作为唯一 watch/concern 与官方关键月龄依据；五脑不得弱化它，也不得用家长担忧、游戏完成或推荐曝光制造能力结论。

未来上线各读取点时采用独立、可回退的展示开关与并行对照，先审计差异再切换用户入口。规则或 ontology 变更需提升版本、记录审核依据，并用 21 个月“扶栏上楼梯 observed、会跑 not_yet、双脚跳 future”等现有 Golden Cases 回归：不会跑不能被写成正在出现，未来跳跃不能触发当前缺失或训练建议。

## 13. 旧备份与向后兼容

旧备份缺少 five-brain 字段时仍按原结构导入；只读映射适配层在展示时由旧证据计算候选视图。旧 ID、source、日期和五维状态保持原样，不给旧数据补写默认的五脑证据。新导出将来可以附带 `ontology_version`、`mapping_rule_version` 及人工确认的映射元数据；缺字段时按旧版读取。导入、查看历史、刷新都不得隐式重建或覆盖 snapshot。canonical activity 的旧 alias、收藏与反馈兼容机制保持独立，不因五脑标签改变。

## 14. 推荐实施顺序

| 阶段 | 交付边界 | 依赖与实施理由 |
| --- | --- | --- |
| 3.3A | 版本化 ontology、年龄规则审核状态、只读 mapping 接口与校验 | 先固定 ID 和安全边界，不改产品页面 |
| 3.3B | 少量旧 evidence 的人工复核映射和只读派生视图 | 先验证来源可追溯与一对多语义，不能靠领域批量推断 |
| 3.3C | 少量 canonical 游戏的人审机制与五脑体验映射 | 复用 Phase 3.2B 机制试点，不触碰推荐排序 |
| 3.3D | Growth V2 的五脑展示试点与原五维并行核对 | 只有证据和年龄门通过验收才逐步切换展示 |
| 3.3E | Weekly plan、Today 读取已审映射 | 保持周计划快照与推荐硬过滤、原权重不变，先只读解释再考虑软排序 |
| 3.3F | 仅接入 approved 的脑科学知识 | 当前 0 approved，故此阶段可保持空结果，待人工来源审核后上线 |

顺序中的 3.3F 可与前几阶段并行准备审核资料，但正式自动连接必须等知识准入通过。玩具箱与档案五脑化应作为后续独立项目，不夹在 3.3A–F 中。

## 15. 各阶段验收门

| 阶段 | 必须通过的门 |
| --- | --- |
| 3.3A | 恰好 5 脑、19 个唯一稳定子能力 ID；21 个月状态与既有设计一致；未审核后续窗口不自动升级；现有业务与备份测试无变化 |
| 3.3B | 每条派生映射有原证据和 `mapping_reason`；不确定时 unmapped；一对多理由可审；`future`/`early_signal_only` 不产生错误结论；浏览和导入零写入；Phase 1.10A Golden Cases 全过 |
| 3.3C | 仅小样本人审 canonical 活动；variant 不变独立主卡；primary/secondary 数量上限；游戏和反馈不写 evidence；安全/月龄过滤不退化 |
| 3.3D | 五脑年龄状态与记录覆盖状态分离；创意脑前身和健康背景处理正确；原五维与官方 checkpoint 可用；390px、430px、PC 可读且无横向滚动；旧历史不变 |
| 3.3E | 保存的 weekly snapshot 未变；Today/周计划仍以体验主题为前台语言；`future` 不作推荐理由；低证据不触发补短板；硬过滤、收藏、反馈、曝光、14 天轮换回归通过 |
| 3.3F | 只有 approved 且来源、年龄、机制、`use_mode` 均匹配才展示；无匹配返回空；知识不改变成长状态；12 张 legacy 未审核卡不能自动引用 |

本设计完成后方可逐阶段立项。当前产品仍运行原五维安全层、已验收周计划与推荐逻辑；本轮没有实施任何一项迁移。
