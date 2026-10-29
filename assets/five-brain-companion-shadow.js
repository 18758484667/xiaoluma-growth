/* Development-only, read-only companion analysis. Never load this in the product page. */
var FiveBrainCompanionShadow=(function(){
  function unique(xs){return Array.from(new Set(xs));}
  function analyze(input){
    var age=input.age_months,ontology=input.ontology,plan=input.weekly_plan||null;
    var rows=(input.mappings||[]).filter(function(r){return r.mapping_status==='approved';});
    var warnings=[],themes=(input.experience_themes||[]).slice();
    var themeMechanisms=input.theme_mechanisms||{};
    function mappingFor(id){return rows.find(function(r){return r.activity_id===id&&r.age_window&&age>=r.age_window.min_months&&age<=r.age_window.max_months;});}
    function inspect(item,surface){
      var id=item.activity_id,variant=item.variant_id||item.selected_variant_id||id;
      var activity=input.resolve_activity&&input.resolve_activity(id);
      var selected=activity&&activity.variants&&activity.variants.find(function(v){return v.variant_id===variant||v.activity_id===variant;})||activity;
      var result={surface:surface,activity_id:id,variant_id:variant,primary_growth_opportunities:[],secondary_growth_opportunities:[],precursor_opportunities:[],mechanisms:[],theme_alignment:[]};
      if(!activity||!selected||input.is_eligible&&!input.is_eligible(selected,age)){
        warnings.push({code:'unsafe_or_age_ineligible',activity_id:id,variant_id:variant,surface:surface});return result;
      }
      var canonical=mappingFor(id),specific=variant!==id?mappingFor(variant):null;
      var applicable=canonical?[canonical]:[];if(specific)applicable.push(specific);
      if(!applicable.length)warnings.push({code:'no_approved_mapping',activity_id:id,variant_id:variant,surface:surface});
      if(variant===id&&rows.some(function(r){return r.canonical_id===id&&r.activity_id!==id;}))warnings.push({code:'variant_mapping_not_applied',activity_id:id,variant_id:variant,surface:surface});
      applicable.forEach(function(row){
        result.mechanisms.push.apply(result.mechanisms,row.mechanism_ids||[]);
        [['primary_ability_ids','primary_growth_opportunities'],['secondary_ability_ids','secondary_growth_opportunities']].forEach(function(pair){
          (row[pair[0]]||[]).forEach(function(abilityId){
            var ageRule=ontology.getAgeObservationStatus(abilityId,age),status=ageRule.age_observation_status;
            if(status==='future'){warnings.push({code:'future_ability_used',activity_id:id,ability_id:abilityId});return;}
            if(status==='support_context'||!status){warnings.push({code:'unsupported_five_brain_reason',activity_id:id,ability_id:abilityId});return;}
            var entry={ability_id:abilityId,reason:row.mapping_reason&&row.mapping_reason[abilityId]||'',mapping_scope:row.activity_id===id?'canonical':'variant'};
            if(status==='early_signal_only')result.precursor_opportunities.push(entry);
            else result[pair[1]].push(entry);
          });
        });
        (row.precursor_experiences||[]).forEach(function(p){result.precursor_opportunities.push({label:p.label,reason:p.reason,mapping_scope:row.activity_id===id?'canonical':'variant'});});
      });
      result.mechanisms=unique(result.mechanisms);
      ['primary_growth_opportunities','secondary_growth_opportunities','precursor_opportunities'].forEach(function(key){result[key]=result[key].filter(function(x,i,all){return all.findIndex(function(y){return (y.ability_id||y.label)===(x.ability_id||x.label);})===i;});});
      result.theme_alignment=themes.filter(function(t){return (themeMechanisms[t]||[]).some(function(m){return result.mechanisms.includes(m);});});
      return result;
    }
    var weekly=(plan&&plan.suggested_activities||[]).map(function(a){return inspect(a,'weekly_plan');});
    var today=(input.today_activities||[]).map(function(a){return inspect(a,'today_home');});
    var all=weekly.concat(today),mechanisms=unique(all.flatMap(function(a){return a.mechanisms;}));
    var abilities=unique(all.flatMap(function(a){return a.primary_growth_opportunities.concat(a.secondary_growth_opportunities).map(function(x){return x.ability_id;});}));
    var mappedWeekly=weekly.filter(function(x){return x.mechanisms.length;});
    if(mappedWeekly.length>=3&&unique(mappedWeekly.flatMap(function(x){return x.mechanisms;})).length===1)warnings.push({code:'excessive_single_mechanism',surface:'weekly_plan'});
    var explanations=themes.map(function(t){
      var matches=weekly.filter(function(a){return a.theme_alignment.includes(t);});
      return {theme:t,activity_ids:matches.map(function(a){return a.activity_id;}),mechanisms:unique(matches.flatMap(function(a){return a.mechanisms;})),candidate:matches.length?'这周的“'+t+'”可以通过这些现有玩法自然体验。':'目前没有足够已审核的游戏机制来解释这个主题。'};
    });
    return {weekly_snapshot_id:plan&&plan.week_start||null,analyzed_at:input.analyzed_at||new Date().toISOString(),age_months:age,
      experience_themes:themes,activity_ids:unique(all.map(function(a){return a.activity_id;})),weekly_activities:weekly,today_activities:today,
      weekly_life_opportunities:(plan&&plan.life_opportunities||[]).map(function(x){return {title:x.title,text:x.text};}),
      weekly_observation_prompts:(plan&&plan.observation_prompts||[]).map(function(x){return x.text;}),
      growth_opportunities:abilities,mechanisms:mechanisms,
      diversity_notes:[mappedWeekly.length+'个本周游戏有已审核机制；涉及'+unique(mappedWeekly.flatMap(function(x){return x.mechanisms;})).length+'种机制。'],
      alignment_notes:explanations,warnings:warnings};
  }
  return {analyze:analyze};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FiveBrainCompanionShadow;
