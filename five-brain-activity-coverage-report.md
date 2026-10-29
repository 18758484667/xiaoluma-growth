# Phase 3.3C2｜21个月游戏五脑成长经验覆盖报告

日期：2026-10-28。仅审计**活动提供的适龄成长经验**；这是内容供给矩阵，不是小宝的能力评估。候选先记录在 `data/activity-five-brain-candidates-batch2.json`，逐项复核结果写入 `data/activity-five-brain-mappings-batch2.json`。所有 `approved` 的审核来源明确标为 `codex_content_review`；用户或专业人员最终人工验收仍待完成。

## 范围与结论

- 21个月现有安全适龄且未进入首批的 canonical 游戏有 39 个；选出玩法、步骤与场景较清晰的 **30 个**。其余 9 个因小物件/碎片、胶带或涉水复核，或步骤仅一句话等原因未入本批；未改原游戏内容。
- 本批：**24 approved、1 revised、0 rejected、5 unmapped**。首批 11 approved 不变，累计 **35 个不同 canonical** 获本轮审核通过；variant/alias 不另计。
- 唯一 `revised` 为叠叠杯：手部操作清楚，但步骤未明确孩子在失败后如何调整，问题解决不计入 approved 覆盖。
- 五脑累计 approved 游戏涉及：智力脑 2、创意脑完整能力 0、语言脑 8、情绪脑 7、运动脑 22。一个游戏可关联多个脑；各列不应相加当作总数。

## 21个月九项 active ability 内容覆盖

开发门槛：0 = `gap`；1–2 = `limited`；3+ 且至少 2 种**实际连接该能力的** mechanism = `usable`；其他为 `limited`。只判断未来推荐候选池，不判断儿童发展状态。

| 能力 | Approved games | 有效 mechanism | 精力档位 | 场景 | 内容供给状态 |
| --- | ---: | --- | --- | --- | --- |
| 感知注意 (`int_perceptual_attention`) | 2 | `joint_attention`, `search_and_find` | low, medium | indoor, outdoor | `limited` |
| 问题解决 (`int_problem_solving`) | 0 | — | — | — | `gap` |
| 记忆学习 (`int_memory_learning`) | 0 | — | — | — | `gap` |
| 语言理解 (`lang_comprehension`) | 4 | `joint_attention`, `wait_for_response` | low, medium | indoor, mealtime, on_the_go | `usable` |
| 语言表达 (`lang_expression`) | 4 | `language_expansion`, `self_choice`, `wait_for_response` | low | indoor | `usable` |
| 社会认知 (`emo_social_cognition`) | 2 | `imitation` | low | indoor, on_the_go, outdoor | `limited` |
| 社会关系 (`emo_social_relationships`) | 5 | `turn_taking` | low, medium | indoor, outdoor | `limited` |
| 粗大运动 (`mov_gross_motor`) | 20 | `active_movement` | high, low, medium | indoor, on_the_go, outdoor | `limited` |
| 精细动作 (`mov_fine_motor`) | 2 | `hands_on_action` | medium | indoor | `limited` |

结果：`usable` **2**（语言理解、语言表达），`limited` **5**（感知注意、社会认知、社会关系、粗大运动、精细动作），`gap` **2**（问题解决、记忆学习）。粗大运动虽有 20 个 approved 游戏、低/中/高精力及室内/户外/途中场景，但全部经 `active_movement` 一种机制进入，按保守门槛仍是 limited；这提醒未来推荐不能只按活动数量评估多样性。语言表达有 3 种机制，但当前 approved 池只有室内、low effort；场景扩展仍需内容审核。

## 四个重点能力核查

- **记忆学习：0。**已审游戏没有明确“先见到或经历、间隔后再用、没有成人持续提示”的完整玩法过程。可见物品即时拿取、普通配对、藏猫猫都未被强贴记忆。`content_coverage_gap` 保留。
- **问题解决：0。**叠叠杯只写“试着套入”，缺少失败后调整的明确步骤，保留 `revised`，不算 approved。原试点的袜子配对也仍是 revised。没有因为题目像谜题就批准。
- **语言理解 4 / 表达 4。**理解要求词语/短句与孩子的指向或动作相连；表达要求孩子有机会主动用看、指、动作、声音或词回应。仅成人旁白不被算作表达。
- **社会认知 2 / 社会关系 5。**前者仅限注意成人动作并自愿模仿；后者要求滚球、弹琴或招呼等实际来回。成人在旁、并行玩不算关系证据。

## 第二批逐项审核

