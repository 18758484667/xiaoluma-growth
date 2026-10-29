const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const selector=require('../assets/weekly-theme-compatible-shadow.js');
const bridge=require('../data/experience-theme-mechanism-bridge.json');
const pilot=require('../data/five-brain-gap-content-pilot.json');
const mappings=['activity-five-brain-mappings.json','activity-five-brain-mappings-batch2.json','activity-five-brain-mappings-batch3.json'].flatMap(f=>require('../data/'+f).mappings)
  .concat(pilot.items.map(x=>({...x,age_window:{min_months:x.age_range[0],max_months:x.age_range[1]}})));
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
    suggested_activities:[
      {activity_id:'gm_chase_kick_ball',variant_id:'gm_chase_kick_ball',domain:'motor'},
      {activity_id:'act_14_泡泡追跑',variant_id:'act_76_漫天泡泡',domain:'motor'},
      {activity_id:'act_33_室内沙粒盒',variant_id:'act_33_室内沙粒盒',domain:'cog'},
      {activity_id:'act_38_感官游戏大混战',variant_id:'act_38_感官游戏大混战',domain:'cog'}]
  }]
};
[[ctx.EVIDENCE_KEY,backup.evidence],[ctx.ASSESSMENT_KEY,backup.assessments],[ctx.WEEKLY_PLAN_KEY,backup.weeklyLearningPlans],
 [ctx.ACTIVITY_EXPOSURE_KEY,backup.activityExposure],[ctx.ACTIVITY_FEEDBACK_KEY,backup.activityFeedback],
 [ctx.ACTIVITY_FAVORITES_KEY,backup.activityFavorites],[ctx.TODAY_PREFS_KEY,backup.todayPreferences]].forEach(([k,v])=>storage.set(k,JSON.stringify(v)));
const weekly=ctx.weeklyPlanForDate('2026-10-29'),prefs=ctx.loadTodayPrefs(),states=ctx.currentDomainStates();
const names={motor:'自己动起来',fine:'自己动手完成',lang:'把想法说出来',cog:'找一找，看看在哪里',soc:'我和你轮流来'};
const before={storage:JSON.stringify([...storage]),weekly:JSON.stringify(weekly),evidence:JSON.stringify(ctx.loadEvidence()),
  today:ctx.recommendActivities(prefs,21,'2026-10-29',states).map(x=>x.activity_id),
  score:ctx.activityScore(ctx.activityById('gm_chase_kick_ball'),21,prefs,states,'2026-10-29').score,
  bonus:ctx.weeklyPlanActivityBonus(ctx.activityById('gm_chase_kick_ball'),'2026-10-29')};
