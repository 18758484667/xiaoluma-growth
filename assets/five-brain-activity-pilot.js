/* Phase 3.3C review-only adapter. It never reads storage, writes evidence, or ranks games. */
var FiveBrainActivityPilot=(function(){
  var statuses=['draft','pending_review','reviewed','approved','revised','rejected','unmapped'];
  function validatePilot(dataset,context){
    var errors=[];
    if(!dataset||!Array.isArray(dataset.mappings))return ['missing mappings'];
    context=context||{};
    var ontology=context.ontologyApi,mechanisms=new Set((context.mechanisms||[]).map(function(x){return typeof x==='string'?x:x.mechanism_id;}));
    var countRange=context.countRange||{min:15,max:20};
    if(dataset.mappings.length<countRange.min||dataset.mappings.length>countRange.max)errors.push('review batch count out of range');
    var ids=new Set();
    dataset.mappings.forEach(function(row){
      var id=row.activity_id;
      if(!id||ids.has(id))errors.push('duplicate or missing activity_id '+id);
      ids.add(id);
      if(context.canonicalActivityId&&context.canonicalActivityId(id)!==id)errors.push('variant or alias used as primary mapping '+id);
      var activity=context.activityById&&context.activityById(id);
      if(!activity)errors.push('activity missing '+id);
      else if(row.mapping_status==='approved'&&context.activityAvailableAtAge&&!context.activityAvailableAtAge(activity,21))errors.push('activity unsafe or age-ineligible at 21 '+id);
      var w=row.age_window;
      if(!w||!Number.isInteger(w.min_months)||!Number.isInteger(w.max_months)||w.min_months>21||w.max_months<21||w.max_months>23||activity&&(w.min_months<activity.min_age_months||w.max_months>activity.max_age_months))errors.push('invalid pilot age window '+id);
      if(statuses.indexOf(row.mapping_status)<0)errors.push('invalid mapping status '+id);
      if(['approved','revised','rejected'].indexOf(row.mapping_status)>=0&&(!row.reviewed_at||!String(row.review_note||'').trim()))errors.push('reviewed mapping lacks date or review note '+id);
      if(row.mapping_status==='rejected'&&!String(row.rejection_reason||'').trim())errors.push('rejected mapping lacks rejection reason '+id);
      if(!row.play_basis||!Array.isArray(row.mechanism_ids)||!Array.isArray(row.primary_ability_ids)||!Array.isArray(row.secondary_ability_ids)||!Array.isArray(row.experience_tags)||!row.mapping_reason||typeof row.mapping_reason!=='object'){
        errors.push('missing mapping fields '+id);return;
      }
      if(row.primary_ability_ids.length>2||row.secondary_ability_ids.length>2)errors.push('ability count exceeds limit '+id);
      if(new Set(row.mechanism_ids).size!==row.mechanism_ids.length)errors.push('duplicate mechanism '+id);
      var abilities=row.primary_ability_ids.concat(row.secondary_ability_ids);
      if(new Set(abilities).size!==abilities.length)errors.push('duplicate ability '+id);
      if(row.mapping_status==='unmapped'){
        if(abilities.length||!row.unmapped_reason)errors.push('unmapped row has ability or no reason '+id);
      }else if(row.mapping_status!=='rejected'&&(!row.mechanism_ids.length||!row.primary_ability_ids.length))errors.push('mapped row lacks mechanism or primary ability '+id);
      row.mechanism_ids.forEach(function(mid){if(!mechanisms.has(mid))errors.push('unknown mechanism '+id+'/'+mid);});
      abilities.forEach(function(aid){
        var ability=ontology&&ontology.getAbilityById(aid),age=ontology&&ontology.getAgeObservationStatus(aid,21);
        if(!ability||!age||age.age_observation_status!=='active_observation')errors.push('non-active or unknown formal ability '+id+'/'+aid);
        else if(!row.mechanism_ids.some(function(mid){return ability.related_mechanisms.indexOf(mid)>=0;}))errors.push('ability lacks ontology mechanism path '+id+'/'+aid);
        if(!String(row.mapping_reason[aid]||'').trim())errors.push('missing per-ability reason '+id+'/'+aid);
      });
      Object.keys(row.mapping_reason).forEach(function(aid){if(abilities.indexOf(aid)<0)errors.push('orphan ability reason '+id+'/'+aid);});
      (row.early_experience_candidates||[]).forEach(function(item){
        var age=ontology&&ontology.getAgeObservationStatus(item.ability_id,21);
        if(!age||age.age_observation_status!=='early_signal_only'||item.age_status_at_21!=='early_signal_only'||!item.reason||abilities.indexOf(item.ability_id)>=0)errors.push('invalid early experience '+id);
      });
      (row.precursor_experiences||[]).forEach(function(item){
        if(item.brain_id!=='creativity'||!item.label||!item.reason||item.ability_id)errors.push('invalid creative precursor '+id);
      });
      if(row.experience_tags.length>3||row.experience_tags.some(function(tag){return !tag||typeof tag!=='string';}))errors.push('invalid family tags '+id);
    });
    return errors;
  }
  function coverage(dataset,ontologyApi){
    var brainCounts={},abilityCounts={},precursorCount=0;
    (dataset&&dataset.mappings||[]).forEach(function(row){
      var brains=new Set();row.primary_ability_ids.concat(row.secondary_ability_ids).forEach(function(id){
        var a=ontologyApi.getAbilityById(id);if(!a)return;
        brains.add(a.brain_id);abilityCounts[id]=(abilityCounts[id]||0)+1;
      });
      (row.precursor_experiences||[]).forEach(function(x){brains.add(x.brain_id);precursorCount++;});
      brains.forEach(function(id){brainCounts[id]=(brainCounts[id]||0)+1;});
    });
    return {reviewed_count:dataset.mappings.length,mapped_count:dataset.mappings.filter(function(x){return x.mapping_status!=='unmapped';}).length,
      unmapped_count:dataset.mappings.filter(function(x){return x.mapping_status==='unmapped';}).length,
      brain_activity_counts:brainCounts,ability_activity_counts:abilityCounts,creative_precursor_count:precursorCount};
  }
  function getApprovedMapping(dataset,activityId,canonicalActivityId,ageMonths){
    var id=canonicalActivityId?canonicalActivityId(activityId):activityId;
    return (dataset&&dataset.mappings||[]).find(function(row){return row.activity_id===id&&row.mapping_status==='approved'&&ageMonths>=row.age_window.min_months&&ageMonths<=row.age_window.max_months;})||null;
  }
  return {validatePilot:validatePilot,coverage:coverage,getApprovedMapping:getApprovedMapping};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainActivityPilot;
