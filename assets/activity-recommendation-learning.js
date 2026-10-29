/* Phase 2.5C: exposure is display history, never play feedback or growth evidence. */
var ACTIVITY_EXPOSURE_KEY='xlma_activity_exposure_v1';
var ACTIVITY_PREFERENCE_PROFILE_KEY='xlma_activity_preference_profile_v1';
var ACTIVITY_EXPOSURE_SURFACES=['today_home','swap_result','monthly_plan'];
function activityDateDistance(older,newer){var a=Date.parse(older+'T12:00:00'),b=Date.parse(newer+'T12:00:00');return isFinite(a)&&isFinite(b)?Math.round((b-a)/86400000):Infinity;}
function normalizeActivityExposures(rows,referenceDate){
  var seen={};return (Array.isArray(rows)?rows:[]).filter(function(x){return x&&typeof x.activity_id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')&&ACTIVITY_EXPOSURE_SURFACES.indexOf(x.surface)>=0&&typeof x.shown_at==='string';}).map(function(x){return {activity_id:canonicalActivityId(x.activity_id),date:x.date,shown_at:x.shown_at,surface:x.surface};}).filter(function(x){var distance=activityDateDistance(x.date,referenceDate);return distance>=0&&distance<=45;}).filter(function(x){var key=x.activity_id+'|'+x.date+'|'+x.surface;if(seen[key])return false;seen[key]=true;return true;});
}
function loadActivityExposures(referenceDate){return normalizeActivityExposures(safeJsonArray(ACTIVITY_EXPOSURE_KEY),referenceDate||fmt(new Date()));}
function recordActivityExposure(activities,surface,referenceDate){
  if(ACTIVITY_EXPOSURE_SURFACES.indexOf(surface)<0)return 0;
  referenceDate=referenceDate||fmt(new Date());var rows=loadActivityExposures(referenceDate),seen={};rows.forEach(function(x){seen[x.activity_id+'|'+x.date+'|'+x.surface]=true;});var added=0;
  (activities||[]).forEach(function(item){var id=canonicalActivityId(typeof item==='string'?item:item&&item.activity_id),key=id+'|'+referenceDate+'|'+surface;if(!id||seen[key])return;seen[key]=true;rows.push({activity_id:id,date:referenceDate,shown_at:new Date().toISOString(),surface:surface});added++;});
  if(added){localStorage.setItem(ACTIVITY_EXPOSURE_KEY,JSON.stringify(rows));if(typeof idbSet==='function')idbSet('activity_exposure_v1',rows);}return added;
}
function recentExposurePenalty(activityId,referenceDate){
  var id=canonicalActivityId(activityId),distance=Infinity,monthlyOnly=true;
  loadActivityExposures(referenceDate).forEach(function(x){if(x.activity_id!==id)return;var days=activityDateDistance(x.date,referenceDate);if(days<distance){distance=days;monthlyOnly=x.surface==='monthly_plan';}else if(days===distance&&x.surface!=='monthly_plan')monthlyOnly=false;});
  var points=[22,14,10,6,3,1][distance]||0;return monthlyOnly?Math.round(points*.5):points;
}
function activityPlayType(a){
  if(a.play_type&&a.play_type!=='existing_mechanic_variant')return a.play_type;
  var title=a.title||'',tags=a.interest_tags||[];
  if(tags.indexOf('balls')>=0)return 'ball_play';if(/搬|送|家务|收纳|递/.test(title))return 'carrying';if(/音乐|唱|儿歌|吉他|敲/.test(title))return 'music';if(/绘本|翻书|看图/.test(title))return 'book_talk';if(/泡泡/.test(title))return 'bubble_play';if(/模仿|做动作/.test(title))return 'imitation';if(/走|散步|小坡/.test(title))return 'walking';if(/叠|积木/.test(title))return 'stacking';if(/假装|娃娃/.test(title))return 'pretend_play';if(/藏|找/.test(title))return 'hide_find';return (a.domains||[])[0]+'_other';
}
function activityInteractionStyle(a){
  var type=activityPlayType(a);
  if(/request|choice|expansion|sound_imitation|book_talk/.test(type))return 'language_exchange';
  if(/turn|cooperation|greeting|parallel/.test(type))return 'social_exchange';
  if((a.domains||[])[0]==='motor'||/ball|walking|reach|stepping|pivot/.test(type))return 'movement';
  if(/music|imitation/.test(type))return 'imitative';return 'exploration';
}
function activityContextType(a){if(a.activity_context_type)return a.activity_context_type;var title=a.title||'';if(/家务|衣|饭|尿布|收纳|勺/.test(title))return 'daily_life';if((a.location||[]).indexOf('outdoor')>=0&&!(a.location||[]).includes('indoor'))return 'outdoor';if((a.location||[]).indexOf('on_the_go')>=0)return 'transition';return 'play';}
function activityPreferenceFeatures(a){return {domains:(a.domains||[]).slice(0,2),play_types:[activityPlayType(a)],contexts:[activityContextType(a)],locations:(a.location||[]).slice(0,2),interaction_styles:[activityInteractionStyle(a)]};}
function buildActivityPreferenceProfile(referenceDate){
  referenceDate=referenceDate||fmt(new Date());var byId={};activityCatalog().forEach(function(a){byId[a.activity_id]=a;});
  var groups={domains:{},play_types:{},contexts:{},locations:{},interaction_styles:{}},valid=0;
  loadActivityFeedback().forEach(function(row){var a=byId[row.activity_id],days=activityDateDistance(row.date,referenceDate);if(!a||days<=0||days>90||['love','okay','no_interest'].indexOf(row.enjoyment)<0)return;valid++;
    var value={love:1,okay:.2,no_interest:-1}[row.enjoyment]*Math.pow(.5,days/30),features=activityPreferenceFeatures(a);
    Object.keys(features).forEach(function(kind){features[kind].forEach(function(key){if(!key)return;var slot=groups[kind][key]||(groups[kind][key]={score:0,count:0,positive_dates:[],negative_dates:[]});slot.score+=value;slot.count++;var dates=value>0?slot.positive_dates:slot.negative_dates;if(dates.indexOf(row.date)<0)dates.push(row.date);});});
  });
  var favoriteTypes={};loadActivityFavorites().forEach(function(row){var a=byId[row.activity_id];if(a){var type=activityPlayType(a);favoriteTypes[type]=(favoriteTypes[type]||0)+1;}});
  return {version:1,reference_date:referenceDate,source_feedback_count:valid,features:groups,favorite_play_types:favoriteTypes};
}
function saveActivityPreferenceProfile(){var profile=buildActivityPreferenceProfile(fmt(new Date()));localStorage.setItem(ACTIVITY_PREFERENCE_PROFILE_KEY,JSON.stringify(profile));if(typeof idbSet==='function')idbSet('activity_preference_profile_v1',profile);return profile;}
function activityPreferenceBonus(a,profile){
  if(!profile||!profile.features)return 0;var features=activityPreferenceFeatures(a),weights={domains:1,play_types:2.5,contexts:.8,locations:.5,interaction_styles:1},total=0;
  Object.keys(features).forEach(function(kind){features[kind].forEach(function(key){var x=profile.features[kind]&&profile.features[kind][key];if(!x)return;var evidence=x.score>0?x.positive_dates.length:x.negative_dates.length;if(evidence<2)return;total+=Math.max(-2,Math.min(2,x.score))*weights[kind];});});
  var saved=profile.favorite_play_types&&profile.favorite_play_types[activityPlayType(a)]||0;if(saved>=2)total+=.5;
  return Math.max(-4,Math.min(6,Math.round(total*10)/10));
}
function selectDiverseActivityBatch(ranked,excludedIds){
  var excluded={};(excludedIds||[]).forEach(function(id){excluded[canonicalActivityId(id)]=true;});var pool=ranked.filter(function(a){return !excluded[a.activity_id];}),out=[];
  var slots=['zero','small','scene'];
  while(out.length<3&&pool.length){var wanted=slots[out.length],candidates=pool.some(function(a){return a.slot===wanted;})?pool.filter(function(a){return a.slot===wanted;}):pool,best=null,bestScore=-Infinity;candidates.forEach(function(a){var score=a._score||0,domain=a.domains[0],type=activityPlayType(a),style=activityInteractionStyle(a);out.forEach(function(p){if(p.domains[0]===domain)score-=11;if(activityPlayType(p)===type)score-=14;if(activityInteractionStyle(p)===style)score-=3;if(p.slot===a.slot)score-=2;});if(score>bestScore){best=a;bestScore=score;}});out.push(best);pool=pool.filter(function(a){return a!==best;});}
  return out;
}