const options=selector.buildOptions({ctx,age_months:21,prefs,states,reference_date:'2026-10-29'});
function run(changes){return selector.select({weekly_plan:weekly,age_months:21,options,mappings,bridge,taxonomy:ctx.BRAIN_MECHANISMS,name_by_domain:names,...changes});}
const result=run();let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
const move=result.groups.find(g=>g.theme_id==='move_self'),find=result.groups.find(g=>g.theme_id==='search_where');
check('正式 weekly snapshot 原样保留',()=>assert.equal(JSON.stringify(ctx.weeklyPlanForDate('2026-10-29')),before.weekly));
check('shadow 保留原两个体验主题及次序',()=>assert.deepEqual(result.experience_themes,['自己动起来','找一找，看看在哪里']));
check('theme gate 只接受 approved 且存在的机制',()=>{assert.ok(result.groups.flatMap(g=>g.shadow).every(x=>x.mechanism_ids.length));const altered=structuredClone(mappings);altered.find(m=>m.activity_id==='gap_delayed_bowl_find').mapping_status='revised';assert.ok(!run({mappings:altered}).groups.flatMap(g=>g.shadow).some(x=>x.variant_id==='gap_delayed_bowl_find'));});
check('ability 不是主题兼容的直接来源',()=>{const altered=structuredClone(mappings),row=altered.find(m=>m.activity_id==='gap_delayed_bowl_find');row.primary_ability_ids=[];row.secondary_ability_ids=[];const r=run({mappings:altered});assert.ok(r.pool_by_theme.find(x=>x.theme_id==='search_where').candidate_count>=1);assert.ok(r.groups.flatMap(g=>g.shadow).some(x=>x.activity_id==='gap_delayed_bowl_find'));});
check('variant 不提升 canonical，且只能选精确 approved variant',()=>{const cup=options.find(x=>x.variant_id==='gap_variant_cup_try_another');assert.ok(cup);assert.ok(find.shadow.some(x=>x.variant_id==='gap_variant_cup_try_another'));assert.ok(!find.shadow.some(x=>x.variant_id==='act_10_叠叠杯排序'));});
check('两项已知触感错配被识别',()=>{for(const id of ['act_33_室内沙粒盒','act_38_感官游戏大混战'])assert.equal(find.original.find(x=>x.activity_id===id).compatible,false);});
check('室内看泡泡 variant 不冒充追泡泡主玩法',()=>assert.equal(move.original.find(x=>x.activity_id==='act_14_泡泡追跑').compatible,false));
check('已有合法搜索与配对内容替换两项错配',()=>{assert.equal(find.shadow.length,2);assert.ok(find.shadow.every(x=>['search_and_find','simple_matching'].some(m=>x.mechanism_ids.includes(m))));assert.ok(find.shadow.every(x=>!find.original_activity_ids.includes(x.activity_id)));});
check('recent exposure 的原有降权仍生效',()=>{const id=find.shadow[0].activity_id,baseline=options.find(x=>x.activity_id===id).score,old=storage.get(ctx.ACTIVITY_EXPOSURE_KEY);const rows=JSON.parse(old);rows.push({activity_id:id,date:'2026-10-28',shown_at:'2026-10-28T10:00:00.000Z',surface:'today_home'});storage.set(ctx.ACTIVITY_EXPOSURE_KEY,JSON.stringify(rows));const after=selector.buildOptions({ctx,age_months:21,prefs,states,reference_date:'2026-10-29'}).find(x=>x.activity_id===id).score;storage.set(ctx.ACTIVITY_EXPOSURE_KEY,old);assert.ok(after<baseline);});
check('interest 的原有加权仍生效',()=>{const target='act_75_藏猫猫',normal=options.find(x=>x.activity_id===target).score,interested=selector.buildOptions({ctx,age_months:21,prefs:{...prefs,interests:['climbing']},states,reference_date:'2026-10-29'}).find(x=>x.activity_id===target).score;assert.ok(interested>normal);});
check('caregiver effort 原有候选池仍先过滤',()=>{const low={...prefs,energy:'low'},o=selector.buildOptions({ctx,age_months:21,prefs:low,states,reference_date:'2026-10-29'});assert.ok(o.length>=3);assert.ok(o.every(x=>x.caregiver_effort==='low'));});
check('五主题当前条件下候选池均未枯竭',()=>assert.ok(result.pool_by_theme.every(x=>x.candidate_count>=2)));
check('极短低精力模式会如实报告轮流主题候选枯竭',()=>{const low={...prefs,duration:'5',energy:'low'},o=selector.buildOptions({ctx,age_months:21,prefs:low,states,reference_date:'2026-10-29'}),r=run({options:o});assert.equal(r.pool_by_theme.find(x=>x.theme_id==='take_turns').candidate_count,0);assert.ok(r.warnings.some(x=>x.code==='theme_candidate_pool_too_narrow'&&x.theme_id==='take_turns'));});
check('户外条件下找一找池过窄时不拿无映射游戏填位',()=>{const outdoor={...prefs,context:'outdoor',energy:'high'},o=selector.buildOptions({ctx,age_months:21,prefs:outdoor,states,reference_date:'2026-10-29'}),r=run({options:o});assert.equal(r.pool_by_theme.find(x=>x.theme_id==='search_where').candidate_count,1);assert.equal(r.groups.find(x=>x.theme_id==='search_where').shadow.length,1);assert.ok(r.warnings.some(x=>x.code==='theme_candidate_pool_too_narrow'&&x.theme_id==='search_where'));});
check('兴趣改变后，同主题内的原有分数会改变入选游戏',()=>{const interested={...prefs,interests:['climbing']},o=selector.buildOptions({ctx,age_months:21,prefs:interested,states,reference_date:'2026-10-29'}),r=run({options:o});assert.ok(r.groups.find(x=>x.theme_id==='search_where').shadow.some(x=>x.activity_id==='act_75_藏猫猫'));});
check('近期曝光会使同主题候选后退',()=>{const old=storage.get(ctx.ACTIVITY_EXPOSURE_KEY),rows=JSON.parse(old);rows.push({activity_id:'gap_delayed_bowl_find',date:'2026-10-28',shown_at:'2026-10-28T12:00:00.000Z',surface:'today_home'});storage.set(ctx.ACTIVITY_EXPOSURE_KEY,JSON.stringify(rows));const o=selector.buildOptions({ctx,age_months:21,prefs,states,reference_date:'2026-10-29'}),r=run({options:o});storage.set(ctx.ACTIVITY_EXPOSURE_KEY,old);assert.ok(!r.groups.find(x=>x.theme_id==='search_where').shadow.some(x=>x.activity_id==='gap_delayed_bowl_find'));});
check('无 child evidence 不产生补弱选游',()=>assert.deepEqual(run({child_evidence:[]}).shadow_activity_ids,run({child_evidence:Array(100).fill({ability_id:'int_memory_learning'})}).shadow_activity_ids));
check('ability 数量不改变排序分数与选择',()=>{const altered=structuredClone(mappings),row=altered.find(m=>m.activity_id==='gap_detour_soft_ball');row.secondary_ability_ids=[];assert.deepEqual(run({mappings:altered}).shadow_activity_ids,result.shadow_activity_ids);});
check('memory limited 不引发强制补齐',()=>{const altered=structuredClone(mappings),row=altered.find(m=>m.activity_id==='gap_delayed_bowl_find');row.primary_ability_ids=[];row.secondary_ability_ids=[];assert.deepEqual(run({mappings:altered}).shadow_activity_ids,result.shadow_activity_ids);});
check('Today 推荐顺序完全不变',()=>assert.deepEqual(ctx.recommendActivities(prefs,21,'2026-10-29',states).map(x=>x.activity_id),before.today));
check('recommendation score 和 weekly +5 不变',()=>{assert.equal(ctx.activityScore(ctx.activityById('gm_chase_kick_ball'),21,prefs,states,'2026-10-29').score,before.score);assert.equal(ctx.weeklyPlanActivityBonus(ctx.activityById('gm_chase_kick_ball'),'2026-10-29'),before.bonus);});
check('Growth 和正式入口未加载 shadow selector',()=>{for(const f of ['育儿系统看板.html','assets/growth-plan-v2.js','assets/weekly-learning-plan.js','assets/weekly-learning-plan-ui.js'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes('weekly-theme-compatible-shadow'));});
check('child evidence 与全部存储未被影子分析修改',()=>{assert.equal(JSON.stringify(ctx.loadEvidence()),before.evidence);assert.equal(JSON.stringify([...storage]),before.storage);});
check('游戏操作仍不产生成长 evidence',()=>{ctx.renderGames();ctx.toggleActivityFavorite('gm_soft_toy_delivery');ctx.updateActivityFeedback('gm_soft_toy_delivery','enjoyment','love');assert.equal(JSON.stringify(ctx.loadEvidence()),before.evidence);});
console.log(`Weekly theme compatible shadow: ${passed} passed, 0 failed`);
