/* Phase 1.8: summary is generated only on explicit assessment completion or update. */
function previousMonthKey(monthKey){var p=monthKey.split('-');return fmt(new Date(+p[0],+p[1]-2,15)).slice(0,7);}
function monthlySuggestionType(st){
  if(st.key==='concern')return st.evidenceLevel==='low'?'monitor':'professional_check';
  return {watch:'monitor',emerging:'opportunity',unknown:'observe',rich:'maintain',on_track:'maintain'}[st.key]||'observe';
}
function monthlyDimensionSummary(domain,st,monthRows,recentRows,assessment){
  var related=monthRows.filter(function(e){return e.domains.indexOf(domain)>=0;}),recent=recentRows.filter(function(e){return e.domains.indexOf(domain)>=0;});
  var observed=st.capabilities.filter(function(s){return s.status==='observed'&&s.rows.some(function(r){return r.confirmed;});}).map(function(s){return {capability_id:s.capability.capability_id,label:s.capability.label};}).slice(0,3);
  var emerging=st.capabilities.filter(function(s){return s.status==='emerging'&&s.rows.some(function(r){return r.confirmed;});}).map(function(s){return {capability_id:s.capability.capability_id,label:s.capability.label,phase:s.phase};}).slice(0,3);
  var seen=observed.concat(emerging).map(function(x){return x.label;}),observedItems=observed.map(function(x){return x.label;});
  recent.filter(function(e){return (e.evidence_type==='observed'||e.evidence_type==='emerging')&&e.raw_record&&seen.every(function(x){return e.raw_record.indexOf(x)<0;});}).slice(0,3-observedItems.length).forEach(function(e){observedItems.push(e.raw_record);});
  var target=(emerging[0]||st.capabilities.find(function(s){return s.status==='not_yet'&&s.phase!=='future';})&&st.capabilities.find(function(s){return s.status==='not_yet'&&s.phase!=='future';}).capability||st.capabilities.find(function(s){return s.phase==='current';})&&st.capabilities.find(function(s){return s.phase==='current';}).capability),targetLabel=target&&target.label||'自然互动中的具体表现';
  var type=monthlySuggestionType(st),next=observationSuggestions(st)[0],recommendation='';
  if(type==='maintain')recommendation='继续在熟悉的游戏和生活里提供机会，顺便留意这些表现是否持续出现。';
  if(type==='opportunity')recommendation='遇到合适的日常场景时，多给她机会自然尝试「'+targetLabel+'」；不必反复测试。';
  if(type==='observe')recommendation='目前信息还少。'+next;
  if(type==='monitor')recommendation='接下来2～4周，在自然场景里留意「'+targetLabel+'」是否再次出现，并记下具体情况。';
  if(type==='professional_check')recommendation='接下来2～4周继续记录「'+targetLabel+'」的具体表现；如已有能力倒退或担忧持续，可与儿保或儿科专业人员讨论。';
  var answers=(assessment.selectedCapabilityIds||[]).filter(function(id){var c=capabilityById(id);return c&&c.domain===domain&&assessment.answers&&assessment.answers[id];}).map(function(id){return {capability_id:id,label:capabilityById(id).label,status:assessment.answers[id].status};});
  var sources={};related.forEach(function(e){var name=EVIDENCE_SOURCE[e.source]||'日常记录';sources[name]=(sources[name]||0)+1;});
  var keyRows=related.slice().sort(function(a,b){return b.createdAt-a.createdAt;}).slice(0,3).map(function(e){return {observation_id:e.observation_id,date:e.date,text:e.raw_record,status:e.evidence_type,source:EVIDENCE_SOURCE[e.source]||'日常记录'};});
  return {domain:domain,state:st.key,state_label:st.label,evidence_level:st.evidenceLevel,evidence_label:st.evidenceLabel,target_capability_id:target&&target.capability_id||null,
    observed_capabilities:observed,observed_items:observedItems,emerging_capabilities:emerging,next_observation:next,
    recommendation_type:type,recommendation:recommendation,monthly_evidence_count:related.length,
    assessment_answers:answers,recent_observation_count:recent.length,source_counts:sources,
    evidence_refs:related.map(function(e){return e.observation_id;}),key_evidence:keyRows,why:st.why};
}
function monthlyFocusCandidates(dimensions){
  return DOMAIN_IDS.map(function(d,i){var x=dimensions[d],score=0;
    if(x.state==='concern')score=x.evidence_level==='low'?55:100;
    else if(x.state==='watch')score=x.evidence_level==='low'?50:80;
    else if(x.state==='emerging'&&x.emerging_capabilities.some(function(c){return c.phase==='current';}))score=60;
    else if(x.state==='unknown'&&x.evidence_level==='low')score=30;
    return {domain:d,score:score,index:i};
  }).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score||a.index-b.index;});
}
function monthlyFocusFromDimensions(dimensions){
  var candidates=monthlyFocusCandidates(dimensions),chosen=candidates.slice(0,2);
  if(chosen.length&&chosen[0].score<=30)chosen=chosen.slice(0,1);
  return chosen.map(function(x){var dim=dimensions[x.domain],name=DOMAIN_META[x.domain].name.slice(2).trim(),ids=dim.emerging_capabilities.map(function(c){return c.capability_id;});if(dim.target_capability_id&&ids.indexOf(dim.target_capability_id)<0)ids.push(dim.target_capability_id);var reason=dim.state==='concern'?'本月有值得继续核实的担忧记录。':dim.state==='watch'?'有些具体表现需要在自然场景里再看几次。':dim.state==='emerging'?'已有正在出现的表现，适合多给自然尝试机会。':'目前记录较少，先顺便留意即可。';return {domain:x.domain,type:dim.recommendation_type,title:name+' · '+dim.state_label,reason:reason,action:dim.recommendation,capability_ids:ids};});
}
function monthlyCapabilityChanges(monthKey,evidence){
  var previous=previousMonthKey(monthKey),before=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)===previous;}),earlier=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)<monthKey;}),now=evidence.filter(function(e){return e.confirmed&&e.date.slice(0,7)===monthKey;}),out=[];
  CAPABILITIES.forEach(function(c){
    var old=before.filter(function(e){return e.capability_ids.indexOf(c.capability_id)>=0;}),current=now.filter(function(e){return e.capability_ids.indexOf(c.capability_id)>=0;});
    if(!old.length||!current.length)return;
    var explicitNotYet=old.some(function(e){return e.evidence_type==='not_yet';}),priorPositive=earlier.some(function(e){return e.capability_ids.indexOf(c.capability_id)>=0&&(e.evidence_type==='observed'||e.evidence_type==='emerging');}),currentPositive=current.filter(function(e){return e.evidence_type==='observed'||e.evidence_type==='emerging';});
    if(explicitNotYet&&!priorPositive&&currentPositive.length)out.push({capability_id:c.capability_id,domain:c.domain,text:'本月开始看到：'+c.label,evidence_refs:currentPositive.map(function(e){return e.observation_id;})});
    else if(old.some(function(e){return e.evidence_type==='emerging';})&&!old.some(function(e){return e.evidence_type==='observed';})&&uniqueValues(current.filter(function(e){return e.evidence_type==='observed';}).map(function(e){return e.date;})).length>=2)out.push({capability_id:c.capability_id,domain:c.domain,text:'本月在不同日子再次看到：'+c.label,evidence_refs:current.filter(function(e){return e.evidence_type==='observed';}).map(function(e){return e.observation_id;})});
  });return out.slice(0,3);
}
function monthlyPlanActivities(focus,states,age,referenceDate,prefs){
  var domains=focus.map(function(x){return x.domain;}),capabilityIds=[].concat.apply([],focus.map(function(x){return x.capability_ids||[];})),ranked=rankedActivityCandidates(prefs,age,referenceDate,states);
  var scored=ranked.map(function(a){var hit=a.domains.some(function(d){return domains.indexOf(d)>=0;}),capabilityHit=a.observation_prompts.some(function(p){return capabilityIds.indexOf(p.capability_id)>=0;});return {activity:a,score:a._score+(hit?24:0)+(capabilityHit?14:0),hit:hit};}).sort(function(a,b){return b.score-a.score||a.activity.activity_id.localeCompare(b.activity.activity_id);});
  var preferred=scored.filter(function(x){return x.hit;}),selected=(domains.length&&preferred.length>=2?preferred:scored).slice(0,3);
  return selected.map(function(x){var a=x.activity;return {activity_id:a.activity_id,title:a.title,description:a.description,duration:a.duration.label,domains:a.domains.slice(),steps:a.steps.slice(0,4),safety_notes:a.safety_notes};});
}
function monthlyLifeOpportunities(focus,age,prefs,states){
  var domains=focus.map(function(x){return x.domain;}),eligible=LIFE_OPPORTUNITIES.filter(function(x){return age>=(x.min_age_months||0)&&x.contexts.indexOf(prefs.context)>=0;}).filter(function(x){return x.title!=='走一段小坡或不同路面'||!states||['emerging','on_track','rich'].indexOf(states.motor.key)>=0;});
  return eligible.slice().sort(function(a,b){var ah=(a.domains||[]).some(function(d){return domains.indexOf(d)>=0;})?1:0,bh=(b.domains||[]).some(function(d){return domains.indexOf(d)>=0;})?1:0;return bh-ah;}).slice(0,2).map(function(x){return {title:x.title,text:x.text,domains:(x.domains||[]).slice()};});
}
function generateMonthlyGrowthSummary(input){
  var assessment=input.assessment,monthKey=assessment.monthKey,monthDate=new Date(+monthKey.slice(0,4),+monthKey.slice(5,7)-1,15),fallbackAge=(monthDate.getFullYear()-BIRTH.getFullYear())*12+monthDate.getMonth()-BIRTH.getMonth()-(monthDate.getDate()<BIRTH.getDate()?1:0),age=typeof assessment.ageMonths==='number'&&isFinite(assessment.ageMonths)?assessment.ageMonths:fallbackAge,referenceDate=input.referenceDate||monthKey+'-28',evidence=normalizeEvidence(input.evidence||[]).filter(function(e){return e.confirmed&&e.date<=referenceDate;}),recentStart=fmt(addDays(new Date(referenceDate+'T12:00:00'),-120)),last30=fmt(addDays(new Date(referenceDate+'T12:00:00'),-30)),stateRows=evidence.filter(function(e){return e.date>=recentStart;}),monthRows=evidence.filter(function(e){return e.date.slice(0,7)===monthKey;}),recentRows=evidence.filter(function(e){return e.date>=last30;}),states={},dimensions={};
  DOMAIN_IDS.forEach(function(d){states[d]=evaluateDomainState(d,age,stateRows,referenceDate);dimensions[d]=monthlyDimensionSummary(d,states[d],monthRows,recentRows,assessment);});
  var focus=monthlyFocusFromDimensions(dimensions),newCaps=monthlyCapabilityChanges(monthKey,evidence),previous=input.previousAssessment||null,previousStates=null;
  if(previous&&previous.monthly_growth_summary&&previous.monthly_growth_summary.dimensions){previousStates={};DOMAIN_IDS.forEach(function(d){previousStates[d]=previous.monthly_growth_summary.dimensions[d]&&previous.monthly_growth_summary.dimensions[d].state||'unknown';});}
  else if(previous){previousStates={};var priorDate=fmt(new Date(previous.completedAt));DOMAIN_IDS.forEach(function(d){previousStates[d]=evaluateDomainState(d,previous.ageMonths,evidence.filter(function(e){return e.date<=priorDate&&e.date>=fmt(addDays(new Date(priorDate+'T12:00:00'),-120));}),priorDate).key;});}
  var positive=DOMAIN_IDS.filter(function(d){return states[d].key==='rich'||states[d].key==='on_track';}),uncertain=DOMAIN_IDS.filter(function(d){return states[d].key==='unknown';}),concerning=DOMAIN_IDS.filter(function(d){return states[d].key==='concern';}),specific=DOMAIN_IDS.map(function(d){return dimensions[d].observed_items[0];}).filter(Boolean).slice(0,2),sentences=[];
  if(concerning.length)sentences.push('本月有几项表现值得继续关注，先把具体情境记清楚，再决定是否需要进一步咨询。');
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
    input_summary:{current_month_evidence_count:monthRows.length,recent_observation_count:recentRows.length,assessment_answer_count:Object.keys(assessment.answers||{}).length,concern_evidence_count:monthRows.filter(function(e){return e.evidence_type==='concern';}).length}};
}
function monthlyDimensionHtml(domain,x){
  if(!x)return '';
  var label=x.state==='emerging'?'最近正在发展':x.state==='concern'?'建议重点关注':x.state==='watch'?'建议继续观察':x.state==='unknown'?'目前信息较少':'继续提供机会';
  var sources=Object.keys(x.source_counts||{}).map(function(k){return esc(k)+' '+esc(x.source_counts[k])+' 条';}).join('、');
  var answers=(x.assessment_answers||[]).length?'<p>评估回答：'+x.assessment_answers.map(function(a){return esc(a.label)+'（'+esc(EVIDENCE_STATUS[a.status])+'）';}).join('；')+'</p>':'';
  var evidence=(x.key_evidence||[]).map(function(e){return '<li>'+esc(e.date)+' · '+esc(e.source)+' · '+esc(e.text)+'</li>';}).join('');
  var capabilities=(x.observed_capabilities||[]).concat(x.emerging_capabilities||[]).map(function(c){return c.label;}).slice(0,3);
  return '<article class="monthly-dimension"><div class="monthly-dimension-head"><h4>'+esc(DOMAIN_META[domain].name)+'</h4><span class="growth-state ds-status-chip growth-state-'+esc(x.state)+'">'+esc(x.state_label)+'</span></div>'+
    '<p><b>已经看到</b> '+((x.observed_items||[]).length?esc(x.observed_items.slice(0,3).join('；')):'目前还没有足够的已确认观察。')+'</p>'+
    '<p><b>'+label+'</b> '+esc(x.recommendation)+'</p><details><summary>为什么这样判断？</summary><div class="monthly-evidence">'+
    '<p>本月参考 '+esc(x.monthly_evidence_count)+' 条记录；'+esc(x.evidence_label)+'。'+(sources?sources+'。':'')+'</p>'+answers+
    (capabilities.length?'<p>相关能力：'+esc(capabilities.join('；'))+'</p>':'')+'<p>'+esc(x.why)+'</p>'+
    '<p>最近观察：</p>'+(evidence?'<ul>'+evidence+'</ul>':'<p>本月尚无可展示的具体记录。</p>')+'<p>因此目前归为「'+esc(x.state_label)+'」。</p></div></details></article>';
}
function monthlySummaryHtml(summary,history){
  var focus=summary.monthly_focus||[],dims=summary.dimensions||{},plan=summary.next_30_days||{},changes=summary.recent_changes||[],newCaps=summary.new_capabilities||[];
  var focusHtml=focus.length?focus.map(function(x){return '<article><b>'+esc(x.title)+'</b><p class="monthly-focus-reason">'+esc(x.reason)+'</p><p>'+esc(x.action)+'</p></article>';}).join(''):'<p>没有特别需要强化的方面，继续正常生活和游戏即可。</p>';
  var games=(plan.activities||[]).map(function(a){return '<details><summary>'+esc(a.title)+' · '+esc(a.duration)+'</summary><p>'+esc(a.description)+'</p><ol>'+(a.steps||[]).map(function(step){return '<li>'+esc(step)+'</li>';}).join('')+'</ol><p class="monthly-safety">'+esc(a.safety_notes)+'</p></details>';}).join('')||'<p>当前条件下没有适合的已收录游戏，可以调整今日推荐条件后主动更新本月总结。</p>';
  var life=(plan.life_opportunities||[]).map(function(x){return '<p><b>'+esc(x.title)+'</b><br>'+esc(x.text)+'</p>';}).join('')||'<p>目前没有适龄的已收录生活机会，继续按日常节奏陪伴即可。</p>';
  var otherChanges=changes.filter(function(x){return !newCaps.some(function(n){return n.capability_id===x.capability_id;});});
  var changeHtml=otherChanges.length?'<ul>'+otherChanges.map(function(x){return '<li>'+esc(x.text)+'</li>';}).join('')+'</ul>':newCaps.length?'<p>本月有可确认的新表现，见下方。</p>':'<p>目前还没有足够的连续记录，之后会逐渐形成成长轨迹。</p>';
  var newHtml=newCaps.length?'<h4>这个月新出现</h4><ul>'+newCaps.map(function(x){return '<li>'+esc(x.text.replace(/^本月开始看到：/,''))+'</li>';}).join('')+'</ul>':'';
  var nextMonth='<div class="monthly-next-month"><h4>下个月回来时</h4><p>'+esc((summary.next_month_check||[]).join('；'))+'</p></div>';
  return '<div class="monthly-summary-head"><span class="growth-eyebrow">'+esc(summary.month_key.slice(0,4))+'年'+esc(summary.month_key.slice(5,7))+'月 · '+(history?'历史快照':'本月成长手册')+'</span><h2>小鹿玛 · '+esc(summary.age_months)+'个月成长总结</h2><p>'+esc(summary.overall_summary)+'</p></div>'+
    '<div class="monthly-focus"><h3>'+(focus.length?'这个月最值得做的 '+focus.length+' 件事':'这个月的陪伴方向')+'</h3>'+focusHtml+'</div>'+
    '<div class="monthly-dimensions"><h3>五维成长情况</h3>'+DOMAIN_IDS.map(function(d){return monthlyDimensionHtml(d,dims[d]);}).join('')+'</div>'+
    '<div class="monthly-next"><h3>接下来30天</h3><div class="monthly-next-grid"><div><h4>日常互动</h4><p>'+esc((plan.interaction||[]).join('；'))+'</p></div><div><h4>玩一玩</h4>'+games+'</div><div><h4>生活参与</h4>'+life+'</div></div></div>'+
    '<div class="monthly-changes"><h3>最近的变化</h3>'+changeHtml+newHtml+nextMonth+'</div>';
}
function renderMonthlyGrowthSummary(){
  var section=document.getElementById('monthlySummarySection');if(!section)return;var a=currentAssessment();
  if(!a||!a.completedAt){section.hidden=true;section.innerHTML='';return;}
  section.hidden=false;
  var body=a.monthly_growth_summary?monthlySummaryHtml(a.monthly_growth_summary,false):'<div class="ds-empty-state">本月评估已完成，但还没有固定总结。</div>';
  section.innerHTML=body+'<div class="monthly-summary-actions"><button type="button" class="assessment-edit-link" onclick="beginAssessmentEdit()">修改本次评估 ›</button><button type="button" class="monthly-update ds-action-secondary" onclick="updateCurrentMonthSummary()">'+(a.monthly_growth_summary?'更新本月总结':'生成本月总结')+'</button></div><p class="monthly-action-hint">题目答错了，修改本次评估；后来补记观察，更新本月总结。</p>';
}
function updateCurrentMonthSummary(){
  var rows=loadAssessments(),a=rows.find(function(x){return x.monthKey===fmt(new Date()).slice(0,7)&&x.completedAt;});if(!a)return;
  var previous=rows.filter(function(x){return x.completedAt&&x.monthKey<a.monthKey;}).sort(function(x,y){return x.monthKey<y.monthKey?1:-1;})[0]||null;
  a.monthly_growth_summary=generateMonthlyGrowthSummary({assessment:a,evidence:loadEvidence(),referenceDate:fmt(new Date()),previousAssessment:previous});saveAssessments(rows);renderMonthlyGrowthSummary();renderMonthlyGrowthHistory();
}
function renderMonthlyGrowthHistory(){
  var box=document.getElementById('monthlySummaryHistory');if(!box)return;var rows=loadAssessments().filter(function(a){return a.completedAt;}).sort(function(a,b){return a.monthKey<b.monthKey?1:-1;});
  box.innerHTML=rows.length?rows.map(function(a){return '<button type="button" class="monthly-history-button ds-action-secondary" onclick="showHistoricalGrowthSummary(\''+esc(a.monthKey)+'\')">'+esc(a.monthKey)+' · '+(a.monthly_growth_summary?'查看固定总结':'暂无固定总结')+'</button>';}).join(''):'<p class="ds-empty-state">还没有已完成的月度评估。</p>';
}
function showHistoricalGrowthSummary(monthKey){
  var box=document.getElementById('monthlySummaryHistoryDetail');if(!box)return;var a=loadAssessments().find(function(x){return x.monthKey===monthKey&&x.completedAt;});
  box.innerHTML=!a?'':'<button type="button" class="monthly-history-back ds-action-secondary" onclick="closeHistoricalGrowthSummary()">← 返回历史月份</button>'+(a.monthly_growth_summary?monthlySummaryHtml(a.monthly_growth_summary,true):'<div class="ds-info-strip">这个月份完成于成长总结功能上线前，暂无固定快照。可以查看上方的月度成长档案。</div>');
}
function closeHistoricalGrowthSummary(){var box=document.getElementById('monthlySummaryHistoryDetail');if(box)box.innerHTML='';}
