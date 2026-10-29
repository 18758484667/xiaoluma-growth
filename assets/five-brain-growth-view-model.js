/* Read-only observation map. It links approved child evidence to the existing ontology. */
var FiveBrainGrowthViewModel=(function(){
  'use strict';
  function build(options){
    options=options||{};
    var api=options.ontologyApi,age=options.ageMonths,source=Array.isArray(options.evidence)?options.evidence:[],links=Array.isArray(options.approvedMappings)?options.approvedMappings:[];
    var ontology=api.getFiveBrainOntology(),bySource=new Map();
    source.forEach(function(row){if(row&&typeof row.observation_id==='string')bySource.set(row.observation_id,row);});
    var observations={};
    links.forEach(function(link){
      if(!link||link.review_status!=='approved'||!link.reviewed_at||!link.mapping_reason||!['observed','emerging'].includes(link.source_evidence_status))return;
      var row=bySource.get(link.source_evidence_id),atTime=api.getAgeObservationStatus(link.ability_id,link.age_months_at_time);
      if(!row||row.confirmed!==true||row.source!=='monthly_assessment'||row.date!==link.observed_at||row.raw_record!==link.observed_behavior||row.evidence_type!==link.source_evidence_status||!Array.isArray(row.capability_ids)||row.capability_ids.indexOf(link.source_capability_id)<0)return;
      if(!atTime||atTime.age_observation_status!==link.age_status_at_time||!['active_observation','early_signal_only'].includes(atTime.age_observation_status))return;
      if(link.mapping_kind!==(atTime.age_observation_status==='early_signal_only'?'signal_mapping':'ability_observation'))return;
      if(!observations[link.ability_id])observations[link.ability_id]=[];
      var suffix='_'+link.source_capability_id;
      var eventId=row.observation_id.indexOf('assess_')===0&&row.observation_id.endsWith(suffix)?row.observation_id.slice(0,-suffix.length):row.observation_id;
      if(!observations[link.ability_id].some(function(x){return x.source_id===row.observation_id;}))observations[link.ability_id].push({source_id:row.observation_id,event_id:eventId,source_capability_id:link.source_capability_id,date:row.date,behavior:row.raw_record,source_label:'月度评估',source_status:row.evidence_type});
    });
    var groups=ontology.brains.slice().sort(function(a,b){return a.display_order-b.display_order;}).map(function(brain){
      return {brain_id:brain.brain_id,name:brain.name_zh,abilities:brain.ability_ids.map(function(id){
        var ability=ontology.abilities.find(function(item){return item.ability_id===id;}),rule=api.getAgeObservationStatus(id,age),applicability=rule.age_observation_status||'pending_review',records=observations[id]||[];
        records=records.slice().sort(function(a,b){return b.date.localeCompare(a.date);});
        var displayStatus=applicability==='active_observation'?(records.length?'limited_observation':'no_observation'):
          applicability==='early_signal_only'?(records.length?'early_observed':'early_context'):
          applicability==='future'?'future':applicability==='support_context'?'support_context':'pending_review';
        return {ability_id:id,name:ability.name_zh,applicability:applicability,display_status:displayStatus,observations:records};
      })};
    });
    return {age_months:age,groups:groups,has_observations:groups.some(function(group){return group.abilities.some(function(ability){return ability.observations.length>0;});})};
  }
  return {build:build};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainGrowthViewModel;
