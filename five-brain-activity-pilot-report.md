# Phase 3.3C｜游戏 → 五脑成长经验映射试点报告

日期：2026-10-28。试点数据：[data/activity-five-brain-mappings.json](data/activity-five-brain-mappings.json)。本轮只审查**活动提供的适龄成长经验**；活动展示、玩过、收藏、反馈和完成都不是孩子已表现出的能力证据。

## 1. 取样与结果

审查 **20 个 canonical 主游戏**，其中 **14 个有明确的机制与 active 子能力体验候选**，**6 个 unmapped**。第一批完整覆盖用户当前周计划中的 4/4 个主游戏、备份中 Today 展示过的 12/12 个主游戏，以及收藏中的 1/1 个主游戏；另纳入机制审核队列与明确配对玩法，形成运动、寻找、语言、社会与动手的多样样本。上述比例只说明**取样来源**，不把浏览或收藏当作儿童能力信号。

所有有映射的记录均为 `mapping_status: pending_review`，`reviewed_at: null`；没有自动批准的正式活动映射，当前生产推荐读取结果为空。原有 10 种机制 taxonomy 被复用，没有建立第二套分类。

## 2. 五脑覆盖矩阵

下表按**不同主游戏数**计数；一个游戏可能关联两个脑，列数相加不等于 14。

| 五脑 | 试点主游戏数 | 边界 |
| --- | ---: | --- |
| 智力脑 | 2 | 感知注意、问题解决；**没有**可靠的记忆学习游戏映射 |
| 创意脑 | 1 | 仅 `act_1_假装游戏` 的“简单假装”前身体验；正式创意子能力 **0** |
| 语言脑 | 6 | 理解与表达分开；仅成人讲话不等于孩子语言表达 |
| 情绪脑 | 4 | 熟人间来回互动及基础轮流关注，不推断完整情绪调节 |
| 运动脑 | 5 | 粗大运动与实际手部操作；不挂体适能或健康管理能力 |

## 3. 十九项 ability 覆盖

| 子能力 | 候选游戏数 | 备注 |
| --- | ---: | --- |
| `int_perceptual_attention` 感知注意 | 2 | 寻找可见线索、比较袜子样板 |
| `int_problem_solving` 问题解决 | 1 | 简单配对中的具体“从候选中找对应物”小目标；仍待人工复核 |
| `int_memory_learning` 记忆学习 | **0** | 藏猫猫会找人，但现有步骤没有要求隔时利用已记住的位置 |
| `lang_comprehension` 语言理解 | 3 | 简短动作邀请、按名称指/拿、绘本指图 |
| `lang_expression` 语言表达 | 3 | 选择、自然扩展、自主表达“再来” |
| `emo_social_cognition` 基础社会认知 | 1 | 明确“轮到你”的短轮流互动 |
| `emo_social_relationships` 社会关系 | 4 | 轮流踢球、藏找、一起收拾、轮流拍盆 |
| `mov_gross_motor` 粗大运动 | 4 | 追踢球、追泡泡、推拉走、滚球捡回 |
| `mov_fine_motor` 精细动作 | 1 | 拿起完整衣物/玩具并放回，属于实际手部操作机会 |
| 其余 10 项 | **0** | 含执行功能、阅读/书写准备、情绪识别/调节、体适能、健康管理与创意脑三项完整构念；没有为覆盖率硬挂标签 |

共 **8/19** 项有正式子能力*候选连接*；该数字不是孩子能力记录或发展评估。`lang_reading_readiness` 仅在厚页绘本共读中作为 `early_experience_candidate`，不计入正式 8 项。创意脑的简单假装仅在 `precursor_experiences`，不写入三项完整能力 ID。

## 4. 五个典型案例

| 类型 | activity → mechanism → ability candidate | 具体理由与边界 |
| --- | --- | --- |
| 纯运动 | `gm_roll_fetch` 球滚远了捡回来 → `active_movement` → `mov_gross_motor` | 孩子自己走、蹲、捡、带回。可选变体有请求互动，但主游戏不因此自动挂语言或记忆。 |
| 寻找 | `act_75_藏猫猫` → `search_and_find`、`turn_taking` → `int_perceptual_attention`（主）、`emo_social_relationships`（次） | 找到发声且在可见范围的人、交换角色；没有隔时回忆要求，**不挂记忆学习**。 |
| 问题解决 | `act_123_简易配对` → `simple_matching` → `int_perceptual_attention`（主）、`int_problem_solving`（次） | 看样板并从几只袜子中找对应一只，是明确的小目标与选择过程；不把做过游戏当成问题解决能力已出现。 |
| 语言互动 | `gap_choose_two` 两样选一样 → `self_choice` → `lang_expression` | 孩子可用看、指、拿、声音或词表达偏好；不要求开口，也不因为成人提问就同时挂语言理解。 |
| 社会互动 | `gap_drum_turn` 轮流拍大鼓 → `turn_taking` → `emo_social_relationships`（主）、`emo_social_cognition`（次） | 成人明确说“轮到你”并短暂交替，提供注意对方和回应的基础机会；不是完整社会认知评估。 |