| 游戏 | 机制 | 正式主 / 次能力 | 结果 | 核心复核结论 |
| --- | --- | --- | --- | --- |
| 手指谣与歌曲 (`act_3_手指谣与歌曲`) | `imitation` | emo_social_cognition / 无 | `approved` | 可确认看成人动作再回应；歌声本身不支持语言理解/表达。 |
| 材质触摸分辨 (`act_5_材质触摸分辨`) | `sensory_exploration` | 无 / 无 | `unmapped` | 触摸不同完整材料的机制明确；没有足够具体的注意或手部能力要求，保持未映射。 |
| 叠叠杯排序 (`act_10_叠叠杯排序`) | `hands_on_action` | mov_fine_motor / int_problem_solving | `revised` | 主体验明确；问题解决只留 revised 候选，不能计入 approved 覆盖。 |
| 积木塔 (`act_13_积木塔`) | `hands_on_action` | mov_fine_motor / 无 | `approved` | 倒塌后没有明确重试路径，不挂问题解决。 |
| 乐高大颗粒娃娃屋 (`act_25_乐高大颗粒娃娃屋`) | `pretend_play`, `hands_on_action` | 无 / 无 | `unmapped` | 娃娃进出矮屋是简单假装前身；大块积木由成人搭屋角，不能把搭建能力归给孩子。 |
| 靠垫桥 (`act_80_靠垫桥`) | `active_movement` | mov_gross_motor / 无 | `approved` | 只读现有安全修订后的低矮地面玩法，不推断体适能。 |
| 地面靠垫小角落 (`act_89_靠垫房屋`) | `active_movement` | mov_gross_motor / 无 | `approved` | 仅依据坐上和走下的真实步骤；给玩具找位置不自动推断寻找能力。 |
| 和爸爸乱弹吉他 (`act_105_和爸爸乱弹吉他`) | `turn_taking`, `hands_on_action` | emo_social_relationships / mov_fine_motor | `approved` | 两人交替为主，手指拨弦为次；只使用现有成人持琴安全前提。 |
| 抛接球互动 (`act_119_抛接球互动`) | `turn_taking` | emo_social_relationships / 无 | `approved` | 这里主要是滚球往返；不因球的存在挂粗大运动。 |
| 你做我也做 (`act_124_动作模仿游戏`) | `imitation` | emo_social_cognition / 无 | `approved` | 仅限注意他人动作并回应的基础社会认知，不推断成熟观点采择。 |
| 障碍爬行大冒险 (`act_129_障碍爬行大冒险`) | `active_movement` | mov_gross_motor / 无 | `approved` | 成人清空地面并全程接应；没有孩子自行解决路线障碍的步骤。 |
| 软玩具搬运站 (`gm_soft_toy_delivery`) | `active_movement` | mov_gross_motor / 无 | `approved` | 选择搬哪件不等于明确语言表达或执行功能目标。 |
| 蹲下捡进篮子 (`gm_squat_basket`) | `active_movement` | mov_gross_motor / 无 | `approved` | 成人指出目标，不推断独立寻找或问题解决。 |
| 找到小熊送回来 (`gm_find_bear_return`) | `active_movement`, `wait_for_response` | mov_gross_motor / lang_comprehension | `approved` | 小熊全程可见；不挂记忆学习。语言理解是由具体词语与拿来动作连接的次要机会。 |
| 坐着陪她踢软球 (`gm_seated_soft_kick`) | `active_movement` | mov_gross_motor / 无 | `approved` | 成人坐着参与不等于孩子与成人有明确轮流规则。 |
| 音乐走走停停 (`gm_music_walk_stop`) | `active_movement` | mov_gross_motor / 无 | `approved` | 步骤明确不要求遵守停走规则，因此不挂执行功能。 |
| 推空纸箱送货 (`gm_push_empty_box`) | `active_movement` | mov_gross_motor / 无 | `approved` | 成人指终点，没有孩子自行寻找路径或调整办法的步骤。 |
| 到安全处自己走一段 (`gm_walk_from_stroller`) | `active_movement` | mov_gross_motor / 无 | `approved` | 作为移动经验，不推断体适能或自控能力。 |
| 走到那边看看 (`gm_walk_to_tree`) | `active_movement` | mov_gross_motor / 无 | `approved` | 树始终可见，不能当成寻找/记忆任务。 |
| 走走捡两三片大树叶 (`gm_leaf_collect`) | `active_movement` | mov_gross_motor / 无 | `approved` | 具体身体移动为核心；不因“找叶子”标题外延记忆或问题解决。 |
| 小坡走上走下 (`gm_gentle_slope`) | `active_movement` | mov_gross_motor / 无 | `approved` | 现有安全条件必须继续生效；不把活动映射成体适能评估。 |
| 地面低矮软垫路线 (`gm_low_soft_course`) | `active_movement` | mov_gross_motor / 无 | `approved` | 路线由成人设置且引导，不挂问题解决。 |
| 稳固低台阶上下 (`gm_low_step_up_down`) | `active_movement` | mov_gross_motor / 无 | `approved` | 只映射受保护的身体移动经验，不把它当成达标练习。 |
| 声音你来我来 (`gap_sound_reply`) | `wait_for_response`, `imitation` | lang_expression / 无 | `approved` | 表达方式不限定口语；仅成人模仿孩子不足以给孩子挂成熟社会认知。 |
| 在旁边各玩一份 (`gap_parallel_play`) | — | 无 / 无 | `unmapped` | 两个孩子各自玩相似材料但不要求来回互动；现有机制缺 parallel_play，且不能仅因成人在场挂社会关系。 |
| 一起抬空篮子 (`gap_carry_together`) | — | 无 / 无 | `unmapped` | 成人和孩子共扶空篮并移动是真实协同动作，现有机制缺 cooperative_action；不为覆盖强塞轮流或共同注意。 |
| 门口打个招呼 (`gap_greeting_reply`) | `turn_taking` | emo_social_relationships / 无 | `approved` | 不要求孩子必须打招呼；不从一次回应推断成熟社会认知。 |
| 踩大脚印走两步 (`gap_big_footprints`) | `active_movement` | mov_gross_motor / 无 | `approved` | 成人坐在旁边，不将听指令或认识图形作为能力目标。 |
| 碰一碰大布片 (`gap_reach_big_cloth`) | — | 无 / 无 | `unmapped` | 站立伸手触碰布片既非现有 active_movement 的走追搬，也不是明确的 hands_on_action 操作；记录 reaching_balance taxonomy gap，不强贴能力。 |
| 转身找大图 (`gap_turn_to_picture`) | `joint_attention` | int_perceptual_attention / 无 | `approved` | 没有比较、隐藏或记忆步骤；不加问题解决/记忆。 |

