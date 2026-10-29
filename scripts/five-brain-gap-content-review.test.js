const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const data=require('../data/five-brain-gap-content-pilot.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const smokeFile=path.join(__dirname,'smoke.test.js'),loader=new Module(smokeFile,module);
loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const byId=Object.fromEntries(data.items.map(x=>[x.activity_id,x]));
const revisedIds=['gap_variant_cup_try_another','gap_variant_bear_sleep_recall','gap_variant_daily_location_recall'];
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
check('复核只处理既有3项revised，仍为3个新canonical与3个variant',()=>{
  assert.equal(data.items.length,6);assert.equal(data.items.filter(x=>x.decision==='new_canonical').length,3);
  assert.deepEqual(data.items.filter(x=>x.decision==='add_as_variant').map(x=>x.activity_id).sort(),revisedIds.slice().sort());
  assert.equal(data.items.filter(x=>x.mapping_status==='approved').length,6);
  assert.equal(data.items.filter(x=>x.mapping_status==='revised').length,0);
});
check('两个通过的映射只属于variant，不提升到原主游戏',()=>{
  for(const id of ['gap_variant_cup_try_another','gap_variant_daily_location_recall']){const row=byId[id];assert.equal(row.mapping_status,'approved');assert.equal(row.mapping_scope,'variant_only');assert.notEqual(row.activity_id,row.canonical_id);}
  assert.equal(byId.gap_variant_cup_try_another.canonical_id,'act_10_叠叠杯排序');
  assert.equal(byId.gap_variant_daily_location_recall.canonical_id,'gap_delayed_bowl_find');
  assert.ok(!fs.readFileSync(path.join(__dirname,'..','育儿系统看板.html'),'utf8').includes('five-brain-gap-content-pilot'));
});
check('套杯问题解决有目标、独立尝试与失败后调整',()=>{
  const row=byId.gap_variant_cup_try_another,c=row.review_checks.problem_solving;
  assert.ok(c.goal&&c.independent_attempt&&c.feedback_or_adjustment);
  assert.match(row.steps.join(' '),/不示范正确排列/);assert.match(row.steps.join(' '),/套不进去时先等待/);assert.match(row.steps.join(' '),/换杯|转向|重来/);
  assert.ok(row.mechanism_ids.some(m=>ontology.getAbilityById('int_problem_solving').related_mechanisms.includes(m)));
});
check('生活找位置有先前信息、自然短间隔、无持续提示与后续使用',()=>{
  const row=byId.gap_variant_daily_location_recall,c=row.review_checks.memory_learning;
  assert.ok(c.prior_exposure&&c.retention_interval&&c.later_reuse&&c.adult_prompt_free);
  assert.match(row.steps.join(' '),/间隔几秒/);assert.match(row.steps.join(' '),/不持续指向/);
  assert.deepEqual(row.secondary_ability_ids,[]);assert.ok(!row.mapping_reason.lang_comprehension);
});
check('小熊动作回忆仅通过variant专属的延迟模仿路径',()=>{
  const row=byId.gap_variant_bear_sleep_recall;
  assert.equal(row.mapping_status,'approved');assert.equal(row.mapping_scope,'variant_only');
  assert.deepEqual(row.mechanism_ids,['deferred_imitation','pretend_play']);
  assert.ok(row.mechanism_ids.some(m=>ontology.getAbilityById('int_memory_learning').related_mechanisms.includes(m)));
  assert.ok(!row.primary_ability_ids.concat(row.secondary_ability_ids).some(id=>id.startsWith('cre_')));
});
check('材料安全与家长语言保持原设计，不新增小件或训练要求',()=>{
  for(const row of data.items){assert.ok(row.safety_notes&&row.materials);assert.ok(!/小贴纸|碎纸|珠子|硬币|小积木/.test(row.materials));assert.ok(!/训练问题解决|提升记忆力|强化执行功能/.test(row.steps.join(' ')));}
});
check('内容覆盖按不同canonical计数：问题解决3 usable，记忆学习2 limited',()=>{
  const approved=data.items.filter(x=>x.mapping_status==='approved');
  function coverage(ability){const rows=approved.filter(x=>x.primary_ability_ids.concat(x.secondary_ability_ids).includes(ability)),ids=new Set(rows.map(x=>x.canonical_id)),mechs=new Set(rows.flatMap(x=>x.mechanism_ids).filter(m=>ontology.getAbilityById(ability).related_mechanisms.includes(m)));return {count:ids.size,mechanisms:[...mechs].sort()};}
  const problem=coverage('int_problem_solving'),memory=coverage('int_memory_learning');
  assert.equal(problem.count,3);assert.deepEqual(problem.mechanisms,['hands_on_action','simple_matching']);
  assert.equal(memory.count,2);assert.deepEqual(memory.mechanisms,['deferred_imitation','search_and_find']);
});
check('正式21个月安全池为57，已审核主游戏进入页面',()=>{
  assert.equal(ctx.activityCatalog().filter(a=>ctx.activityAvailableAtAge(a,21)).length,57);
  assert.ok(data.items.filter(x=>x.decision==='new_canonical').every(x=>ctx.activityById(x.activity_id)));
});
check('读取审核数据不改变推荐与周计划输出',()=>{
  const prefs={duration:'10_15',context:'home',energy:'low',interests:[]},day='2026-10-28';
  const beforeRec=ctx.recommendActivities(prefs,21,day,{}).map(x=>x.activity_id);
  const beforePlan=ctx.buildWeeklyPlan(day);delete beforePlan.generated_at;
  JSON.stringify(data.items.filter(x=>x.mapping_scope==='variant_only'));
  assert.deepEqual(ctx.recommendActivities(prefs,21,day,{}).map(x=>x.activity_id),beforeRec);
  const afterPlan=ctx.buildWeeklyPlan(day);delete afterPlan.generated_at;
  assert.deepEqual(JSON.parse(JSON.stringify(afterPlan)),JSON.parse(JSON.stringify(beforePlan)));
});
check('普通游戏操作不创建成长或五脑evidence',()=>{
  const growth=JSON.stringify(ctx.loadEvidence()),five=storage.get('xlma_five_brain_evidence_v1');
  ctx.renderGames();ctx.toggleActivityFavorite('gm_roll_fetch');ctx.updateActivityFeedback('gm_roll_fetch','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),growth);assert.equal(storage.get('xlma_five_brain_evidence_v1'),five);
});
console.log(`Five-brain gap content review: ${passed} passed, 0 failed`);
