const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const bridge=require('../assets/experience-theme-mechanism-bridge.js');
const config=require('../data/experience-theme-mechanism-bridge.json');
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
const seed=[[ctx.EVIDENCE_KEY,backup.evidence],[ctx.ASSESSMENT_KEY,backup.assessments],[ctx.WEEKLY_PLAN_KEY,backup.weeklyLearningPlans],
  [ctx.ACTIVITY_EXPOSURE_KEY,backup.activityExposure],[ctx.ACTIVITY_FEEDBACK_KEY,backup.activityFeedback],
  [ctx.ACTIVITY_FAVORITES_KEY,backup.activityFavorites],[ctx.TODAY_PREFS_KEY,backup.todayPreferences]];
seed.forEach(([key,value])=>storage.set(key,JSON.stringify(value)));
const weekly=ctx.weeklyPlanForDate('2026-10-29'),catalog=ctx.activityCatalog();
const input={age_months:21,bridge:config,mappings,catalog,taxonomy:ctx.BRAIN_MECHANISMS,
  is_eligible:ctx.activityAvailableAtAge,weekly_plan:weekly,
  name_by_domain:{motor:'自己动起来',fine:'自己动手完成',lang:'把想法说出来',cog:'找一找，看看在哪里',soc:'我和你轮流来'}};
let passed=0;function check(label,fn){fn();passed++;console.log('PASS',label);}
const beforeStorage=JSON.stringify([...storage]),beforeWeekly=JSON.stringify(weekly),beforeEvidence=JSON.stringify(ctx.loadEvidence());
const prefs=ctx.loadTodayPrefs(),states=ctx.currentDomainStates(),todayBefore=ctx.recommendActivities(prefs,21,'2026-10-29',states).map(a=>a.activity_id);
const scoreActivity=ctx.activityById('gm_chase_kick_ball'),scoreBefore=ctx.activityScore(scoreActivity,21,prefs,states,'2026-10-29').score;
const result=bridge.audit(input);
check('五个固定家长主题均存在且名称未改',()=>assert.equal(bridge.validateBridge(config,ctx.BRAIN_MECHANISMS).length,0));
check('只引用项目真实有效机制',()=>{const changed=structuredClone(config);changed.themes[0].primary_mechanism_ids=['made_up'];assert.ok(bridge.validateBridge(changed,ctx.BRAIN_MECHANISMS).some(x=>x.includes('nonexistent')));});
check('主题配置没有 ability、score 或儿童结论直连',()=>{assert.ok(config.themes.every(t=>!Object.keys(t).some(k=>/ability|score|deficit|child_evidence/i.test(k))));assert.ok(bridge.validateBridge(config,ctx.BRAIN_MECHANISMS).length===0);});
check('成长机会只由 approved activity mapping 间接产生',()=>{const onlyUnapproved=bridge.audit({...input,mappings:mappings.filter(m=>m.mapping_status!=='approved')});assert.ok(onlyUnapproved.themes.every(t=>t.growth_opportunities.length===0));});
check('variant 映射不提升 canonical 主游戏',()=>{const row=result.themes.find(t=>t.theme_id==='search_where').supported_activities.find(a=>a.activity_id==='act_10_叠叠杯排序');assert.ok(row.explicit_variant_ids.includes('gap_variant_cup_try_another'));assert.equal(mappings.find(m=>m.activity_id==='act_10_叠叠杯排序').mapping_status,'revised');});
check('theme-neutral 游戏允许存在',()=>assert.ok(result.theme_neutral_activity_ids.includes('act_33_室内沙粒盒')));
check('unmapped 触感游戏不自动推断认知或五脑能力',()=>{const x=result.weekly.find(x=>x.activity_id==='act_33_室内沙粒盒');assert.deepEqual(x.approved_growth_opportunities,[]);assert.deepEqual(x.approved_mechanisms,[]);});
check('future 能力不通过主题机制绕过年龄规则',()=>{const fake=structuredClone(mappings);const m=fake.find(x=>x.activity_id==='gm_chase_kick_ball');m.primary_ability_ids=['cre_divergent_thinking'];m.secondary_ability_ids=[];const audit=bridge.audit({...input,mappings:fake});assert.ok(!audit.themes.flatMap(t=>t.growth_opportunities).includes('cre_divergent_thinking'));});
check('儿童无 evidence 或有大量 evidence 都不改变 bridge',()=>{const empty=bridge.audit({...input,child_evidence:[]}),many=bridge.audit({...input,child_evidence:Array(100).fill({ability_id:'int_memory_learning'})});assert.deepEqual(empty,many);});
check('本周快照仍是相同四项、两个主题',()=>assert.equal(JSON.stringify(ctx.weeklyPlanForDate('2026-10-29')),beforeWeekly));
check('Today 候选和顺序不变',()=>assert.deepEqual(ctx.recommendActivities(prefs,21,'2026-10-29',states).map(a=>a.activity_id),todayBefore));
check('recommendation score 不变',()=>assert.equal(ctx.activityScore(scoreActivity,21,prefs,states,'2026-10-29').score,scoreBefore));
check('child evidence 与本地数据未写入',()=>{assert.equal(JSON.stringify(ctx.loadEvidence()),beforeEvidence);assert.equal(JSON.stringify([...storage]),beforeStorage);});
check('Growth 和产品入口没有加载 bridge',()=>{for(const f of ['育儿系统看板.html','assets/growth-plan-v2.js','assets/weekly-learning-plan.js','assets/weekly-learning-plan-ui.js'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes('experience-theme-mechanism-bridge'));});
check('浏览和游戏反馈操作仍不因 bridge 写 evidence',()=>{ctx.renderGames();ctx.toggleActivityFavorite('gm_soft_toy_delivery');ctx.updateActivityFeedback('gm_soft_toy_delivery','enjoyment','love');assert.equal(JSON.stringify(ctx.loadEvidence()),beforeEvidence);});
check('21个月正式安全适龄 canonical 池为57项',()=>assert.equal(result.canonical_safe_count,57));
check('找一找主题供给存在，但当前两项均不支撑该主题',()=>{const find=result.themes.find(t=>t.theme_id==='search_where');assert.ok(find.supported_canonical_count>=3);assert.deepEqual(result.weekly.filter(x=>x.assigned_theme==='找一找，看看在哪里').map(x=>x.classification),['theme_assignment_mismatch','theme_assignment_mismatch']);});
check('成人单向说话或理解机会不自动算“把想法说出来”',()=>{const express=result.themes.find(t=>t.theme_id==='express_ideas');for(const id of ['act_122_厚页绘本共读','act_126_水果寻宝','act_130_简单指令互动','gm_find_bear_return'])assert.ok(!express.supported_activities.some(a=>a.activity_id===id),id);});
console.log(`Experience theme mechanism bridge: ${passed} passed, 0 failed`);
