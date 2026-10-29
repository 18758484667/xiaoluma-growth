const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const root=path.join(__dirname,'..');
const data=require('../data/activity-five-brain-mappings.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const pilot=require('../assets/five-brain-activity-pilot.js');
const smokeFile=path.join(__dirname,'smoke.test.js');
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const context={ontologyApi:ontology,mechanisms:ctx.BRAIN_MECHANISMS,activityById:ctx.activityById,
  canonicalActivityId:ctx.canonicalActivityId,activityAvailableAtAge:ctx.activityAvailableAtAge};
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
function mutated(rowIndex,change){const copy=structuredClone(data);Object.assign(copy.mappings[rowIndex],change);return pilot.validatePilot(copy,context);}

check('20个真实主游戏全部存在；仅已批准映射要求当前21个月安全可用',()=>{
  assert.equal(data.mappings.length,20);assert.deepEqual(pilot.validatePilot(data,context),[]);
  assert.ok(data.mappings.every(x=>ctx.activityById(x.activity_id)));
  assert.ok(data.mappings.filter(x=>x.mapping_status==='approved').every(x=>ctx.activityAvailableAtAge(ctx.activityById(x.activity_id),21)));
});
check('4个当前周计划主游戏均被审查，真实收藏和展示游戏被优先纳入',()=>{
  const ids=new Set(data.mappings.map(x=>x.activity_id));
  for(const id of ['gm_chase_kick_ball','act_14_泡泡追跑','act_33_室内沙粒盒','act_38_感官游戏大混战','act_1_假装游戏','gm_roll_fetch','act_75_藏猫猫'])assert.ok(ids.has(id),id);
});
check('primary与secondary各最多2项，逐项理由非空',()=>{
  assert.ok(data.mappings.every(x=>x.primary_ability_ids.length<=2&&x.secondary_ability_ids.length<=2));
  assert.ok(mutated(0,{primary_ability_ids:['mov_gross_motor','lang_expression','int_problem_solving']}).some(x=>x.includes('exceeds limit')));
  assert.ok(mutated(0,{secondary_ability_ids:['emo_social_relationships','int_problem_solving','lang_expression']}).some(x=>x.includes('exceeds limit')));
  const copy=structuredClone(data);delete copy.mappings[0].mapping_reason.mov_gross_motor;
  assert.ok(pilot.validatePilot(copy,context).some(x=>x.includes('missing per-ability reason')));
});
check('所有机制复用现有taxonomy且必须经机制连接到能力',()=>{
  const known=new Set(ctx.BRAIN_MECHANISMS.map(x=>x.mechanism_id));
  assert.ok(data.mappings.every(x=>x.mechanism_ids.every(id=>known.has(id))));
  assert.ok(mutated(0,{mechanism_ids:['invented_mechanism']}).some(x=>x.includes('unknown mechanism')));
  assert.ok(mutated(0,{mechanism_ids:['language_expansion']}).some(x=>x.includes('ontology mechanism path')));
});
check('21个月future创意能力不得成为正式游戏能力，early只能独立记早期候选',()=>{
  assert.ok(data.mappings.every(x=>x.primary_ability_ids.concat(x.secondary_ability_ids).every(id=>ontology.getAgeObservationStatus(id,21).age_observation_status==='active_observation')));
  assert.ok(mutated(0,{secondary_ability_ids:['cre_divergent_thinking']}).some(x=>x.includes('non-active')));
  assert.ok(mutated(0,{secondary_ability_ids:['lang_reading_readiness']}).some(x=>x.includes('non-active')));
  assert.equal(data.mappings.find(x=>x.activity_id==='act_1_假装游戏').precursor_experiences[0].brain_id,'creativity');
  assert.equal(data.mappings.find(x=>x.activity_id==='act_122_厚页绘本共读').early_experience_candidates[0].age_status_at_21,'early_signal_only');
});
check('别名解析回canonical；variant不建第二份主映射',()=>{
  assert.equal(ctx.canonicalActivityId('act_76_漫天泡泡'),'act_14_泡泡追跑');
  assert.equal(data.mappings.filter(x=>x.activity_id==='act_14_泡泡追跑').length,1);
  assert.ok(mutated(1,{activity_id:'act_76_漫天泡泡'}).some(x=>x.includes('variant or alias')));
  assert.equal(pilot.getApprovedMapping(data,'act_76_漫天泡泡',ctx.canonicalActivityId,21).activity_id,'act_14_泡泡追跑');
});
check('审核批准仅限静态映射文件；revised仍不进入批准读取',()=>{
  assert.equal(data.mappings.filter(x=>x.mapping_status==='approved').length,11);
  assert.equal(data.mappings.filter(x=>x.mapping_status==='revised').length,3);
  assert.equal(data.mappings.filter(x=>x.mapping_status==='unmapped').length,6);
  assert.ok(pilot.getApprovedMapping(data,'gm_roll_fetch',ctx.canonicalActivityId,21));
  assert.equal(pilot.getApprovedMapping(data,'act_123_简易配对',ctx.canonicalActivityId,21),null);
  assert.ok(mutated(0,{reviewed_at:null}).some(x=>x.includes('lacks date or review note')));
});
check('允许6个unmapped并保留原因，不强贴五脑标签',()=>{
  const coverage=pilot.coverage(data,ontology);
  assert.equal(coverage.mapped_count,14);assert.equal(coverage.unmapped_count,6);
  assert.ok(data.mappings.filter(x=>x.mapping_status==='unmapped').every(x=>x.unmapped_reason));
  assert.ok(mutated(2,{unmapped_reason:''}).some(x=>x.includes('unmapped row')));
});
check('五脑覆盖只计体验候选；记忆学习没有被藏猫猫硬推断',()=>{
  const c=pilot.coverage(data,ontology);
  assert.deepEqual(c.brain_activity_counts,{movement:5,emotion:4,language:6,creativity:1,intelligence:2});
  assert.equal(c.creative_precursor_count,1);
  assert.equal(c.ability_activity_counts.int_memory_learning,undefined);
  assert.equal(c.ability_activity_counts.int_problem_solving,undefined);
});
check('审核状态与两项最小taxonomy补齐均有明确边界',()=>{
  const byId=Object.fromEntries(data.mappings.map(x=>[x.activity_id,x]));
  assert.ok(ctx.BRAIN_MECHANISMS.some(x=>x.mechanism_id==='sensory_exploration'&& !/训练|大脑发育|提升感知能力/.test(x.definition)));
  assert.ok(ctx.BRAIN_MECHANISMS.some(x=>x.mechanism_id==='pretend_play'));
  assert.deepEqual(byId['act_33_室内沙粒盒'].primary_ability_ids,[]);
  assert.deepEqual(byId['act_1_假装游戏'].primary_ability_ids,[]);
  assert.ok(!data.mappings.some(x=>x.primary_ability_ids.concat(x.secondary_ability_ids).some(id=>id.startsWith('cre_'))));
  assert.deepEqual(byId['gm_roll_fetch'].primary_ability_ids,['mov_gross_motor']);
  assert.deepEqual(byId['gm_roll_fetch'].secondary_ability_ids,[]);
  assert.deepEqual(byId['act_75_藏猫猫'].secondary_ability_ids,['emo_social_relationships']);
  assert.deepEqual(byId['gap_drum_turn'].secondary_ability_ids,[]);
  assert.deepEqual(byId['act_123_简易配对'].secondary_ability_ids,[]);
  assert.ok(data.mappings.every(x=>x.reviewed_at&&x.review_note));
  assert.ok(data.mappings.every(x=>x.reviewed_by==='codex_content_review'));
  assert.ok(mutated(0,{mapping_status:'rejected',rejection_reason:''}).some(x=>x.includes('lacks rejection reason')));
  assert.deepEqual(pilot.validatePilot({...data,mappings:data.mappings.map((x,i)=>i===0?{...x,mapping_status:'rejected',rejection_reason:'核心玩法不足以支持该能力'}:x)},context),[]);
});
check('点开、收藏、孩子反馈不因映射产生five-brain或旧成长evidence',()=>{
  const before=JSON.stringify(ctx.loadEvidence()),mappingBefore=JSON.stringify(data);
  ctx.toggleActivityFavorite('gm_roll_fetch');
  ctx.updateActivityFeedback('gm_roll_fetch','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),before);
  assert.equal(JSON.stringify(data),mappingBefore);
  assert.ok(!storage.has('xlma_five_brain_evidence_v1'));
});
check('页面、推荐、周计划、Growth V2均未接入新映射，旧备份字段无需变化',()=>{
  for(const file of ['育儿系统看板.html','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js','assets/growth-plan-v2.js']){
    assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes('FiveBrainActivityPilot'),file);
  }
  const html=fs.readFileSync(path.join(root,'育儿系统看板.html'),'utf8');
  assert.ok(html.includes('schemaVersion:5'));
  assert.ok(!html.includes('activity-five-brain-mappings'));
});
console.log(`Five-brain activity pilot: ${passed} passed, 0 failed`);
