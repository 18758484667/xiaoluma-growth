# Phase 1.10｜发育内容与判定规则总审计

审计日期：2026-10-24。范围：当前工作区 18～36 月龄 `CAPABILITIES`、Phase 1.9 阶段指南、成长证据、五维状态、月度重点、下一观察点及玩具／材料安全。**本文件记录当前实现与待审核风险，不将算法输出解释为医学诊断。**本轮未修改产品内容或判定代码。

## 结论与数量

| 项目 | 数量／结果 |
| --- | ---: |
| capability 总数 | 17 |
| `official_anchor` | 13 |
| `adapted_anchor` | 1 |
| `product_observation` | 3 |
| 指南年龄阶段 | 6（18～20、21～23、24～26、27～29、30～32、33～36） |
| 玩具／材料 | 13 |
| Golden Cases | 30：20 通过、10 失败 |
| 原自动化检查 | 220 通过、0 失败（旧检查不覆盖以下风险） |

逐项内容见 [development-content-audit.md](development-content-audit.md)，仅真正的官方锚点见 [official-development-anchors.md](official-development-anchors.md)。审计使用的权威原始材料：[国家卫健委 3 岁以下发育标志自评表](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)、[CDC 18 月龄](https://www.cdc.gov/act-early/milestones/18-months.html)、[CDC 2 岁](https://www.cdc.gov/act-early/milestones/2-years.html)、[CDC 30 月龄](https://www.cdc.gov/act-early/milestones/30-months.html)、[CPSC 小部件说明](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)。

## 当前完整判定路径

1. **输入**：月度评估提供 `observed`、`emerging`、`unobserved`、`not_yet` 四种能力事实，以及独立的 `caregiver_concern`；日常观察、首页“今天留意”和游戏的主动观察也可提供证据。旧 `evidence_type=concern` 在读取时映射为 `unobserved + caregiver_concern=true`。
2. **证据**：评估题答案写成带稳定 `assessment_id + capability_id` 的 `monthly_assessment` 证据；编辑保存会替换同 ID 旧证据。日常文字用关键词推断最多两个 capability。证据保存于本地存储并可导入导出。
3. **能力阶段**：`capabilityPhase` 使用 `min_age_months`、`typical_age_start`、`typical_age_end` 和全局 `CAPABILITY_GRACE_MONTHS=4`，产生 `future / current / grace / overdue / unknown`。该 4 个月是产品参数，源文档没有给出统一缓冲期。
4. **证据充分度**：过滤未确认、`unobserved` 和未来阶段的单项 `not_yet`，再按能力数、不同日期、评估与日常两类来源及 45 天内记录划分 `low / medium / high`。`evidence_strength` 字段没有进入此分级。
5. **领域状态**：按每项最新证据取状态；文字匹配“倒退”等直接 `concern`；两项持续缺失且过缓冲期的 `official_anchor` **或 `adapted_anchor`** 可 `concern`；单项过期、冲突可 `watch`；其余进入 `rich / on_track / emerging / unknown`。家长主观担忧字段不再单独强制 `concern`，但文字记录仍可能误命中倒退正则。
6. **下一观察点**：`observationSuggestions` 排除 `future`，优先 `emerging`、`not_yet`，再按阶段与典型年龄终点排序；21 月龄“扶栏上楼梯已会、跑未出现”有专门的自然移动建议。无年龄窗口的产品观察项未被排除。
7. **月度重点**：`monthlyDimensionSummary` 先选当前／缓冲／过期能力作为目标；`monthlyFocusCandidates` 根据 `concern/watch/emerging/current_not_yet/unknown` 打分，最多两项；游戏与生活建议复用现有活动库筛选与推荐分数。
8. **总结快照**：完成评估、明确保存修改、明确点“更新本月总结”才生成／替换本月 `monthly_growth_summary`。普通打开、查看历史、刷新不写快照。旧历史快照不会因规则变化自动重建。

## 年龄窗口与来源审计

### 未来锚点

- **状态层已部分隔离**：`motor_jump` 的 `typical_age_start=24`；21 月龄的 `not_yet` 不改变大运动状态或证据充分度，下一观察点也不会选它。Golden G01～G05、G18～G19 通过。
- **入口层仍提前**：`assessmentQuestionSet` 允许 `min_age_months <= age+3`；`motor_jump.min_age_months=20`，因此 21 月龄评估仍会问 24 月龄双脚跳（G27 失败）。`todayObservationCandidates` 用同类条件，18 月龄也可能把双脚跳列入候选（G26 失败）。即使 `not_yet` 不扣分，题目本身可能被家长理解为当前要求。
- **多能力证据例外**：证据充分度先按整条记录过滤，再把该记录的所有 capability ID 计数。一条同时关联当前 `motor_run` 与未来 `motor_jump` 的 `not_yet` 会把未来能力算进充分度（G28 失败）。

### 当前窗口和过期窗口

- 单项当前窗口 `not_yet` 目前不会直接 `concern`（G06～G08 通过），但 24 月龄两项官方锚点同月明确未出现仍会进入 `emerging`，未进入关注候选（G22 失败）。这与[国家卫健委自评表](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)的相应月龄求助建议存在明显差距；跨来源锚点如何组合仍需专业审稿。
- 18 月龄官方锚点明确 `not_yet` 时，统一缓冲期使其不进入 `watch`（G21 失败）。原始自评表对相应月龄 1 项未出现建议寻求指导、2 项及以上建议就医，代码的 4 个月统一缓冲不来自该表。**不能将当前 `watch/concern` 阈值解释为官方建议。**
- 30 月龄与 36 月龄的国家卫健委锚点未完整建模。33～36 月龄指南明说沿用 30 月龄内容，因而内容覆盖不足，不是已经完成 36 月龄官方审计。

### source 使用

- `source_level` 不存在于 capability 数据中；目前仅有 `source` 字符串与 `source_type`。逐项来源等级在内容清单中为审计推断，尚不能作为机器可验证的可信度字段。
- `cog_pretend` 标为 `adapted_anchor`，但 `evaluateDomainState` 把它与 `official_anchor` 合并计入两项过期持续缺失的 `concern` 条件（G25 失败）。应在审核后决定产品改写是否只用于机会建议。
- `fine_lid` 产品名“拧开大瓶盖”比原文“用手旋拧”更强调完成动作；`motor_jump` 产品名“尝试双脚跳起”又弱于原文“跳起”。这些语义变化应由内容负责人逐项确认。
- 27～29 月龄指南正文及观察点引用 30 月龄的 `soc_peers`。文案使用“可以”“看看”，尚未写成达标要求，但应明确标为提前提供机会，而非该阶段判断依据。
- `cog_sort` 为产品观察项，却用于 27～36 月龄指南机会与观察点；该项没有固定年龄来源，也未列入阶段 `source_refs`。生活、玩具、替代材料仅有项目内容，没有逐条外部出处；不能在 UI 中统称为“官方发展依据”。

## caregiver concern 与风险升级

- 已检查 `setAssessmentAnswer`、`toggleAssessmentConcern`、`assessmentEvidenceRows`、`normalizeEvidence`、`evaluateDomainState`：**家长选择额外担忧不再直接把领域设为 `concern`**。G09、G10、G20 通过。
- 旧评估答案若仍保存为 `status=concern`，评估编辑界面的预填按钮只检查 `caregiver_concern`，可能没有显示“额外担忧”已选中；计算层兼容不等于编辑界面完全兼容，应在统一修复时处理。
- 仍有**文本误触发**：`isRegressionEvidence` 用正则搜索原始文字；“没有倒退，仍会扶栏上楼梯”也匹配“倒退”，导致 `concern`（G23 失败）。无法仅凭关键词可靠判断已掌握能力倒退。
- 同一能力旧 `not_yet` 与较新 `observed` 共存时，`summarizeCapabilityEvidence.conflict` 仍为真，可能持续 `watch`（G24 失败）。应区分“真实矛盾需复核”和“后来学会”。
- `concern` 的两项持续缺失规则只要求 `medium` 证据、不同日期与锚点类型；没有明确要求评估所处的来源文档建议、同领域已有正向表现如何抵消，也没有明确的专业审稿记录。
- 反向风险同样存在：固定缓冲期可能让应提示与专业人员讨论的相应月龄未出现情况仅显示“正在发展”。[CDC](https://www.cdc.gov/act-early/milestones/2-years.html)明确说明里程碑清单不能替代标准化筛查，并鼓励家长就缺失、倒退或担忧与医生讨论；产品状态不能作为不求助的依据。

## next_observation 全路径审计

| 来源 | 当前规则 | 风险 |
| --- | --- | --- |
| 成长画像“接下来留意” | 稳定表现 → `emerging` → 当前／缓冲期无记录 → 自然观察 | `growthRecentText` 的“稳定”优先级可遮住当下更值得留意的表现；它是摘要文本，不等于月度下一观察点。 |
| `observationSuggestions` | 排除 `future`；按 `emerging`、`not_yet`、阶段和年龄终点排序；最多 3 条 | 无年龄窗口的产品项未排除；没有结构化“自然前置行为”关系，21 月龄跑步只有特例文案。 |
| `monthlyDimensionSummary.next_observation` | 取 `observationSuggestions` 第一条 | 如果候选排序或年龄元数据有误，会直接进入总结与 `next_month_check`。 |
| `monthlyDimensionSummary.target` | 当前／缓冲／过期中找 `emerging`、`not_yet` 或当前未掌握项 | 不会选 future，但可能在“过期能力已观察到”与当前目标之间产生不够自然的目标。 |
| Phase 1.9 `observe_points` | 六个阶段的静态内容映射 | 27～29 月龄出现 30 月龄同伴锚点，虽然语气轻，也需要人工审稿。 |
| 首页“今天可以留意” | `todayObservationCandidates` 从当前或临近 future 选题 | 18 月龄可出现 24 月龄双脚跳（G26 失败）；界面虽有“提前自然留意”说明，仍有越级风险。 |

`todayObservationCandidates` 还用 `s.emerging / s.observed / s.notYet` 排序，但 `summarizeCapabilityEvidence` 返回的是 `status` 与日期数组，没有这些计数字段；该优先级计算存在 `undefined` 运算，实际排序可能退化为列表顺序。这是建议修复的代码缺陷，未在本轮静默改写。

## 内容与材料安全审计

- 六个阶段均有五领域文字、5 条机会、玩具分组、生活参与、3 条观察点与 source refs；没有空阶段。18～20、21～23、24～26、30～32 的阶段领域没有超过阶段终点的能力；27～29 有 `soc_peers` 提前引用；33～36 仅沿用 30 月龄锚点。
- 大多数文字采用“可以”“尝试”“留意”，没有发现把未来能力直接写成“必须会”的显式句子。重复项较多：跑动、翻书、两词、假装游戏跨多个阶段重复。重复作为持续机会可以成立，但每阶段差异与 33～36 月龄覆盖需内容审核。
- 13 项玩具／材料都标了大尺寸与安全提示，当前代码按 `min_piece_cm >= 3.2` 和禁词过滤。然而单一数值无法验证可脱落的小配件、折断后的碎片或小部件圆筒测试；尤其粗杆蜡笔、嵌板拼图、娃娃装饰件、硬盖空盒需要实物规格与成人陪玩说明。参见 [CPSC 小部件规则](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)。
- `guideSafeToy` 在年龄 **36** 时停止“小部件”过滤，但阶段为 33～36 月龄，切换边界应复核。另有 “大号” 等非量化描述，安全性不能由名称自动保证。

## Golden Cases 与失败项

运行：`node scripts/development-golden.test.js`。测试固定年龄、证据与预期；**失败项保留，不用现有输出改写预期**。测试文件不接入 `check.sh` 的绿色门禁，以免把尚未审核的临床阈值当作既定产品规则。

| Case | 预期与发现 | 等级 |
| --- | --- | --- |
| G21 | 18 月龄官方单项明确未出现，应进入指导／watch 候选；当前仅落在缓冲期，未进入 watch | P0 |
| G22 | 24 月龄两项官方能力未出现应进入关注候选；当前仅 emerging | P0 |
| G23 | “没有倒退”不应触发 concern；当前正则误触发 | P0 |
| G24 | 旧 `not_yet` 后有新 `observed` 不应自动长期 watch；当前 conflict 持续 | P1 |
| G25 | `adapted_anchor` 不应与单一官方锚点合并触发 concern；当前会合并 | P0 |
| G26 | 18 月龄今天留意不应出现 24 月龄双脚跳；当前候选可出现 | P1 |
| G27 | 21 月龄评估不应把 24 月龄双脚跳作为当前题；当前题集包含 | P1 |
| G28 | 混合证据里的未来 `not_yet` 不应抬高充分度；当前按整条证据放行后计入未来 ID | P1 |
| G29 | “今天留意”应优先正在出现的当前能力；排序读取不存在的字段，未生效 | P2 |
| G30 | 旧 `status=concern` 评估答案进入编辑时应显示额外担忧已选中；当前未预填 | P1 |

其余 G01～G20 通过，包括用户真实 21 月龄案例、家长担忧分离、低证据 unknown、产品观察项不凭 `not_yet` 触发 concern、已掌握能力倒退与多项过期锚点。通过只证明当前实现符合这些固定案例，**不构成临床有效性证明**。

## 建议修复项（先审核，再统一实施）

### P0

1. 由儿保／发育专业人员审定每个官方锚点的相应月龄提示、来源差异与升级规则；移除“全局 4 个月缓冲＝官方安全窗口”的含义，明确产品状态与“建议咨询”的关系。
2. 把能力倒退从自由文本正则中拆出为明确、可核实的结构化事实，避免否定句误报；对既有记录保持兼容读取。
3. `adapted_anchor` 不再默认与官方原文同权触发 concern；为 source 加机器可读等级并做来源审稿。
4. 在上述规则审定前，**不要将现有 `watch/concern`、月度重点和 30 天建议作为排除专业咨询的依据**；评估摘要要明确表述适用边界。

### P1

1. 统一未来能力的选题、首页留意、证据充分度与月度重点年龄门槛；不能只在状态层过滤。
2. 解决同一能力从 `not_yet` 到 `observed` 的时间变化与真正冲突的区分。
3. 审核 27～29 月龄 `soc_peers`、33～36 月龄内容覆盖、指南 product observation 的来源呈现；修正旧 `concern` 评估答案的预填显示。
4. 对玩具／替代材料建立可核验尺寸、可脱落部件及破损检查；现有 `min_piece_cm` 不足以做安全认证。

### P2

1. 为每项能力加入结构化 `source_level`、原文链接、适用年龄、审稿人和审稿日期；不再只存来源字符串。
2. 给 `next_observation` 建立可审阅的前置行为映射，减少按数组顺序或特例文案选目标。
3. 修正“今天留意”候选排序对不存在的字段的引用，并增加单测。
4. 明确 6 个阶段重复内容的“持续机会”语义，并让指南审计文件随内容改动自动重生成。

## 当前使用建议

现有成长总结可暂作**家庭观察记录与回顾草稿**；不建议把自动生成的五维状态、`watch/concern`、本月重点或 30 天建议当作可靠的发育筛查结果，也不应用“正在发展／暂无法判断”来否定家长的真实担忧。发现能力倒退、持续担忧或相应月龄标志未出现时，应按官方材料与儿保／儿科专业人员讨论。正式修复需先审核本报告和两份清单。历史月份快照保持原样，任何统一修复都不应静默重写历史。
