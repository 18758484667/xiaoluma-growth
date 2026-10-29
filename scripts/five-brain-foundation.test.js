const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const ontology=require('../assets/five-brain-ontology.js');
const api=require('../assets/five-brain-ontology-api.js');
const mappings=require('../assets/five-brain-mapping-schema.js');
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const knowledgeContext={};vm.createContext(knowledgeContext);
vm.runInContext(fs.readFileSync(path.join(root,'assets/brain-knowledge-foundation.js'),'utf8'),knowledgeContext);
const mechanisms=knowledgeContext.BRAIN_MECHANISMS;

check('五脑、19项、ID唯一、年龄与机制验证通过',()=>{
  assert.deepEqual(api.validateOntology(ontology,mechanisms),[]);
  assert.equal(ontology.brains.length,5);
  assert.equal(ontology.abilities.length,19);
  assert.equal(new Set(ontology.abilities.map(a=>a.ability_id)).size,19);
});
check('设计文档的稳定 brain 与 ability ID 未改名',()=>{
  assert.deepEqual(ontology.brains.map(b=>b.brain_id),['intelligence','creativity','language','emotion','movement']);
  const design=fs.readFileSync(path.join(root,'five-brain-development-model-v1.md'),'utf8');
  for(const ability of ontology.abilities)assert.ok(design.includes('`'+ability.ability_id+'`'),ability.ability_id);
});
check('18至60+窗口连续、无重叠，17个月明确在范围外',()=>{
  assert.deepEqual(ontology.age_windows.map(w=>[w.min_months,w.max_months]),[[18,23],[24,29],[30,35],[36,47],[48,59],[60,null]]);
  for(let age=18;age<=120;age++)assert.notEqual(api.getAgeObservationStatus('mov_gross_motor',age).window_id,null,String(age));
  assert.equal(api.getAgeObservationStatus('mov_gross_motor',17).review_status,'out_of_scope');
});
check('21个月四类状态准确，创意脑三项 future',()=>{
  const counts={};for(const ability of ontology.abilities){const s=api.getAgeObservationStatus(ability.ability_id,21).age_observation_status;counts[s]=(counts[s]||0)+1;}
  assert.deepEqual(counts,{active_observation:9,early_signal_only:6,future:3,support_context:1});
  for(const id of ['cre_divergent_thinking','cre_growth_mindset','cre_counterfactual_thinking'])assert.equal(api.getAgeObservationStatus(id,21).age_observation_status,'future');
  assert.equal(api.getAgeObservationStatus('mov_health_context',21).age_observation_status,'support_context');
});
check('24、36、48和60边界明确返回待审核，不生效为专业年龄规则',()=>{
  for(const [age,windowId] of [[23,'18_23'],[24,'24_29'],[29,'24_29'],[30,'30_35'],[35,'30_35'],[36,'36_47'],[47,'36_47'],[48,'48_59'],[59,'48_59'],[60,'60_plus']]){
    const result=api.getAgeObservationStatus('int_memory_learning',age);
    assert.equal(result.window_id,windowId);
    if(age>=24){assert.equal(result.age_observation_status,null);assert.equal(result.review_status,'pending_review');assert.equal(result.candidate_status,'active_observation');}
  }
  assert.equal(api.getAbilitiesAvailableAtAge(24).length,0);
});
check('健康管理所有窗口仅为 support_context 候选，绝不成为能力等级',()=>{
  const rules=api.getAbilityById('mov_health_context').age_observation_rules;
  assert.ok(rules.every(r=>r.age_observation_status==='support_context'));
});
check('读取 API 返回副本，调用方不能改动共享配置',()=>{
  const all=api.getFiveBrainOntology();all.brains[0].name_zh='破坏';
  const one=api.getAbilityById('mov_gross_motor');one.age_observation_rules[0].age_observation_status='future';
  assert.equal(api.getBrainById('intelligence').name_zh,'智力脑');
  assert.equal(api.getAgeObservationStatus('mov_gross_motor',21).age_observation_status,'active_observation');
  assert.equal(api.getAbilitiesForBrain('creativity').length,3);
  assert.equal(api.getAbilitiesAvailableAtAge(21).length,15);
});
check('validator 发现重复 ID、窗口缺口和非法状态',()=>{
  const duplicate=api.getFiveBrainOntology();duplicate.abilities[1].ability_id=duplicate.abilities[0].ability_id;
  assert.ok(api.validateOntology(duplicate,mechanisms).some(x=>x.includes('duplicate ability_id')));
  const gap=api.getFiveBrainOntology();gap.age_windows[1].min_months=25;
  assert.ok(api.validateOntology(gap,mechanisms).some(x=>x.includes('gap or overlap')));
  const invalid=api.getFiveBrainOntology();invalid.abilities[0].age_observation_rules[0].age_observation_status='weak';
  assert.ok(api.validateOntology(invalid,mechanisms).some(x=>x.includes('invalid age status')));
});
check('mapping schema 只验证有出处记录，不产生实际映射',()=>{
  const record={mapping_id:'example-only',source_type:'capability_evidence',source_id:'existing-evidence-id',ability_id:'mov_gross_motor',observed_behavior:'扶着栏杆上楼梯',observed_at:'2026-10-01',age_months_at_time:21,mapping_reason:'原始观察明确记录了扶栏上楼梯的身体移动行为',age_status_at_time:'active_observation',mapping_source:'manual',review_status:'pending_review',confidence:'medium',source_evidence_status:'observed',mapping_kind:'ability_observation'};
  assert.deepEqual(mappings.validateMapping(record,api),[]);
  assert.ok(mappings.validateMapping({...record,mapping_reason:''},api).some(x=>x.includes('mapping_reason')));
  assert.ok(mappings.validateMapping({...record,age_status_at_time:'future'},api).some(x=>x.includes('age status')));
  assert.ok(mappings.validateMapping({...record,ability_id:'cre_divergent_thinking',age_status_at_time:'future',review_status:'approved'},api).some(x=>x.includes('cannot be approved')));
  assert.ok(mappings.validateMappings([record,{...record}],api).some(x=>x.includes('duplicate mapping_id')));
});
check('原五维及专业算法仍未接入新基础设施；页面仅接入只读展示',()=>{
  const html=fs.readFileSync(path.join(root,'育儿系统看板.html'),'utf8');
  const domains=[...html.matchAll(/capability_id:'[^']+',domain:'([^']+)'/g)].map(x=>x[1]);
  assert.deepEqual([...new Set(domains)].sort(),['cog','fine','lang','motor','soc']);
  assert.equal(domains.length,17);
  for(const file of ['assets/development-safety.js','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js']){
    assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes('FiveBrainOntology'),file);
  }
  assert.ok(html.includes('assets/five-brain-growth-view-model.js'));
  assert.ok(html.includes('motor_stairs'));
  assert.ok(html.includes('milestone'));
});
check('浏览器脚本可共享同一 ontology，无 Node 专用依赖',()=>{
  const ctx={Number,JSON,Set};vm.createContext(ctx);
  for(const file of ['assets/five-brain-ontology.js','assets/five-brain-ontology-api.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
  assert.equal(ctx.FiveBrainOntology.getAbilityById('lang_expression').name_zh,'语言表达');
});
console.log(`Five-brain foundation: ${passed} passed, 0 failed`);
