# Phase 3.3C6｜已审核内容正式并入游戏库

## 准入与结构

依据 `data/five-brain-gap-content-pilot.json`、`five-brain-gap-content-review-report.md` 和 `deferred-imitation-mechanism-review.md` 复核：六项内容的内容、查重、安全和五脑经验映射状态均为 `approved`。并库仅读取已批准的玩法内容；能力映射、机制和审核理由继续留在 pilot 数据层。生成的 `assets/five-brain-gap-content.js` 不含五脑能力字段。

| 类型 | 稳定 ID | 家长看到的名称 | 所属主游戏 |
| --- | --- | --- | --- |
| 新主游戏 | `gap_open_big_box` | 大盒子怎么打开 | 自身 |
| 新主游戏 | `gap_detour_soft_ball` | 绕过去拿球 | 自身 |
| 新主游戏 | `gap_delayed_bowl_find` | 玩具藏在哪个大碗下面 | 自身 |
| 玩法变化 | `gap_variant_cup_try_another` | 哪个杯子能套进去 | `act_10_叠叠杯排序` |
| 玩法变化 | `gap_variant_bear_sleep_recall` | 刚才小熊是怎么睡觉的 | `act_1_假装游戏` |
| 玩法变化 | `gap_variant_daily_location_recall` | 小帮手还记得放哪儿 | `gap_delayed_bowl_find` |

六项均上线；没有留下待审核内容，也没有新增第四个记忆游戏。三个变化通过现有 canonical/alias 结构展示在详情中，收藏与反馈按主游戏 ID 工作；变化专属的五脑映射没有提升到主游戏。

## 安全与内容池

六项均使用审核过的完整大件或轻质材料，游戏原步骤和安全说明逐项保留。21个月原有安全过滤对六项均放行，既有五项 `blocked_under_3` 保持拦截。21个月正式可展示主游戏 **54 → 57**；21～24月并集 **81 → 84**。玩法变化不计入主游戏数。

正式内容供给按不同 canonical 计数：问题解决 **3项、2种机制，usable**；记忆学习 **2项、2种机制，limited**。这是游戏内容供给状态，不是小宝的能力状态。

新游戏与既有游戏一样经过年龄、安全、时长、场景、精力和现有排序规则。`assets/activity-recommendation-learning.js` 与 `assets/weekly-learning-plan.js` 未改；没有五脑分数或新权重。静态游戏数据不属于用户备份，旧备份没有新 ID 可正常导入；旧收藏、反馈、别名仍可读取。

## 验证

- `./check.sh`：通过，包含业务 smoke、成长 Golden Cases、游戏收藏/别名、安全、周计划、五脑边界与新增并库专项。
- 新增并库专项：7/7 通过，覆盖主游戏和变化计数、21个月安全过滤、Today 候选、周计划、收藏、反馈、旧备份、无成长证据写入、映射不进入排序。
- 浏览器专项脚本未运行：当前 Node 环境没有安装 `playwright`（`MODULE_NOT_FOUND`）。

未修改推荐权重、周计划算法、成长判定、五脑 evidence 或页面视觉架构。
