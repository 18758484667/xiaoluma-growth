# Phase 3.3C-Review｜游戏五脑映射审核报告

审核日期：2026-10-28。范围限试点 20 个 canonical 游戏；逐项对照现有游戏描述、步骤、变体和 21 个月年龄状态。**映射表示玩法提供成长经验，不是孩子已获得该能力，也不是成长 evidence。**

## 审核结论

| 最终状态 | 游戏数 | 处理 |
| --- | ---: | --- |
| approved | 11 | 玩法、机制、主次能力与逐项理由一致；仅供未来受控读取 |
| revised | 3 | 已收紧主次归属或删除过度推断；暂不进入 approved 读取 |
| rejected | 0 | 没有整条游戏映射被拒绝；3 条具体能力连接被否决并从映射中移除 |
| unmapped | 6 | 保留未映射理由；两项触感游戏和简单假装仅补机制描述 |

每条记录保留 `reviewed_at`、`reviewed_by: codex_content_review`、`review_note`、逐项 `mapping_reason` 和原 canonical ID。这里的 `approved` 表示本轮 Codex 逐项内容审核通过；**用户或专业人员的最终人工验收尚未完成**，不能把它写成已有外部专家签核。`revised` 不被 `getApprovedMapping` 返回。没有删除审核历史。

## 11 项 approved 开发审核摘要

所有下表的正式子能力在 21 个月均为 `active_observation`；这里的“主/次”指**活动体验**，不表示孩子表现好坏。

| 活动 | mechanism | 主能力 | 次能力 | 依据 |
| --- | --- | --- | --- | --- |
| 追球再踢回来 (`gm_chase_kick_ball`) | `active_movement`, `turn_taking` | `mov_gross_motor` | `emo_social_relationships` | 孩子主动追、走、踢球，是具体身体移动机会。；玩法写明成人和孩子轮流踢或滚，提供来回互动机会。 |
| 吹泡泡 (`act_14_泡泡追跑`) | `active_movement` | `mov_gross_motor` | — | 主玩法让孩子自己走、追、碰泡泡，提供主动移动经验；其他语言变体不另建主映射。 |
| 简单指令互动 (`act_130_简单指令互动`) | `wait_for_response` | `lang_comprehension` | — | 活动给孩子听到熟悉简短话语并以动作回应的机会；游戏展示或参与不证明她已经理解。 |
| 推拉玩具散步 (`gm_push_pull_walk`) | `active_movement` | `mov_gross_motor` | — | 走动、推拉和调整身体位置是本玩法的核心主动移动经验。 |
| 藏猫猫 (`act_75_藏猫猫`) | `search_and_find`, `turn_taking` | `int_perceptual_attention` | `emo_social_relationships` | 玩法提供跟随声音和可见线索寻找人的注意机会。；双方交换藏与找，提供熟人间来回互动机会。 |
| 球滚远了，捡回来 (`gm_roll_fetch`) | `active_movement` | `mov_gross_motor` | — | 自己走、蹲起并把球带回来，核心是安全空间内的身体移动。 |
| 找大水果放篮子 (`act_126_水果寻宝`) | `wait_for_response`, `hands_on_action` | `lang_comprehension` | — | 听到熟悉水果名称后有机会指向或拿来相应物品；这是理解机会而非理解已被证明。 |
| 两样选一样 (`gap_choose_two`) | `self_choice` | `lang_expression` | — | 孩子有机会用动作、声音或词表达选择；不要求一定开口，也不推断语言理解。 |
| 接住她的一个词 (`gap_expand_one_word`) | `language_expansion` | `lang_expression` | — | 玩法从孩子自发词语开始，成人扩展原意，提供继续表达的机会。 |
| 停一停，等你说再来 (`gap_request_again`) | `wait_for_response` | `lang_expression` | — | 短暂停顿提供孩子表达‘再来’的机会，手势和声音也算表达，不要求说词。 |
| 厚页绘本共读 (`act_122_厚页绘本共读`) | `joint_attention`, `wait_for_response` | `lang_comprehension` | — | 听到熟悉名称后指向相应图画，是本玩法提供的理解与回应机会；不能从共读本身推断已理解。 |

## 3 项 revised 与被否决的能力连接

