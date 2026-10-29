/* A schema and validator for future read-only evidence links. No mappings are created here. */
var FiveBrainMappingSchema=(function(){
  var schema={version:'1.0.0',required:['mapping_id','source_type','source_id','ability_id',
    'observed_behavior','observed_at','age_months_at_time','mapping_reason',
    'age_status_at_time','mapping_source','review_status','confidence',
    'source_evidence_status','mapping_kind'],
    mapping_sources:['manual','reviewed_rule','legacy_mapping'],
    review_statuses:['pending_review','approved','rejected'],
    confidence_levels:['low','medium','high']};
  function validateMapping(record,ontologyApi){
    var errors=[];
    if(!record||typeof record!=='object')return ['mapping must be an object'];
    schema.required.forEach(function(key){if(record[key]===undefined||record[key]===null||record[key]==='')errors.push('missing '+key);});
    ['mapping_id','source_type','source_id','ability_id','observed_behavior','observed_at','mapping_reason'].forEach(function(key){
      if(record[key]!==undefined&&typeof record[key]!=='string')errors.push('invalid '+key);
    });
    if(!Number.isInteger(record.age_months_at_time)||record.age_months_at_time<0)errors.push('invalid age_months_at_time');
    if(schema.mapping_sources.indexOf(record.mapping_source)<0)errors.push('invalid mapping_source');
    if(schema.review_statuses.indexOf(record.review_status)<0)errors.push('invalid review_status');
    if(schema.confidence_levels.indexOf(record.confidence)<0)errors.push('invalid confidence');
    if(['observed','emerging'].indexOf(record.source_evidence_status)<0)errors.push('invalid source_evidence_status');
    if(['ability_observation','signal_mapping'].indexOf(record.mapping_kind)<0)errors.push('invalid mapping_kind');
    if(record.age_status_at_time==='early_signal_only'&&record.mapping_kind!=='signal_mapping')errors.push('early signal requires signal_mapping');
    if(record.age_status_at_time==='active_observation'&&record.mapping_kind!=='ability_observation')errors.push('active observation requires ability_observation');
    if(record.observed_at&&!/^\d{4}-\d{2}-\d{2}/.test(record.observed_at))errors.push('invalid observed_at');
    if(ontologyApi){
      if(!ontologyApi.getAbilityById(record.ability_id))errors.push('unknown ability_id');
      var age=ontologyApi.getAgeObservationStatus(record.ability_id,record.age_months_at_time);
      if(record.age_status_at_time!==age.age_observation_status)errors.push('age status does not match effective rule');
      if(record.review_status==='approved'&&(!age.age_observation_status||age.age_observation_status==='future'||age.age_observation_status==='support_context'))errors.push('mapping cannot be approved at this age status');
    }
    return errors;
  }
  function validateMappings(records,ontologyApi){
    if(!Array.isArray(records))return ['mappings must be an array'];
    var errors=[],ids=new Set();
    records.forEach(function(record,index){
      validateMapping(record,ontologyApi).forEach(function(error){errors.push(index+': '+error);});
      if(record&&ids.has(record.mapping_id))errors.push(index+': duplicate mapping_id');
      if(record)ids.add(record.mapping_id);
    });
    return errors;
  }
  return {schema:schema,validateMapping:validateMapping,validateMappings:validateMappings};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainMappingSchema;
