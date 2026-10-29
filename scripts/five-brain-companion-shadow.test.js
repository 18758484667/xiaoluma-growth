const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const shadow=require('../assets/five-brain-companion-shadow.js');
const ontology=require('../assets/five-brain-ontology-api.js');
const batches=['activity-five-brain-mappings.json','activity-five-brain-mappings-batch2.json','activity-five-brain-mappings-batch3.json'].flatMap(f=>require('../data/'+f).mappings);
const pilot=require('../data/five-brain-gap-content-pilot.json').items.map(x=>({...x,age_window:{min_months:x.age_range[0],max_months:x.age_range[1]}}));
const mappings=batches.concat(pilot);
const smoke=path.join(__dirname,'smoke.test.js'),loader=new Module(smoke,module);
loader.filename=smoke;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smoke,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smoke);
const {ctx,storage}=loader.exports;
const backupPath='/Users/sunpoet/Downloads/小鹿玛成长数据_2026-10-28_0930.json';
const backup=fs.existsSync(backupPath)?require(backupPath):{
  evidence:[],assessments:[],activityExposure:[],activityFeedback:[],activityFavorites:[],
  todayPreferences:{duration:'10_15',context:'home',energy:'medium',interests:[]},
  weeklyLearningPlans:[{week_start:'2026-10-26',week_end:'2026-11-01',age_months:21,generated_at:1,
    focus_areas:[{domain:'motor',title:'主动移动'},{domain:'cog',title:'探索与寻找'}],
    suggested_activities:[one('gm_chase_kick_ball'),one('act_14_泡泡追跑','act_76_漫天泡泡')]}]
};
const themeMap=ctx.BRAIN_THEME_MECHANISMS;
const base={age_months:21,ontology,mappings,theme_mechanisms:themeMap,resolve_activity:ctx.activityById,is_eligible:ctx.activityAvailableAtAge,analyzed_at:'2026-10-29T00:00:00.000Z'};
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
function run(changes){return shadow.analyze({...base,...changes});}
function one(id,variant){return {activity_id:id,variant_id:variant||id};}
function ids(rows){return rows.map(x=>x.ability_id);}
function seed(){
  storage.set(ctx.EVIDENCE_KEY,JSON.stringify(backup.evidence));
  storage.set(ctx.ASSESSMENT_KEY,JSON.stringify(backup.assessments));
  storage.set(ctx.WEEKLY_PLAN_KEY,JSON.stringify(backup.weeklyLearningPlans));
  storage.set(ctx.ACTIVITY_EXPOSURE_KEY,JSON.stringify(backup.activityExposure));
  storage.set(ctx.ACTIVITY_FEEDBACK_KEY,JSON.stringify(backup.activityFeedback));
  storage.set(ctx.ACTIVITY_FAVORITES_KEY,JSON.stringify(backup.activityFavorites));
  storage.set(ctx.TODAY_PREFS_KEY,JSON.stringify(backup.todayPreferences));
}
seed();const weekly=ctx.weeklyPlanForDate('2026-10-29'),prefs=ctx.loadTodayPrefs();
const states=ctx.currentDomainStates(),today=ctx.recommendActivities(prefs,21,'2026-10-29',states);
check('真实备份周快照只读取得，不重新生成',()=>assert.equal(weekly.week_start,'2026-10-26'));
const themeTitles={motor:'自己动起来',cog:'找一找，看看在哪里'};
check('真实备份两主题与现有 UI 映射一致',()=>{assert.deepEqual(weekly.focus_areas.map(f=>themeTitles[f.domain]),['自己动起来','找一找，看看在哪里']);const ui=fs.readFileSync(path.join(__dirname,'../assets/weekly-learning-plan-ui.js'),'utf8');Object.values(themeTitles).forEach(t=>assert.ok(ui.includes(t)));});
const before={storage:JSON.stringify([...storage]),weekly:JSON.stringify(weekly),today:today.map(x=>x.activity_id),evidence:JSON.stringify(ctx.loadEvidence())};
const record=run({weekly_plan:weekly,today_activities:today,experience_themes:weekly.focus_areas.map(f=>themeTitles[f.domain])});
check('shadow 不改变推荐结果',()=>assert.deepEqual(ctx.recommendActivities(prefs,21,'2026-10-29',states).map(x=>x.activity_id),before.today));
check('shadow 不改变 weekly snapshot',()=>assert.equal(JSON.stringify(ctx.weeklyPlanForDate('2026-10-29')),before.weekly));
check('shadow 不改变 Today 排序',()=>assert.deepEqual(record.today_activities.map(x=>x.activity_id),before.today));
check('shadow 不写 storage 或 child evidence',()=>{assert.equal(JSON.stringify([...storage]),before.storage);assert.equal(JSON.stringify(ctx.loadEvidence()),before.evidence);});
check('仅 approved 映射有效',()=>{const bad={...mappings.find(x=>x.mapping_status==='approved'),activity_id:'gm_chase_kick_ball',mapping_status:'revised'};const r=run({mappings:[bad],today_activities:[one('gm_chase_kick_ball')]});assert.deepEqual(r.today_activities[0].primary_growth_opportunities,[]);assert.ok(r.warnings.some(x=>x.code==='no_approved_mapping'));});
check('variant 记忆映射不提升 canonical',()=>{const r=run({today_activities:[one('act_1_假装游戏')]});assert.ok(!ids(r.today_activities[0].primary_growth_opportunities).includes('int_memory_learning'));});
check('只有精确 variant 获得延迟模仿记忆机会',()=>{const r=run({today_activities:[one('act_1_假装游戏','gap_variant_bear_sleep_recall')]});assert.ok(ids(r.today_activities[0].primary_growth_opportunities).includes('int_memory_learning'));assert.ok(r.today_activities[0].mechanisms.includes('deferred_imitation'));});
check('无 evidence 不触发补弱，记录只由已审核游戏决定',()=>{const a=run({today_activities:[one('gap_open_big_box')]}),b=run({today_activities:[one('gap_open_big_box')],child_evidence:[{ability_id:'int_problem_solving'}]});assert.deepEqual(a.today_activities,b.today_activities);});
check('evidence 数量不成为权重或排序',()=>{const r=run({today_activities:[one('gap_open_big_box')],child_evidence:Array(100).fill({ability_id:'mov_fine_motor'})});assert.deepEqual(r.today_activities.map(x=>x.activity_id),['gap_open_big_box']);assert.ok(!('score' in r));});
check('future ability 被拒为21个月机会',()=>{const fake={...mappings[0],activity_id:'gap_open_big_box',primary_ability_ids:['cre_divergent_thinking'],secondary_ability_ids:[]};const r=run({mappings:[fake],today_activities:[one('gap_open_big_box')]});assert.deepEqual(r.today_activities[0].primary_growth_opportunities,[]);assert.ok(r.warnings.some(x=>x.code==='future_ability_used'));});
check('early ability 仅进入 precursor',()=>{const fake={...mappings[0],activity_id:'gap_open_big_box',primary_ability_ids:['int_executive_function'],secondary_ability_ids:[]};const r=run({mappings:[fake],today_activities:[one('gap_open_big_box')]});assert.deepEqual(r.today_activities[0].primary_growth_opportunities,[]);assert.equal(r.today_activities[0].precursor_opportunities[0].ability_id,'int_executive_function');});
check('健康管理不成为游戏目标',()=>{const fake={...mappings[0],activity_id:'gap_open_big_box',primary_ability_ids:['mov_health_context'],secondary_ability_ids:[]};const r=run({mappings:[fake],today_activities:[one('gap_open_big_box')]});assert.deepEqual(r.today_activities[0].primary_growth_opportunities,[]);});
check('年龄或安全不合格优先挡住五脑解释',()=>{const r=run({today_activities:[one('gap_open_big_box')],is_eligible:()=>false});assert.deepEqual(r.today_activities[0].mechanisms,[]);assert.ok(r.warnings.some(x=>x.code==='unsafe_or_age_ineligible'));});
check('记忆 limited 不驱动强制补齐',()=>{const r=run({weekly_plan:weekly,today_activities:today});assert.deepEqual(r.activity_ids,Array.from(new Set(weekly.suggested_activities.concat(today).map(x=>x.activity_id))));});
check('pretend_play 不能绕过 creative future',()=>{const r=run({today_activities:[one('act_1_假装游戏','gap_variant_bear_sleep_recall')]});assert.ok(!r.growth_opportunities.some(x=>x.startsWith('cre_')));});
check('普通游戏操作不会被 shadow 创建成长 evidence',()=>assert.equal(JSON.stringify(ctx.loadEvidence()),before.evidence));
check('Growth 和前台脚本没有加载 shadow 模块',()=>{for(const f of ['育儿系统看板.html','assets/growth-plan-v2.js','assets/weekly-learning-plan.js'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes('five-brain-companion-shadow'));});
console.log(`Five-brain companion shadow: ${passed} passed, 0 failed`);