## 5. Future、early 与年龄门

每条记录的 `age_window` 与游戏本身可用月龄、18–23 月产品观察基线取交集；所有入选主游戏在 21 个月通过现有安全/月龄准入。正式 primary / secondary 只允许 21 个月 `active_observation` 的子能力。`future`、`support_context` 和 `early_signal_only` 不能放进正式能力列表。

- `act_1_假装游戏` 只存“简单假装”前身体验，不挂 `cre_divergent_thinking`、`cre_growth_mindset` 或 `cre_counterfactual_thinking`。
- `act_122_厚页绘本共读` 可另记 `lang_reading_readiness` 的 `early_experience_candidate`，但不作为成熟阅读能力目标。
- “体适能”“执行功能”“情绪调节”等没有借运动或轮流玩法提前包装为训练目标。
- 当前样本没有足够明确的**记住位置或规则后再用**的安全主游戏步骤，因此记忆学习覆盖为 0；这与 Phase 3.3B 的“尚无记忆学习真实 evidence”是两层不同事实。

## 6. 六个 unmapped 与 taxonomy 审计

| 主游戏 | 未映射原因 |
| --- | --- |
| `act_33_室内沙粒盒`（现为大布片触摸盒） | 核心是完整布片的触感探索，现有机制没有准确分类 |
| `act_38_感官游戏大混战`（现为大物件触感托盘） | 同样以触感探索为核心，不因拿放动作强挂精细动作 |
| `act_1_假装游戏` | 现有 `imitation` 可描述其中示范环节，但缺少“简单假装”专门机制；创意脑完整构念仍 future |
| `act_113_橡皮泥杯子蛋糕_2_` | 描述与步骤过于笼统，不能确认独立互动机制 |
| `act_128_撕彩纸贴贴乐` | 当前步骤使用小纸碎片与胶水，先留给内容安全复核；映射未更改原安全标注 |
| `act_12_场景旁白沟通` | 可识别 `joint_attention`，但仅成人旁白不足以确认孩子理解或表达，故不挂语言子能力 |

**现有 taxonomy 足以支撑 14 个映射候选，不足以准确描述两类触感探索和简单假装。** 建议后续人工内容审核考虑在现有 taxonomy 内补充 `sensory_exploration` 与 `simple_pretend_play`，本轮**没有新增机制**。模糊文案与安全材料问题也应先由内容治理处理，不通过五脑映射掩盖。

## 7. 数据与行为隔离

- `data/activity-five-brain-mappings.json` 只含 canonical ID、机制、逐项能力理由、家长语言标签、适龄窗口和审核状态；没有孩子 evidence。
- `assets/five-brain-activity-pilot.js` 提供只读校验、覆盖统计和仅返回 `approved` 记录的读取门。当前 0 条 approved，正式读取为空。
- 为使“寻找”机制可连接感知注意，在现有 `assets/five-brain-ontology.js` 的该子能力**候选机制列表**加入 `search_and_find` 与 `simple_matching`；这些连接仍是待审核的产品语义元数据，不改变年龄规则、专业安全层或 evidence。
- 当前网页没有加载上述新文件；推荐算法、周计划、Growth V2、Today、游戏文案、canonical/alias、备份结构均未修改。活动展示、收藏或反馈不写五脑 evidence，也不因映射新增原五维 evidence。

## 8. 测试

- `scripts/five-brain-activity-pilot.test.js`：**11 项通过，0 失败**。覆盖 20 个主游戏的存在与21月安全准入、当前周计划取样、primary/secondary 上限、每项理由、合法机制、机制→ability 路径、future/early 隔离、canonical/variant、未批准读取为空、unmapped、覆盖矩阵、收藏/反馈不写 evidence、页面和备份入口不变。
- `bash check.sh`：**完整项目自动化检查通过**，包括原成长 Golden Cases、游戏收藏与反馈、推荐轮换、周计划、Growth V2、旧备份与 Phase 3.3A/B 专项。

**验收结论：**试点证明一部分主游戏可以用现有机制清楚地连接到适龄体验；6 个保留 unmapped 显示数据与 taxonomy 的真实边界。所有映射尚未批准，本轮不进入 Growth V2 或正式推荐迁移。
