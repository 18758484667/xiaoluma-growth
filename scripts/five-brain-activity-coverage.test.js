const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const root=path.join(__dirname,'..');
const first=require('../data/activity-five-brain-mappings.json');
const candidates=require('../data/activity-five-brain-candidates-batch2.json');
const batch=require('../data/activity-five-brain-mappings-batch2.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const pilot=require('../assets/five-brain-activity-pilot.js');
const coverage=require('../assets/five-brain-activity-coverage.js');
const smokeFile=path.join(__dirname,'smoke.test.js');
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const context={ontologyApi:ontology,mechanisms:ctx.BRAIN_MECHANISMS,activityById:ctx.activityById,
  canonicalActivityId:ctx.canonicalActivityId,activityAvailableAtAge:ctx.activityAvailableAtAge};
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
function changed(id,changes){const copy=structuredClone(batch);Object.assign(copy.mappings.find(x=>x.activity_id===id),changes);return coverage.validateBatch(copy,candidates,first,context,pilot);}
const matrix=coverage.approvedCoverage([first,batch],ontology,ctx.activityById);
const byAbility=Object.fromEntries(matrix.abilities.map(x=>[x.ability_id,x]));

check('候选先行：30个21个月安全适龄主游戏逐项审核且不与首批重复',()=>{
  assert.equal(candidates.candidates.length,30);assert.equal(batch.mappings.length,30);
  assert.deepEqual(coverage.validateBatch(batch,candidates,first,context,pilot),[]);
  assert.ok(candidates.candidates.every(x=>x.candidate_status==='candidate'));
  assert.ok(batch.mappings.every(x=>x.reviewed_at&&x.review_note&&x.reviewed_by==='codex_content_review'));
});
check('本批24 approved、1 revised、5 unmapped；累计35个approved canonical',()=>{
  assert.equal(batch.mappings.filter(x=>x.mapping_status==='approved').length,24);
  assert.equal(batch.mappings.filter(x=>x.mapping_status==='revised').length,1);
  assert.equal(batch.mappings.filter(x=>x.mapping_status==='unmapped').length,5);
  assert.equal(matrix.approved_canonical_count,35);assert.deepEqual(matrix.duplicate_canonical_ids,[]);
});
check('主次各最多2，机制存在且通过年龄状态和ontology路径',()=>{
  assert.ok(batch.mappings.every(x=>x.primary_ability_ids.length<=2&&x.secondary_ability_ids.length<=2));
  assert.ok(changed('act_13_积木塔',{mechanism_ids:['fake_mechanism']}).some(x=>x.includes('unknown mechanism')));
  assert.ok(changed('act_13_积木塔',{secondary_ability_ids:['cre_divergent_thinking']}).some(x=>x.includes('non-active')));
  assert.ok(changed('act_13_积木塔',{secondary_ability_ids:['lang_reading_readiness']}).some(x=>x.includes('non-active')));
});
check('记忆学习必须有事前接触、间隔、后续使用与无提示依据',()=>{
  const id='gap_turn_to_picture',row=batch.mappings.find(x=>x.activity_id===id);
  assert.equal(byAbility.int_memory_learning.approved_game_count,0);
  assert.ok(changed(id,{mechanism_ids:['search_and_find'],secondary_ability_ids:['int_memory_learning'],mapping_reason:{...row.mapping_reason,int_memory_learning:'记住位置'}}).some(x=>x.includes('strict ability criteria missing')));
});
check('问题解决必须有独立尝试和依据结果调整',()=>{
  assert.equal(byAbility.int_problem_solving.approved_game_count,0);
  assert.ok(changed('act_10_叠叠杯排序',{mapping_status:'approved'}).some(x=>x.includes('strict ability criteria missing')));
});
check('语言理解与表达分别需要语言线索/孩子回应或主动表达',()=>{
  assert.equal(byAbility.lang_comprehension.approved_game_count,4);
  assert.equal(byAbility.lang_expression.approved_game_count,4);
  const id='gm_find_bear_return',row=batch.mappings.find(x=>x.activity_id===id);
  assert.ok(changed(id,{review_checks:{language_expression:{child_expression:''}},secondary_ability_ids:['lang_expression'],mapping_reason:{...row.mapping_reason,lang_expression:'成人说话'}}).some(x=>x.includes('strict ability criteria missing')));
  assert.ok(changed(id,{review_checks:{language_comprehension:{spoken_cue:'去拿小熊',child_response:''}}}).some(x=>x.includes('strict ability criteria missing')));
});
check('社会认知与社会关系分别需要随他人行为回应或真实来回互动',()=>{
  assert.equal(byAbility.emo_social_cognition.approved_game_count,2);
  assert.equal(byAbility.emo_social_relationships.approved_game_count,5);
  assert.ok(changed('act_124_动作模仿游戏',{review_checks:{social_cognition:{other_person_behavior:'拍手',child_contingent_response:''}}}).some(x=>x.includes('strict ability criteria missing')));
  assert.ok(changed('gap_greeting_reply',{review_checks:{social_relationships:{reciprocal_interaction:''}}}).some(x=>x.includes('strict ability criteria missing')));
});
check('创意脑只留前身，early与future不进入正式主次能力',()=>{
  const pretend=batch.mappings.find(x=>x.activity_id==='act_25_乐高大颗粒娃娃屋');
  assert.equal(pretend.mapping_status,'unmapped');assert.equal(pretend.precursor_experiences[0].brain_id,'creativity');
  assert.ok(batch.mappings.every(x=>x.primary_ability_ids.concat(x.secondary_ability_ids).every(id=>ontology.getAgeObservationStatus(id,21).age_observation_status==='active_observation')));
});
check('alias归canonical、variant不重复计数且revised不算approved',()=>{
  assert.ok(batch.mappings.every(x=>ctx.canonicalActivityId(x.activity_id)===x.activity_id));
  assert.equal(pilot.getApprovedMapping(batch,'act_10_叠叠杯排序',ctx.canonicalActivityId,21),null);
  assert.ok(matrix.abilities.every(x=>x.approved_game_count>=0));
});
check('覆盖状态按0/1–2/3+与机制多样性计算，非儿童能力分数',()=>{
  assert.equal(byAbility.int_problem_solving.coverage_status,'gap');
  assert.equal(byAbility.int_perceptual_attention.coverage_status,'limited');
  assert.equal(byAbility.lang_comprehension.coverage_status,'usable');
  assert.equal(byAbility.mov_gross_motor.coverage_status,'limited');
  assert.equal(byAbility.mov_gross_motor.mechanism_diversity,1);
});
check('浏览、收藏和反馈不写五脑或旧成长evidence',()=>{
  const before=JSON.stringify(ctx.loadEvidence());
  ctx.renderGames();ctx.toggleActivityFavorite('gm_soft_toy_delivery');ctx.updateActivityFeedback('gm_soft_toy_delivery','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),before);
  assert.ok(!storage.has('xlma_five_brain_evidence_v1'));
});
check('推荐、周计划与Growth入口未接入映射，读取覆盖不改变结果',()=>{
  const prefs={duration:'10_15',context:'home',energy:'low',interests:[]},date='2026-10-21';
  const recommendations=JSON.stringify(ctx.recommendActivities(prefs,21,date,ctx.currentDomainStates()));
  const weekly=ctx.buildWeeklyPlan(date);
  const beforeStorage=JSON.stringify([...storage.entries()]);
  coverage.approvedCoverage([first,batch],ontology,ctx.activityById);
  assert.equal(JSON.stringify(ctx.recommendActivities(prefs,21,date,ctx.currentDomainStates())),recommendations);
  const afterWeekly=ctx.buildWeeklyPlan(date);
  delete weekly.generated_at;delete afterWeekly.generated_at;
  assert.deepEqual(JSON.parse(JSON.stringify(afterWeekly)),JSON.parse(JSON.stringify(weekly)));
  assert.equal(JSON.stringify([...storage.entries()]),beforeStorage);
  for(const file of ['育儿系统看板.html','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js','assets/growth-plan-v2.js']){
    const source=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(!source.includes('FiveBrainActivityCoverage')&&!source.includes('activity-five-brain-mappings-batch2'),file);
  }
});
console.log(`Five-brain activity coverage: ${passed} passed, 0 failed`);
