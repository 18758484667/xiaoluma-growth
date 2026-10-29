# 官方发育锚点表

仅收录当前 `source_type=official_anchor` 的 13 项。这里的“官方”表示来源可核对，**不表示现有产品风险算法已经获得官方验证**。`adapted_anchor` 与 `product_observation` 均排除。

| 官方年龄 | 领域 | capability_id | 官方原始语义（简译） | 产品映射 | 官方来源 | 当前是否参与风险判断／审计意见 |
| --- | --- | --- | --- | --- | --- | --- |
| 18 月龄 | 大运动 | motor_stairs | 扶着墙或栏杆上楼梯 | 扶着墙或栏杆上楼梯 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 18 月龄 | 精细动作 | fine_lid | 用手旋拧（如拧瓶盖、上发条等） | 会用手拧开大瓶盖或操作旋转物 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 18 月龄 | 精细动作 | fine_spoon | Tries to use a spoon（尝试用勺子） | 尝试使用勺子进食 | [CDC](https://www.cdc.gov/act-early/milestones/18-months.html) | 当前代码通常不凭单项 not_yet 升级；倒退文字仍可 concern。 |
| 18 月龄 | 语言沟通 | lang_words | 说出 3 个有意义的词 | 能说出至少3个有意义的词 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 18 月龄 | 认知探索 | cog_object_use | 知道常用物品用途（如杯子用来喝水、灯会亮） | 知道梳子、勺子、电话等常用物品的用途 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 18 月龄 | 社会交往／情绪 | soc_ball | 与他人玩传球等互动游戏 | 能和家人玩来回传球等互动游戏 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 24 月龄 | 大运动 | motor_run | Runs（会跑） | 会跑 | [CDC](https://www.cdc.gov/act-early/milestones/2-years.html) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 24 月龄 | 大运动 | motor_jump | 双脚同时离地跳起 | 尝试双脚同时离地跳起 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 24 月龄 | 精细动作 | fine_spoon_eat | Eats with a spoon（用勺子吃饭） | 会用勺子吃饭 | [CDC](https://www.cdc.gov/act-early/milestones/2-years.html) | 当前代码通常不凭单项 not_yet 升级；倒退文字仍可 concern。 |
| 24 月龄 | 精细动作 | fine_pages | 一页页地翻书 | 能一页页翻书 | [国家卫健委](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 24 月龄 | 语言沟通 | lang_two_words | Says at least two words together（至少两个词连用） | 能把至少两个词组合在一起 | [CDC](https://www.cdc.gov/act-early/milestones/2-years.html) | 当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。 |
| 30 月龄 | 认知探索 | cog_color_one | Shows he knows at least one color（能辨认至少一种颜色） | 知道至少一种颜色 | [CDC](https://www.cdc.gov/act-early/milestones/30-months.html) | 当前代码通常不凭单项 not_yet 升级；倒退文字仍可 concern。 |
| 30 月龄 | 社会交往／情绪 | soc_peers | Plays next to other children and sometimes plays with them（并排玩，有时一起玩） | 会在其他小朋友旁边玩，有时也会一起玩 | [CDC](https://www.cdc.gov/act-early/milestones/30-months.html) | 当前代码通常不凭单项 not_yet 升级；倒退文字仍可 concern。 |

### 明确排除

- `cog_pretend`：`adapted_anchor`，虽指向国家卫健委 24 月龄“玩装扮游戏”，产品改写后不能混作官方原文锚点。
- `lang_request`、`cog_sort`、`soc_emotion`：`product_observation`，无官方固定年龄窗口。

国家卫健委自评表还列有 30、36 月龄官方项目，但本项目未全部收录；这是一项**覆盖范围缺口**，不应把当前 13 项误认为完整官方量表。原表对相应月龄未出现 1 项或 2 项以上分别给出求助指导，现有统一 4 个月缓冲规则与该原文并不一致，详见总审计报告。[原表](https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf)。
