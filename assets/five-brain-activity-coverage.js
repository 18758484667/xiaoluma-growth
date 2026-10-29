/* Development-only content audit. This file is not loaded by the product page. */
var FiveBrainActivityCoverage=(function(){
  var strictChecks={
    int_memory_learning:['prior_exposure','retention_interval','later_reuse','adult_prompt_free'],
    int_problem_solving:['goal','independent_attempt','feedback_or_adjustment'],
    lang_comprehension:['spoken_cue','child_response'],
    lang_expression:['child_expression'],
    emo_social_cognition:['other_person_behavior','child_contingent_response'],
    emo_social_relationships:['reciprocal_interaction']
  };
  var checkNames={int_memory_learning:'memory_learning',int_problem_solving:'problem_solving',
    lang_comprehension:'language_comprehension',lang_expression:'language_expression',
    emo_social_cognition:'social_cognition',emo_social_relationships:'social_relationships'};
  function validateBatch(batch,candidates,firstBatch,context,pilot){
    var errors=pilot.validatePilot(batch,Object.assign({},context,{countRange:{min:1,max:40}}));
    var candidateIds=new Set((candidates&&candidates.candidates||[]).map(function(x){return x.activity_id;}));
    var previous=Array.isArray(firstBatch)?firstBatch:[firstBatch];
    var firstIds=new Set([].concat.apply([],previous.map(function(b){return b&&b.mappings||[];})).map(function(x){return x.activity_id;}));
    if(!candidates||!Array.isArray(candidates.candidates)||candidates.candidates.length!==batch.mappings.length)errors.push('candidate and review counts differ');
    batch.mappings.forEach(function(row){
      var id=row.activity_id;
      if(!candidateIds.has(id)||row.candidate_source_id!==id)errors.push('missing pre-review candidate '+id);
      if(firstIds.has(id))errors.push('canonical repeated from first batch '+id);
      if(!row.reviewed_at||row.reviewed_by!=='codex_content_review'||!String(row.review_note||'').trim())errors.push('review provenance missing '+id);
      if(['approved','revised','rejected','unmapped'].indexOf(row.mapping_status)<0)errors.push('candidate not reviewed '+id);
      if(row.mapping_status!=='approved')return;
      if(row.review_hold)errors.push('review hold blocks approval '+id);
      row.primary_ability_ids.concat(row.secondary_ability_ids).forEach(function(aid){
        var fields=strictChecks[aid];if(!fields)return;
        var detail=row.review_checks&&row.review_checks[checkNames[aid]];
        if(!detail||fields.some(function(field){return !String(detail[field]||'').trim();}))errors.push('strict ability criteria missing '+id+'/'+aid);
      });
    });
    return errors;
  }
  function approvedCoverage(batches,ontology,activityById){
    var rows=[].concat.apply([],batches.map(function(b){return b.mappings||[];})).filter(function(r){return r.mapping_status==='approved';});
    var ids=new Set(),duplicates=[];
    rows.forEach(function(r){if(ids.has(r.activity_id))duplicates.push(r.activity_id);ids.add(r.activity_id);});
    var active=ontology.getFiveBrainOntology().abilities.filter(function(a){return ontology.getAgeObservationStatus(a.ability_id,21).age_observation_status==='active_observation';});
    var matrix=active.map(function(a){
      var matching=rows.filter(function(r){return r.primary_ability_ids.concat(r.secondary_ability_ids).indexOf(a.ability_id)>=0;});
      var mechanisms=new Set(),efforts=new Set(),contexts=new Set(),prep=new Set();
      var effortCounts={},contextCounts={},prepCounts={};
      function tally(counts,key){counts[key]=(counts[key]||0)+1;}
      matching.forEach(function(r){r.mechanism_ids.forEach(function(id){if(a.related_mechanisms.indexOf(id)>=0)mechanisms.add(id);});
        var activity=activityById(r.activity_id);if(activity){if(activity.caregiver_effort){efforts.add(activity.caregiver_effort);tally(effortCounts,activity.caregiver_effort);}
          new Set(activity.location||[]).forEach(function(x){contexts.add(x);tally(contextCounts,x);});
          var prepLevel=activity.prep_cost||activity.prep_level;if(prepLevel){prep.add(prepLevel);tally(prepCounts,prepLevel);}}
      });
      return {ability_id:a.ability_id,ability_name:a.name_zh,brain_id:a.brain_id,approved_game_count:matching.length,
        mechanism_ids:Array.from(mechanisms).sort(),mechanism_diversity:mechanisms.size,effort_levels:Array.from(efforts).sort(),effort_diversity:efforts.size,effort_counts:effortCounts,
        contexts:Array.from(contexts).sort(),context_diversity:contexts.size,context_counts:contextCounts,prep_levels:Array.from(prep).sort(),prep_diversity:prep.size,prep_counts:prepCounts,
        coverage_status:matching.length===0?'gap':matching.length>=3&&mechanisms.size>=2?'usable':'limited'};
    });
    return {approved_canonical_count:ids.size,duplicate_canonical_ids:duplicates,abilities:matrix};
  }
  return {validateBatch:validateBatch,approvedCoverage:approvedCoverage};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainActivityCoverage;
