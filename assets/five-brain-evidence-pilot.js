/* Phase 3.3B: pure, read-only pilot mapping of explicit existing evidence.
 * Never reads storage, writes user data, or treats play/feedback as observation. */
var FiveBrainEvidencePilot=(function(){
  var directRules={
    motor_stairs:{ability_id:'mov_gross_motor',reason:'原记录明确报告扶栏上楼梯这一身体移动、平衡和台阶动作。'},
    motor_run:{ability_id:'mov_gross_motor',reason:'原记录明确报告自然跑动这一粗大运动行为。'},
    fine_lid:{ability_id:'mov_fine_motor',reason:'原记录明确报告拧开大瓶盖或操作旋转物的手部动作。'},
    fine_spoon:{ability_id:'mov_fine_motor',reason:'原记录明确报告尝试使用勺子的手部动作。'},
    fine_spoon_eat:{ability_id:'mov_fine_motor',reason:'原记录明确报告使用勺子进食的手部动作。'},
    fine_pages:{ability_id:'mov_fine_motor',reason:'原记录明确报告一页页翻书的手部动作；不据此推断阅读能力。'},
    lang_words:{ability_id:'lang_expression',reason:'原记录明确报告孩子说出有意义词语的表达行为。'},
    lang_two_words:{ability_id:'lang_expression',reason:'原记录明确报告孩子说出两词组合的表达行为。'},
    lang_request:{ability_id:'lang_expression',reason:'原记录明确报告用手势、声音或词主动表达需要；不据此推断语言理解。'},
    soc_ball:{ability_id:'emo_social_relationships',reason:'原记录明确报告与家人来回传球的实际互动；不据此推断完整社会认知。'}
  };
  var blockedSources=['activity_feedback','activity_exposure','activity_favorite','game_played'];
  function ageMonthsAtDate(birth,date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(birth||'')||!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
    var b=birth.split('-').map(Number),d=date.split('-').map(Number),age=(d[0]-b[0])*12+d[1]-b[1]-(d[2]<b[2]?1:0);
    return age>=0?age:null;
  }
  function sourceId(row){return row&&row.observation_id?String(row.observation_id):null;}
  function reject(row,reason){return {source_evidence_id:sourceId(row),source_capability_id:Array.isArray(row&&row.capability_ids)&&row.capability_ids.length===1?row.capability_ids[0]:null,source_evidence_status:row&&row.evidence_type||null,observed_at:row&&row.date||null,reason:reason};}
  function mapOne(row,birthDate,ontologyApi,capabilityIndex){
    if(!row||!sourceId(row))return {mappings:[],unmapped:reject(row,'missing_source_id')};
    if(blockedSources.indexOf(row.source)>=0||row.source==='game_feedback')return {mappings:[],unmapped:reject(row,'game_or_feedback_not_evidence')};
    if(row.confirmed!==true)return {mappings:[],unmapped:reject(row,'not_confirmed')};
    if(row.evidence_type==='not_yet'){
      var notYetAge=ageMonthsAtDate(birthDate,row.date),notYetIds=Array.isArray(row.capability_ids)?row.capability_ids:[];
      var notYetCap=notYetIds.length===1?capabilityIndex[notYetIds[0]]:null;
      return {mappings:[],unmapped:reject(row,notYetCap&&Number.isFinite(notYetCap.typical_age_start)&&notYetAge<notYetCap.typical_age_start?'future_not_yet_kept_only_as_reference':'not_yet_kept_only_as_source_reference')};
    }
    if(row.evidence_type==='unobserved')return {mappings:[],unmapped:reject(row,'unobserved_not_ability_evidence')};
    if(row.evidence_type!=='observed'&&row.evidence_type!=='emerging')return {mappings:[],unmapped:reject(row,'unsupported_evidence_state')};
    var date=String(row.date||''),age=ageMonthsAtDate(birthDate,date);
    if(age===null)return {mappings:[],unmapped:reject(row,'age_at_observation_unknown')};
    var ids=Array.isArray(row.capability_ids)?row.capability_ids:[];
    if(ids.length!==1)return {mappings:[],unmapped:reject(row,'capability_id_missing_or_ambiguous')};
    var cap=capabilityIndex[ids[0]];
    if(!cap)return {mappings:[],unmapped:reject(row,'unknown_source_capability')};
    if(Number.isFinite(cap.typical_age_start)&&age<cap.typical_age_start)return {mappings:[],unmapped:reject(row,'source_capability_future_at_observation')};
    var rule=directRules[ids[0]];
    if(!rule)return {mappings:[],unmapped:reject(row,'no_reviewed_one_to_one_rule')};
    // Old free text and automatically inferred legacy capability IDs are not reliable enough for this pilot.
    if(String(row.source||'').indexOf('legacy_')===0)return {mappings:[],unmapped:reject(row,'legacy_inferred_capability_needs_manual_review')};
    var sourceType=String(row.source||''),text=String(row.raw_record||'').trim();
    if(!text)return {mappings:[],unmapped:reject(row,'observed_behavior_missing')};
    if(sourceType==='parent_record')return {mappings:[],unmapped:reject(row,'parent_record_requires_manual_review')};
    if(sourceType!=='monthly_assessment')return {mappings:[],unmapped:reject(row,'source_requires_manual_review')};
    // Monthly assessment rows contain the exact reviewed capability question.
    if(sourceType==='monthly_assessment'&&text!==cap.label)return {mappings:[],unmapped:reject(row,'assessment_question_mismatch')};
    var ageResult=ontologyApi.getAgeObservationStatus(rule.ability_id,age);
    if(ageResult.age_observation_status!=='active_observation')return {mappings:[],unmapped:reject(row,'target_ability_age_rule_not_active')};
    var mapping={mapping_id:'pilot_'+sourceId(row)+'_'+rule.ability_id,source_type:sourceType,source_id:sourceId(row),
      source_evidence_id:sourceId(row),source_capability_id:ids[0],observed_behavior:text,
      observed_at:date,age_months_at_time:age,age_months:age,ability_id:rule.ability_id,
      age_status_at_time:ageResult.age_observation_status,mapping_reason:rule.reason,
      mapping_source:'reviewed_rule',review_status:'pending_review',confidence:'medium',
      source_evidence_status:row.evidence_type,mapping_kind:'ability_observation'};
    if(row.evidence_type==='emerging')mapping.mapping_reason+=' 原始状态为 emerging，仅代表正在出现的行为片段，不表示已掌握。';
    return {mappings:[mapping],unmapped:null};
  }
  function audit(rows,options){
    options=options||{};
    var sourceRows=Array.isArray(rows)?rows:[],limit=Math.min(20,Math.max(0,options.limit||20));
    var selected=sourceRows.slice(0,limit),mappings=[],unmapped=[];
    selected.forEach(function(row){var result=mapOne(row,options.birthDate,options.ontologyApi,options.capabilityIndex||{});
      mappings.push.apply(mappings,result.mappings);if(result.unmapped)unmapped.push(result.unmapped);
    });
    return {reviewed_count:selected.length,mapped_source_count:new Set(mappings.map(function(x){return x.source_id;})).size,
      mapping_count:mappings.length,unmapped_count:unmapped.length,mappings:mappings,unmapped:unmapped};
  }
  function validateManualTarget(row,targetAbilityId,reason,birthDate,ontologyApi,capabilityIndex){
    if(!row||!sourceId(row)||['monthly_assessment','parent_record'].indexOf(row.source)<0||row.confirmed!==true||['observed','emerging'].indexOf(row.evidence_type)<0||!String(row.raw_record||'').trim()||!String(reason||'').trim())return {allowed:false,reason:'explicit_behavior_and_reason_required'};
    var age=ageMonthsAtDate(birthDate,row.date),ids=Array.isArray(row.capability_ids)?row.capability_ids:[];
    if(ids.length&&(!capabilityIndex||ids.some(function(id){return !capabilityIndex[id];})))return {allowed:false,reason:'source_capability_rule_unverified'};
    if(ids.some(function(id){return Number.isFinite(capabilityIndex[id].typical_age_start)&&age<capabilityIndex[id].typical_age_start;}))return {allowed:false,reason:'source_capability_future_at_observation'};
    var status=ontologyApi.getAgeObservationStatus(targetAbilityId,age);
    if(!status.age_observation_status||status.age_observation_status==='future'||status.age_observation_status==='support_context')return {allowed:false,reason:'age_status_not_eligible'};
    return {allowed:true,mapping_kind:status.age_observation_status==='early_signal_only'?'signal_mapping':'ability_observation',
      age_status_at_time:status.age_observation_status,source_evidence_status:row.evidence_type};
  }
  function createManualMapping(row,proposal,birthDate,ontologyApi,capabilityIndex){
    proposal=proposal||{};
    var checked=validateManualTarget(row,proposal.ability_id,proposal.mapping_reason,birthDate,ontologyApi,capabilityIndex);
    if(!checked.allowed)return {mapping:null,reason:checked.reason};
    var excerpt=String(proposal.observed_behavior_excerpt||'').trim(),raw=String(row.raw_record||'');
    if(excerpt.length<4||raw.indexOf(excerpt)<0)return {mapping:null,reason:'behavior_excerpt_not_in_source'};
    var age=ageMonthsAtDate(birthDate,row.date);
    return {mapping:{mapping_id:'pilot_'+sourceId(row)+'_'+proposal.ability_id,
      source_type:row.source,source_id:sourceId(row),source_evidence_id:sourceId(row),
      source_capability_id:Array.isArray(row.capability_ids)&&row.capability_ids.length===1?row.capability_ids[0]:null,
      observed_behavior:excerpt,observed_at:row.date,age_months_at_time:age,age_months:age,
      ability_id:proposal.ability_id,age_status_at_time:checked.age_status_at_time,
      mapping_reason:String(proposal.mapping_reason).trim(),mapping_source:'manual',
      review_status:'pending_review',confidence:'low',source_evidence_status:row.evidence_type,
      mapping_kind:checked.mapping_kind},reason:null};
  }
  function summary(mappings,ontologyApi){
    var byAbility={};(Array.isArray(mappings)?mappings:[]).forEach(function(m){
      if(!byAbility[m.ability_id])byAbility[m.ability_id]={ability_id:m.ability_id,mapped_evidence_count:0,source_evidence_ids:[],age_status:m.age_status_at_time,earliest_observation:m.observed_at,latest_observation:m.observed_at};
      var entry=byAbility[m.ability_id];entry.mapped_evidence_count++;entry.source_evidence_ids.push(m.source_evidence_id);
      if(m.observed_at<entry.earliest_observation)entry.earliest_observation=m.observed_at;
      if(m.observed_at>entry.latest_observation)entry.latest_observation=m.observed_at;
    });
    return Object.keys(byAbility).sort().map(function(id){return byAbility[id];});
  }
  return {directRules:directRules,ageMonthsAtDate:ageMonthsAtDate,mapOne:mapOne,audit:audit,
    validateManualTarget:validateManualTarget,createManualMapping:createManualMapping,summary:summary};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainEvidencePilot;
