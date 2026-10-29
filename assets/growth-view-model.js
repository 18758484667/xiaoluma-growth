/* Read-only view adapter. All developmental judgments stay in the existing engine. */
(function(global){
  'use strict';
  var names={motor:'大运动',fine:'精细动作',lang:'语言沟通',cog:'认知探索',soc:'社会互动'};
  function build(){
    var age=ageInfo().totM,month=fmt(new Date()).slice(0,7),assessment=currentAssessment(),summary=assessment&&assessment.completedAt?assessment.monthly_growth_summary:null;
    var states=currentDomainStates(),stage=growthTimelineStage(age),evidence=loadEvidence(),assessments=loadAssessments();
    var observations=evidence.filter(function(e){return e.source!=='monthly_assessment'&&e.source!=='legacy_assessment';}).sort(function(a,b){return b.date.localeCompare(a.date)||b.createdAt-a.createdAt;});
    var dimensions=DOMAIN_IDS.map(function(domain){
      var st=states[domain],facts=st.capabilities.filter(function(s){return s.phase!=='future'&&s.rows.some(function(r){return r.confirmed;});});
      var fact=function(s){return {id:s.capability.capability_id,label:s.capability.label,status:growthTimelineEvidenceStatus(s),rows:s.rows};};
      return {domain:domain,name:names[domain],state:st,lead:growthRecentText(st),
        observed:facts.filter(function(s){return growthTimelineEvidenceStatus(s)==='observed';}).map(fact),
        current:facts.filter(function(s){var status=growthTimelineEvidenceStatus(s);return status==='emerging'||status==='not_yet';}).map(fact),
        next:observationSuggestions(st)[0],evidence:st.evidence.slice().sort(function(a,b){return b.createdAt-a.createdAt;}),
        assessmentAnswers:assessment?(assessment.selectedCapabilityIds||[]).map(function(id){var c=capabilityById(id),answer=(assessment.answers||{})[id];return c&&c.domain===domain&&answer?{label:c.label,answer:answer}:null;}).filter(Boolean):[],
        trajectory:st.evidenceLevel==='low'?null:growthTimelineItems(st,age,stage)};
    });
    var months=Array.from(new Set(observations.map(function(e){return e.date.slice(0,7);}).concat(assessments.map(function(a){return a.monthKey;})))).filter(function(m){return /^\d{4}-\d{2}$/.test(m);}).sort().reverse();
    var archives=months.map(function(m){var a=assessments.find(function(item){return item.monthKey===m;}),snapshot=a&&a.completedAt?a.monthly_growth_summary:null;return {month:m,assessment:a||null,snapshot:snapshot||null,observations:observations.filter(function(e){return e.date.slice(0,7)===m;})};});
    return {age:age,month:month,assessment:assessment,summary:summary||null,focus:summary?(summary.monthly_focus||[]).slice(0,2):[],plan:summary?summary.next_30_days||{}:{},dimensions:dimensions,stage:stage,observations:observations,monthObservations:observations.filter(function(e){return e.date.slice(0,7)===month;}),archives:archives,guide:guideForAge(age)};
  }
  global.GrowthViewModel={build:build,names:names};
})(window);