## 前身、early/future 与 taxonomy 边界

- `act_25_乐高大颗粒娃娃屋` 只记录简单假装 `precursor_experience`，不挂任何 21 个月 `future` 创意脑完整能力。
- 本批没有足够明确的 `early_signal_only` 专门体验可独立记录；没有把走走停停写成执行功能训练、把弹吉他写成书写准备，也没有把移动量写成体适能等级。
- 原 12 种机制足以解释 24 个 approved 游戏；本批**没有新增 taxonomy**。但 3 类值得后续评估：`parallel_play`（附近各玩一份）、`cooperative_action`（共抬空篮）、`reaching_balance`（站立伸手触布）。它们留为 `taxonomy_gap`，不因单个游戏扩表，也不强塞到 `turn_taking` 或 `active_movement`。

## 当前真实内容缺口与迁移建议

1. `content_coverage_gap`：记忆学习、问题解决没有 approved 游戏。若未来要补，应先由内容审核明确真实的间隔回忆或自发试错步骤；本轮未改文案、未生成新游戏。
2. 感知注意仅 2 个可靠游戏；社会认知只靠模仿一种机制；精细动作仅 2 个且均为室内 medium。
3. 社会关系虽有 5 个，但机制集中在轮流；粗大运动数量多而机制单一。
4. 本轮**不建议据此进入正式五脑推荐迁移**：九项 active 能力只有 2 项满足保守的池可用门槛，智力脑关键两项仍是 gap；全部批准状态仍待用户或专业人工验收。

## 行为隔离与测试

- 本轮只增加静态候选、静态审核映射、只读覆盖计算与测试；未修改游戏正文、安全说明、effort、月龄范围、首页、Growth V2、周计划或推荐排序。
- 映射数据不在产品 HTML 加载。游戏浏览、收藏、反馈不产生五脑或旧成长 evidence；周计划引用不会凭活动生成能力记录。
- `scripts/five-brain-activity-coverage.test.js` 覆盖候选与审核独立、active/early/future、记忆与问题解决严格依据、语言和社会两类区分、主次上限、机制合法性、canonical/alias、推荐与周计划输出不变、成长 evidence 不写入。
- `scripts/five-brain-activity-coverage.test.js` **12 项通过、0 失败**；`bash check.sh` **全套通过**，包含既有成长 Golden Cases、收藏/反馈、推荐轮换、周计划、Growth V2 和五脑基座/首批试点专项。
