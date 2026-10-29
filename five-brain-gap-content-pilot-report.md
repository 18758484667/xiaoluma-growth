# Phase 3.3C 内容缺口定向补齐｜审核报告

日期：2026-10-28。范围：仅 21 个月“问题解决”和“记忆学习”的六项用户指定设计。当前正式安全游戏池仍为 54 个；本轮内容保存在独立审核数据，不被正式页面加载。游戏提供成长经验，不能替代家长记录的真实行为 evidence。

## 查重与内容去向

审查现有 canonical、variants、aliases、受限/撤出活动的材料、步骤和核心互动后，六项处理如下：

| 设计 | 决策 | 对照的已有内容与理由 | 五脑映射审核 |
| --- | --- | --- | --- |
| 大盒子怎么打开 | `new_canonical`：`gap_open_big_box` | `gap_request_again_open` 是等孩子表达“打开”后成人帮开；`act_33_室内沙粒盒` 是敞口触摸盒，均无孩子独立尝试开盖。 | **approved**：问题解决主项；精细动作次项。 |
| 哪个杯子能套进去 | `add_as_variant`：`act_10_叠叠杯排序` | 已有套杯核心玩法；旧步骤先示范按大小排序。本变化取消给出答案，保留套不进后自己换杯或方向。 | **revised**：变化本身有问题解决过程；现有 canonical 级映射不能把变化特有过程外推到旧主游戏。 |
| 绕过去拿球 | `new_canonical`：`gap_detour_soft_ball` | `gm_low_soft_course`、`act_118_居家障碍闯关` 是预设地面路线；`gm_find_bear_return` 是可见目标往返。没有“正面受阻后自己选侧路”的同一核心机制。 | **approved**：问题解决主项；粗大运动次项。 |
| 玩具藏在哪个大碗下面 | `new_canonical`：`gap_delayed_bowl_find` | `act_75_藏猫猫` 靠可见/可听线索找人，无短暂间隔后使用先前位置的要求。 | **approved**：记忆学习主项；感知注意次项。 |
| 刚才小熊是怎么睡觉的 | `add_as_variant`：`act_1_假装游戏` | 现有假装游戏已含“哄娃娃睡觉”，但没有隔几秒后重现动作；作为玩法变化保留。 | **revised**：当前记忆学习 ontology 只连接 `search_and_find`，不因单项内容私自扩大为 `imitation`。只记简单假装前身，不挂完整创意脑能力。 |
| 小帮手还记得放哪儿 | `add_as_variant`：`gap_delayed_bowl_find` | 与大碗游戏共享“先看位置→短间隔→再找”的核心；差异是生活场景和固定位置。作为变化，不重复建立主游戏。 | **revised**：同一 canonical 不重复计入记忆学习；语言理解只在孩子确实依语言寻找时才可能成立。 |

没有 `rejected_as_duplicate` 或 `rejected_for_safety`。三项待修订映射仍保留内容与原因，不计入已批准覆盖。

## 审核结论与覆盖

- 内容：**3 个新 canonical、3 个 existing/new canonical variants**，均保留稳定拟用 ID；只读审核数据见 `data/five-brain-gap-content-pilot.json`。
- 新试点映射：**3 approved、3 revised、0 rejected**。这些是内容审核层的批准记录，用户与专业审核的最终验收仍可调整。
- 问题解决：原正式映射 **0**；本试点批准 **2 个新 canonical**。按先前内容供给规则仍为 **limited**，未达 3 个且机制多样性不足的 `usable`。
- 记忆学习：原正式映射 **0**；本试点批准 **1 个新 canonical**。生活变化与动作回忆不重复或提前计入，因此仍为 **limited**。
- **正式已上线的五脑映射与 54 个可展示游戏池仍保持原样**：这份审核数据未进入 Today、周计划、游戏库或 Growth；正式统计仍为问题解决 0、记忆学习 0。正式接入前需先决定 variant 条件映射的表达方式并完成人工验收。

## 安全复核

六项仅使用完整大号玩具、轻质圆滑容器和稳定低矮材料。开盒不用瓶盖、药瓶、锁扣或重盖；绕行只在防滑平地摆单个低靠垫并保留两侧通路；藏找不用小贴纸或碎纸；假装游戏不用可脱落纽扣附件。安全词句和使用前检查已写在每项内容中。产品采用谨慎原则：3 岁以下玩具及配件应避免可吞咽小件，材料是否适龄还需实际产品核验，可参考[美国消费品安全委员会的小部件说明](https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Small-Parts-for-Toys-and-Childrens-Products)及[美国儿科学会的玩具安全建议](https://www.healthychildren.org/English/safety-prevention/at-home/Pages/how-to-buy-safe-toys.aspx)。本审核不等于对任意家庭实物作出安全认证。

## 行为和证据边界

记忆玩法只安排数秒的自然间隔，不逐步加长“挑战”；找不到就一起找。问题解决玩法先等孩子自己试，再给予轻提示或局部帮助。测试明确验证：普通浏览、收藏与反馈不会因这份数据创建旧成长或五脑 evidence。只有家长日后主动记录“换手、改方向、短间隔后找回”等具体行为，才可能进入证据映射；游戏成功、被推荐或被收藏均不自动证明能力。

## 测试

`scripts/five-brain-gap-content-pilot.test.js`：**11/11 通过**，覆盖查重、稳定 ID、材料安全、问题解决失败与调整空间、记忆时间间隔、普通藏找区分、创意脑边界、逐项映射理由、21个月年龄安全、游戏操作不写 evidence、正式推荐与周计划源码不变。完整 `./check.sh` 回归通过。没有修改推荐排序、周计划算法、正式游戏正文、五脑 ontology、成长系统或备份数据结构。
