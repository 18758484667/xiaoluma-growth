# 发育内容审计清单

生成依据：当前工作区 `CAPABILITIES` 与 `DEVELOPMENT_GUIDE_CONTENT`，未改写任何产品内容。审计日期：2026-10-24。这里的 `source_level` 是**审计推断**，代码尚无该字段；“可触发”描述当前实现，不代表医学有效性。

能力 17 项；指南 6 个阶段；玩具／材料 13 项。全局缓冲期为 4 个月，代码未按来源或单项设置。

## Capability 全量清单

每项的“当前用途”包括动态月度评估、证据关联与五维状态。`min_age_months` 用于选题，不等于官方达标年龄；典型窗口和缓冲期由产品算法解释。

### 18～20 月龄：对应锚点

#### motor_stairs｜扶着墙或栏杆上楼梯

| 字段 | 当前值 |
| --- | --- |
| capability_id | motor_stairs |
| 中文名称 | 扶着墙或栏杆上楼梯 |
| domain | motor（大运动） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 18～20、21～23、24～26 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### fine_lid｜会用手拧开大瓶盖或操作旋转物

| 字段 | 当前值 |
| --- | --- |
| capability_id | fine_lid |
| 中文名称 | 会用手拧开大瓶盖或操作旋转物 |
| domain | fine（精细动作） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；未进入指南正文 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### fine_spoon｜尝试使用勺子进食

| 字段 | 当前值 |
| --- | --- |
| capability_id | fine_spoon |
| 中文名称 | 尝试使用勺子进食 |
| domain | fine（精细动作） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | normal |
| source | CDC Learn the Signs. Act Early. 18 months: Tries to use a spoon |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 18～20 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 不能凭 not_yet；“倒退”文字可触发 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/18-months.html)。

#### lang_words｜能说出至少3个有意义的词

| 字段 | 当前值 |
| --- | --- |
| capability_id | lang_words |
| 中文名称 | 能说出至少3个有意义的词 |
| domain | lang（语言沟通） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 18～20 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### cog_object_use｜知道梳子、勺子、电话等常用物品的用途

| 字段 | 当前值 |
| --- | --- |
| capability_id | cog_object_use |
| 中文名称 | 知道梳子、勺子、电话等常用物品的用途 |
| domain | cog（认知探索） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 18～20、21～23、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### soc_ball｜能和家人玩来回传球等互动游戏

| 字段 | 当前值 |
| --- | --- |
| capability_id | soc_ball |
| 中文名称 | 能和家人玩来回传球等互动游戏 |
| domain | soc（社会交往／情绪） |
| min_age_months | 15 |
| typical_age_start | 15 |
| typical_age_end | 18 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 18～20、21～23、24～26、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

### 21～23 月龄：无新增固定锚点；见本阶段指南

本阶段没有首次对应的固定年龄锚点；已有能力仍可能作为生活机会或回顾内容。

### 24～26 月龄：对应锚点

#### motor_run｜会跑

| 字段 | 当前值 |
| --- | --- |
| capability_id | motor_run |
| 中文名称 | 会跑 |
| domain | motor（大运动） |
| min_age_months | 20 |
| typical_age_start | 20 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | CDC Learn the Signs. Act Early. 2 years: Runs |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 21～23、24～26、27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/2-years.html)。

#### motor_jump｜尝试双脚同时离地跳起

| 字段 | 当前值 |
| --- | --- |
| capability_id | motor_jump |
| 中文名称 | 尝试双脚同时离地跳起 |
| domain | motor（大运动） |
| min_age_months | 20 |
| typical_age_start | 24 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 24～26 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### fine_spoon_eat｜会用勺子吃饭

| 字段 | 当前值 |
| --- | --- |
| capability_id | fine_spoon_eat |
| 中文名称 | 会用勺子吃饭 |
| domain | fine（精细动作） |
| min_age_months | 20 |
| typical_age_start | 20 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | normal |
| source | CDC Learn the Signs. Act Early. 2 years: Eats with a spoon |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 21～23、24～26 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 不能凭 not_yet；“倒退”文字可触发 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/2-years.html)。

