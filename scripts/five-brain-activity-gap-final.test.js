const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const Module=require('node:module');
const root=path.join(__dirname,'..');
const first=require('../data/activity-five-brain-mappings.json');
const second=require('../data/activity-five-brain-mappings-batch2.json');
const candidates=require('../data/activity-five-brain-candidates-batch3.json');
const third=require('../data/activity-five-brain-mappings-batch3.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const pilot=require('../assets/five-brain-activity-pilot.js');
const coverage=require('../assets/five-brain-activity-coverage.js');
const smokeFile=path.join(__dirname,'smoke.test.js'),loader=new Module(smokeFile,module);
loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const context={ontologyApi:ontology,mechanisms:ctx.BRAIN_MECHANISMS,activityById:ctx.activityById,
  canonicalActivityId:ctx.canonicalActivityId,activityAvailableAtAge:ctx.activityAvailableAtAge};
const batches=[first,second,third],matrix=coverage.approvedCoverage(batches,ontology,ctx.activityById);
const byAbility=Object.fromEntries(matrix.abilities.map(x=>[x.ability_id,x]));
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
function changed(id,patch){const copy=structuredClone(third);Object.assign(copy.mappings.find(x=>x.activity_id===id),patch);return coverage.validateBatch(copy,candidates,[first,second],context,pilot);}
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');}

check('历史59项审核记录保持完整；并库后21月57项可展示',()=>{
  const catalog=ctx.activityCatalog(),eligible=age=>catalog.filter(x=>ctx.activityAvailableAtAge(x,age));
  const union=new Set([21,22,23,24].flatMap(age=>eligible(age).map(x=>x.activity_id)));
  const prior=new Set([...first.mappings,...second.mappings].map(x=>x.activity_id));
  const remaining=eligible(21).filter(x=>!prior.has(x.activity_id)).map(x=>x.activity_id).sort();
  assert.equal(union.size,84);assert.equal(eligible(21).length,57);assert.equal(prior.size,50);
  assert.equal(remaining.length,8);
  assert.equal(JSON.stringify(candidates.candidates.map(x=>x.activity_id).sort()),JSON.stringify(third.mappings.map(x=>x.activity_id).sort()));
  assert.ok(third.mappings.every(x=>ctx.canonicalActivityId(x.activity_id)===x.activity_id));
});
check('9项审核完整且与前两批不重复：3 approved、1 revised、3 rejected、2 unmapped',()=>{
  assert.deepEqual(coverage.validateBatch(third,candidates,[first,second],context,pilot),[]);
  assert.deepEqual(['approved','revised','rejected','unmapped'].map(s=>third.mappings.filter(x=>x.mapping_status===s).length),[3,1,3,2]);
  assert.equal(matrix.approved_canonical_count,38);assert.deepEqual(matrix.duplicate_canonical_ids,[]);
});
check('问题解决严格要求独立尝试、多个办法与依据结果调整',()=>{
  assert.equal(byAbility.int_problem_solving.approved_game_count,0);
  const row=third.mappings.find(x=>x.activity_id==='gm_multi_step_delivery');
  assert.ok(changed(row.activity_id,{mechanism_ids:['active_movement','hands_on_action'],secondary_ability_ids:['int_problem_solving'],mapping_reason:{...row.mapping_reason,int_problem_solving:'完成路线'}}).some(x=>x.includes('strict ability criteria missing')));
});
check('记忆学习严格要求先前信息、时间间隔、后续使用及无持续提示',()=>{
  assert.equal(byAbility.int_memory_learning.approved_game_count,0);
  const row=third.mappings.find(x=>x.activity_id==='act_132_颜色形状配对');
  assert.ok(changed(row.activity_id,{mechanism_ids:['simple_matching','search_and_find'],secondary_ability_ids:['int_memory_learning'],mapping_reason:{...row.mapping_reason,int_memory_learning:'看到了相同形状'}}).some(x=>x.includes('strict ability criteria missing')));
});
check('early与future不能被批准为当前成熟能力',()=>{
  assert.ok(changed('act_131_趣味玩水探索',{secondary_ability_ids:['mov_fitness']}).some(x=>x.includes('non-active')));
  assert.ok(changed('act_131_趣味玩水探索',{secondary_ability_ids:['cre_divergent_thinking']}).some(x=>x.includes('non-active')));
});
check('存在材料或安全待核实项时不能改状态直接批准',()=>{
  for(const id of ['act_4_颜色配对分类','act_7_撕贴收纳','act_8_瓶盖配对拧动','act_9_翻书找物']){
    assert.ok(changed(id,{mapping_status:'approved'}).some(x=>x.includes('review hold blocks approval')),id);
  }
  assert.ok(third.mappings.filter(x=>x.mapping_status==='rejected').every(x=>x.rejection_reason));
});
check('九项active覆盖只计approved，粗大运动21项仍单机制limited',()=>{
  assert.equal(matrix.abilities.length,9);
  assert.deepEqual(matrix.abilities.map(x=>x.approved_game_count),[3,0,0,4,4,2,5,21,3]);
  assert.deepEqual(matrix.abilities.map(x=>x.coverage_status),['usable','gap','gap','usable','usable','limited','limited','limited','limited']);
  assert.equal(byAbility.mov_gross_motor.mechanism_diversity,1);
  assert.equal(byAbility.mov_fine_motor.mechanism_diversity,1);
});
check('第一、二批approved和游戏正文文件与审计开始前逐字节一致',()=>{
  const expected={
    'data/activity-five-brain-mappings.json':'ed86f41aae37bcee13c843c3420f6de90e6dfd03e4fd4454bb1e88f8060293ce',
    'data/activity-five-brain-mappings-batch2.json':'c1612156df61e84dcfafa394161a8c680a3b5b685df18f45c7b347e6abe2f470',
    'assets/activity-gap-content.js':'6eb1085c1d7f8bf886d8001337d704a5a1c2ab8840c160448ff816c70a207fdd'
  };
  Object.entries(expected).forEach(([file,digest])=>assert.equal(hash(file),digest,file));
});
check('浏览、收藏、玩过反馈不写成长evidence',()=>{
  const before=JSON.stringify(ctx.loadEvidence());ctx.renderGames();
  ctx.toggleActivityFavorite('act_132_颜色形状配对');ctx.updateActivityFeedback('act_132_颜色形状配对','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),before);assert.ok(!storage.has('xlma_five_brain_evidence_v1'));
});
check('推荐、周计划和Growth展示没有接入本轮映射，读取审计不会改变结果',()=>{
  const prefs={duration:'10_15',context:'home',energy:'low',interests:[]},date='2026-10-21';
  const rec=JSON.stringify(ctx.recommendActivities(prefs,21,date,ctx.currentDomainStates()));
  const weekly=ctx.buildWeeklyPlan(date),before=JSON.stringify([...storage.entries()]);
  coverage.approvedCoverage(batches,ontology,ctx.activityById);
  assert.equal(JSON.stringify(ctx.recommendActivities(prefs,21,date,ctx.currentDomainStates())),rec);
  const after=ctx.buildWeeklyPlan(date);delete weekly.generated_at;delete after.generated_at;
  assert.deepEqual(JSON.parse(JSON.stringify(after)),JSON.parse(JSON.stringify(weekly)));
  assert.equal(JSON.stringify([...storage.entries()]),before);
  for(const file of ['育儿系统看板.html','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js','assets/growth-plan-v2.js']){
    assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes('activity-five-brain-mappings-batch3'),file);
  }
});
console.log(`Five-brain final activity gap audit: ${passed} passed, 0 failed`);
