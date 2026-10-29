/* Development-only shadow experiment. No product page imports this module. */
const ontology=require('./five-brain-ontology-api.js');

function buildOptions(input){
  const {ctx,age_months:age,prefs,states,reference_date:date}=input;
  const selected=ctx.energyCandidatePool(ctx.eligibleActivities(age,prefs,states),prefs);
  const locations=ctx.contextLocations(prefs.context),duration=ctx.durationLimit(prefs.duration);
  const effortRank={low:0,medium:1,high:2},profile=ctx.buildActivityPreferenceProfile(date),out=[];
  selected.forEach(chosen=>{
    const canonical=ctx.activityById(chosen.activity_id);
    if(!canonical)return;
    (canonical.variants||[canonical]).forEach(variant=>{
      const variantId=variant.variant_id||variant.activity_id;
      if(!ctx.activityAvailableAtAge(variant,age)||variant.recommendation_eligible===false)return;
      if(!variant.location.some(x=>locations.includes(x))||variant.duration.max>duration)return;
      /* The original energy pool is fixed first. A variant cannot impose more effort than its selected canonical option. */
      if(effortRank[variant.caregiver_effort]>effortRank[chosen.caregiver_effort])return;
      const activity=Object.assign({},canonical,variant,{activity_id:canonical.activity_id,title:canonical.title,
        selected_variant_id:variantId,variant_title:variant.variant_title||null});
      const scored=ctx.activityScore(activity,age,prefs,states,date,profile);
      out.push({activity_id:canonical.activity_id,variant_id:variantId,title:canonical.title,
        variant_title:activity.variant_title,score:scored.score,score_signals:scored.reasons,
        caregiver_effort:activity.caregiver_effort,location:activity.location.slice(),duration_max:activity.duration.max,
        prep_level:activity.prep_level,context_type:activity.activity_context_type||null});
    });
  });
  return out.sort((a,b)=>b.score-a.score||a.activity_id.localeCompare(b.activity_id)||a.variant_id.localeCompare(b.variant_id));
}
function select(input){
  const plan=input.weekly_plan,age=input.age_months,options=input.options||[],bridge=input.bridge;
  const mappings=new Map((input.mappings||[]).filter(m=>m.mapping_status==='approved'&&m.age_window&&age>=m.age_window.min_months&&age<=m.age_window.max_months).map(m=>[m.activity_id,m]));
  const activeTaxonomy=new Set((input.taxonomy||[]).filter(m=>m.status==='active').map(m=>m.mechanism_id));
  const themeNames=input.name_by_domain||{},used=new Set(),warnings=[];
  const original=(plan.suggested_activities||[]).map(a=>({...a}));
  function approvedFor(option){
    /* Exact displayed variant only. Canonical mapping never silently certifies another variant. */
    return mappings.get(option.variant_id)||null;
  }
  function compatible(theme,option){
    const mapping=approvedFor(option);if(!mapping)return null;
    const mechanisms=(mapping.mechanism_ids||[]).filter(id=>activeTaxonomy.has(id));
    const primary=mechanisms.filter(id=>theme.primary_mechanism_ids.includes(id));
    const secondary=mechanisms.filter(id=>theme.secondary_mechanism_ids.includes(id));
    if(!primary.length&&!secondary.length)return null;
    /* The already-approved game mapping, never the theme, is the only ability source. */
    const abilityIds=(mapping.primary_ability_ids||[]).concat(mapping.secondary_ability_ids||[])
      .filter(id=>ontology.getAgeObservationStatus(id,age).age_observation_status==='active_observation');
    if(theme.theme_id==='express_ideas'&&!abilityIds.includes('lang_expression'))return null;
    return {mechanism_ids:primary.concat(secondary),primary_mechanism_ids:primary,secondary_mechanism_ids:secondary,
      five_brain_opportunities:Array.from(new Set(abilityIds))};
  }
  const poolByTheme=bridge.themes.map(theme=>{
    const compatibleOptions=options.map(option=>{const match=compatible(theme,option);return match?{...option,...match}:null;}).filter(Boolean);
    const seen=new Set(),canonicalOptions=compatibleOptions.filter(o=>{if(seen.has(o.activity_id))return false;seen.add(o.activity_id);return true;});
    return {theme_id:theme.theme_id,theme_name:theme.display_name,candidate_count:canonicalOptions.length,
      variant_option_count:compatibleOptions.length,candidates:canonicalOptions};
  });
  const poolMap=new Map(poolByTheme.map(x=>[x.theme_name,x]));
  poolByTheme.filter(x=>x.candidate_count<2).forEach(x=>warnings.push({code:'theme_candidate_pool_too_narrow',theme_id:x.theme_id,count:x.candidate_count}));
  const groups=(plan.focus_areas||[]).map(focus=>{
    const themeName=themeNames[focus.domain],theme=bridge.themes.find(t=>t.display_name===themeName),pool=poolMap.get(themeName);
    if(!theme||!pool){warnings.push({code:'unknown_theme',domain:focus.domain});return null;}
    const originally=original.filter(a=>a.domain===focus.domain);
    const selected=pool.candidates.filter(o=>!used.has(o.activity_id)).slice(0,2);
    selected.forEach(o=>used.add(o.activity_id));
    if(selected.length<2)warnings.push({code:'insufficient_unique_candidates',theme_id:theme.theme_id,count:selected.length});
    const originalRows=originally.map(o=>{
      const found=options.find(x=>x.activity_id===o.activity_id&&x.variant_id===(o.variant_id||o.activity_id));
      const match=found&&compatible(theme,found);
      return {activity_id:o.activity_id,variant_id:o.variant_id||o.activity_id,title:found&&found.title||o.activity_id,
        compatible:!!match,score:found?found.score:null,score_signals:found&&found.score_signals||[],
        mechanism_ids:match&&match.mechanism_ids||[],reason:match?'approved displayed-variant mechanism':'no approved matching mechanism for displayed variant'};
    });
    return {theme_id:theme.theme_id,theme_name:themeName,original_activity_ids:originalRows.map(x=>x.activity_id),
      shadow_activity_ids:selected.map(x=>x.activity_id),original:originalRows,shadow:selected.map(o=>({
        activity_id:o.activity_id,variant_id:o.variant_id,title:o.title,score:o.score,
        retained_score_signals:o.score_signals,caregiver_effort:o.caregiver_effort,location:o.location,
        duration_max:o.duration_max,prep_level:o.prep_level,mechanism_ids:o.mechanism_ids,
        five_brain_opportunities:o.five_brain_opportunities,
        replacement_reason:originally.some(x=>x.activity_id===o.activity_id&&x.variant_id===o.variant_id)?'retained compatible displayed variant':'selected by existing score after theme compatibility gate'
      })),candidate_count:pool.candidate_count};
  }).filter(Boolean);
  const all=groups.flatMap(x=>x.shadow),mechanisms=Array.from(new Set(all.flatMap(x=>x.mechanism_ids)));
  const contexts=Array.from(new Set(all.flatMap(x=>x.location)));
  if(mechanisms.length<2&&all.length>=3)warnings.push({code:'single_mechanism_concentration'});
  if(contexts.length===1&&all.length>=3)warnings.push({code:'single_context_concentration',context:contexts[0]});
  return {weekly_snapshot_id:plan.week_start,age_months:age,experience_themes:groups.map(x=>x.theme_name),
    original_activity_ids:original.map(x=>x.activity_id),shadow_activity_ids:all.map(x=>x.activity_id),
    groups,pool_by_theme:poolByTheme.map(({candidates,...summary})=>summary),
    mechanism_ids:mechanisms,five_brain_opportunities:Array.from(new Set(all.flatMap(x=>x.five_brain_opportunities))),warnings};
}
module.exports={buildOptions,select};