#### fine_pages｜能一页页翻书

| 字段 | 当前值 |
| --- | --- |
| capability_id | fine_pages |
| 中文名称 | 能一页页翻书 |
| domain | fine（精细动作） |
| min_age_months | 20 |
| typical_age_start | 20 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志 |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 21～23、24～26、27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

#### lang_two_words｜能把至少两个词组合在一起

| 字段 | 当前值 |
| --- | --- |
| capability_id | lang_two_words |
| 中文名称 | 能把至少两个词组合在一起 |
| domain | lang（语言沟通） |
| min_age_months | 20 |
| typical_age_start | 20 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | CDC Learn the Signs. Act Early. 2 years: Says at least two words together |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 21～23、24～26、27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/2-years.html)。

#### cog_pretend｜会用娃娃或安全日用品玩简单假装游戏

| 字段 | 当前值 |
| --- | --- |
| capability_id | cog_pretend |
| 中文名称 | 会用娃娃或安全日用品玩简单假装游戏 |
| domain | cog（认知探索） |
| min_age_months | 20 |
| typical_age_start | 20 |
| typical_age_end | 24 |
| grace period | 全局 4 个月；非来源原文  |
| importance | key |
| source | 根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述 |
| source_type | adapted_anchor |
| source_level | 官方内容的产品改写 |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 21～23、24～26、27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。

### 27～29 月龄：无新增固定锚点；见本阶段指南

本阶段没有首次对应的固定年龄锚点；已有能力仍可能作为生活机会或回顾内容。

### 30～32 月龄：对应锚点

#### cog_color_one｜知道至少一种颜色

| 字段 | 当前值 |
| --- | --- |
| capability_id | cog_color_one |
| 中文名称 | 知道至少一种颜色 |
| domain | cog（认知探索） |
| min_age_months | 30 |
| typical_age_start | 30 |
| typical_age_end | 30 |
| grace period | 全局 4 个月；非来源原文  |
| importance | normal |
| source | CDC Learn the Signs. Act Early. 30 months: Shows he knows at least one color |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 不能凭 not_yet；“倒退”文字可触发 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/30-months.html)。

#### soc_peers｜会在其他小朋友旁边玩，有时也会一起玩

| 字段 | 当前值 |
| --- | --- |
| capability_id | soc_peers |
| 中文名称 | 会在其他小朋友旁边玩，有时也会一起玩 |
| domain | soc（社会交往／情绪） |
| min_age_months | 30 |
| typical_age_start | 30 |
| typical_age_end | 30 |
| grace period | 全局 4 个月；非来源原文  |
| importance | normal |
| source | CDC Learn the Signs. Act Early. 30 months: Plays next to other children and sometimes plays with them |
| source_type | official_anchor |
| source_level | 官方锚点（产品标签需核对原文） |
| 当前产品如何使用 | 月度选题／证据关联／领域状态；指南涉及 27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 是；按 future／current／grace／overdue 阶段 |
| 是否可触发 watch | 关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突 |
| 是否可触发 concern | 不能凭 not_yet；“倒退”文字可触发 |
| 是否可作为 next_observation | 非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序 |
| 是否可作为 monthly_focus | 可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入 |

