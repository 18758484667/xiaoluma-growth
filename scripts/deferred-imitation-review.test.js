const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const Module=require('node:module');
const root=path.join(__dirname,'..');
const data=require('../data/five-brain-gap-content-pilot.json');
const ontology=require('../assets/five-brain-ontology-api.js');
const oldBatches=['data/activity-five-brain-mappings.json','data/activity-five-brain-mappings-batch2.json','data/activity-five-brain-mappings-batch3.json'];
const smokeFile=path.join(__dirname,'smoke.test.js'),loader=new Module(smokeFile,module);
loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const bear=data.items.find(x=>x.design_id==='bear_sleep_recall');
const oldMappings=oldBatches.flatMap(file=>require('../'+file).mappings);
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
check('deferred_imitation taxonomy 唯一、合法，旧机制保留',()=>{
  const ids=ctx.BRAIN_MECHANISMS.map(x=>x.mechanism_id);
  assert.equal(ids.length,13);assert.equal(new Set(ids).size,13);
  assert.ok(ids.includes('imitation')&&ids.includes('pretend_play')&&ids.includes('deferred_imitation'));
  assert.deepEqual(ontology.validateOntology(ontology.getFiveBrainOntology(),ctx.BRAIN_MECHANISMS),[]);
});
check('延迟模仿定义要求观察、示范结束、无持续呈现、短间隔和之后重现',()=>{
  const m=ctx.BRAIN_MECHANISMS.find(x=>x.mechanism_id==='deferred_imitation');
  assert.equal(m.name,'延迟模仿');assert.equal(m.status,'active');
  for(const term of ['观察','示范已经结束','不再持续呈现','短暂间隔','重新做出'])assert.ok(m.definition.includes(term),term);
  assert.ok(!/训练|提升记忆力|记忆力好|达标|大脑成熟/.test(m.definition+m.example));
});
check('即时模仿与延迟模仿分离；旧模仿游戏和映射不自动升级',()=>{
  const immediate=ctx.BRAIN_MECHANISMS.find(x=>x.mechanism_id==='imitation');
  assert.ok(!immediate.definition.includes('间隔'));
  for(const id of ['act_3_手指谣与歌曲','act_124_动作模仿游戏']){const a=ctx.activityById(id);assert.ok(a);assert.ok(!/间隔几秒|短暂其他互动/.test(a.steps.join(' ')));}
  assert.ok(oldMappings.every(x=>!x.mechanism_ids.includes('deferred_imitation')));
});
check('小熊 variant 五项延迟条件与实际步骤一致才批准',()=>{
  assert.equal(bear.mapping_status,'approved');assert.equal(bear.mapping_scope,'variant_only');
  assert.deepEqual(bear.mechanism_ids,['deferred_imitation','pretend_play']);
  const c=bear.review_checks.deferred_imitation;
  for(const key of ['observed_action','demonstration_finished','action_not_continuously_shown','real_delay','later_reenactment_opportunity'])assert.ok(c[key],key);
  assert.match(bear.steps[0],/只示范一次/);assert.match(bear.steps[1],/间隔几秒/);assert.match(bear.steps[1],/不持续示范/);assert.match(bear.steps[2],/把材料交给孩子/);
});
check('抽掉真实间隔或持续示范时不得满足审核准入',()=>{
  function eligible(row){const c=row.review_checks&&row.review_checks.deferred_imitation||{};return ['observed_action','demonstration_finished','action_not_continuously_shown','real_delay','later_reenactment_opportunity'].every(k=>!!c[k])&&row.steps.some(s=>/间隔几秒/.test(s))&&row.steps.some(s=>/不持续示范/.test(s));}
  assert.equal(eligible(bear),true);
  const noDelay=structuredClone(bear);noDelay.steps=noDelay.steps.map(s=>s.replace('间隔几秒','马上'));assert.equal(eligible(noDelay),false);
  const ongoing=structuredClone(bear);ongoing.steps=ongoing.steps.map(s=>s.replace('不持续示范','持续示范'));assert.equal(eligible(ongoing),false);
});
check('映射只属于小熊 variant，不提升原假装游戏 canonical',()=>{
  assert.equal(bear.canonical_id,'act_1_假装游戏');assert.notEqual(bear.activity_id,bear.canonical_id);
  assert.ok(!oldMappings.some(x=>x.activity_id===bear.canonical_id&&x.primary_ability_ids.includes('int_memory_learning')));
  assert.ok(!data.items.some(x=>x.activity_id===bear.canonical_id&&x.primary_ability_ids.includes('int_memory_learning')));
});
check('21个月记忆学习路径可用，但游戏不等于成长证据',()=>{
  assert.equal(ontology.getAgeObservationStatus('int_memory_learning',21).age_observation_status,'active_observation');
  assert.ok(ontology.getAbilityById('int_memory_learning').related_mechanisms.includes('deferred_imitation'));
  assert.ok(!bear.primary_ability_ids.concat(bear.secondary_ability_ids).some(id=>id.startsWith('cre_')));
  const before=JSON.stringify(ctx.loadEvidence()),five=storage.get('xlma_five_brain_evidence_v1');
  ctx.renderGames();ctx.toggleActivityFavorite('gm_roll_fetch');ctx.updateActivityFeedback('gm_roll_fetch','enjoyment','love');
  assert.equal(JSON.stringify(ctx.loadEvidence()),before);assert.equal(storage.get('xlma_five_brain_evidence_v1'),five);
});
check('正式21个月游戏池为57；新机制仍不参与推荐排序',()=>{
  assert.equal(ctx.activityCatalog().filter(x=>ctx.activityAvailableAtAge(x,21)).length,57);
  assert.ok(!fs.readFileSync(path.join(root,'育儿系统看板.html'),'utf8').includes('five-brain-gap-content-pilot'));
});
check('推荐与周计划行为不因审核数据读取改变',()=>{
  assert.equal(digest('assets/activity-recommendation-learning.js'),'32697e66b5353256332b7929fb0fb3bd3870ddc5bb21f23e4d9afa8b64107a98');
  assert.equal(digest('assets/weekly-learning-plan.js'),'607d897843a31ba91a1deb9c6e9c72b0dc00b6256309d93dea9db4109c5898ef');
  const prefs={duration:'10_15',context:'home',energy:'low',interests:[]},day='2026-10-28';
  const rec=ctx.recommendActivities(prefs,21,day,{}).map(x=>x.activity_id),plan=ctx.buildWeeklyPlan(day);delete plan.generated_at;
  JSON.stringify(data.items);
  assert.deepEqual(ctx.recommendActivities(prefs,21,day,{}).map(x=>x.activity_id),rec);
  const again=ctx.buildWeeklyPlan(day);delete again.generated_at;assert.deepEqual(JSON.parse(JSON.stringify(again)),JSON.parse(JSON.stringify(plan)));
});
check('原59项审核映射逐字节未被批量重写',()=>{
  assert.deepEqual(oldBatches.map(digest),[
    'ed86f41aae37bcee13c843c3420f6de90e6dfd03e4fd4454bb1e88f8060293ce',
    'c1612156df61e84dcfafa394161a8c680a3b5b685df18f45c7b347e6abe2f470',
    'e8658d34c97b5ed38007b56f39e216670fc45d463547474db4e5ad8ff6450f2d'
  ]);
});
check('审核内容按 canonical 去重：记忆学习2项、2种机制，仍未达usable',()=>{
  const rows=data.items.filter(x=>x.mapping_status==='approved'&&x.primary_ability_ids.concat(x.secondary_ability_ids).includes('int_memory_learning'));
  assert.equal(new Set(rows.map(x=>x.canonical_id)).size,2);
  const related=new Set(ontology.getAbilityById('int_memory_learning').related_mechanisms);
  assert.deepEqual([...new Set(rows.flatMap(x=>x.mechanism_ids).filter(id=>related.has(id)))].sort(),['deferred_imitation','search_and_find']);
});
console.log(`Deferred imitation review: ${passed} passed, 0 failed`);
