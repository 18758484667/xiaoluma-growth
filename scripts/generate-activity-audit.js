/* Phase 2.5 editorial audit. Reads production functions in an in-memory VM; writes only Markdown reports. */
const fs=require('fs'),path=require('path'),Module=require('module');
const root=path.resolve(__dirname,'..'),smokeFile=path.join(__dirname,'smoke.test.js');
const bootstrap=fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0];
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(bootstrap+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const catalog=ctx.rawActivityCatalog(),byId=Object.fromEntries(catalog.map(a=>[a.activity_id,a]));
const domainName={motor:'大运动',fine:'精细动作',lang:'语言沟通',cog:'认知/记忆感官',soc:'社会互动'};
const stages=[[18,20],[21,23],[24,26],[27,29],[30,32],[33,36]];
const fmt=(x)=>String(x??'—').replace(/\|/g,'\\|').replace(/\n/g,' ');
const count=(rows,key)=>Object.entries(rows.reduce((o,a)=>(o[key(a)]=(o[key(a)]||0)+1,o),{})).sort((a,b)=>String(a[0]).localeCompare(String(b[0]),'zh-CN'));
const table=(heads,rows)=>'| '+heads.join(' | ')+' |\n|'+heads.map(()=>'---').join('|')+'|\n'+rows.map(row=>'| '+row.map(fmt).join(' | ')+' |').join('\n')+'\n';
const id=(n)=>catalog[n].activity_id;
const manualRisk={};
function risk(indices,status,reason){for(const n of indices)manualRisk[id(n)]={status,reason};}
risk([24,36,47,62,73,81,95,97],'remove_candidate','尖锐/电气/化学/可破碎或易误吞材料与现有家庭玩法边界冲突；需人工决定下架或重构。');
risk([0,11,22,27,29,30,34,37,38,39,50,51,57,63,67,68,69,71,94,98,101,107,120,125,127],'needs_revision','小件、颗粒、磁性材料、成人工具或可脱落装饰；当前已有部分禁词拦截，但原内容尚未改写。');
risk([14,117],'needs_revision','户外追逐需要明确远离车辆、水域与障碍，普通通用安全句不足。');
risk([28],'needs_revision','步骤涉及烤箱，必须分离成人操作并重写玩法。');
risk([31,33,35,41,53,55,64,74,84,89,92,100,116,126,129,131],'needs_revision','存在冰块/沙粒/水盆/绳带/家具/玻璃陶瓷/食物或工具场景，需要具体边界与成人持续看护说明。');
risk([80,118],'needs_revision','现有游戏库展示的原始步骤与安全版覆盖/提示相冲突，涉及靠垫跑跳或椅子通道。');
// A few items need more precise editorial reasons than their risk family.
Object.assign(manualRisk,{
  [id(71)]:{status:'needs_revision',reason:'24月龄灯箱彩色米未被现有禁词过滤拦截，米粒易误吸且灯箱有电气边界。'},
  [id(118)]:{status:'needs_revision',reason:'统一活动覆盖禁止桌椅，但游戏库仍展示“用椅子搭通道”的旧步骤；两个入口内容直接冲突。'},
  [id(80)]:{status:'needs_revision',reason:'安全说明要求单层软垫，游戏库旧步骤仍写“靠垫摆桥跑跳”。'},
  [id(131)]:{status:'needs_revision',reason:'温水盆玩法步骤写全程看护，通用安全说明却未直说不可离开；需统一水域警示。'},
  [id(126)]:{status:'needs_revision',reason:'水果活动含“蒙上眼睛”和切配步骤，需明确不蒙眼进食、整果/切块误吸边界。'},
  [id(97)]:{status:'remove_candidate',reason:'水中纸船同时使用吹风机，电器与水并用不适合作为儿童家庭活动。'},
  [id(81)]:{status:'remove_candidate',reason:'玻璃鱼缸与水油亮片组合，破碎和小件误食风险高。'},
  [id(73)]:{status:'remove_candidate',reason:'气球破片有误吸风险，当前玩法未给出替代材料。'}
});
const preciseRiskReasons={
  24:'橡皮糖与牙签搭建，牙签尖端和糖果误吸均不适合直接交给幼儿操作。',
  28:'原步骤含烤箱加热，需将成人制作与幼儿可参与步骤明确分离。',
  31:'冰格内“宝藏”材质尺寸不明，融化后可能形成可误吞小件。',
  33:'散装沙粒与小工具用于室内感官盒，需解决入口误吸和散落清理。',
  35:'冰块、小船和水同盆，需限定水量、冰块/小船尺寸并全程近身看护。',
  36:'自制灯箱涉及电源和透光材料，现有说明缺少电气隔离细节。',
  38:'大托盘混用彩色米、意面、颜料和土壤；颗粒误吸与材料卫生边界不清。',
  41:'意面与串珠属于可入口的小件，原步骤没有适龄大尺寸替代。',
  47:'硬币属于幼儿可误吞小件，不应作为直接操作材料。',
  53:'竹筒与扭扭棒绑挂树梢，存在硬边、金属丝和高处操作风险。',
  55:'纸箱、锡纸和衣架制作电视；需排除衣架尖端、可脱落锡纸和纸箱边缘。',
  62:'发光棒材料破裂后可接触内部液体，现有玩法缺少可靠隔离。',
  64:'食用色素冰砖融化后的小冰块可能入口，且涉水玩法需明确持续看护。',
  74:'纸胶带布成跨越路线，若形成长带或高低交错需防缠绕、绊倒。',
  84:'扭扭棒穿麦圈并悬挂，金属丝尖端和可脱落小食物需要成人制作与保管。',
  89:'靠垫毯子搭房屋供孩子钻进钻出，需限制高度并确保通风与结构稳定。',
  92:'陶瓷小茶具可破碎成尖片，且颜料适龄性未说明。',
  95:'弹珠可误吞；放入盒中滚动涂画仍需避免幼儿接触散落弹珠。',
  100:'啫喱粉加温水制作感官材料，入口安全性、温度和可食误认均未说明。',
  116:'纸板转盘拉绳旋转，需说明绳长、缠绕与纸板脱落边缘控制。',
  129:'抱枕毯子搭隧道，安全覆盖与原步骤中的家具/软垫边界需要统一。'
};
for(const [n,reason] of Object.entries(preciseRiskReasons))manualRisk[id(Number(n))]={status:manualRisk[id(Number(n))].status,reason};
for(const a of catalog)if(a.safety_level==='blocked'&&!manualRisk[a.activity_id])manualRisk[a.activity_id]={status:'needs_revision',reason:'现有3岁以下安全过滤已屏蔽，但原内容需要人工复核材料与替代方案。'};
const effortReview={};function effort(indices,to,reason){for(const n of indices)effortReview[id(n)]={to,reason};}
effort([1,9,126,133],'medium','实际需要持续角色回应、小件看护、食物准备或共同收拾，不属于顺手坐着即可完成。');
effort([24,28,33,36,89,97,100,117,131],'high','涉及尖锐/加热/玩水/搭建/户外持续跟随或明显清理，成人负担高于现有标注。');
for(const key of ['gm_walk_from_stroller','gm_walk_to_tree','gm_leaf_collect','gm_garden_loop'])effortReview[key]={to:'medium',reason:'户外需全程同行、看路和保护，不能进入“很累时坐着玩”的低精力推荐。'};
const sceneReview={};function scene(indices,to,reason){for(const n of indices)sceneReview[id(n)]={to,reason};}
scene([32,53],'outdoor','步骤明确需要公园或挂树，原数据仅标普通室内。');
scene([84,87],'indoor+outdoor','制作可在室内，但投放/悬挂需户外，不应只标室内。');
scene([89,118],'indoor-space','需要清空较大地面或搭建通道，不是普通室内低门槛场景。');
sceneReview.gm_low_soft_course={to:'indoor-space',reason:'虽标室内，但需清空地面并铺防滑软垫。'};
const clusters=[
 {ids:[22,113],decision:'删除候选',reason:'同为橡皮泥杯子蛋糕；第二条只替换材料并落入通用步骤模板。'},
 {ids:[61,111],decision:'合并候选',reason:'同为对折纸挤颜料印蝴蝶，动作与产物相同。'},
 {ids:[12,121],decision:'合并候选',reason:'日常物品命名/场景旁白核心都是看见物品后说名称，可在一条中给两种说法。'},
 {ids:[124,'gm_seated_body_copy'],decision:'合并候选',reason:'都以简单身体动作互相模仿；坐着陪伴可作为原玩法的低精力变体。'},
 {ids:['gm_walk_to_tree','gm_garden_loop'],decision:'合并候选',reason:'都只是以室外目标引导走一小段，换树/花坛没有新的核心动作。'},
 {ids:[80,118,'gm_low_soft_course'],decision:'合并候选',reason:'均为低矮障碍路线；保留安全版地面路线，旧版先解决矛盾步骤。'},
 {ids:[4,132],decision:'合并候选',reason:'颜色配对分类与颜色形状配对的颜色阶段基本相同。'},
 {ids:[7,128],decision:'合并候选',reason:'撕纸、贴纸、收拾纸片的主动作相同。'},
 {ids:[2,133],decision:'合并候选',reason:'家务变游戏与小小家务能手都以递物、收玩具、整理衣物为主。'},
 {ids:[28,107],decision:'合并候选',reason:'同为捏怪兽材料变体；两项先处理烤箱和可脱落装饰。'},
 {ids:[54,55],decision:'合并候选',reason:'制作纸板办公/电视道具后假装扮演，核心玩法接近；纸箱电视另有衣架材料风险。'},
 {ids:[14,117],decision:'保留',reason:'追泡泡与推车追泡泡的动作要求不同，后者多推拉协调；安全边界需分别补足。'},
 {ids:[119,'gm_roll_fetch','gm_seated_soft_kick','gm_chase_kick_ball'],decision:'保留',reason:'传球、追回、踢球分别提供轮流、往返与脚部动作。'},
 {ids:[105,106],decision:'保留',reason:'自由拨弦与唱歌/律动有可辨的互动差异。'},
 {ids:['gm_soft_toy_delivery','gm_squat_basket','gm_multi_step_delivery'],decision:'保留',reason:'往返搬运、蹲起放篮和多步骤交付的动作与照护负担不同。'}
];
function clusterId(x){return typeof x==='number'?id(x):x;}
const dupById={};for(const c of clusters)for(const item of c.ids){const key=clusterId(item);if(!dupById[key])dupById[key]=[];dupById[key].push(c);}
const duplicateCandidates=new Set(clusters.filter(c=>c.decision!=='保留').flatMap(c=>c.ids.map(clusterId)));
function templateLike(a){return a.activity_id.startsWith('act_')&&!/1\./.test(String(a.legacy.steps||''));}
function actualPrep(a){const t=(a.title+' '+a.materials+' '+(a.legacy.steps||''));if(/烤箱|吹风机|灯箱|搭建|雕塑|陶瓷|剪纸|剪刀|缝|喷绘|染色|水彩|胶水|彩色米|感官瓶|沙粒|水盆|模型|雪糕棍|纸板/.test(t))return 'high';if(/颜料|橡皮泥|纸盒|纸箱|贴纸|涂画|冰块|冰格|彩纸|泡泡|水|黏土|花|布娃娃|积木|绘本|叠叠杯|胶带/.test(t))return 'medium';return a.prep_level==='none'?'none':'low';}
function contextType(a){const t=a.title+' '+a.description;if(/洗澡|浴室|刷牙|喂饭|吃饭|勺子/.test(t)||a.location.includes('bath')||a.location.includes('mealtime'))return 'caregiving';if(/收玩具|家务|收纳|递衣|搬运|送货|洗衣/.test(t))return 'daily_life';if(/出门|推车|等车|路上|实时物品命名|散步/.test(t)||a.location.includes('on_the_go'))return 'transition';if(a.location.includes('outdoor')&&(!a.location.includes('indoor')||/公园|树|花坛|小坡|落叶/.test(t)))return 'outdoor';return 'play';}
function playType(a){const t=a.title+' '+a.description;if(/追球|滚球|踢球|传球|抛接球/.test(t))return '球类往返';if(/泡泡/.test(t))return '追泡泡';if(/障碍|迷宫|靠垫桥|软垫路线|钻山洞/.test(t))return '障碍路线';if(/走|散步|小坡|台阶|花坛|树叶/.test(t)&&a.domains.includes('motor'))return '步行探索';if(/搬运|送货|家务|收纳|捡进篮/.test(t))return '搬运收纳';if(/音乐|歌曲|吉他|手指谣/.test(t))return '音乐律动';if(/模仿|身体动作/.test(t))return '动作模仿';if(/绘本|翻书|讲故事|图卡/.test(t))return '共读叙述';if(/命名|旁白|说名|沟通|指令|请求/.test(t))return '语言表达';if(/假装|扮演|娃娃|餐馆|小剧场/.test(t))return '假装扮演';if(/分类|配对|排序/.test(t))return '配对分类';if(/感官|触摸|冰|玩水|沙粒|米粒|材质/.test(t))return '感官探索';if(/画|涂|印|拼贴|剪纸|折纸|纸板|橡皮泥/.test(t))return '美术手作';if(/藏|寻找|寻宝/.test(t))return '藏找记忆';if(/积木|乐高|搭建/.test(t))return '搭建';return '其他';}
function ageUnclear(a){return a.activity_id.startsWith('act_');}
function score(a){let n=100;if(templateLike(a))n-=20;if(ageUnclear(a))n-=12;if(a.safety_notes==='使用适龄、完好的大尺寸材料，全程保持在身边')n-=8;if(manualRisk[a.activity_id])n-=manualRisk[a.activity_id].status==='remove_candidate'?35:20;if(effortReview[a.activity_id])n-=10;if(sceneReview[a.activity_id])n-=10;if(duplicateCandidates.has(a.activity_id))n-=8;if(a.description.length<28)n-=6;return Math.max(0,n);}
function hasArt(a){return !!ctx.todayActivityImage(a);}
function isHomeCandidate(a){return a.safety_level!=='blocked'&&a.min_age_months<=36&&a.max_age_months>=18&&a.duration.max<=15&&a.location.length>0;}
const enriched=catalog.map(a=>Object.assign({},a,{audit:{risk:manualRisk[a.activity_id]||null,effort:effortReview[a.activity_id]||null,scene:sceneReview[a.activity_id]||null,duplicate:dupById[a.activity_id]||[],template_like:templateLike(a),prep:actualPrep(a),context:contextType(a),play_type:playType(a),age_unclear:ageUnclear(a),score:score(a),art:hasArt(a)}}));
const eligible=(age)=>enriched.filter(a=>a.min_age_months<=age&&age<=a.max_age_months&&a.safety_level!=='blocked');
const stageRows=stages.map(([start,end])=>{const ages=Array.from({length:end-start+1},(_,i)=>eligible(start+i).length);return [`${start}～${end}`,Math.min(...ages),Math.max(...ages),ages.join(' / ')];});
function countsString(rows,key){return count(rows,key).map(([k,v])=>`${k} ${v}`).join('；');}

const labelLocation={indoor:'室内',outdoor:'户外',on_the_go:'外出途中',bath:'洗澡',mealtime:'用餐'};
const labelEffort={low:'低',medium:'中',high:'高'};
const labelContext={play:'专门游戏',daily_life:'生活参与',outdoor:'户外探索',transition:'转场途中',caregiving:'照护场景'};
function unique(rows,key){return [...new Set(rows.map(key))];}
function categories(rows,fn){return count(rows,fn).map(([k,v])=>[k,v]);}
function durationBand(a){return a.duration.max<=5?'≤5分钟':a.duration.max<=10?'5～10分钟':a.duration.max<=15?'10～15分钟':'>15分钟';}
function locationBand(a){const s=a.location;if(s.includes('indoor')&&s.includes('outdoor'))return '室内与户外';if(s.includes('indoor')&&s.includes('on_the_go'))return '室内与途中';if(s.includes('outdoor')&&s.includes('on_the_go'))return '户外与途中';if(s.includes('indoor'))return '室内';if(s.includes('outdoor'))return '户外';if(s.includes('on_the_go'))return '外出途中';return '照护场景';}
function rawRisk(a){return a.audit.risk?a.audit.risk.status:'safe';}
function adult(a){return a.audit.risk||a.location.includes('outdoor')||a.location.includes('bath')||a.location.includes('mealtime')||/陪同|成人|家长|大人|一起/.test(a.safety_notes)?'是':'建议复核';}
function homeUse(a){return isHomeCandidate(a)?'是，依条件':'否/仅库内';}
function monthlyUse(a){return isHomeCandidate(a)?'是，依焦点与条件':'否/仅库内';}
function materials(a){return Array.isArray(a.materials)?a.materials.join('、'):a.materials;}
function activityRow(a){const q=a.audit,dups=q.duplicate.filter(x=>x.decision!=='保留');return [a.activity_id,a.title,`${a.min_age_months}～${a.max_age_months}`,a.domains.map(x=>domainName[x]||x).join('、'),(a.secondary_domains||[]).map(x=>domainName[x]||x).join('、')||'无',a.duration.label||`${a.duration.min}～${a.duration.max}分钟`,a.location.map(x=>labelLocation[x]||x).join('、'),`${a.caregiver_effort}${q.effort?'→'+q.effort.to+'（待审）':''}`,`${a.prep_level}${a.prep_level!==q.prep?'→'+q.prep+'（估算）':''}`,a.cleanup_level,materials(a),a.safety_notes,adult(a),q.art?'有':'无',homeUse(a),monthlyUse(a),'稳定 activity_id；可收藏/反馈',dups.length?dups[0].decision:'否',rawRisk(a),q.age_unclear?'是：上限推断':'否',q.context,q.template_like?'是':'否',q.score];}
function distributionTable(rows){return table(['维度','分组','数量'],[
  ...categories(rows,a=>a.domains.length>1?'综合类':domainName[a.domains[0]]||a.domains[0]).map(x=>['领域',...x]),
  ['领域','综合类',rows.filter(a=>a.domains.length>1).length],
  ...categories(rows,a=>labelEffort[a.caregiver_effort]||a.caregiver_effort).map(x=>['照护者精力（当前字段）',...x]),
  ...categories(rows,locationBand).map(x=>['地点（互斥）',...x]),
  ...[['室内',a=>a.location.includes('indoor')],['户外',a=>a.location.includes('outdoor')],['外出途中',a=>a.location.includes('on_the_go')]].map(([label,fn])=>['地点（可重叠）',label,rows.filter(fn).length]),
  ...categories(rows,a=>a.prep_level).map(x=>['准备成本（当前字段）',...x]),
  ['准备成本（当前字段）','medium / high',rows.filter(a=>['medium','high'].includes(a.prep_level)).length],
  ...categories(rows,a=>a.audit.prep).map(x=>['准备成本（审计估算）',...x]),
  ...categories(rows,durationBand).map(x=>['时长',...x]),
  ['时长','>15分钟',rows.filter(a=>durationBand(a)==='>15分钟').length],
  ...categories(rows,a=>labelContext[a.audit.context]).map(x=>['场景分类（审计建议）',...x])]);}
function reset(){storage.clear();}
const simulationScenarios=[
  ['很累 / 家里 / 5分钟',{duration:'5',context:'home',energy:'low',interests:[]}],
  ['很累 / 家里 / 10～15分钟',{duration:'10_15',context:'home',energy:'low',interests:[]}],
  ['还好 / 家里 / 10～15分钟',{duration:'10_15',context:'home',energy:'medium',interests:[]}],
  ['有精力 / 家里 / 10～15分钟',{duration:'10_15',context:'home',energy:'high',interests:[]}],
  ['有精力 / 户外 / 10～15分钟',{duration:'10_15',context:'outdoor',energy:'high',interests:[]}]
];
function simulate(name,prefs,mode='仅打开首页'){
  reset();const firstDate='2026-10-01',base=ctx.recommendActivities(prefs,21,firstDate,{}).map(a=>a.activity_id);
  if(mode==='收藏首日三项')ctx.localStorage.setItem('xlma_activity_favorites_v1',JSON.stringify(base.map((activity_id,i)=>({activity_id,created_at:`2026-09-${String(20+i).padStart(2,'0')}T00:00:00.000Z`}))));
  if(mode==='首日三项曾很喜欢')ctx.localStorage.setItem('xlma_activity_feedback_v1',JSON.stringify(base.map((activity_id,i)=>({feedback_id:`audit-love-${i}`,activity_id,date:'2026-09-25',enjoyment:'love',difficulty:null}))));
  const batches=[];
  for(let day=1;day<=14;day++){
    const date=`2026-10-${String(day).padStart(2,'0')}`;
    const chosen=ctx.todayRecommendations(prefs,21,date,{}).map(a=>a.activity_id);batches.push(chosen);
    if(mode==='每天玩完并记录还可以'){
      const rows=JSON.parse(ctx.localStorage.getItem('xlma_activity_feedback_v1')||'[]');
      chosen.forEach((activity_id,i)=>rows.push({feedback_id:`audit-${day}-${i}`,activity_id,date,enjoyment:'okay',difficulty:null}));
      ctx.localStorage.setItem('xlma_activity_feedback_v1',JSON.stringify(rows));
    }
  }
  const all=batches.flat(),uniqueIds=new Set(all),adjacent=batches.slice(1).map((batch,i)=>batch.filter(id=>batches[i].includes(id)).length),same=adjacent.filter(x=>x===3).length;
  const consecutive=Object.fromEntries([...uniqueIds].map(id=>{let run=0,max=0;for(const batch of batches){run=batch.includes(id)?run+1:0;max=Math.max(max,run);}return [id,max];}));
  const typeBatches=batches.map(batch=>batch.map(id=>playType(byId[id]))),sameTypeDays=typeBatches.slice(1).filter((types,i)=>types.some(t=>typeBatches[i].includes(t))).length;
  const domainCount=count(all.map(id=>byId[id]),a=>domainName[a.domains[0]]||a.domains[0]);
  const pool=ctx.energyCandidatePool(ctx.eligibleActivities(21,prefs),prefs).length;
  return {name,mode,pool,batches,unique:uniqueIds.size,same,overlap:adjacent.reduce((a,b)=>a+b,0),maxStreak:Math.max(...Object.values(consecutive)),sameTypeDays,domains:domainCount.map(([x,n])=>`${x} ${n}/42`).join('；'),first:batches[0].map(id=>byId[id].title).join('、')};
}
const simulations=simulationScenarios.map(([name,prefs])=>simulate(name,prefs));
const sensitivity=[simulate(...simulationScenarios[1],'每天玩完并记录还可以'),simulate(...simulationScenarios[1],'收藏首日三项'),simulate(...simulationScenarios[1],'首日三项曾很喜欢')];
const simulationTable=rows=>table(['条件','行为','候选池','14天不同活动','相邻完全相同天数/13','相邻重复位/39','最长连续出现','同玩法类型连续/13','领域曝光/42','第1天组合'],rows.map(x=>[x.name,x.mode,x.pool,x.unique,x.same,x.overlap,x.maxStreak,x.sameTypeDays,x.domains,x.first]));

const guide=ctx.DEVELOPMENT_GUIDE_CONTENT,toys=ctx.DEVELOPMENT_GUIDE_TOYS,life=ctx.LIFE_OPPORTUNITIES;
const guideRefs=guide.flatMap(b=>b.activity_titles.map(title=>({stage:b.age_range.join('～'),title,found:catalog.some(a=>a.title===title)})));
const invalidGuideRefs=guideRefs.filter(x=>!x.found);
const toyRefs=guide.flatMap(b=>Object.values(b.toys).flat()).filter(x=>!toys.some(t=>t.toy_id===x));
const overview=[
  `# 游戏与育儿内容库全量审计`,
  ``,
  `> 口径提示：本报告统计 Phase 2.5A 合并前的 155 条原始活动。当前面向家长的主游戏为 149 个，合并与旧 ID 映射见 [activity-cleanup-report.md](activity-cleanup-report.md)。`,
  ``,
  `审计日期：2026-10-24。依据当前代码中 \`activityCatalog()\` 的归一化结果、\`DEVELOPMENT_GUIDE_CONTENT\`、\`DEVELOPMENT_GUIDE_TOYS\`、\`LIFE_OPPORTUNITIES\`、月度总结和首页推荐函数。脚本在内存 VM 中读取，不接触用户浏览器存储，也不改产品数据。`,
  ``,
  `**口径**：共 ${catalog.length} 项（旧库 ${catalog.filter(a=>a.activity_id.startsWith('act_')).length}，大运动补充 ${catalog.filter(a=>a.activity_id.startsWith('gm_')).length}）；当前安全过滤直接屏蔽 ${catalog.filter(a=>a.safety_level==='blocked').length} 项。下表包含被屏蔽项，用于内容治理。每个月龄的“可用”指当前年龄及 \`safety_level\` 过滤通过，未叠加时长、场景、精力。领域按当前主领域单计；归一化目录当前没有 secondary_domains。`,
  ``,
  `**审计标记**：\`activity_context_type\`、内容质量分、准备成本估算、模板感、重复候选、effort/场景修正均为编辑审查建议，尚未写入产品数据，也不用于用户界面或推荐。内容质量分从 100 按明确性/安全性/年龄清晰度/重复等减分，不是科学有效性分数；低分不等于无效。\`需要成人全程参与\` 是谨慎的编辑判断，非现有独立字段。`,
  ``,
  `## 内容分布`,
  ``,distributionTable(enriched),
  `### 按月龄阶段（安全过滤后）`,
  ``,table(['阶段','阶段内最少','阶段内最多','逐月可用数'],stageRows),
  `### 来源与连接`,
  ``,
  `- 发育指南：${guide.length} 个阶段；每阶段都包含五领域摘要、机会、玩具、生活参与、观察点、来源引用。活动标题引用共 ${guideRefs.length} 次，去重 ${unique(guideRefs,x=>x.title).length} 个，无法关联目录标题 ${invalidGuideRefs.length} 次。${invalidGuideRefs.length?'未匹配：'+invalidGuideRefs.map(x=>`${x.stage}/${x.title}`).join('；'):''}`,
  `- 指南玩具/替代材料：${toys.length} 项，指南引用中失效 toy_id ${toyRefs.length} 项。玩具材料本身经过 Phase 1.9 单独审核；此处只核对引用与 3 岁以下安全提示是否一致。`,
  `- 生活机会：${life.length} 项；月度总结从现有 \`LIFE_OPPORTUNITIES\` 中按月龄与场景抽取，不按 activity_id 连接。`,
  `- 首页推荐与月度成长计划都调用同一目录和排名函数，月度建议记录 activity_id。收藏与游戏反馈也用同一稳定 activity_id；因此合并或删除候选均需要迁移历史引用方案。`,
  ``,
  `### 发育指南当前引用的活动`,
  ``,table(['阶段','活动标题','目录中找到'],guideRefs.map(x=>[x.stage,x.title,x.found?'是':'否'])),
  `### 生活机会与玩具索引`,
  ``,table(['生活机会','起始月龄','领域','场景'],life.map(x=>[x.title,x.min_age_months,(x.domains||[]).map(d=>domainName[d]||d).join('、'),(x.contexts||[]).join('、')])),
  ``,table(['toy_id','材料/玩具','适龄','替代材料','安全提示'],toys.map(x=>[x.toy_id,x.name,x.age_range.join('～'),x.replacement_materials.join('、')||'无',x.safety_notes])),
  `## 重复与模板感`,
  ``,
  `按核心动作、材料、目标与操作步骤人工规则审视，保留明确不同动作的近似标题。合并/删除候选 ${clusters.filter(c=>c.decision!=='保留').length} 组、涉及 ${duplicateCandidates.size} 个 activity_id；另外 ${clusters.filter(c=>c.decision==='保留').length} 组建议保留。此处是候选清单，不执行合并。`,
  ``,table(['决定','activity_id / 名称','理由'],clusters.map(c=>[c.decision,c.ids.map(x=>{const a=byId[clusterId(x)];return `${a.activity_id} ${a.title}`;}).join('；'),c.reason])),
  `模板感候选 ${enriched.filter(a=>a.audit.template_like).length} 项：原始步骤没有结构化编号，归一化时落到同一套通用五步说明。它们的玩法题材可能不同，标记的是执行文案缺乏独立步骤，不等同于重复或应删除。`,
  ``,
  `## 安全、月龄与编辑风险`,
  ``,
  `安全审查标记：safe ${enriched.filter(a=>rawRisk(a)==='safe').length}；needs_revision ${enriched.filter(a=>rawRisk(a)==='needs_revision').length}；remove_candidate ${enriched.filter(a=>rawRisk(a)==='remove_candidate').length}。其中被程序直接屏蔽 ${enriched.filter(a=>a.safety_level==='blocked').length} 项；**编辑标记和当前安全过滤并非同一件事**。需要复核的项目并非均已自动拦截。`,
  ``,
  `突出问题：\`act_71_灯箱彩色米\`仍可在24月龄进入候选；\`act_118_居家障碍闯关\`、\`act_80_靠垫桥\`的安全版描述与游戏库旧步骤冲突；\`act_97_折纸船\`含水与吹风机；\`act_73_气球与球拍\`使用气球；\`act_81_玻璃鱼缸雪球\`使用玻璃和小件。`,
  ``,
  `旧库 ${enriched.filter(a=>a.audit.age_unclear).length} 项的年龄上限由归一化公式推断，未逐项来源审核。当前月龄能过滤，但“适用到几月”不等于已完成编辑确认。当前 effort 疑似标错 ${Object.keys(effortReview).length} 项，场景疑似标错 ${Object.keys(sceneReview).length} 项。`,
  ``,
  `安全外部参照：[美国消费品安全委员会：3 岁以下小零件与误吞](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)、[玩具与气球提示](https://www.cpsc.gov/id/Safety-Education/Toys)、[家庭水域看护](https://www.cpsc.gov/s3fs-public/InHomeDrowning.pdf)。报告只做内容编辑风险筛查，最终材料和适龄文案仍需人工审核。`,
  ``,
  `## 全量逐项审计表`,
  ``,
  `“可能进入首页/月度计划”只表示通过年龄区间、安全、时长基础条件后存在被选中机会，具体还受场景、精力、兴趣与反馈影响。材料/安全提示原样来自归一化目录。`,
  ``,table(['activity_id','名称','月龄','主领域','secondary_domains','时长','地点','照护者精力','准备成本','清理成本','材料','安全提示','成人全程','插画','首页推荐','月度计划','收藏/反馈','疑似重复','风险级别','年龄不清','场景分类建议','模板感','质量分'],enriched.map(activityRow))
].join('\n');

const age21=eligible(21),age24=eligible(24),ageUnion=enriched.filter(a=>[21,22,23,24].some(age=>age>=a.min_age_months&&age<=a.max_age_months)&&a.safety_level!=='blocked');
const diversity=['motor','fine','lang','cog','soc'].map(domain=>{const items=ageUnion.filter(a=>a.domains.includes(domain));return [domainName[domain],items.length,countsString(items,a=>a.audit.play_type)];});
const lowRows=age21.filter(a=>a.caregiver_effort==='low');
const realLow=lowRows.filter(a=>!a.audit.effort&&['none','low'].includes(a.prep_level)&&['none','low'].includes(a.cleanup_level)&&a.duration.max<=10);
const ageReport=[
  `# 21～24 月龄活动与推荐体验审计`,
  ``,
  `> 口径提示：活动数量取 155 条原始内容；14 天模拟会运行生成时的当前推荐代码，因此可能不同于最初的 Phase 2.5 基线。当前主游戏合并结果见 [activity-cleanup-report.md](activity-cleanup-report.md)。`,
  ``,
  `审计日期：2026-10-24。可用口径为月龄窗口与现有 \`safety_level\` 非 blocked；21～23 月各 ${age21.length} 项，24 月 ${age24.length} 项，21～24 交集/并集不是同一概念：并集 ${ageUnion.length} 项。当前目录 21～24 月可用的项目总量按并集为 ${ageUnion.length}，但 21 月家长实际只能先看到 ${age21.length} 项。`,
  ``,
  `## 覆盖与真实可执行性`,
  ``,table(['月龄','可用总数','大运动','精细动作','语言沟通','认知探索','社会互动','综合类','low','medium','high','含室内','含户外','零准备'],[21,22,23,24].map(age=>{const r=eligible(age),dc=Object.fromEntries(count(r,a=>a.domains[0]));return [age,r.length,dc.motor||0,dc.fine||0,dc.lang||0,dc.cog||0,dc.soc||0,r.filter(a=>a.domains.length>1).length,...['low','medium','high'].map(x=>r.filter(a=>a.caregiver_effort===x).length),r.filter(a=>a.location.includes('indoor')).length,r.filter(a=>a.location.includes('outdoor')).length,r.filter(a=>a.prep_level==='none').length];})),
  `21 月龄现有 low ${lowRows.length} 项；按“≤10分钟、准备与收拾均低、没有被 effort 审计标错”收紧后只有 ${realLow.length} 项，且仍需人工核对是否真正可以坐着完成。\`energyCandidatePool\` 对“很累”先严格筛选，候选不足时会放宽到 medium；下文候选池用的是当前代码真实规则。`,
  ``,
  `生活场景型（daily_life、transition、caregiving）在 21 月龄 ${age21.filter(a=>['daily_life','transition','caregiving'].includes(a.audit.context)).length} 项、24 月龄 ${age24.filter(a=>['daily_life','transition','caregiving'].includes(a.audit.context)).length} 项。这是审计分类建议，产品尚无持久字段。`,
  ``,table(['场景类型（21月）','数量'],categories(age21,a=>labelContext[a.audit.context])),
  `## 五领域玩法类型覆盖图（21～24并集）`,
  ``,table(['领域','活动数','玩法类型与数量'],diversity),
  ``,
  `**主要缺口不是凑平数量**：语言沟通在 21 月龄仅 ${age21.filter(a=>a.domains.includes('lang')).length} 项，优先增加 3～4 种不同类型：请求与选择、动作配语言、绘本接话、日常叙述；社会互动仅 ${age21.filter(a=>a.domains.includes('soc')).length} 项，优先增加 2～3 种：轮流等待、并排同伴玩、合作收拾。大运动虽然有 ${age21.filter(a=>a.domains.includes('motor')).length} 项，但球类、路线与步行变体集中；更值得补 2～3 种安全、低精力的蹲起/推拉/音乐律动玩法。精细动作侧重点应先提升步骤清晰和材料安全，而非继续扩数量。`,
  ``,
  `## 首页 14 天模拟`,
  ``,
  `每组从空白浏览器存储开始，年龄固定 21 月，日期为 2026-10-01 至 2026-10-14。基础情形每天只打开首页，不点“换一换”、不完成游戏、不写反馈；这恰好反映家长被动查看的长期曝光。五组使用当前 \`todayRecommendations\`、年龄/安全/地点/时长/精力过滤和当前得分。相邻重复位的分母为 13 天转换 × 3 个位置；“同玩法类型连续”指相邻两天至少共享一个审计玩法类型，属于粗粒度启发式。`,
  ``,simulationTable(simulations),
  `### 敏感性对照：反馈与收藏`,
  ``,
  `同一“很累/家里/10～15分钟”条件，再对比：每天实际玩完并反馈“还可以”、预先收藏基线前三项、预先标记基线前三项“很喜欢”（日期早于模拟窗口）。收藏/喜欢作用于得分，但不能越过安全、月龄与条件过滤。`,
  ``,simulationTable(sensitivity),
  `**结论**：不记录“玩过”时，当前日期变化本身不会驱动轮换，顶部组合可能连续 14 天完全一致；每天写入反馈才会触发近期玩过降权。收藏 +4 分、很喜欢累计最多 +8 分，可以提升偏好活动，但被动模式下也可能固化组合；本轮只报告，不改算法。`,
  ``,
  `## 指南与月度计划连接`,
  ``,
  `21～23 月指南列出 ${guide.find(x=>x.age_range[0]===21).activity_titles.join('、')}，这三项在 18～26 月龄阶段重复引用；指南内容不等于首页实际轮换集合。月度总结调用同一推荐排名，并对当前成长焦点加分，因此目录中的内容缺口、effort 和安全标签偏差也会传入建议。收藏与反馈继续按 activity_id 关联。`,
  ``,
  `## 待人工核对的问题`,
  ``,
  `- 21 月龄语言/社会互动活动数少，且多为命名/共读或滚球，连续使用时容易重复。`,
  `- “很累”候选池虽有 ${simulations[1].pool} 项，真正坐着、零或低准备、步骤明确的选择更少；户外低 effort 标签需复核。`,
  `- 生活型活动目前靠标题与场景人工识别，无法稳定用字段区分专门游戏、转场、照护。`,
  `- 室内/户外标签有与步骤冲突的个案，室内大空间玩法没有空间门槛字段。`,
  `- 现有系统“换一换”可以主动轮换，但被动每日首页无自然轮换；应在内容清理后再决定产品层修复。`,
].join('\n');

const p0=enriched.filter(a=>a.audit.risk&&a.safety_level!=='blocked').map(a=>({id:a.activity_id,issue:`${a.audit.risk.status}；${a.audit.risk.reason}`,action:a.audit.risk.status==='remove_candidate'?'人工复核后先撤出可见库，或以安全材料重写':'先核对材料/步骤/提示的一致性，必要时从推荐候选移除',human:'是'}));
const p1=[
  ...enriched.filter(a=>a.audit.risk&&a.safety_level==='blocked').map(a=>({id:a.activity_id,issue:`现有过滤已屏蔽；${a.audit.risk.reason}`,action:'复核原内容，决定保留屏蔽、改写或删除；先不要放回推荐',human:'是'})),
  ...clusters.filter(c=>c.decision!=='保留').map(c=>({id:c.ids.map(clusterId).join('、'),issue:`${c.decision}：${c.reason}`,action:'人工对比玩法步骤；确定保留 ID 与收藏/反馈/月度引用迁移方案后再处理',human:'是'})),
  ...Object.entries(effortReview).map(([id,x])=>({id,issue:`照护者精力 ${byId[id].caregiver_effort}→${x.to} 待审：${x.reason}`,action:'实地按“很累时能否坐着完成”核定 effort；若确认再改字段',human:'是'})),
  ...Object.entries(sceneReview).map(([id,x])=>({id,issue:`场景 ${byId[id].location.join('、')}→${x.to} 待审：${x.reason}`,action:'核对普通家庭空间与步骤一致性，必要时调整场景/空间门槛',human:'是'})),
  ...simulations.map(x=>({id:x.batches[0].join('、'),issue:`${x.name}：14天相邻完全相同 ${x.same}/13；候选池 ${x.pool}`,action:'先补足玩法类型及修复标签，再讨论自然轮换与近期曝光策略',human:'是'}))
];
function chunks(items,size){const out=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out;}
const p2=[
  ...enriched.filter(a=>a.audit.template_like).map(a=>({id:a.activity_id,issue:'落入统一五步操作模板，独有玩法步骤不足',action:'人工重写为该玩法特有的2～4步与真实材料，不扩充相似条目',human:'是'})),
  ...chunks(enriched.filter(a=>!a.audit.art),15).map((group,i)=>({id:group.map(a=>a.activity_id).join('、'),issue:`缺少正式插画（第 ${i+1} 组；全库共 ${enriched.filter(a=>!a.audit.art).length} 项）`,action:'只按首页/高频入口优先级补正式资产；继续使用统一 fallback，不自动生成',human:'是'})),
  ...chunks(enriched.filter(a=>a.audit.age_unclear),15).map((group,i)=>({id:group.map(a=>a.activity_id).join('、'),issue:`旧库年龄上限由规则推断（第 ${i+1} 组）`,action:'按来源与操作复杂度人工复核适龄；不要仅因数据分布改年龄',human:'是'})),
  {id:age21.filter(a=>a.domains.includes('lang')).map(a=>a.activity_id).join('、'),issue:'21月龄语言仅3项，玩法集中',action:'后续补3～4种真正不同的请求/选择、绘本接话、动作配语言、日常叙述',human:'是'},
  {id:age21.filter(a=>a.domains.includes('soc')).map(a=>a.activity_id).join('、'),issue:'21月龄社会互动仅4项',action:'后续补2～3种轮流等待、并排同伴玩、合作收拾等不同玩法',human:'是'},
  {id:age21.filter(a=>a.domains.includes('motor')).map(a=>a.activity_id).join('、'),issue:'21月龄大运动虽多，但球、路线与步行变体集中',action:'后续补2～3种低精力、零准备的蹲起/推拉/音乐律动类型',human:'是'}
];
if(new Set(catalog.map(a=>a.activity_id)).size!==catalog.length)throw Error('activity_id 存在重复，不能可靠关联收藏/反馈');
if(simulations.some(x=>x.batches.length!==14||x.batches.some(b=>b.length!==3)))throw Error('14天推荐模拟不完整');
function actionTable(rows){return table(['activity_id','问题','建议动作','需要人工内容审核'],rows.map(x=>[x.id,x.issue,x.action,x.human]));}
const actionReport=[
  `# 游戏与育儿内容库待处理清单`,
  ``,
  `> 口径提示：这是 Phase 2.5A 合并前的候选清单。已实施的主游戏与玩法变化、仍待人工审核的候选见 [activity-cleanup-report.md](activity-cleanup-report.md)。`,
  ``,
  `审计日期：2026-10-24。**只列待审核动作，未修改或删除任何活动。** P0/P1/P2 是本次编辑治理优先级，不是儿童发育风险等级。同一 activity_id 可能同时出现在多个优先级，因为安全、精力、去重是独立问题。`,
  ``,
  `统计：P0 ${p0.length} 条；P1 ${p1.length} 条；P2 ${p2.length} 条。P0 只统计当前仍可展示/推荐且人工发现风险的活动；已被代码屏蔽的风险项列 P1，避免误以为当前仍在首页候选中。候选数量不等于已确认错误数量。`,
  ``,
  `## P0｜当前可见或可推荐的安全与明显错误`,
  ``,actionTable(p0),
  `## P1｜已屏蔽旧内容、重复、标注与推荐体验`,
  ``,actionTable(p1),
  `## P2｜步骤文案、玩法缺口、年龄与插画维护`,
  ``,actionTable(p2),
  `## 实施前的约束`,
  ``,
  `1. 合并/删除 activity_id 前，先检查收藏、反馈和历史月度计划快照的引用；不可直接使旧 ID 失效。`,
  `2. 小件、气球、磁体、水盆与电器相关内容必须由人工逐项审查，不能靠字符串替换解除风险。参照 [CPSC 小零件](https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs)、[CPSC 玩具安全](https://www.cpsc.gov/id/Safety-Education/Toys) 和 [CPSC 家庭水域](https://www.cpsc.gov/s3fs-public/InHomeDrowning.pdf)。`,
  `3. 先处理 P0，再校准 effort/场景与去重，最后按真正玩法类型补缺口。此轮审计不执行这些动作。`,
].join('\n');

for(const [name,body] of [['activity-library-audit.md',overview],['activity-21-24-audit.md',ageReport],['activity-content-actions.md',actionReport]])fs.writeFileSync(path.join(root,name),body+'\n');
console.log(JSON.stringify({total:catalog.length,age21:age21.length,age24:age24.length,age21to24Union:ageUnion.length,domains:count(enriched,a=>a.domains[0]),effort:count(enriched,a=>a.caregiver_effort),zeroPrep:enriched.filter(a=>a.prep_level==='none').length,duplicateClusters:clusters.filter(c=>c.decision!=='保留').length,duplicateIds:duplicateCandidates.size,templateLike:enriched.filter(a=>a.audit.template_like).length,safetyRisk:enriched.filter(a=>rawRisk(a)!=='safe').length,effortReview:Object.keys(effortReview).length,p0:p0.length,p1:p1.length,p2:p2.length,simulations:simulations.map(x=>({name:x.name,pool:x.pool,unique:x.unique,same:x.same,overlap:x.overlap})),sensitivity:sensitivity.map(x=>({mode:x.mode,unique:x.unique,same:x.same,overlap:x.overlap})),invalidGuideRefs:invalidGuideRefs.length,toyRefs:toyRefs.length},null,2));
