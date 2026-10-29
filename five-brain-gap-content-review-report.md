# Phase 3.3C5-Review｜三项 revised 玩法变化复核

> 本文保留上一轮的审核快照。“小熊睡觉”后续已完成延迟模仿机制复核；当前状态见 [延迟模仿机制复核](deferred-imitation-mechanism-review.md)。

日期：2026-10-28。范围仅限 `data/five-brain-gap-content-pilot.json` 中原 `mapping_status = revised` 的三项；不改其他三项已批准新主游戏，不新增游戏。

## 修改前逐项原因

| Variant（归属主游戏） | 目标 ability | 当前 mechanism | 原来为何未通过 | 问题类型 |
| --- | --- | --- | --- | --- |
| 哪个杯子能套进去（`act_10_叠叠杯排序`） | 问题解决；次项感知注意、精细动作 | `hands_on_action`、`simple_matching` | 变体明确有“套不进→等待→换杯/转向/重试”，但旧主游戏先示范正确顺序；不能把变体独有经验提升为整个 canonical 的能力映射。 | 玩法成立；缺的是 variant 级映射边界，不是步骤不足。 |
| 刚才小熊是怎么睡觉的（`act_1_假装游戏`） | 记忆学习 | `imitation`、`pretend_play` | 步骤已有“看一次→做别的事几秒→再尝试重现”，但现有 ontology 的记忆学习只连接 `search_and_find`。把动作回忆硬称作寻找会错配机制。 | 玩法本身成立；现有机制到 ability 的正式连接尚未审核。 |
| 小帮手还记得放哪儿（`gap_delayed_bowl_find`） | 记忆学习；原次项语言理解 | `search_and_find`、`hands_on_action` | 延迟位置记忆成立，但这是已批准大碗藏找主游戏的生活变化，不应算第二个 canonical；原语言理解次项缺少对应机制路径与独立语言理解依据。 | 玩法成立；需 variant 级记录并删去未充分支持的次项。 |

三项当前步骤都已写明等待或数秒间隔，没有必要为了通过审核改写家长能看到的玩法。以下结论只调整审核数据的作用范围和能力归属。

## 复核处理与最小改动

| Variant | 最终状态 | 实际调整 |
| --- | --- | --- |
| 哪个杯子能套进去 | **approved，仅此 variant** | 步骤和材料不变；新增 `mapping_scope = variant_only` 与问题解决准入检查。原 `act_10_叠叠杯排序` 的先示范玩法不继承映射。 |
| 刚才小熊是怎么睡觉的 | **revised，仅此 variant** | 步骤和材料不变；注明 `variant_only`。时间间隔已成立，但 `imitation/pretend_play → 记忆学习` 不在现有 ontology 的正式机制路径内；不通过改名或硬加 `search_and_find` 来凑覆盖。 |
| 小帮手还记得放哪儿 | **approved，仅此 variant** | 步骤和材料不变；新增 `variant_only` 与记忆准入检查，移除缺少独立依据和机制路径的“语言理解”次项。 |

此处 `approved` 仅指只读内容审核数据中的**玩法变化专属**映射。它不会自动批准或改写所属主游戏的现有五脑映射。三项均未新增材料、改变核心玩法或增加训练要求。

## 内容供给重新计算

按**不同 canonical** 去重，不能把一个主游戏的两个变化计作两个游戏：

| 21个月内容目标 | 通过的 canonical | 对应机制 | 内容状态 |
| --- | --- | --- | --- |
| 问题解决 | 3：大盒子怎么打开、绕过去拿球、叠叠杯排序的特定变化 | `hands_on_action`、`simple_matching` | **usable**：3 个、至少 2 种机制。旧主游戏其他玩法不因此获得问题解决标签。 |
| 记忆学习 | 1：玩具藏在哪个大碗下面及其生活变化 | `search_and_find` | **limited**：生活变化不重复计数；小熊动作回忆仍待机制路径审核。 |

内容门槛只描述未来可选游戏的供给，不评价小宝的能力。此前正式产品的 approved 映射中两项仍为 0；新审核数据没有接入正式游戏库或五脑展示。六项中现为 **5 approved、1 revised、0 rejected**（其中本轮把原 3 revised 处理为 2 approved、1 revised）。

## 安全、上线建议与行为隔离

修订前后材料、步骤完全不变，继续只用完整大件、轻质容器和安全平地。建议将已批准的三项新主游戏和两个通过的玩法变化作为下一次**游戏库内容并入**候选；并入前需核验家庭实际材料尺寸、轻盖防夹手及稳定低靠垫。小熊变化可作为普通假装玩法候选，但不得带记忆学习五脑标签。**本轮不正式并入**，也不接入 Today、weekly plan、Growth V2 或推荐排序。

`data/five-brain-gap-content-pilot.json` 只读保存审核结果；`scripts/five-brain-gap-content-review.test.js` 验证三项边界、机制、21个月池保持 54、游戏操作不写 evidence、正式推荐与周计划结果不因读取审核数据改变。完整 `./check.sh` 结果见本轮交付记录。
