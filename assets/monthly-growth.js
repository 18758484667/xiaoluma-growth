/* Phase 1.8: summary is generated only on explicit assessment completion or update. */
function previousMonthKey(monthKey){var p=monthKey.split('-');return fmt(new Date(+p[0],+p[1]-2,15)).slice(0,7);}
function monthlySuggestionType(st){
  if(st.key==='concern')return 'professional_check';
  return {watch:'opportunity',emerging:'opportunity',unknown:'observe',rich:'maintain',on_track:'maintain'}[st.key]||'observe';
}
function monthlyDimensionSummary(domain,st,monthRows,recentRows,assessment){
  var related=monthRows.filter(function(e){return e.domains.indexOf(domain)>=0;}),recent=recentRows.filter(function(e){return e.domains.indexOf(domain)>=0;});
  var observed=st.capabilities.filter(function(s){return s.phase!=='future'&&s.status==='observed'&&s.rows.some(function(r){return r.confirmed;});}).map(function(s){return {capability_id:s.capability.capability_id,label:s.capability.label};}).slice(0,3);
  var emerging=st.capabilities.filter(function(s){return s.phase==='current'&&s.status==='emerging'&&s.rows.some(function(r){return r.confirmed;});}).map(function(s){return {capability_id:s.capability.capability_id,label:s.capability.label,phase:s.phase};}).slice(0,3);
  var seen=observed.concat(emerging).map(function(x){return x.label;}),observedItems=observed.map(function(x){return x.label;});
  recent.filter(function(e){return (e.evidence_type==='observed'||e.evidence_type==='emerging')&&e.raw_record&&e.capability_ids.every(function(id){var c=capabilityById(id);return !c||capabilityPhase(c,st.ageMonths)!=='future';})&&seen.every(function(x){return e.raw_record.indexOf(x)<0;});}).slice(0,3-observedItems.length).forEach(function(e){observedItems.push(e.raw_record);});
  var eligible=st.capabilities.filter(function(s){return s.phase==='current';}),targetState=eligible.find(function(s){return s.status==='emerging';})||eligible.find(function(s){return s.status==='not_yet';})||eligible.find(function(s){return s.status!=='observed';})||eligible[0],target=targetState&&targetState.capability,targetLabel=target&&target.label||'自然互动中的具体表现';
  var type=monthlySuggestionType(st),next=observationSuggestions(st)[0],recommendation='';
  if(type==='maintain')recommendation='继续在熟悉的游戏和生活里提供机会，顺便留意这些表现是否持续出现。';
  if(type==='opportunity')recommendation='遇到合适的日常场景时，多给她机会自然尝试「'+targetLabel+'」；不必反复测试。';
  if(type==='observe')recommendation='目前信息还少。'+next;
  if(type==='monitor')recommendation='在自然场景里顺便留意「'+targetLabel+'」是否逐渐出现，不需要反复测试。';
  if(type==='professional_check')recommendation=st.regressionReport?'已记录明确的能力倒退，建议及时与儿保或儿科专业人员讨论。':(st.officialCheckpoint?checkpointMessage(st.officialCheckpoint.result):'请查看本次官方关键月龄核对的原表建议。');
  if(domain==='motor'&&st.ageMonths>=20&&st.ageMonths<24&&st.key!=='concern'&&st.capabilities.some(function(s){return s.capability.capability_id==='motor_stairs'&&s.status==='observed';})&&st.capabilities.some(function(s){return s.capability.capability_id==='motor_run'&&s.status==='not_yet';}))recommendation='大运动正在继续发展，已经看到扶栏上楼梯。可以多提供快走、追球、踢球、缓坡和低台阶等主动移动机会，顺便观察是否逐渐出现更快的步态或短暂跑动。';
  var answers=(assessment.selectedCapabilityIds||[]).filter(function(id){var c=capabilityById(id);return c&&c.domain===domain&&assessment.answers&&assessment.answers[id];}).map(function(id){var answer=assessment.answers[id];return {capability_id:id,label:capabilityById(id).label,status:answer.status==='concern'?'unobserved':answer.status,caregiver_concern:answer.caregiver_concern===true||answer.status==='concern'};});
  var sources={};related.forEach(function(e){var name=EVIDENCE_SOURCE[e.source]||'日常记录';sources[name]=(sources[name]||0)+1;});
  var keyRows=related.slice().sort(function(a,b){return b.createdAt-a.createdAt;}).slice(0,3).map(function(e){return {observation_id:e.observation_id,date:e.date,text:e.raw_record,status:e.evidence_type,caregiver_concern:e.caregiver_concern===true,source:EVIDENCE_SOURCE[e.source]||'日常记录'};});
  return {domain:domain,state:st.key,state_label:st.label,evidence_level:st.evidenceLevel,evidence_label:st.evidenceLabel,target_capability_id:target&&target.capability_id||null,
    observed_capabilities:observed,observed_items:observedItems,emerging_capabilities:emerging,current_not_yet:st.capabilities.filter(function(s){return s.phase==='current'&&s.status==='not_yet';}).map(function(s){return s.capability.capability_id;}),next_observation:next,
    recommendation_type:type,recommendation:recommendation,monthly_evidence_count:related.length,
    assessment_answers:answers,recent_observation_count:recent.length,source_counts:sources,
    evidence_refs:related.map(function(e){return e.observation_id;}),key_evidence:keyRows,why:st.why};
}
function monthlyFocusCandidates(dimensions){
  return DOMAIN_IDS.map(function(d,i){var x=dimensions[d],score=0;
    if(x.state==='concern')score=70;
    else if(x.state==='watch')score=50;
    else if(x.state==='emerging'&&x.emerging_capabilities.some(function(c){return c.phase==='current';}))score=60;
    else if(x.state==='emerging'&&x.current_not_yet&&x.current_not_yet.length)score=45;
    else if(x.state==='unknown'&&x.evidence_level==='low')score=30;
    return {domain:d,score:score,index:i};
  }).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score||a.index-b.index;});
}
function monthlyFocusFromDimensions(dimensions){
  var candidates=monthlyFocusCandidates(dimensions),chosen=candidates.slice(0,2);
  if(chosen.length&&chosen[0].score<=30)chosen=chosen.slice(0,1);
  return chosen.map(function(x){var dim=dimensions[x.domain],name=DOMAIN_META[x.domain].name.slice(2).trim(),ids=dim.emerging_capabilities.map(function(c){return c.capability_id;});if(dim.target_capability_id&&ids.indexOf(dim.target_capability_id)<0)ids.push(dim.target_capability_id);var reason=dim.state==='concern'?'请查看官方节点核对或明确倒退记录的建议。':dim.state==='watch'?'有些具体表现需要在自然场景里再看几次。':dim.state==='emerging'?(dim.emerging_capabilities.length?'已有正在出现的表现，适合多给自然尝试机会。':'处在当前发展窗口，适合多给自然活动机会，顺便留意。'):'目前记录较少，先顺便留意即可。';return {domain:x.domain,type:dim.recommendation_type,title:name+' · '+dim.state_label,reason:reason,action:dim.recommendation,capability_ids:ids};});
}
function monthlyCapabilityChanges(monthKey,evidence,age){
  var previous=previousMonthKey(monthKey),before=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)===previous;}),earlier=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)<monthKey;}),now=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)===monthKey;}),out=[];
  CAPABILITIES.forEach(function(c){
    if(capabilityPhase(c,age)==='future')return;
    var old=before.filter(function(e){return e.capability_ids.indexOf(c.capability_id)>=0;}),current=now.filter(function(e){return e.capability_ids.indexOf(c.capability_id)>=0;});
    if(!old.length||!current.length)return;
    var explicitNotYet=old.some(function(e){return e.evidence_type==='not_yet';}),priorPositive=earlier.some(function(e){return e.capability_ids.indexOf(c.capability_id)>=0&&(e.evidence_type==='observed'||e.evidence_type==='emerging');}),currentPositive=current.filter(function(e){return e.evidence_type==='observed'||e.evidence_type==='emerging';});
    if(explicitNotYet&&!priorPositive&&currentPositive.length)out.push({capability_id:c.capability_id,domain:c.domain,text:'本月开始看到：'+c.label,evidence_refs:currentPositive.map(function(e){return e.observation_id;})});
    else if(old.some(function(e){return e.evidence_type==='emerging';})&&!old.some(function(e){return e.evidence_type==='observed';})&&uniqueValues(current.filter(function(e){return e.evidence_type==='observed';}).map(function(e){return e.date;})).length>=2)out.push({capability_id:c.capability_id,domain:c.domain,text:'本月在不同日子再次看到：'+c.label,evidence_refs:current.filter(function(e){return e.evidence_type==='observed';}).map(function(e){return e.observation_id;})});
  });return out.slice(0,3);
}
function monthlyPlanActivities(focus,states,age,referenceDate,prefs){
  var domains=focus.map(function(x){return x.domain;}),capabilityIds=[].concat.apply([],focus.map(function(x){return x.capability_ids||[];})),ranked=rankedActivityCandidates(prefs,age,referenceDate,states);
  var scored=ranked.map(function(a){var choices=a.variants||[a],hit=choices.some(function(v){return v.domains.some(function(d){return domains.indexOf(d)>=0;});}),capabilityHit=choices.some(function(v){return v.observation_prompts.some(function(p){return capabilityIds.indexOf(p.capability_id)>=0;});});return {activity:a,score:a._score+(hit?24:0)+(capabilityHit?14:0),hit:hit};}).sort(function(a,b){return b.score-a.score||a.activity.activity_id.localeCompare(b.activity.activity_id);});
  var preferred=scored.filter(function(x){return x.hit;}),pool=domains.length&&preferred.length>=2?preferred:scored,selected=[];
  domains.forEach(function(domain){var candidate=pool.find(function(x){return selected.indexOf(x)<0&&(x.activity.variants||[x.activity]).some(function(v){return v.domains.indexOf(domain)>=0;});});if(candidate&&selected.length<3)selected.push(candidate);});
  pool.forEach(function(x){if(selected.length<3&&selected.indexOf(x)<0)selected.push(x);});
  return selected.map(function(x){var a=x.activity;if(a.variants)a=chooseActivityVariant(activityById(a.activity_id),age,prefs,states,domains)||a;return {activity_id:a.activity_id,title:a.title,description:a.description,duration:a.duration.label,domains:a.domains.slice(),steps:a.steps.slice(0,4),safety_notes:a.safety_notes};});
}
function monthlyLifeOpportunities(focus,age,prefs,states){
  var domains=focus.map(function(x){return x.domain;}),eligible=LIFE_OPPORTUNITIES.filter(function(x){return age>=(x.min_age_months||0)&&x.contexts.indexOf(prefs.context)>=0;}).filter(function(x){return x.title!=='走一段小坡或不同路面'||!states||['emerging','on_track','rich'].indexOf(states.motor.key)>=0;});
  return eligible.slice().sort(function(a,b){var ah=(a.domains||[]).some(function(d){return domains.indexOf(d)>=0;})?1:0,bh=(b.domains||[]).some(function(d){return domains.indexOf(d)>=0;})?1:0;return bh-ah;}).slice(0,2).map(function(x){return {title:x.title,text:x.text,domains:(x.domains||[]).slice()};});
}
function generateMonthlyGrowthSummary(input){
  var assessment=input.assessment,monthKey=assessment.monthKey,monthDate=new Date(+monthKey.slice(0,4),+monthKey.slice(5,7)-1,15),fallbackAge=(monthDate.getFullYear()-BIRTH.getFullYear())*12+monthDate.getMonth()-BIRTH.getMonth()-(monthDate.getDate()<BIRTH.getDate()?1:0),age=typeof assessment.ageMonths==='number'&&isFinite(assessment.ageMonths)?assessment.ageMonths:fallbackAge,referenceDate=input.referenceDate||monthKey+'-28',evidence=normalizeEvidence(input.evidence||[]).filter(function(e){return e.confirmed&&e.date<=referenceDate;}),recentStart=fmt(addDays(new Date(referenceDate+'T12:00:00'),-120)),last30=fmt(addDays(new Date(referenceDate+'T12:00:00'),-30)),stateRows=evidence.filter(function(e){return e.date>=recentStart;}),monthRows=evidence.filter(function(e){return e.date.slice(0,7)===monthKey;}),recentRows=evidence.filter(function(e){return e.date>=last30;}),states={},dimensions={};
  DOMAIN_IDS.forEach(function(d){states[d]=evaluateDomainState(d,age,stateRows,referenceDate,{checkpoint:checkpointDomainSignal(d,age,monthKey),regression:regressionSignal(d,referenceDate)});dimensions[d]=monthlyDimensionSummary(d,states[d],monthRows,recentRows,assessment);});
  var focus=monthlyFocusFromDimensions(dimensions),newCaps=monthlyCapabilityChanges(monthKey,evidence,age),previous=input.previousAssessment||null,previousStates=null;
  if(previous&&previous.monthly_growth_summary&&previous.monthly_growth_summary.dimensions){previousStates={};DOMAIN_IDS.forEach(function(d){previousStates[d]=previous.monthly_growth_summary.dimensions[d]&&previous.monthly_growth_summary.dimensions[d].state||'unknown';});}
  else if(previous){previousStates={};var priorDate=fmt(new Date(previous.completedAt));DOMAIN_IDS.forEach(function(d){previousStates[d]=evaluateDomainState(d,previous.ageMonths,evidence.filter(function(e){return e.date<=priorDate&&e.date>=fmt(addDays(new Date(priorDate+'T12:00:00'),-120));}),priorDate).key;});}
  var positive=DOMAIN_IDS.filter(function(d){return states[d].key==='rich'||states[d].key==='on_track';}),uncertain=DOMAIN_IDS.filter(function(d){return states[d].key==='unknown';}),concerning=DOMAIN_IDS.filter(function(d){return states[d].key==='concern';}),specific=DOMAIN_IDS.map(function(d){return dimensions[d].observed_items[0];}).filter(Boolean).slice(0,2),sentences=[];
  if(concerning.length)sentences.push('本月记录中有明确的官方节点提示或能力倒退记录，请查看对应的说明，并与专业人员讨论。');
  else if(positive.length>=3)sentences.push('这个月在多个方面都有已确认的日常表现，整体可以继续按她的节奏陪伴。');
  else if(uncertain.length>=3)sentences.push('这次评估提供了一个起点，仍有几个方面的记录较少，暂时不需要急着下结论。');
  else sentences.push('从本月的评估和日常记录看，已有一些可确认的表现，也有正在慢慢出现的变化。');
  if(newCaps.length)sentences.push('和上月记录相比，本月开始看到「'+newCaps[0].text.replace(/^本月开始看到：/,'')+'」。');
  else if(specific.length)sentences.push('已看到的具体表现包括「'+specific.join('」和「')+'」。');
  else sentences.push('目前能确认的具体行为还不多，之后在自然生活里继续留意即可。');
  if(focus.length&&positive.length)sentences.push(DOMAIN_META[positive[0]].name.slice(2).trim()+'方面已有可确认的表现，可以继续正常提供机会。');
  if(focus.length)sentences.push('接下来一个月，先把注意力放在'+focus.map(function(x){return DOMAIN_META[x.domain].name.slice(2).trim();}).join('和')+'，不用把每个领域都变成任务。');
  else sentences.push('这个月没有特别需要强化的方面，继续正常生活和游戏即可。');
  var prefs=input.prefs||loadTodayPrefs(),life=monthlyLifeOpportunities(focus,age,prefs,states),activities=monthlyPlanActivities(focus,states,age,referenceDate,prefs),linked=focus.length?life.find(function(x){return x.domains.indexOf(focus[0].domain)>=0;}):null;
  var interaction=[linked?linked.title+'。'+linked.text:'跟着她正在注意的事说一句话，留一点时间等她回应。'];
  if(linked&&life.length>1)life=life.filter(function(x){return x!==linked;});
  return {schemaVersion:1,assessment_id:assessment.assessment_id,month_key:monthKey,age_months:age,generated_at:Date.now(),snapshot:true,
    overall_summary:sentences.join(''),monthly_focus:focus,dimensions:dimensions,next_30_days:{interaction:interaction,activities:activities,life_opportunities:life},
    recent_changes:newCaps.slice(),new_capabilities:newCaps.filter(function(x){return x.text.indexOf('开始看到')>=0;}),next_month_check:focus.length?focus.map(function(x){return dimensions[x.domain].next_observation;}):['下个月再看看哪些表现自然出现了，仍不需要专门测试。'],previous_month_key:previous?previous.monthKey:null,previous_states:previousStates,
    input_summary:{current_month_evidence_count:monthRows.length,recent_observation_count:recentRows.length,assessment_answer_count:Object.keys(assessment.answers||{}).length,concern_evidence_count:monthRows.filter(function(e){return e.caregiver_concern;}).length}};
}
function growthDisplayExcerpt(value,maxSentences,maxChars){
  var text=String(value||'').trim(),sentences=text.match(/[^。！？!?]+[。！？!?]?/g)||[text],short=sentences.slice(0,maxSentences).join('').trim();
  if(Array.from(short).length>maxChars)short=Array.from(short).slice(0,maxChars-1).join('').replace(/[，、；\s]+$/,'')+'…';
  return short;
}
function updateCurrentMonthSummary(){
  var rows=loadAssessments(),a=rows.find(function(x){return x.monthKey===fmt(new Date()).slice(0,7)&&x.completedAt;});if(!a)return;
  var previous=rows.filter(function(x){return x.completedAt&&x.monthKey<a.monthKey;}).sort(function(x,y){return x.monthKey<y.monthKey?1:-1;})[0]||null;
  a.monthly_growth_summary=generateMonthlyGrowthSummary({assessment:a,evidence:loadEvidence(),referenceDate:fmt(new Date()),previousAssessment:previous});saveAssessments(rows);if(window.GrowthPageV2)GrowthPageV2.refresh();
}
