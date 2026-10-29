const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const Module=require('node:module');
const root=path.join(__dirname,'..');
const data=require('../data/five-brain-gap-content-pilot.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const previous=[require('../data/activity-five-brain-mappings.json'),require('../data/activity-five-brain-mappings-batch2.json'),require('../data/activity-five-brain-mappings-batch3.json')];
const smokeFile=path.join(__dirname,'smoke.test.js'),loader=new Module(smokeFile,module);
loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const byDesign=Object.fromEntries(data.items.map(x=>[x.design_id,x]));
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
function digest(file){return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');}
const productHashes={
  'assets/activity-gap-content.js':'6eb1085c1d7f8bf886d8001337d704a5a1c2ab8840c160448ff816c70a207fdd',
  'assets/weekly-learning-plan.js':'607d897843a31ba91a1deb9c6e9c72b0dc00b6256309d93dea9db4109c5898ef',
  'assets/activity-recommendation-learning.js':'32697e66b5353256332b7929fb0fb3bd3870ddc5bb21f23e4d9afa8b64107a98',
  'assets/five-brain-ontology.js':'933e7cea347d6ab3c03fb7261362f00d3915ee10284cefa1e7fe040480455f67'
};
check('六项逐一查重：3个独立核心玩法、3个现有主游戏的变化',()=>{
  assert.equal(data.items.length,6);assert.equal(new Set(data.items.map(x=>x.design_id)).size,6);
  assert.equal(data.items.filter(x=>x.decision==='new_canonical').length,3);
  assert.equal(data.items.filter(x=>x.decision==='add_as_variant').length,3);
  const known=new Set(ctx.activityCatalog().map(x=>x.activity_id));
  for(const x of data.items)assert.ok(known.has(x.canonical_id));
  assert.equal(byDesign.nesting_cup_trial.canonical_id,'act_10_叠叠杯排序');
  assert.equal(byDesign.bear_sleep_recall.canonical_id,'act_1_假装游戏');
  assert.equal(byDesign.daily_location_recall.canonical_id,'gap_delayed_bowl_find');
});
check('所有内容有适龄完整大材料、步骤、收尾与安全边界',()=>{
  for(const x of data.items){assert.ok(x.age_range[0]<=21&&x.age_range[1]>=21);assert.ok(x.steps.length>=4&&x.steps.some(s=>/结束/.test(s)));assert.ok(x.safety_notes&&x.materials&&x.core_play);assert.ok(!/瓶盖|药瓶|小贴纸|碎纸|珠子|硬币|小积木|重盖/.test(x.materials));assert.ok(/完整|大号|大物件|大篮子/.test(x.materials));}
});
check('问题解决严格包含真实目标、独立尝试和失败后调整',()=>{
  for(const id of ['large_box_opening','nesting_cup_trial','detour_to_ball']){const x=byDesign[id];assert.ok(x.primary_ability_ids.includes('int_problem_solving'));assert.match(x.steps.join(' '),/等待|先等待|自己/);assert.match(x.steps.join(' '),/换|转向|改从|绕/);}
  for(const x of data.items.filter(x=>x.mapping_status==='approved'&&x.primary_ability_ids.includes('int_problem_solving'))){const c=x.review_checks.problem_solving;assert.ok(c.goal&&c.independent_attempt&&c.feedback_or_adjustment);}
});
check('记忆学习均有先前信息、短间隔、后续使用且不持续提示',()=>{
  for(const id of ['delayed_bowl_location','bear_sleep_recall','daily_location_recall']){const x=byDesign[id];assert.ok(x.primary_ability_ids.includes('int_memory_learning'));assert.match(x.steps.join(' '),/几秒/);assert.match(x.steps.join(' '),/之后|再问|再去|过|把材料交给|自然问/);assert.match(x.steps.join(' '),/不持续|不要求|不反复|不连续/);}
  const c=byDesign.delayed_bowl_location.review_checks.memory_learning;assert.ok(c.prior_exposure&&c.retention_interval&&c.later_reuse&&c.adult_prompt_free);
});
check('普通藏找和成人示范正确顺序没有被误批准为主游戏映射',()=>{
  assert.equal(byDesign.nesting_cup_trial.mapping_status,'approved');assert.equal(byDesign.nesting_cup_trial.mapping_scope,'variant_only');
  assert.equal(byDesign.bear_sleep_recall.mapping_status,'approved');assert.equal(byDesign.bear_sleep_recall.mapping_scope,'variant_only');
  assert.equal(byDesign.daily_location_recall.mapping_status,'approved');assert.equal(byDesign.daily_location_recall.mapping_scope,'variant_only');
  assert.ok(!previous.flatMap(b=>b.mappings).some(x=>x.activity_id==='act_75_藏猫猫'&&x.primary_ability_ids.includes('int_memory_learning')));
});
check('创意脑完整能力不进入21个月映射，简单假装只记前身',()=>{
  assert.ok(data.items.every(x=>x.primary_ability_ids.concat(x.secondary_ability_ids).every(id=>!id.startsWith('cre_'))));
  assert.match(byDesign.bear_sleep_recall.precursor_experience,/不得映射/);
});
check('映射逐项有机制、年龄路径、理由与review记录，主次不超量',()=>{
  const mechanisms=new Set(ctx.BRAIN_MECHANISMS.map(x=>x.mechanism_id));
  for(const x of data.items){assert.ok(x.mapping_reason&&x.review_note&&x.reviewed_at&&x.reviewed_by==='codex_content_review');assert.ok(x.primary_ability_ids.length<=2&&x.secondary_ability_ids.length<=2);assert.ok(x.mechanism_ids.every(id=>mechanisms.has(id)));for(const id of x.primary_ability_ids.concat(x.secondary_ability_ids)){const a=ontology.getAbilityById(id);assert.ok(a&&x.mapping_reason[id]);assert.equal(ontology.getAgeObservationStatus(id,21).age_observation_status,'active_observation');if(x.mapping_status==='approved')assert.ok(x.mechanism_ids.some(mid=>a.related_mechanisms.includes(mid)));}}
  assert.equal(data.items.filter(x=>x.mapping_status==='approved').length,6);
});
check('五脑映射保持独立，推荐及周计划源码不变',()=>{
  for(const [file,expected] of Object.entries(productHashes))assert.equal(digest(file),expected,file);
  for(const file of ['育儿系统看板.html','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js'])assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes('five-brain-gap-content-pilot'));
});
check('21个月安全过滤可接受新主游戏的结构化年龄和安全状态',()=>{
  for(const x of data.items.filter(x=>x.decision==='new_canonical')){const row={min_age_months:x.age_range[0],max_age_months:x.age_range[1],safety_level:'standard'};assert.equal(ctx.activityAvailableAtAge(row,21),true);}
  assert.ok(data.items.every(x=>!ctx.ACTIVITY_AGE21_SAFETY_HOLDS[x.activity_id]));
});
check('普通游戏操作不因审核数据创建成长证据',()=>{
  const before=JSON.stringify(ctx.loadEvidence()),five=storage.get('xlma_five_brain_evidence_v1');
  ctx.renderGames();ctx.toggleActivityFavorite('gm_roll_fetch');ctx.updateActivityFeedback('gm_roll_fetch','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),before);assert.equal(storage.get('xlma_five_brain_evidence_v1'),five);
});
check('既有五脑审核文件保持原状，新增内容不占用旧canonical ID',()=>{
  const existing=new Set(previous.flatMap(b=>b.mappings).map(x=>x.activity_id));
  assert.ok(data.items.filter(x=>x.decision==='new_canonical').every(x=>!existing.has(x.activity_id)));
  assert.equal(previous.flatMap(b=>b.mappings).filter(x=>x.mapping_status==='approved'&&x.primary_ability_ids.includes('int_problem_solving')).length,0);
  assert.equal(previous.flatMap(b=>b.mappings).filter(x=>x.mapping_status==='approved'&&x.primary_ability_ids.includes('int_memory_learning')).length,0);
});
console.log(`Five-brain gap content pilot: ${passed} passed, 0 failed`);
