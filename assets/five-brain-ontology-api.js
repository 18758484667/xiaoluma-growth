/* Read-only access to the five-brain product ontology. No user data is read or written. */
var FiveBrainOntology=(function(){
  var data=typeof FIVE_BRAIN_ONTOLOGY!=='undefined'?FIVE_BRAIN_ONTOLOGY:
    typeof module!=='undefined'&&module.exports?require('./five-brain-ontology.js'):null;
  var statuses=['active_observation','early_signal_only','future','support_context'];
  var legacyDomains=['motor','fine','lang','cog','soc'];
  function copy(value){return value==null?null:JSON.parse(JSON.stringify(value));}
  function getFiveBrainOntology(){return copy(data);}
  function getBrainById(id){return copy(data.brains.find(function(brain){return brain.brain_id===id;}));}
  function getAbilityById(id){return copy(data.abilities.find(function(ability){return ability.ability_id===id;}));}
  function getAbilitiesForBrain(id){return copy(data.abilities.filter(function(a){return a.brain_id===id;}));}
  function ageWindow(ageMonths){
    if(!Number.isInteger(ageMonths)||ageMonths<0)return null;
    return data.age_windows.find(function(w){return ageMonths>=w.min_months&&(w.max_months===null||ageMonths<=w.max_months);})||null;
  }
  function getAgeObservationStatus(abilityId,ageMonths){
    var ability=data.abilities.find(function(a){return a.ability_id===abilityId;}),window=ageWindow(ageMonths);
    if(!ability||!window)return {ability_id:abilityId,age_months:ageMonths,window_id:null,
      age_observation_status:null,candidate_status:null,review_status:ability?'out_of_scope':'unknown_ability'};
    var rule=ability.age_observation_rules.find(function(r){return r.window_id===window.window_id;});
    if(!rule)return {ability_id:abilityId,age_months:ageMonths,window_id:window.window_id,
      age_observation_status:null,candidate_status:null,review_status:'missing_rule'};
    var effective=rule.review_status==='product_baseline';
    return {ability_id:abilityId,age_months:ageMonths,window_id:window.window_id,
      age_observation_status:effective?rule.age_observation_status:null,
      candidate_status:effective?null:rule.age_observation_status,review_status:rule.review_status};
  }
  function getAbilitiesAvailableAtAge(ageMonths){
    return data.abilities.filter(function(a){var result=getAgeObservationStatus(a.ability_id,ageMonths);
      return result.age_observation_status==='active_observation'||result.age_observation_status==='early_signal_only';
    }).map(function(a){return copy(a);});
  }
  function validateOntology(ontology,mechanismRegistry){
    var errors=[];
    if(!ontology||!Array.isArray(ontology.brains)||!Array.isArray(ontology.abilities)||!Array.isArray(ontology.age_windows))return ['ontology shape invalid'];
    var brains=ontology.brains,abilities=ontology.abilities,windows=ontology.age_windows;
    function unique(items,key,label){if(new Set(items.map(function(x){return x[key];})).size!==items.length)errors.push('duplicate '+label);}
    if(brains.length!==5)errors.push('expected 5 brains');
    if(abilities.length!==19)errors.push('expected 19 abilities');
    unique(brains,'brain_id','brain_id');unique(abilities,'ability_id','ability_id');unique(windows,'window_id','window_id');
    if(!ontology.version||!ontology.review_status)errors.push('missing version or review_status');
    var brainIds=new Set(brains.map(function(b){return b.brain_id;}));
    var abilityIds=new Set(abilities.map(function(a){return a.ability_id;}));
    brains.forEach(function(b){
      if(!b.name_zh||!b.description||!Number.isInteger(b.display_order)||!Array.isArray(b.ability_ids))errors.push('incomplete brain '+b.brain_id);
      b.ability_ids.forEach(function(id){if(!abilityIds.has(id)||!abilities.some(function(a){return a.ability_id===id&&a.brain_id===b.brain_id;}))errors.push('brain ability mismatch '+id);});
    });
    abilities.forEach(function(a){
      if(!brainIds.has(a.brain_id))errors.push('unknown brain for '+a.ability_id);
      if(!brains.some(function(b){return b.brain_id===a.brain_id&&b.ability_ids.indexOf(a.ability_id)>=0;}))errors.push('unlisted ability '+a.ability_id);
      if(!a.name_zh||!a.parent_definition||!a.evidence_policy||!a.review_status)errors.push('incomplete ability '+a.ability_id);
      if(!Array.isArray(a.related_legacy_domains)||a.related_legacy_domains.some(function(id){return legacyDomains.indexOf(id)<0;}))errors.push('invalid legacy domain '+a.ability_id);
      if(!Array.isArray(a.related_mechanisms))errors.push('invalid mechanisms '+a.ability_id);
      if(!Array.isArray(a.age_observation_rules)||a.age_observation_rules.length!==windows.length){errors.push('missing age rules '+a.ability_id);return;}
      var ids=new Set();
      a.age_observation_rules.forEach(function(rule){
        if(ids.has(rule.window_id))errors.push('duplicate age rule '+a.ability_id+'/'+rule.window_id);
        ids.add(rule.window_id);
        if(!windows.some(function(w){return w.window_id===rule.window_id;}))errors.push('unknown age window '+a.ability_id+'/'+rule.window_id);
        if(statuses.indexOf(rule.age_observation_status)<0)errors.push('invalid age status '+a.ability_id+'/'+rule.window_id);
        if(rule.review_status!=='product_baseline'&&rule.review_status!=='pending_review')errors.push('invalid rule review status '+a.ability_id+'/'+rule.window_id);
        if(rule.window_id!=='18_23'&&rule.review_status!=='pending_review')errors.push('unreviewed later rule activated '+a.ability_id+'/'+rule.window_id);
        if(a.ability_id==='mov_health_context'&&rule.age_observation_status!=='support_context')errors.push('health context converted to ability');
        if(['cre_divergent_thinking','cre_growth_mindset','cre_counterfactual_thinking'].indexOf(a.ability_id)>=0&&rule.window_id==='18_23'&&rule.age_observation_status!=='future')errors.push('creative construct active at 21 months');
      });
      windows.forEach(function(w){if(!ids.has(w.window_id))errors.push('missing '+a.ability_id+'/'+w.window_id);});
    });
    var sorted=windows.slice().sort(function(a,b){return a.min_months-b.min_months;});
    if(sorted.length!==6||sorted[0].min_months!==18||sorted[sorted.length-1].max_months!==null)errors.push('age window coverage invalid');
    sorted.forEach(function(w,index){
      if(!Number.isInteger(w.min_months)||(w.max_months!==null&&(!Number.isInteger(w.max_months)||w.max_months<w.min_months)))errors.push('invalid age window '+w.window_id);
      if(index>0&&sorted[index-1].max_months+1!==w.min_months)errors.push('age window gap or overlap '+w.window_id);
    });
    if(!Array.isArray(ontology.legacy_domain_links)||new Set(ontology.legacy_domain_links.map(function(x){return x.legacy_domain_id;})).size!==5||legacyDomains.some(function(id){return !ontology.legacy_domain_links.some(function(x){return x.legacy_domain_id===id;});}))errors.push('legacy domain coverage invalid');
    if(!Array.isArray(ontology.mechanism_links))errors.push('mechanism_links missing');
    var registry=mechanismRegistry?new Set(mechanismRegistry.map(function(x){return typeof x==='string'?x:x.mechanism_id;})):null;
    var links=ontology.mechanism_links||[];
    if(new Set(links.map(function(x){return x.mechanism_id;})).size!==links.length)errors.push('duplicate mechanism link');
    links.forEach(function(link){
      if(!link.mechanism_id||!link.review_status)errors.push('incomplete mechanism link');
      if(registry&&!registry.has(link.mechanism_id)&&link.review_status!=='pending_review')errors.push('unknown confirmed mechanism '+link.mechanism_id);
    });
    abilities.forEach(function(a){(a.related_mechanisms||[]).forEach(function(id){
      var link=links.find(function(x){return x.mechanism_id===id;});
      if(!link)errors.push('mechanism link missing '+id);
      else if(registry&&!registry.has(id)&&link.review_status!=='pending_review')errors.push('unknown confirmed mechanism '+id);
    });});
    return errors;
  }
  return {getFiveBrainOntology:getFiveBrainOntology,getBrainById:getBrainById,getAbilityById:getAbilityById,
    getAgeObservationStatus:getAgeObservationStatus,getAbilitiesForBrain:getAbilitiesForBrain,
    getAbilitiesAvailableAtAge:getAbilitiesAvailableAtAge,validateOntology:validateOntology};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainOntology;
