const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const api=require('../assets/five-brain-ontology-api.js');
const schema=require('../assets/five-brain-mapping-schema.js');
const pilot=require('../assets/five-brain-evidence-pilot.js');
const root=path.join(__dirname,'..');
const birthDate='2025-01-16';
const capabilityIndex={
  motor_stairs:{label:'扶着墙或栏杆上楼梯',typical_age_start:15},
  motor_run:{label:'会跑',typical_age_start:20},
  motor_jump:{label:'尝试双脚同时离地跳起',typical_age_start:24},
  fine_spoon:{label:'尝试使用勺子进食',typical_age_start:15},
  lang_words:{label:'能说出至少3个有意义的词',typical_age_start:15},
  cog_object_use:{label:'知道梳子、勺子、电话等常用物品的用途',typical_age_start:15},
  cog_pretend:{label:'会用娃娃或安全日用品玩简单假装游戏',typical_age_start:20},
  soc_ball:{label:'能和家人玩来回传球等互动游戏',typical_age_start:15}
};
function row(id,capabilityId,status,extra={}){return {observation_id:id,date:'2026-10-20',raw_record:capabilityIndex[capabilityId]?.label||'',capability_ids:[capabilityId],evidence_type:status,source:'monthly_assessment',confirmed:true,...extra};}
function mapped(item){return pilot.mapOne(item,birthDate,api,capabilityIndex);}
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
const unchangedFiles=['育儿系统看板.html','assets/development-safety.js','assets/weekly-learning-plan.js','assets/activity-recommendation-learning.js','assets/growth-plan-v2.js'];
function hashes(){return unchangedFiles.map(f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'));}
const before=hashes();

check('observed 的明确大运动、精细动作、语言表达可生成可追溯候选',()=>{
  for(const [id,cap,status,target] of [['stairs','motor_stairs','observed','mov_gross_motor'],['spoon','fine_spoon','observed','mov_fine_motor'],['words','lang_words','observed','lang_expression']]){
    const result=mapped(row(id,cap,status));assert.equal(result.mappings.length,1);assert.equal(result.mappings[0].ability_id,target);
    assert.equal(result.mappings[0].source_evidence_id,id);assert.ok(result.mappings[0].mapping_reason);
    assert.deepEqual(schema.validateMapping(result.mappings[0],api),[]);
  }
});
check('emerging 保留原始状态，不升级为 observed',()=>{
  const result=mapped(row('stairs-early','motor_stairs','emerging'));
  assert.equal(result.mappings[0].source_evidence_status,'emerging');
  assert.equal(result.mappings[0].review_status,'pending_review');
});
check('not_yet 与 unobserved 不生成负向五脑 evidence',()=>{
  assert.equal(mapped(row('no-run','motor_run','not_yet')).unmapped.reason,'not_yet_kept_only_as_source_reference');
  assert.equal(mapped(row('no-jump','motor_jump','not_yet')).unmapped.reason,'future_not_yet_kept_only_as_reference');
  assert.equal(mapped(row('no-spoon','fine_spoon','unobserved')).unmapped.reason,'unobserved_not_ability_evidence');
});
check('未来跳跃不映射到当前粗大运动，完整创意脑21个月禁止正式映射',()=>{
  assert.equal(mapped(row('jump','motor_jump','observed')).unmapped.reason,'source_capability_future_at_observation');
  const manual=pilot.createManualMapping({observation_id:'pretend',date:'2026-10-20',raw_record:'小宝假装给娃娃喂饭',capability_ids:['cog_pretend'],evidence_type:'observed',source:'parent_record',confirmed:true},{ability_id:'cre_counterfactual_thinking',observed_behavior_excerpt:'假装给娃娃喂饭',mapping_reason:'候选'},birthDate,api,capabilityIndex);
  assert.equal(manual.mapping,null);assert.equal(manual.reason,'age_status_not_eligible');
  const jump=pilot.createManualMapping({observation_id:'early-jump',date:'2026-10-20',raw_record:'小宝尝试双脚同时离地跳起',capability_ids:['motor_jump'],evidence_type:'observed',source:'parent_record',confirmed:true},{ability_id:'mov_gross_motor',observed_behavior_excerpt:'尝试双脚同时离地跳起',mapping_reason:'有跳跃动作'},birthDate,api,capabilityIndex);
  assert.equal(jump.mapping,null);assert.equal(jump.reason,'source_capability_future_at_observation');
});
check('语言表达不自动双映射为理解；认知领域不自动映射四项',()=>{
  assert.deepEqual(mapped(row('words-only','lang_words','observed')).mappings.map(x=>x.ability_id),['lang_expression']);
  assert.equal(mapped(row('object-use','cog_object_use','observed')).unmapped.reason,'no_reviewed_one_to_one_rule');
});
check('社会来回传球仅映射社会关系，不推断完整社会认知',()=>{
  assert.deepEqual(mapped(row('ball','soc_ball','observed')).mappings.map(x=>x.ability_id),['emo_social_relationships']);
});
check('一条具体观察可人工提出两个不同能力映射，理由逐条独立',()=>{
  const source={observation_id:'find-1',date:'2026-10-20',raw_record:'小宝一直看着藏玩具的杯子，过一会儿自己去杯子下找到了玩具。',capability_ids:[],evidence_type:'observed',source:'parent_record',confirmed:true};
  const attention=pilot.createManualMapping(source,{ability_id:'int_perceptual_attention',observed_behavior_excerpt:'一直看着藏玩具的杯子',mapping_reason:'实际持续关注藏物位置'},birthDate,api);
  const memory=pilot.createManualMapping(source,{ability_id:'int_memory_learning',observed_behavior_excerpt:'过一会儿自己去杯子下找到了玩具',mapping_reason:'间隔之后利用之前看见的位置'},birthDate,api);
  assert.ok(attention.mapping);assert.ok(memory.mapping);
  assert.equal(attention.mapping.source_evidence_id,memory.mapping.source_evidence_id);
  assert.notEqual(attention.mapping.mapping_reason,memory.mapping.mapping_reason);
  assert.deepEqual(schema.validateMappings([attention.mapping,memory.mapping],api),[]);
});
check('early_signal_only 只形成 signal_mapping',()=>{
  const source={observation_id:'book-1',date:'2026-10-20',raw_record:'小宝和妈妈一起看书，自己指着图画并翻厚页。',capability_ids:[],evidence_type:'emerging',source:'parent_record',confirmed:true};
  const result=pilot.createManualMapping(source,{ability_id:'lang_reading_readiness',observed_behavior_excerpt:'自己指着图画并翻厚页',mapping_reason:'记录共同看书的早期参与，不是阅读能力'},birthDate,api);
  assert.equal(result.mapping.mapping_kind,'signal_mapping');
  assert.equal(result.mapping.age_status_at_time,'early_signal_only');
  assert.equal(result.mapping.source_evidence_status,'emerging');
});
check('游戏、反馈、曝光、未确认和模糊旧记录均 unmapped',()=>{
  for(const source of ['game_feedback','activity_exposure','activity_feedback'])assert.equal(mapped(row('game', 'motor_stairs','observed',{source})).mappings.length,0);
  assert.equal(mapped(row('unconfirmed','motor_stairs','observed',{confirmed:false})).mappings.length,0);
  assert.equal(mapped(row('legacy','motor_stairs','observed',{source:'legacy_assessment'})).mappings.length,0);
  assert.equal(mapped(row('guess','motor_stairs','observed',{source:'parent_record',raw_record:'今日留意：扶着墙或栏杆上楼梯'})).mappings.length,0);
  assert.equal(mapped(row('specific-parent','motor_stairs','observed',{source:'parent_record',raw_record:'小宝自己扶着栏杆走上了三个台阶'})).unmapped.reason,'parent_record_requires_manual_review');
});
check('缺少 mapping_reason 或原文片段不能手工映射',()=>{
  const source={observation_id:'find-2',date:'2026-10-20',raw_record:'小宝找到了杯子里的玩具',capability_ids:[],evidence_type:'observed',source:'parent_record',confirmed:true};
  assert.equal(pilot.createManualMapping(source,{ability_id:'int_problem_solving',observed_behavior_excerpt:'找到了杯子里的玩具',mapping_reason:''},birthDate,api).mapping,null);
  assert.equal(pilot.createManualMapping(source,{ability_id:'int_problem_solving',observed_behavior_excerpt:'尝试了两个位置',mapping_reason:'有尝试'},birthDate,api).mapping,null);
});
check('试点摘要只计映射，审查返回 unmapped 而不改原始 evidence',()=>{
  const sources=[row('s1','motor_stairs','observed'),row('s2','motor_run','not_yet'),row('s3','cog_object_use','observed')];
  const frozen=JSON.stringify(sources),result=pilot.audit(sources,{birthDate,ontologyApi:api,capabilityIndex});
  assert.equal(result.reviewed_count,3);assert.equal(result.mapped_source_count,1);assert.equal(result.unmapped_count,2);
  assert.equal(pilot.summary(result.mappings,api)[0].mapped_evidence_count,1);
  assert.equal(JSON.stringify(sources),frozen);
});
check('本地备份审查命令只读预览，不更改输入备份',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'five-brain-pilot-'));
  try{
    const file=path.join(dir,'backup.json'),backup={birth:birthDate,evidence:[row('s1','motor_stairs','observed'),row('s2','motor_run','not_yet')]};
    fs.writeFileSync(file,JSON.stringify(backup));const before=fs.readFileSync(file,'utf8');
    const output=JSON.parse(execFileSync(process.execPath,[path.join(root,'scripts/review-five-brain-evidence.js'),file],{encoding:'utf8'}));
    assert.equal(output.reviewed_count,2);assert.equal(output.mapping_count,1);assert.equal(output.unmapped_count,1);
    assert.equal(fs.readFileSync(file,'utf8'),before);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
check('checkpoint、周计划、推荐、Growth V2 与页面文件字节不变，旧备份入口保留',()=>{
  assert.deepEqual(hashes(),before);
  const html=fs.readFileSync(path.join(root,'育儿系统看板.html'),'utf8');
  assert.ok(html.includes('function importData('));
  assert.ok(!html.includes('FiveBrainEvidencePilot'));
});
console.log(`Five-brain evidence pilot: ${passed} passed, 0 failed`);
