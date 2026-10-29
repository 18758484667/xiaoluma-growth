/* Weekly companionship plan. This layer reads reviewed content and never writes growth evidence. */
var WEEKLY_PLAN_KEY='xlma_weekly_learning_plans_v1';
var WEEKLY_FOCUS_LABELS={motor:'主动移动',fine:'自己动手',lang:'表达与交流',cog:'探索与寻找',soc:'轮流与参与'};
function normalizeWeeklyPlans(rows){
  var byWeek={};(Array.isArray(rows)?rows:[]).forEach(function(p){
    if(!p||!/^\d{4}-\d{2}-\d{2}$/.test(p.week_start||'')||!/^\d{4}-\d{2}-\d{2}$/.test(p.week_end||'')||!Array.isArray(p.focus_areas)||!Array.isArray(p.suggested_activities))return;
    if(!byWeek[p.week_start]||Number(p.updated_at||p.generated_at)>Number(byWeek[p.week_start].updated_at||byWeek[p.week_start].generated_at))byWeek[p.week_start]=p;
  });
  return Object.keys(byWeek).sort().reverse().slice(0,12).map(function(k){return byWeek[k];});
}
function loadWeeklyPlans(){try{return normalizeWeeklyPlans(JSON.parse(localStorage.getItem(WEEKLY_PLAN_KEY)||'[]'));}catch(e){return [];}}
function weeklyPlanForDate(date){var key=fmt(mondayOf(date||new Date()));return loadWeeklyPlans().find(function(p){return p.week_start===key;})||null;}
function weeklyFocusCandidates(age,band,assessment,evidence,previous,referenceDate){
  var monthly=assessment&&assessment.monthly_growth_summary&&assessment.monthly_growth_summary.monthly_focus||[];
  var feedback=loadActivityFeedback().filter(function(row){return row.enjoyment==='love'&&row.date<=referenceDate&&row.date>=fmt(addDays(new Date(referenceDate+'T12:00:00'),-60));});
  return DOMAIN_IDS.map(function(domain,index){
    var guideItems=(band.domains[domain]||[]).filter(function(x){var c=capabilityById(x.capability_id);return c&&capabilityPhase(c,age)!=='future';});
    var positive=evidence.filter(function(e){return e.confirmed&&e.domains.indexOf(domain)>=0&&['observed','emerging'].indexOf(e.evidence_type)>=0&&e.capability_ids.some(function(id){var c=capabilityById(id);return c&&capabilityPhase(c,age)!=='future';});});
    var monthlyHit=monthly.find(function(f){return f.domain===domain;});
    var repeat=previous&&previous.focus_areas&&previous.focus_areas.some(function(f){return f.domain===domain;});
    var likedDays={},likedRows=[];feedback.forEach(function(row){var a=activityById(row.activity_id);if(a&&a.domains.indexOf(domain)>=0){likedDays[row.date]=true;likedRows.push(row);}});
    var positiveDays={};positive.forEach(function(row){positiveDays[row.date]=true;});
    return {domain:domain,index:index,score:(guideItems.length?10:0)+(monthlyHit?8:0)+(Object.keys(positiveDays).length>=2?Math.min(6,positive.length*2):0)+(Object.keys(likedDays).length>=2?4:0)-(repeat?6:0),guideItems:guideItems,positive:positive,monthlyHit:monthlyHit,liked:Object.keys(likedDays).length>=2,feedbackRefs:likedRows.map(function(row){return row.feedback_id;}).filter(Boolean)};
  }).filter(function(x){return x.guideItems.length;}).sort(function(a,b){return b.score-a.score||a.index-b.index;});
}
function buildWeeklyPlan(referenceDate,previous){
  var date=referenceDate instanceof Date?referenceDate:new Date((referenceDate||fmt(new Date()))+'T12:00:00');
  var weekStart=fmt(mondayOf(date)),weekEnd=fmt(addDays(mondayOf(date),6)),age=ageInfo(date).totM,band=guideForAge(age);
  if(!band)return null;
  var assessment=loadAssessments().find(function(a){return a.monthKey===fmt(date).slice(0,7)&&a.completedAt;})||null;
  var evidence=loadEvidence().filter(function(e){return e.confirmed&&e.date<=fmt(date)&&e.date>=fmt(addDays(date,-90));});
  var selected=weeklyFocusCandidates(age,band,assessment,evidence,previous,fmt(date)).slice(0,2);
  var focus=selected.map(function(x){
    var guide=x.guideItems[0],cap=capabilityById(guide.capability_id),relevant=x.positive.filter(function(e){return e.capability_ids.indexOf(guide.capability_id)>=0;});
    var reason=relevant.length?'最近在日常记录中看到了相关尝试，继续在轻松场景里提供机会。':x.monthlyHit?'本月总结也提到这个方向，这周可以用日常玩法继续陪伴。':x.liked?'最近多次喜欢相关玩法，继续换着方式体验。':'来自当前月龄阶段的已审核发育指南，作为自然陪伴的方向。';
    return {domain:x.domain,title:WEEKLY_FOCUS_LABELS[x.domain],why_now:reason,target_experience:guide.text,capability_ids:[guide.capability_id],evidence_refs:relevant.map(function(e){return e.observation_id;}),guide_refs:cap?[cap.capability_id]:[],feedback_refs:x.liked?x.feedbackRefs:[],source_type:relevant.length?'confirmed_evidence':x.monthlyHit?'monthly_summary':x.liked?'activity_feedback':'development_guide'};
  });
  var domains=focus.map(function(f){return f.domain;}),prefs=loadTodayPrefs(),states=currentDomainStates();
  var ranked=rankedActivityCandidates(prefs,age,fmt(date),states),suggested=[],used={};
  domains.forEach(function(domain){
    ranked.filter(function(a){return a.domains.indexOf(domain)>=0;}).slice(0,2).forEach(function(a){if(used[a.activity_id])return;used[a.activity_id]=true;suggested.push({activity_id:a.activity_id,variant_id:a.variant_id||a.activity_id,domain:domain});});
  });
  var opportunity=band.opportunities.filter(function(o){return o.capability_ids.some(function(id){return focus.some(function(f){return f.capability_ids.indexOf(id)>=0;});});}).slice(0,3).map(function(o){return {text:o.text,capability_ids:o.capability_ids.slice()};});
  var life=(monthlyLifeOpportunities(focus,age,prefs,states)||[]).slice(0,2).map(function(o){return {title:o.title,text:o.text,domains:o.domains||[]};});
  if(!life.length)life=(band.life_participation||[]).slice(0,2).map(function(t){return {title:t,text:'顺手邀请她参与即可，不要求完成。',domains:[]};});
  var prompts=band.observe_points.filter(function(o){var c=capabilityById(o.capability_id);return c&&capabilityPhase(c,age)!=='future'&&domains.indexOf(c.domain)>=0;}).slice(0,2).map(function(o){return {text:o.text,capability_id:o.capability_id};});
  return {schema_version:1,week_start:weekStart,week_end:weekEnd,age_months:age,generated_at:Date.now(),updated_at:null,status:'active',snapshot:true,focus_areas:focus,opportunities:opportunity,suggested_activities:suggested,life_opportunities:life,observation_prompts:prompts,source_refs:band.source_refs.filter(function(id){return focus.some(function(f){return f.guide_refs.indexOf(id)>=0;});}),source_snapshot:{assessment_id:assessment&&assessment.assessment_id||null,guide_age_range:band.age_range.slice(),evidence_refs:focus.reduce(function(all,f){return all.concat(f.evidence_refs);},[]),feedback_refs:focus.reduce(function(all,f){return all.concat(f.feedback_refs||[]);},[]),preferences:{duration:prefs.duration,context:prefs.context,energy:prefs.energy}},content_gap:focus.filter(function(f){return !suggested.some(function(a){return a.domain===f.domain;});}).map(function(f){return f.domain;}),why_this_matters:null,rationale:'依据本月已保存总结、已确认观察和当前月龄指南，优先选择可在真实生活中提供的机会；游戏经过现有安全、月龄、场景与精力过滤。'};
}
function saveWeeklyPlan(plan){var rows=loadWeeklyPlans().filter(function(p){return p.week_start!==plan.week_start;});rows.unshift(plan);localStorage.setItem(WEEKLY_PLAN_KEY,JSON.stringify(normalizeWeeklyPlans(rows)));if(typeof autoBackup==='function')autoBackup();return plan;}
function ensureWeeklyPlan(referenceDate){var existing=weeklyPlanForDate(referenceDate);if(existing)return existing;var previous=loadWeeklyPlans()[0]||null,plan=buildWeeklyPlan(referenceDate,previous);return plan?saveWeeklyPlan(plan):null;}
function updateWeeklyPlan(){var old=weeklyPlanForDate(new Date()),previous=loadWeeklyPlans().find(function(p){return !old||p.week_start<old.week_start;})||null,plan=buildWeeklyPlan(new Date(),previous);if(!plan)return null;plan.generated_at=old?old.generated_at:plan.generated_at;plan.updated_at=Date.now();return saveWeeklyPlan(plan);}
function weeklyPlanActivityIds(plan){return (plan&&plan.suggested_activities||[]).map(function(x){return canonicalActivityId(x.activity_id);}).filter(function(id){var a=activityById(id);return a&&((a.variants||[a]).some(function(v){return activityAvailableAtAge(v,ageInfo().totM);}));});}
function weeklyPlanActivityBonus(activity,referenceDate){var plan=weeklyPlanForDate(new Date((referenceDate||fmt(new Date()))+'T12:00:00'));if(!plan)return 0;return weeklyPlanActivityIds(plan).indexOf(canonicalActivityId(activity.activity_id))>=0?5:0;}
