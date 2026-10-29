/* Phase 3.3E2 developer-only audit. No product script imports this module. */
const ontology=require('./five-brain-ontology-api.js');

function validateBridge(config,taxonomy){
  const errors=[],names=['自己动起来','自己动手完成','把想法说出来','找一找，看看在哪里','我和你轮流来'];
  const live=new Set(taxonomy.filter(x=>x.status==='active').map(x=>x.mechanism_id));
  if(!config||!Array.isArray(config.themes)||config.themes.length!==5)return ['exactly five themes required'];
  if(config.themes.map(x=>x.display_name).join('|')!==names.join('|'))errors.push('fixed theme order/name changed');
  const ids=new Set();
  config.themes.forEach(t=>{
    if(!t.theme_id||ids.has(t.theme_id))errors.push('duplicate theme id');ids.add(t.theme_id);
    if(!t.description||!t.review_note||t.review_status!=='reviewed')errors.push('unreviewed theme '+t.theme_id);
    if(!Array.isArray(t.primary_mechanism_ids)||!t.primary_mechanism_ids.length||!Array.isArray(t.secondary_mechanism_ids))errors.push('mechanism lists missing '+t.theme_id);
    const mechanisms=(t.primary_mechanism_ids||[]).concat(t.secondary_mechanism_ids||[]);
    if(new Set(mechanisms).size!==mechanisms.length)errors.push('duplicate mechanism '+t.theme_id);
    mechanisms.forEach(id=>{if(!live.has(id))errors.push('nonexistent or inactive mechanism '+id);});
    if(Object.keys(t).some(k=>/ability|score|deficit|child_evidence/i.test(k)))errors.push('direct ability or score field '+t.theme_id);
  });
  return errors;
}
function audit(input){
  const age=input.age_months,config=input.bridge,rows=input.mappings||[],catalog=input.catalog||[];
  const isEligible=input.is_eligible,byId=new Map(catalog.map(a=>[a.activity_id,a]));
  const taxonomy=new Set((input.taxonomy||[]).filter(x=>x.status==='active').map(x=>x.mechanism_id));
  const usableMappings=rows.filter(m=>m.mapping_status==='approved'&&m.age_window&&age>=m.age_window.min_months&&age<=m.age_window.max_months);
  const byMappingId=new Map(usableMappings.map(m=>[m.activity_id,m]));
  const reviewRows=new Map(rows.filter(m=>m.age_window&&age>=m.age_window.min_months&&age<=m.age_window.max_months).map(m=>[m.activity_id,m]));
  function validVariants(a){return (a.variants||[a]).filter(v=>isEligible(v,age));}
  const safe=catalog.filter(a=>validVariants(a).length);
  function mappingMechanisms(m){return m?(m.mechanism_ids||[]).filter(id=>taxonomy.has(id)):[];}
  function mappedAbilities(m){return m?(m.primary_ability_ids||[]).concat(m.secondary_ability_ids||[]).filter(id=>ontology.getAgeObservationStatus(id,age).age_observation_status==='active_observation'):[];}
  function bridgeMatch(t,mechanisms){return {
    primary:mechanisms.filter(id=>t.primary_mechanism_ids.includes(id)),
    secondary:mechanisms.filter(id=>t.secondary_mechanism_ids.includes(id))
  };}
  const themes=config.themes.map(t=>{
    const supported=[];let explicitVariants=0;
    safe.forEach(a=>{
      const base=byMappingId.get(a.activity_id),variants=validVariants(a);
      const variantRows=variants.filter(v=>v.variant_id&&v.variant_id!==a.activity_id).map(v=>byMappingId.get(v.variant_id)).filter(Boolean);
      const matchingRows=[base].concat(variantRows).filter(Boolean).filter(m=>{
        const hit=bridgeMatch(t,mappingMechanisms(m));
        if(!hit.primary.length&&!hit.secondary.length)return false;
        /* A pause or spoken cue alone can be comprehension, not child expression.
           This guard reads the approved activity mapping; the bridge config never maps a theme to an ability. */
        if(t.theme_id==='express_ideas'&&!mappedAbilities(m).includes('lang_expression'))return false;
        return true;
      });
      if(!matchingRows.length)return;
      explicitVariants+=variantRows.filter(m=>matchingRows.includes(m)).length;
      const matchingBase=!!(base&&matchingRows.includes(base));
      const suppliedVariants=matchingBase?variants:variants.filter(v=>matchingRows.some(m=>m.activity_id===(v.variant_id||v.activity_id)));
      const ids=Array.from(new Set(matchingRows.flatMap(m=>mappingMechanisms(m))));
      supported.push({activity_id:a.activity_id,title:a.title,primary_mechanisms:bridgeMatch(t,ids).primary,
        secondary_mechanisms:bridgeMatch(t,ids).secondary,
        explicit_variant_ids:matchingRows.filter(m=>m.activity_id!==a.activity_id).map(m=>m.activity_id),
        growth_opportunities:Array.from(new Set(matchingRows.flatMap(mappedAbilities))),
        efforts:Array.from(new Set(suppliedVariants.map(v=>v.caregiver_effort))),
        contexts:Array.from(new Set(suppliedVariants.flatMap(v=>v.location||[]))),
        context_types:Array.from(new Set(suppliedVariants.map(v=>v.activity_context_type).filter(Boolean)))});
    });
    const mechanisms=Array.from(new Set(supported.flatMap(a=>a.primary_mechanisms.concat(a.secondary_mechanisms))));
    const hasPrimary=supported.some(a=>a.primary_mechanisms.length);
    const status=supported.length>=3&&hasPrimary?'supported':supported.length?'partially_supported':'unsupported';
    return {theme_id:t.theme_id,display_name:t.display_name,review_status:t.review_status,support_status:status,
      supported_canonical_count:supported.length,supported_variant_count:explicitVariants,distinct_mechanisms:mechanisms,
      growth_opportunities:Array.from(new Set(supported.flatMap(a=>a.growth_opportunities))),
      context_diversity:Array.from(new Set(supported.flatMap(a=>a.contexts))),
      context_type_diversity:Array.from(new Set(supported.flatMap(a=>a.context_types))),
      caregiver_effort_diversity:Array.from(new Set(supported.flatMap(a=>a.efforts))),supported_activities:supported};
  });
  const themeByName=new Map(config.themes.map(t=>[t.display_name,t]));
  const nameByDomain=input.name_by_domain||{};
  const weekly=(input.weekly_plan&&input.weekly_plan.suggested_activities||[]).map(item=>{
    const a=byId.get(item.activity_id),variant=item.variant_id||item.activity_id,t=themeByName.get(nameByDomain[item.domain]);
    const chosen=a&&validVariants(a).find(v=>v.variant_id===variant||v.activity_id===variant);
    const approved=[byMappingId.get(item.activity_id),variant!==item.activity_id?byMappingId.get(variant):null].filter(Boolean);
    const reviewed=[reviewRows.get(item.activity_id),variant!==item.activity_id?reviewRows.get(variant):null].filter(Boolean);
    const approvedMechanisms=Array.from(new Set(approved.flatMap(mappingMechanisms)));
    const reviewedMechanisms=Array.from(new Set(reviewed.flatMap(mappingMechanisms)));
    const rawHit=t?bridgeMatch(t,approvedMechanisms):{primary:[],secondary:[]};
    const hit=t&&t.theme_id==='express_ideas'&&!approved.some(m=>mappedAbilities(m).includes('lang_expression'))?{primary:[],secondary:[]}:rawHit;
    const reviewedHit=t?bridgeMatch(t,reviewedMechanisms):{primary:[],secondary:[]};
    let classification='theme_neutral_activity';
    if(!a||!chosen)classification='unsafe_or_age_ineligible';
    else if(hit.primary.length||hit.secondary.length)classification='supported';
    else if(reviewedHit.primary.length||reviewedHit.secondary.length)classification='activity_mapping_gap';
    else if(reviewedMechanisms.length)classification='theme_assignment_mismatch';
    return {activity_id:item.activity_id,variant_id:variant,title:a&&a.title||item.activity_id,assigned_theme:t&&t.display_name||null,
      approved_mechanisms:approvedMechanisms,reviewed_unapproved_mechanisms:reviewed.filter(m=>m.mapping_status!=='approved').flatMap(mappingMechanisms),
      approved_growth_opportunities:Array.from(new Set(approved.flatMap(mappedAbilities))),classification,
      theme_supported:classification==='supported',review_statuses:reviewed.map(m=>m.mapping_status)};
  });
  const themedIds=new Set(themes.flatMap(t=>t.supported_activities.map(a=>a.activity_id)));
  const candidateMappingGaps=safe.flatMap(a=>{
    const variants=validVariants(a),possible=[a.activity_id].concat(variants.map(v=>v.variant_id||v.activity_id));
    return rows.filter(m=>possible.includes(m.activity_id)&&m.mapping_status==='revised'&&m.mechanism_ids&&m.mechanism_ids.length)
      .flatMap(m=>config.themes.filter(t=>{const hit=bridgeMatch(t,mappingMechanisms(m));return hit.primary.length||hit.secondary.length;})
        .map(t=>({activity_id:a.activity_id,mapping_activity_id:m.activity_id,theme:t.display_name,review_status:m.mapping_status,review_note:m.review_note||m.unmapped_reason||''})));
  });
  return {age_months:age,canonical_safe_count:safe.length,themes,weekly,
    theme_neutral_activity_ids:safe.filter(a=>!themedIds.has(a.activity_id)).map(a=>a.activity_id),
    candidate_mapping_gaps:candidateMappingGaps,
    activity_mapping_gap:weekly.filter(x=>x.classification==='activity_mapping_gap').map(x=>x.activity_id),
    theme_assignment_mismatch:weekly.filter(x=>x.classification==='theme_assignment_mismatch').map(x=>x.activity_id)};
}
module.exports={validateBridge,audit};
