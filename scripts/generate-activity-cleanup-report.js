const fs=require('fs'),path=require('path'),Module=require('module');
const root=path.join(__dirname,'..'),smokeFile=path.join(__dirname,'smoke.test.js');
const bootstrap=fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0];
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(bootstrap+'\nmodule.exports={ctx};',smokeFile);
const c=loader.exports.ctx,raw=c.rawActivityCatalog(),catalog=c.activityCatalog(),byId=Object.fromEntries(raw.map(a=>[a.activity_id,a]));
const p0=c.ACTIVITY_CONTENT_CLEANUP,decisions=['keep','revise','blocked_under_3','remove_candidate'];
const ageAvailable=(a,age)=>a.variants?a.variants.some(v=>c.activityAvailableAtAge(v,age)):c.activityAvailableAtAge(a,age);
const ages=Array.from({length:19},(_,i)=>18+i),active=catalog.filter(a=>ages.some(age=>ageAvailable(a,age)));
const count=(xs,p)=>xs.filter(p).length,md=s=>String(s==null?'':s).replace(/\|/g,'／').replace(/\n/g,' ');
const id=n=>raw.find(a=>a.activity_id.startsWith('act_'+n+'_')).activity_id;
const audit=fs.readFileSync(path.join(root,'activity-content-actions.md'),'utf8');
const auditReasons={};for(const line of audit.split('## P0｜')[1].split('## P1｜')[0].split('\n')){const match=line.match(/^\| (act_[^|]+) \| ([^|]+) \|/);if(match)auditReasons[match[1]]=match[2].trim();}
const originalEffort=a=>a.activity_id.startsWith('gm_')?c.GROSS_MOTOR_ACTIVITIES.find(x=>x.activity_id===a.activity_id).caregiver_effort:(()=>{const o=c.ACTIVITY_OVERRIDES[a.legacy.name]||{};return o.caregiver_effort||o.caregiver_energy||'medium';})();
const originalLocation=a=>a.activity_id.startsWith('gm_')?c.GROSS_MOTOR_ACTIVITIES.find(x=>x.activity_id===a.activity_id).location:(c.ACTIVITY_OVERRIDES[a.legacy.name]||{}).location||['indoor'];
const effortIds=Object.keys(c.ACTIVITY_EFFORT_CORRECTIONS),effortChanged=effortIds.filter(x=>originalEffort(byId[x])!==byId[x].caregiver_effort);
const sceneIds=Object.keys(c.ACTIVITY_SCENE_CORRECTIONS),sceneChanged=sceneIds.filter(x=>JSON.stringify(originalLocation(byId[x]))!==JSON.stringify(byId[x].location)||byId[x].space_requirement==='large');
const materialIds=Object.keys(p0).filter(x=>p0[x].decision==='revise'&&p0[x].materials&&p0[x].materials!==byId[x].legacy.mat);
const good=new Set([32,43,46,49,60,72,82,90,96,102,103,106,114,115].map(id));
const mergePending=new Set([113,132,128,107,54].map(id));
const template=raw.filter(a=>a.activity_id.startsWith('act_')&&!/1\./.test(String(a.legacy.steps||'')));
function templateClass(a){if(p0[a.activity_id]&&p0[a.activity_id].decision==='remove_candidate')return 'remove_candidate';if(c.ACTIVITY_ALIASES[a.activity_id]||mergePending.has(a.activity_id))return 'merge';if(good.has(a.activity_id)&&a.safety_level==='standard'&&!p0[a.activity_id])return 'good';return 'rewrite';}
function templateStatus(a){if(a.content_rewritten||p0[a.activity_id]&&p0[a.activity_id].decision==='revise')return '已改写';if(a.safety_level==='blocked'||a.safety_level==='blocked_under_3')return '继续屏蔽，待安全复核';if(templateClass(a)==='merge')return c.ACTIVITY_ALIASES[a.activity_id]?'已归并':'待确认';if(templateClass(a)==='remove_candidate')return '已撤出';return templateClass(a)==='good'?'保留':'待改写（P2）';}
const classes={};for(const a of template)classes[templateClass(a)]=(classes[templateClass(a)]||0)+1;
const groups=[
  ['22＋113',id(113),id(22),'merge_candidate','原杯子蛋糕依赖扣子、豆子，继续屏蔽；安全版只有黏土塑形，待补足玩法后才考虑合并。'],
  ['61＋111',id(61),id(111),'merged','同为对折纸印画，颜料及步骤已统一；第二条成为换颜色变化。'],
  ['12＋121','act_12_场景旁白沟通','act_121_实时物品命名','merged','同一眼前物品命名互动；保留外出版本。'],
  ['124＋坐着模仿',id(124),'gm_seated_body_copy','merged','面对面模仿动作；坐着做为低精力变化。'],
  ['走到树＋绕花坛','gm_walk_to_tree','gm_garden_loop','merged','同一户外短距离步行目标。'],
  ['80＋118＋软垫路线',id(80),'act_118_居家障碍闯关 → gm_low_soft_course','partly_merged','单块靠垫上下与多步骤路线动作不同；后两项都是地面绕线跨软垫，已归并。'],
  ['4＋132',id(4),id(132),'merge_candidate','颜色配对是后者第一阶段，但形状配对增加规则；旧条目含小物，先复核材料。'],
  ['7＋128',id(7),id(128),'keep','贴纸收纳与胶水碎纸拼贴的材料/收尾不同；胶水及碎纸安全边界待审。'],
  ['2＋133',id(2),id(133),'merged','真实家务中递物、放物，单步递放作为变化；照护者精力已按持续互动校准为 medium。'],
  ['28＋107',id(28),id(107),'merge_candidate','均为捏怪兽；107 仍含扭扭棒和可脱落眼睛，保持屏蔽，不能直接合入安全版。'],
  ['54＋55',id(54),id(55),'keep','纸板电脑偏办公假装，纸箱小剧场偏角色表演；共享材料不等于同一核心互动。']
];
const out=[];const add=s=>out.push(s);
add('# Phase 2.5A｜游戏内容清理与安全修正');
add('');add('实施日期：2026-10-24。依据 [全量审计](activity-library-audit.md)、[21～24 月龄审计](activity-21-24-audit.md) 与 [待处理清单](activity-content-actions.md)。本文件记录**已经进入产品的修订**与仍需编辑复核的内容；未新增游戏、未改变推荐排序/轮换算法。');
add('');add('## 数量口径');add('');add('| 指标 | 结果 |');add('|---|---:|');
for(const [k,v] of [['原始 activity ID',raw.length],['当前 canonical 游戏',catalog.length],['18～36 月龄至少一个月可展示的 active 主游戏',active.length],['P0 keep',count(Object.values(p0),x=>x.decision==='keep')],['P0 revise',count(Object.values(p0),x=>x.decision==='revise')],['P0 blocked_under_3',count(Object.values(p0),x=>x.decision==='blocked_under_3')],['P0 remove_candidate',count(Object.values(p0),x=>x.decision==='remove_candidate')],['既有安全过滤继续屏蔽',count(raw,x=>x.safety_level==='blocked')],['合并组 / 玩法变化',c.ACTIVITY_CANONICAL_GROUPS.length+' / '+c.ACTIVITY_CANONICAL_GROUPS.reduce((n,g)=>n+g.variants.length,0)],['新增合并组 / 新增玩法变化','2 / 4'],['旧 ID 别名',Object.keys(c.ACTIVITY_ALIASES).length],['effort 复核 / 实际修正',effortIds.length+' / '+effortChanged.length],['场景或空间复核 / 实际修正',sceneIds.length+' / '+sceneChanged.length],['安全材料替换',materialIds.length],['模板化候选分类',template.length],['已重写步骤（P0＋模板专项）',count(raw,x=>!!x.content_rewritten||p0[x.activity_id]&&p0[x.activity_id].decision==='revise')]])add('| '+k+' | '+v+' |');
add('');add('active 指 18～36 月龄范围内至少有一个月可展示的 canonical 游戏；年龄 48 月起的旧内容不计入。`blocked_under_3` 四项在当前产品覆盖的 18～36 月龄内均隐藏；36 月龄边界也暂不开放，需未来单独审核后启用。原 ID 与原收藏/反馈数据不删除。');
add('');add('## 31 项 P0 安全处理');add('');add('| activity_id | 决策 | 原风险 → 实际处理 | 结果 |');add('|---|---|---|---|');
for(const key of Object.keys(p0)){const x=p0[key],a=byId[key],risk=auditReasons[key]||x.reason||'审计标记';let action=x.decision==='keep'?x.safety_notes:x.decision==='revise'?`材料：${x.materials||a.materials}；${x.safety_notes}`:x.reason;let result=x.decision==='keep'||x.decision==='revise'?'按原月龄与条件可展示':x.decision==='blocked_under_3'?'18～36月龄隐藏':'所有月龄从可见库与推荐撤出';add(`| \`${key}\` | ${x.decision} | ${md(risk)} → ${md(action)} | ${result} |`);}
add('');add('说明：不能靠“成人陪同”解决可入口小件风险；可替代项目直接改为完整大尺寸材料。气球版本改为轻布球；玩水项目要求成人始终伸手可及、结束立即倒空；障碍路线只保留地面胶带和单层防滑软垫。游戏库与首页详情都读取同一份修订后步骤。');
add('');add('## effort 与场景校准');add('');add('17 项按修订后的真实玩法复核：`low` 可坐着或站旁简单回应、少准备收拾；`medium` 需持续互动/移动；`high` 需持续追随、涉水看护或明显清理。原审计建议为 high 的黏土、布片盒与地面靠垫，因本次降复杂度，最终维持 medium。');
add('');add('| activity_id | 原 effort → 当前 | 状态 |');add('|---|---|---|');for(const key of effortIds)add(`| \`${key}\` | ${originalEffort(byId[key])} → ${byId[key].caregiver_effort} | ${effortChanged.includes(key)?'已修正':'复核后维持'} |`);
add('');add('| activity_id | 场景／空间结果 |');add('|---|---|');for(const key of sceneIds){const a=byId[key];add(`| \`${key}\` | ${originalLocation(a).join('、')} → ${a.location.join('、')}；space=${a.space_requirement||'normal'} |`);}
add('');add('`space_requirement` 为最小结构化字段；`large` 标识需要先清空较大地面。当前没有“家中可用空间”偏好，因此没有把它加入推荐评分或轮换。该字段会在内容详情中提示照护者。');
add('');add('## 11 组重复候选逐组复判');add('');add('| 原审计组 | 保留 ID | 合并／候选 ID | 判断 | 理由 |');add('|---|---|---|---|---|');for(const g of groups)add(`| ${g[0]} | \`${g[1]}\` | \`${g[2]}\` | ${g[3]} | ${g[4]} |`);
add('');add('现有 canonical 共 7 组、15 种已有玩法变化，净减少 8 张独立游戏卡；其中本轮新增“折纸印蝴蝶”和“地面低矮软垫路线”两组。旧 ID 通过 `ACTIVITY_ALIASES` 解析，旧收藏与反馈读取时仅在内存映射；浏览不改写本地存储。');
add('');add('## 95 项模板化候选逐项分类');add('');add(`分类总计：good ${classes.good||0}、rewrite ${classes.rewrite||0}、merge ${classes.merge||0}、remove_candidate ${classes.remove_candidate||0}。其中 rewrite 包括已改写与待改写，**待改写不冒充完成**。模板感是原文形式审计，不等于玩法没有价值。`);
add('');add('| activity_id | 分类 | 处理状态 | 依据 |');add('|---|---|---|---|');for(const a of template){const cls=templateClass(a),status=templateStatus(a);let why=cls==='good'?'核心动作可辨，保留独立玩法':cls==='merge'?'与同机制主游戏合并或待合并':cls==='remove_candidate'?'核心风险或独立玩法价值不足':status==='已改写'?'已补具体操作、结束点和安全边界':status.includes('屏蔽')?'原材料有安全问题，不能直接恢复':'原文仅列材料或目标，缺具体操作与结束点';add(`| \`${a.activity_id}\` | ${cls} | ${status} | ${why} |`);}
add('');add('已改写内容遵守“家长做什么、孩子做什么、约玩多久、何时结束”的短步骤。尚待改写的 P2 项继续保留原有安全过滤；本轮未为了追求数量删掉 95 项。');
add('');add('## 当前供给与兼容性');add('');add('| 月龄 | active canonical | 其中主玩法标 low effort |');add('|---|---:|---:|');for(const age of [21,22,23,24]){const x=catalog.filter(a=>ageAvailable(a,age));add(`| ${age} | ${x.length} | ${count(x,a=>a.caregiver_effort==='low')} |`);}add('');add(`21～24 月龄并集：${count(catalog,a=>[21,22,23,24].some(age=>ageAvailable(a,age)))} 项。21 月龄“很累／家里／10～15 分钟”经专项测试仍有至少 3 个候选。收藏、反馈、老备份、月度活动引用继续使用稳定 canonical ID 与别名。`);
add('');add('## 外部安全依据与剩余限制');add('');add('- [CPSC 小部件与误吞风险说明](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)、[CPSC 玩具安全提示](https://www.cpsc.gov/id/Safety-Education/Toys)：支持小件与气球碎片的谨慎处理。');add('- [CPSC 儿童涉水安全资料](https://www.cpsc.gov/s3fs-public/210.pdf)：涉水须保持近身看护，不可短暂离开。');add('- [AAP 误吸预防](https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Choking-Prevention.aspx)：食物游戏与实际进食分开，食用由成人另按适龄方式处理。');add('');add('这些来源支持风险控制原则，不构成对每条原创玩法的官方认可。原库仍有 23 项被既有过滤屏蔽，模板化待改写项需后续内容编辑审核；推荐“被动浏览连续同三项”属于 Phase 2.5C，本轮未调整算法。');
fs.writeFileSync(path.join(root,'activity-cleanup-report.md'),out.join('\n')+'\n');
console.log(JSON.stringify({raw:raw.length,canonical:catalog.length,active:active.length,p0:Object.fromEntries(decisions.map(d=>[d,count(Object.values(p0),x=>x.decision===d)])),aliases:Object.keys(c.ACTIVITY_ALIASES).length,effortChanged:effortChanged.length,sceneChanged:sceneChanged.length,materialReplacements:materialIds.length,template:classes},null,2));