| 游戏 | 审核修订 | 当前状态 |
| --- | --- | --- |
| 一起做小家务 (`act_2_家务变游戏`) | 主能力由精细动作改为社会关系；精细动作降为次要。主玩法是一起/轮流收拾，不把拿放物品当核心发展目标。 | `revised`；机制 `hands_on_action`, `turn_taking`；主 `emo_social_relationships`；次 `mov_fine_motor` |
| 轮流拍大鼓 (`gap_drum_turn`) | 保留社会关系；移除社会认知。成人说“轮到你”不足以确认孩子理解轮流规则。 | `revised`；机制 `turn_taking`；主 `emo_social_relationships`；次 无 |
| 简易配对 (`act_123_简易配对`) | 保留感知注意；移除问题解决。现有步骤偏成人给出袜子和提问，缺少孩子尝试、纠正或独立寻找匹配关系的明确过程。 | `revised`；机制 `simple_matching`；主 `int_perceptual_attention`；次 无 |

**被拒绝的典型连接**：`gap_drum_turn → emo_social_cognition`、`act_123_简易配对 → int_problem_solving`；“一起做小家务的精细动作是主体验”的原归属也被否决。没有把这些可疑连接留作已批准的次要能力。

## 6 项 unmapped 与 taxonomy 最小补齐

| 游戏 | 审核结果 |
| --- | --- |
| 大布片触摸盒 (`act_33_室内沙粒盒`) | 已核对清理后为完整大布片触摸；新增触感探索机制仅描述玩法，没有足够具体的能力表现目标，继续 unmapped。 |
| 大物件触感托盘 (`act_38_感官游戏大混战`) | 已核对清理后为大物件触摸托盘；新增触感探索机制不自动推出注意或精细动作能力，继续 unmapped。 |
| 假装游戏 (`act_1_假装游戏`) | 新增简单假装机制描述勺、碗、娃娃的代表性动作；21个月创意脑完整能力仍 future，因此只保留前身体验，正式能力继续 unmapped。 |
| 橡皮泥杯子蛋糕 (`act_113_橡皮泥杯子蛋糕_2_`) | 现有步骤只有一句塑形，无法确认具体机制与安全操作方式，继续 unmapped。 |
| 撕彩纸贴贴乐 (`act_128_撕彩纸贴贴乐`) | 小纸碎片和胶水操作仍待内容安全复核，不因可能有手部操作而批准能力映射，继续 unmapped。 |
| 看见什么，说什么 (`act_12_场景旁白沟通`) | 主要是成人旁白；没有要求孩子作可辨识语言回应，不能挂语言理解或表达，继续 unmapped。 |

现有 10 种机制之外只新增两项：

- `sensory_exploration`：通过触摸、按压、抓握、比较质地等操作探索物体特征；用于两项完整大物件触感玩法。定义不包含“感觉统合训练”等专业效果承诺。
- `pretend_play`：用物体、动作或角色代表简单现实情境；用于假装喂娃娃。21 个月只留 `precursor_experience`，不挂三项完整创意脑能力。

机制字段只描述家长和孩子发生的互动。新增机制没有自动产生能力连接；两项触感活动及假装游戏仍是 `unmapped`。既有五主题映射未变，脑科学知识仍无 approved 条目。

## 最终 approved 覆盖

按 11 条 approved 记录统计，不计 revised 与 unmapped；同一游戏可涉及两个脑。

| 五脑 | approved 游戏数 |
| --- | ---: |
| 智力脑 | 1 |
| 创意脑完整能力 | 0 |
| 语言脑 | 6 |
| 情绪脑 | 2 |
| 运动脑 | 4 |

已批准的正式子能力为 **5/19**：`int_perceptual_attention` 1、`lang_comprehension` 3、`lang_expression` 3、`emo_social_relationships` 2、`mov_gross_motor` 4。**记忆学习仍为 0，问题解决也为 0。** 藏猫猫使用当下可见/可听线索，不要求隔时记住位置；配对玩法当前没有足够明确的独立试错过程。上述是游戏内容的映射覆盖缺口，不等于小宝的能力缺口，也不据此改写游戏。

创意脑三项在 21 个月仍为 `future`；阅读准备等 `early_signal_only` 仅留早期体验候选，不成为正式主/次能力。所有已批准主/次能力均通过现有 21 个月年龄状态校验。

## 与正式产品隔离及测试

`activity-five-brain-mappings.json` 和审核 adapter 仍未被网页、推荐算法、周计划或 Growth V2 加载。`approved` 只是本试点数据的审核状态，**不代表已在产品中启用**。Today 排序、周计划 focus/快照、成长 evidence、五维状态、游戏收藏和反馈逻辑未改。旧备份不含该静态映射文件，兼容路径不变。

`scripts/five-brain-activity-pilot.test.js` **12 项通过**；知识底座的机制读取专项 **15 项通过**；`bash check.sh` **全套通过**。覆盖审核状态与理由、主次能力上限、机制合法性、future/early 年龄边界、canonical/alias、创意前身、触感定义、游戏收藏/反馈不写成长 evidence，以及正式页面未接入映射。没有修改推荐行为。