原始来源：[查看官方材料](https://www.cdc.gov/act-early/milestones/30-months.html)。

### 33～36 月龄：无新增固定锚点；见本阶段指南

本阶段没有首次对应的固定年龄锚点；已有能力仍可能作为生活机会或回顾内容。

### 无固定年龄窗口：产品观察项

这些项目不能被硬塞进上述年龄段；可在多个阶段作为日常记录，未设置官方典型年龄。

#### lang_request｜会用手势、声音或词语主动表达需求

| 字段 | 当前值 |
| --- | --- |
| capability_id | lang_request |
| 中文名称 | 会用手势、声音或词语主动表达需求 |
| domain | lang（语言沟通） |
| min_age_months | 未设置 |
| typical_age_start | 未设置 |
| typical_age_end | 未设置 |
| grace period | 不适用 |
| importance | normal |
| source | 产品观察项；可关联指物、手势、有意义词汇和两词组合 |
| source_type | product_observation |
| source_level | 产品观察项；非官方年龄锚点 |
| 当前产品如何使用 | 日常证据／领域正向证据；不在指南阶段正文 |
| 是否参与状态判定 | 正向证据可参与；not_yet 无年龄窗负向评分 |
| 是否可触发 watch | 不能凭 not_yet；无年龄窗 |
| 是否可触发 concern | 不能凭 not_yet；文字匹配“倒退”仍可能触发 |
| 是否可作为 next_observation | 可能（unknown 阶段未排除；需复核） |
| 是否可作为 monthly_focus | 不直接；可能影响领域正向证据 |

#### cog_sort｜尝试按特征进行简单配对或分类

| 字段 | 当前值 |
| --- | --- |
| capability_id | cog_sort |
| 中文名称 | 尝试按特征进行简单配对或分类 |
| domain | cog（认知探索） |
| min_age_months | 未设置 |
| typical_age_start | 未设置 |
| typical_age_end | 未设置 |
| grace period | 不适用 |
| importance | normal |
| source | 产品认知探索观察项；暂无足够依据设定严格月龄窗口 |
| source_type | product_observation |
| source_level | 产品观察项；非官方年龄锚点 |
| 当前产品如何使用 | 日常证据／领域正向证据；指南机会涉及 27～29、30～32、33～36 月龄 |
| 是否参与状态判定 | 正向证据可参与；not_yet 无年龄窗负向评分 |
| 是否可触发 watch | 不能凭 not_yet；无年龄窗 |
| 是否可触发 concern | 不能凭 not_yet；文字匹配“倒退”仍可能触发 |
| 是否可作为 next_observation | 可能（unknown 阶段未排除；需复核） |
| 是否可作为 monthly_focus | 不直接；可能影响领域正向证据 |

#### soc_emotion｜会用表情、动作或词语表达高兴、生气等情绪

| 字段 | 当前值 |
| --- | --- |
| capability_id | soc_emotion |
| 中文名称 | 会用表情、动作或词语表达高兴、生气等情绪 |
| domain | soc（社会交往／情绪） |
| min_age_months | 未设置 |
| typical_age_start | 未设置 |
| typical_age_end | 未设置 |
| grace period | 不适用 |
| importance | normal |
| source | 产品社会情绪观察项；不设精确官方月龄窗口 |
| source_type | product_observation |
| source_level | 产品观察项；非官方年龄锚点 |
| 当前产品如何使用 | 日常证据／领域正向证据；不在指南阶段正文 |
| 是否参与状态判定 | 正向证据可参与；not_yet 无年龄窗负向评分 |
| 是否可触发 watch | 不能凭 not_yet；无年龄窗 |
| 是否可触发 concern | 不能凭 not_yet；文字匹配“倒退”仍可能触发 |
| 是否可作为 next_observation | 可能（unknown 阶段未排除；需复核） |
| 是否可作为 monthly_focus | 不直接；可能影响领域正向证据 |

## Phase 1.9 指南全量内容（逐阶段原文）

### 18～20 月龄｜从熟悉的动作，走向更多主动尝试

阶段说明：参考18月龄锚点，观察她如何在日常活动里继续积累；接近24月龄的表现可以慢慢出现。

#### 五领域发育要点

- **大运动**：可以在保护下尝试扶着上低台阶。（motor_stairs）
- **精细动作**：可以逐渐尝试自己拿勺子吃几口。（fine_spoon）
- **语言沟通**：不少孩子会用更多有意义的词表达。（lang_words）
- **认知探索**：可以在生活里认识梳子、勺子等物品的用途。（cog_object_use）
- **社会交往／情绪**：可以继续和家人玩来回传球。（soc_ball）

#### 机会（opportunities）

- 用大号软球来回滚，等她把球送回来。（关联：soc_ball）
- 吃饭时把勺子交给她，洒出来也没关系。（关联：fine_spoon）
- 洗澡时顺着她看到的地方说身体部位。（关联：lang_words）
- 让她帮忙递一件衣服或拿一只大碗。（关联：cog_object_use）
- 走到安全的低台阶旁，让她扶着慢慢试。（关联：motor_stairs）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；大号叠叠杯（stacking_cups；替代：尺寸较大的塑料碗）；大块积木（large_blocks；替代：大号纸箱）；耐翻绘本（picture_books；替代：家里现有的大幅图片）
- **缺少时考虑**：布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）；干净毛巾（towel；替代：无）

#### 生活参与（life participation）

- 吃饭时自己拿勺子试几口
- 收衣服时递一件衣物
- 洗澡时一起说说身体部位

#### 观察点（observe points）

- 顺便看看她怎样扶着上下低台阶。（motor_stairs）
- 留意她有没有用词语或动作主动表达。（lang_words）
- 看看来回滚球时是否愿意再接一次。（soc_ball）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 大号叠叠杯：选择完整、无可拆小配件的杯子。（标称最小部件 5 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- 干净毛巾：玩藏找时保持脸部与呼吸顺畅。（标称最小部件 15 cm；适用 18～36 月龄）
- source_refs：motor_stairs（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）；fine_spoon（CDC Learn the Signs. Act Early. 18 months: Tries to use a spoon）；lang_words（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）；cog_object_use（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）；soc_ball（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）
- 相关游戏标题：球滚远了，捡回来；假装游戏；家务变游戏

### 21～23 月龄｜从18月龄积累，慢慢走向24月龄表现

阶段说明：参考18月龄与24月龄锚点。这是过渡阶段；开始尝试和反复练习都很自然，不把24月龄标志提前当成要求。

#### 五领域发育要点

- **大运动**：主动移动可以变得更丰富，比如追球、快走。（motor_run）；也可以继续在保护下扶着走低台阶。（motor_stairs）
- **精细动作**：可以慢慢尝试一页页翻书。（fine_pages）；自己用勺子吃饭的机会可以多一些。（fine_spoon_eat）
- **语言沟通**：有些孩子会开始把两个词放在一起。（lang_two_words）
- **认知探索**：日常物品的用途会越来越熟悉。（cog_object_use）；可以开始玩简单的假装情节。（cog_pretend）
- **社会交往／情绪**：和家人轮流滚球、接球，继续感受互动。（soc_ball）

#### 机会（opportunities）

- 把大号软球滚远一点，让她自己走过去捡。（关联：motor_run、soc_ball）
- 共读时等她自己翻页，再说说她指到的画面。（关联：fine_pages、lang_two_words）
- 她想要东西时稍等几秒，接住手势或词语。（关联：lang_two_words）
- 用大碗和勺子，和她一起假装做饭或喂娃娃。（关联：cog_pretend）
- 让她递衣服、搬轻篮子，参与手边的家务。（关联：cog_object_use）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；大号叠叠杯（stacking_cups；替代：尺寸较大的塑料碗）；大块积木（large_blocks；替代：大号纸箱）；耐翻绘本（picture_books；替代：家里现有的大幅图片）；粗杆可水洗蜡笔（chunky_crayons；替代：大张纸和已有的安全画笔）
- **缺少时考虑**：布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）；稳固的推拉玩具（push_pull；替代：装轻衣物的大篮子）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；小篮子（basket；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）；干净毛巾（towel；替代：无）

#### 生活参与（life participation）

- 自己拿勺子吃几口
- 帮忙把衣服放进篮子
- 从两样衣物中选一件
- 洗澡时一起说身体部位

#### 观察点（observe points）

- 看看主动移动的方式是否逐渐丰富。（motor_run）
- 留意她是否开始把两个词连在一起。（lang_two_words）
- 看看假装喂娃娃等情节会不会自然出现。（cog_pretend）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 大号叠叠杯：选择完整、无可拆小配件的杯子。（标称最小部件 5 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 粗杆可水洗蜡笔：选择适龄、完整且不易折断的粗杆款，陪同涂画。（标称最小部件 4 cm；适用 18～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 稳固的推拉玩具：检查结构稳固与活动空间，成人在旁保护。（标称最小部件 10 cm；适用 18～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 小篮子：选边缘光滑、无断裂的篮子。（标称最小部件 12 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- 干净毛巾：玩藏找时保持脸部与呼吸顺畅。（标称最小部件 15 cm；适用 18～36 月龄）
- source_refs：motor_stairs（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）；motor_run（CDC Learn the Signs. Act Early. 2 years: Runs）；fine_pages（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；fine_spoon_eat（CDC Learn the Signs. Act Early. 2 years: Eats with a spoon）；lang_two_words（CDC Learn the Signs. Act Early. 2 years: Says at least two words together）；cog_object_use（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）；cog_pretend（根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述）；soc_ball（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）
- 相关游戏标题：球滚远了，捡回来；假装游戏；家务变游戏

### 24～26 月龄｜继续提供跑跳、表达与假装的机会

阶段说明：参考24月龄锚点；孩子的出现时间和熟练程度各有节奏，游戏与生活仍是主要场景。

#### 五领域发育要点

- **大运动**：可以继续在安全空间里跑动、追球。（motor_run）；有些孩子会开始尝试双脚同时跳起。（motor_jump）
- **精细动作**：翻书与自己用勺子可以变得更熟悉。（fine_pages）；吃饭时继续留一点自己尝试的空间。（fine_spoon_eat）
- **语言沟通**：可以多接住她逐渐出现的两词表达。（lang_two_words）
- **认知探索**：可以用安全日用品玩简单假装游戏。（cog_pretend）
- **社会交往／情绪**：轮流传球仍是轻松的互动机会。（soc_ball）

#### 机会（opportunities）

- 在安全空地滚大球，让她追、停、再送回。（关联：motor_run、soc_ball）
- 读绘本时停一停，让她翻页或接一句话。（关联：fine_pages、lang_two_words）
- 给娃娃和大碗，陪她演一小段生活情节。（关联：cog_pretend）
- 把勺子交给她，允许慢慢吃。（关联：fine_spoon_eat）
- 散步时遇到安全低台阶，陪她自己调整脚步。（关联：motor_stairs）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；大块积木（large_blocks；替代：大号纸箱）；耐翻绘本（picture_books；替代：家里现有的大幅图片）；粗杆可水洗蜡笔（chunky_crayons；替代：大张纸和已有的安全画笔）
- **缺少时考虑**：大块嵌板拼图（large_puzzle；替代：大号纸板图片配对）；布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；小篮子（basket；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）

#### 生活参与（life participation）

- 吃饭时自己用勺子
- 一起把玩具送回篮子
- 外出前自己拿一件衣物
- 洗澡时说说身体部位

#### 观察点（observe points）

- 留意跑动和追球时怎样调整脚步。（motor_run）
- 听听她是否自然把两个词连起来。（lang_two_words）
- 看看假装情节是否会重复出现。（cog_pretend）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 粗杆可水洗蜡笔：选择适龄、完整且不易折断的粗杆款，陪同涂画。（标称最小部件 4 cm；适用 18～36 月龄）
- 大块嵌板拼图：拼块应足够大、无可脱落配件。（标称最小部件 5 cm；适用 24～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 小篮子：选边缘光滑、无断裂的篮子。（标称最小部件 12 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- source_refs：motor_run（CDC Learn the Signs. Act Early. 2 years: Runs）；motor_jump（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；fine_pages（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；fine_spoon_eat（CDC Learn the Signs. Act Early. 2 years: Eats with a spoon）；lang_two_words（CDC Learn the Signs. Act Early. 2 years: Says at least two words together）；cog_pretend（根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述）；soc_ball（国家卫健委《婴幼儿早期发展服务指南（试行）》18月龄标志）
- 相关游戏标题：球滚远了，捡回来；假装游戏；家务变游戏

### 27～29 月龄｜在已有的玩法中加入一点新变化

阶段说明：继续参考24月龄锚点，并为30月龄的观察主题提供自然机会；这里没有另设27、28或29月龄达标线。

#### 五领域发育要点

- **大运动**：跑动、追球时可以慢慢尝试换方向。（motor_run）
- **精细动作**：翻书和大块拼放可以继续玩。（fine_pages）
- **语言沟通**：可以把她说出的短句接长一点。（lang_two_words）
- **认知探索**：假装做饭、照顾娃娃等玩法可以更丰富。（cog_pretend）
- **社会交往／情绪**：可以给她和同伴在旁边玩耍的机会。（soc_peers）

#### 机会（opportunities）

- 用大号纸箱和软球玩藏找、搬运。（关联：motor_run、cog_pretend）
- 和她轮流讲绘本画面里发生的事。（关联：fine_pages、lang_two_words）
- 给大碗、勺子和娃娃，跟着她的假装情节玩。（关联：cog_pretend）
- 把大块物品分到两个篮子里，顺手收纳。（关联：cog_sort）
- 在公园给她与同龄孩子并排玩耍的空间。（关联：soc_peers）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；大块积木（large_blocks；替代：大号纸箱）；耐翻绘本（picture_books；替代：家里现有的大幅图片）；布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）
- **缺少时考虑**：大块嵌板拼图（large_puzzle；替代：大号纸板图片配对）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；小篮子（basket；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）；安全空盒（large_box；替代：无）

#### 生活参与（life participation）

- 把玩具放回篮子
- 帮忙递衣服或拿纸巾
- 吃饭时自己选择勺子和碗
- 外出前从两件衣服中选一件

#### 观察点（observe points）

- 留意假装游戏里会不会出现新情节。（cog_pretend）
- 看看她如何和身边的孩子各自玩或互动。（soc_peers）
- 听听她是否用短句说自己的想法。（lang_two_words）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块嵌板拼图：拼块应足够大、无可脱落配件。（标称最小部件 5 cm；适用 24～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 小篮子：选边缘光滑、无断裂的篮子。（标称最小部件 12 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- 安全空盒：检查边缘和盖子，不使用有夹手风险的硬盖。（标称最小部件 10 cm；适用 18～36 月龄）
- source_refs：motor_run（CDC Learn the Signs. Act Early. 2 years: Runs）；fine_pages（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；lang_two_words（CDC Learn the Signs. Act Early. 2 years: Says at least two words together）；cog_pretend（根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述）；soc_peers（CDC Learn the Signs. Act Early. 30 months: Plays next to other children and sometimes plays with them）
- 相关游戏标题：假装游戏；家务变游戏；球滚远了，捡回来

### 30～32 月龄｜让表达、配对和同伴互动自然展开

阶段说明：参考30月龄锚点；把观察放在熟悉的生活和游戏里，不用逐项测试。

#### 五领域发育要点

- **大运动**：可以继续用跑动和追球玩改变方向的游戏。（motor_run）
- **精细动作**：翻书、拿勺子和大块拼放仍值得继续玩。（fine_pages）
- **语言沟通**：可以多聊她看到、做过的事。（lang_two_words）
- **认知探索**：有些孩子会开始认识一种颜色。（cog_color_one）；假装游戏可以继续延伸。（cog_pretend）
- **社会交往／情绪**：可以和其他孩子在旁边玩，有时也一起玩。（soc_peers）

#### 机会（opportunities）

- 用大块物品玩两类配对，不急着答对。（关联：cog_sort）
- 共读时说说画面里的颜色和人物。（关联：cog_color_one、lang_two_words）
- 和她轮流接着演娃娃的生活故事。（关联：cog_pretend）
- 带大号软球到安全空地玩追与停。（关联：motor_run）
- 有同伴时给她并排玩和短暂互动的空间。（关联：soc_peers）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；耐翻绘本（picture_books；替代：家里现有的大幅图片）；大块积木（large_blocks；替代：大号纸箱）；布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）
- **缺少时考虑**：大块嵌板拼图（large_puzzle；替代：大号纸板图片配对）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；小篮子（basket；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）；干净毛巾（towel；替代：无）

#### 生活参与（life participation）

- 自己选一本书
- 把玩具分到两个大篮子里
- 吃饭时自己拿勺子
- 外出前拿自己的衣物

#### 观察点（observe points）

- 看看她怎样给两样东西找相似处。（cog_sort）
- 留意她是否会认出熟悉的一种颜色。（cog_color_one）
- 看看和同伴在旁边玩时的互动。（soc_peers）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块嵌板拼图：拼块应足够大、无可脱落配件。（标称最小部件 5 cm；适用 24～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 小篮子：选边缘光滑、无断裂的篮子。（标称最小部件 12 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- 干净毛巾：玩藏找时保持脸部与呼吸顺畅。（标称最小部件 15 cm；适用 18～36 月龄）
- source_refs：motor_run（CDC Learn the Signs. Act Early. 2 years: Runs）；fine_pages（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；lang_two_words（CDC Learn the Signs. Act Early. 2 years: Says at least two words together）；cog_color_one（CDC Learn the Signs. Act Early. 30 months: Shows he knows at least one color）；cog_pretend（根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述）；soc_peers（CDC Learn the Signs. Act Early. 30 months: Plays next to other children and sometimes plays with them）
- 相关游戏标题：假装游戏；家务变游戏；动作讲故事

### 33～36 月龄｜把熟悉的生活游戏继续玩深一点

阶段说明：沿用已审核的30月龄观察锚点与现有生活内容；本产品尚未加入独立的33～36月龄官方能力锚点。

#### 五领域发育要点

- **大运动**：继续在安全空间里跑动、追球与变换方向。（motor_run）
- **精细动作**：继续让她翻书、握笔或自己拿勺子。（fine_pages）
- **语言沟通**：一起聊画面、生活事件和她感兴趣的事。（lang_two_words）
- **认知探索**：颜色与物品配对可以放进收纳游戏里。（cog_color_one）；假装情节可以由她来带领。（cog_pretend）
- **社会交往／情绪**：给同伴并排玩与一起玩的机会。（soc_peers）

#### 机会（opportunities）

- 把玩具分到两个大篮子里，边收边聊。（关联：cog_sort）
- 共读时让她自己选书、翻页、讲一段。（关联：fine_pages、lang_two_words）
- 用大碗和娃娃跟着她玩假装生活。（关联：cog_pretend）
- 和其他孩子在安全场地一起滚大球。（关联：soc_peers、soc_ball）
- 外出时让她帮忙拿自己的衣物。（关联：cog_object_use）

#### 玩具／材料建议与替代品

- **已有继续玩**：大号软球（soft_ball；替代：卷起的干净毛巾）；耐翻绘本（picture_books；替代：家里现有的大幅图片）；大块积木（large_blocks；替代：大号纸箱）；布娃娃或角色玩具（doll；替代：干净毛巾卷成的角色）；粗杆可水洗蜡笔（chunky_crayons；替代：大张纸和已有的安全画笔）
- **缺少时考虑**：大块嵌板拼图（large_puzzle；替代：大号纸板图片配对）
- **不买也能玩**：大号纸箱（cardboard_box；替代：无）；小篮子（basket；替代：无）；塑料碗和勺子（bowl_spoon；替代：无）；安全空盒（large_box；替代：无）

#### 生活参与（life participation）

- 自己选一本书
- 帮忙收玩具和衣物
- 自己拿勺子吃饭
- 出门前参与准备随身物品

#### 观察点（observe points）

- 留意她怎样给物品配对或分类。（cog_sort）
- 看看假装游戏会不会出现新的角色和情节。（cog_pretend）
- 留意和其他孩子在旁边玩时的互动。（soc_peers）

#### 安全说明与来源

- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。
- 大号软球：使用完整、柔软的大球；在空旷处玩。（标称最小部件 8 cm；适用 18～36 月龄）
- 耐翻绘本：检查书页边缘与装订，陪同翻看。（标称最小部件 8 cm；适用 18～36 月龄）
- 大块积木：使用适龄的大块、无可脱落配件的积木。（标称最小部件 5 cm；适用 18～36 月龄）
- 布娃娃或角色玩具：选择完整、无可脱落装饰件的玩具。（标称最小部件 8 cm；适用 18～36 月龄）
- 粗杆可水洗蜡笔：选择适龄、完整且不易折断的粗杆款，陪同涂画。（标称最小部件 4 cm；适用 18～36 月龄）
- 大块嵌板拼图：拼块应足够大、无可脱落配件。（标称最小部件 5 cm；适用 24～36 月龄）
- 大号纸箱：去掉订书钉和胶带残留，成人在旁陪玩。（标称最小部件 20 cm；适用 18～36 月龄）
- 小篮子：选边缘光滑、无断裂的篮子。（标称最小部件 12 cm；适用 18～36 月龄）
- 塑料碗和勺子：使用家中完整、适龄的大尺寸餐具。（标称最小部件 5 cm；适用 18～36 月龄）
- 安全空盒：检查边缘和盖子，不使用有夹手风险的硬盖。（标称最小部件 10 cm；适用 18～36 月龄）
- source_refs：motor_run（CDC Learn the Signs. Act Early. 2 years: Runs）；fine_pages（国家卫健委《婴幼儿早期发展服务指南（试行）》24月龄标志）；lang_two_words（CDC Learn the Signs. Act Early. 2 years: Says at least two words together）；cog_color_one（CDC Learn the Signs. Act Early. 30 months: Shows he knows at least one color）；cog_pretend（根据国家卫健委指南24月龄「可玩装扮游戏」做家庭场景化表述）；soc_peers（CDC Learn the Signs. Act Early. 30 months: Plays next to other children and sometimes plays with them）
- 相关游戏标题：动作讲故事；今天做了什么；两步指令游戏

## 材料库总表（全部 13 项）

| ID | 名称 | 年龄 | 最小部件 cm | 替代材料 | 安全说明 | 来源 |
| --- | --- | --- | --- | --- | --- | --- |
| soft_ball | 大号软球 | 18～36 | 8 | 卷起的干净毛巾 | 使用完整、柔软的大球；在空旷处玩。 | 代码未记录逐项外部来源 |
| stacking_cups | 大号叠叠杯 | 18～36 | 5 | 尺寸较大的塑料碗 | 选择完整、无可拆小配件的杯子。 | 代码未记录逐项外部来源 |
| large_blocks | 大块积木 | 18～36 | 5 | 大号纸箱 | 使用适龄的大块、无可脱落配件的积木。 | 代码未记录逐项外部来源 |
| picture_books | 耐翻绘本 | 18～36 | 8 | 家里现有的大幅图片 | 检查书页边缘与装订，陪同翻看。 | 代码未记录逐项外部来源 |
| chunky_crayons | 粗杆可水洗蜡笔 | 18～36 | 4 | 大张纸和已有的安全画笔 | 选择适龄、完整且不易折断的粗杆款，陪同涂画。 | 代码未记录逐项外部来源 |
| large_puzzle | 大块嵌板拼图 | 24～36 | 5 | 大号纸板图片配对 | 拼块应足够大、无可脱落配件。 | 代码未记录逐项外部来源 |
| doll | 布娃娃或角色玩具 | 18～36 | 8 | 干净毛巾卷成的角色 | 选择完整、无可脱落装饰件的玩具。 | 代码未记录逐项外部来源 |
| push_pull | 稳固的推拉玩具 | 18～36 | 10 | 装轻衣物的大篮子 | 检查结构稳固与活动空间，成人在旁保护。 | 代码未记录逐项外部来源 |
| cardboard_box | 大号纸箱 | 18～36 | 20 | 无 | 去掉订书钉和胶带残留，成人在旁陪玩。 | 代码未记录逐项外部来源 |
| basket | 小篮子 | 18～36 | 12 | 无 | 选边缘光滑、无断裂的篮子。 | 代码未记录逐项外部来源 |
| bowl_spoon | 塑料碗和勺子 | 18～36 | 5 | 无 | 使用家中完整、适龄的大尺寸餐具。 | 代码未记录逐项外部来源 |
| towel | 干净毛巾 | 18～36 | 15 | 无 | 玩藏找时保持脸部与呼吸顺畅。 | 代码未记录逐项外部来源 |
| large_box | 安全空盒 | 18～36 | 10 | 无 | 检查边缘和盖子，不使用有夹手风险的硬盖。 | 代码未记录逐项外部来源 |

小部件风险参照 [CPSC 官方说明](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)。代码的 `min_piece_cm` 是人工填写的单一数值，不能代替实物小部件圆筒测试及脱落检查。
