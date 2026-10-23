/* Phase 1.9：指南只读；年龄段内容来自 development-guide-content.js。 */
function guideForAge(age){return DEVELOPMENT_GUIDE_CONTENT.find(function(b){return age>=b.age_range[0]&&age<=b.age_range[1];})||null;}
function guideSafeToy(toy,age){
  if(!toy||age<toy.age_range[0]||age>toy.age_range[1]||toy.safety_level==='blocked')return false;
  if(age<36){
    if(typeof toy.min_piece_cm!=='number'||toy.min_piece_cm<3.2)return false;
    var text=[toy.name].concat(toy.replacement_materials||[]).join('');
    if(BLOCKED_UNDER3_WORDS.some(function(word){return text.indexOf(word)>=0;}))return false;
  }
  return true;
}
function guideToysForBand(band,age){
  var byId={};DEVELOPMENT_GUIDE_TOYS.forEach(function(toy){byId[toy.toy_id]=toy;});
  var out={};['continue','consider','no_buy'].forEach(function(group){out[group]=(band.toys[group]||[]).map(function(id){return byId[id];}).filter(function(toy){return guideSafeToy(toy,age);}).slice(0,group==='consider'?2:5);});
  return out;
}
function guideActivitiesForBand(band,age){
  var catalog=activityCatalog();return (band.activity_titles||[]).map(function(title){return catalog.find(function(a){return a.title===title&&age>=a.min_age_months&&age<=a.max_age_months&&a.safety_level!=='blocked'&&(age>=36||!a.legacy||!unsafeForAge(a.legacy));});}).filter(Boolean).slice(0,3);
}
function guideCapabilityStatus(capabilityId,age,evidence){
  var cap=capabilityById(capabilityId);if(!cap)return '';
  var rows=evidence.filter(function(e){return e.confirmed&&e.capability_ids.indexOf(capabilityId)>=0;});if(!rows.length)return '';
  var summary=summarizeCapabilityEvidence(cap,rows,age);
  if(summary.status==='observed')return summary.stableObserved?'已经会了 ✓':'已有记录';
  if(summary.status==='emerging')return '正在发展';
  if(summary.status==='not_yet')return '可以多给机会';
  if(summary.status==='concern')return '可以重点观察';
  return '还没记录到';
}
function homeDevelopmentGuideSummary(age){
  var band=guideForAge(age);if(!band)return null;
  var assessment=currentAssessment(),since=Date.now()-120*86400000,evidence=assessment&&assessment.completedAt?loadEvidence().filter(function(e){return e.confirmed&&e.createdAt>=since;}):[];
  var domains=['motor','lang','fine'],items=domains.map(function(domain){var x=(band.domains[domain]||[])[0];if(!x)return null;var status=evidence.length?guideCapabilityStatus(x.capability_id,age,evidence):'';return {domain:domain,text:x.text,capability_id:x.capability_id,status:status==='可以重点观察'?'':status};}).filter(Boolean).slice(0,3);
  var toys=guideToysForBand(band,age),selected=toys.continue.slice(0,2).concat(toys.no_buy.slice(0,1)).slice(0,3);
  return {age:age,age_range:band.age_range,items:items,toy_names:selected.map(function(x){return x.name;})};
}
function renderHomeDevelopmentGuideSummary(age){
  var box=document.getElementById('homeDevelopmentGuideSection');if(!box)return;
  age=age==null?ageInfo().totM:age;var summary=homeDevelopmentGuideSummary(age);
  if(!summary){box.hidden=true;box.innerHTML='';return;}
  box.hidden=false;
  box.innerHTML='<div class="today-monthly-guide-head"><div><span class="today-monthly-guide-age">'+age+'个月 · </span><span class="today-monthly-guide-range">'+summary.age_range[0]+'～'+summary.age_range[1]+'月龄阶段</span><h2 id="homeDevelopmentGuideTitle">本月发育要点</h2></div></div><ul class="today-monthly-guide-points">'+summary.items.map(function(x){var label=x.domain==='lang'?'语言':DOMAIN_META[x.domain].name.slice(2).trim();return '<li><b>'+esc(label)+'</b><span>'+esc(x.text)+'</span></li>';}).join('')+'</ul><p class="today-monthly-guide-toy">这个月可以多玩：'+esc(summary.toy_names.join(' · '))+'</p><button type="button" class="today-monthly-guide-link" onclick="openHomeDevelopmentGuide()">查看完整发育指南 <span aria-hidden="true">›</span></button>';
}
function openHomeDevelopmentGuide(){
  var nav=document.getElementById('navBrain');if(!nav)return;
  showPage('brain',nav);
  document.getElementById('developmentGuideSection').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderDevelopmentGuide(age){
  var box=document.getElementById('developmentGuideSection');if(!box)return;
  age=age==null?ageInfo().totM:age;var band=guideForAge(age);
  if(!band){box.innerHTML='<div class="guide-outside">当前内容库覆盖18～36月龄，其他阶段的指南尚在整理。</div>';return;}
  var since=Date.now()-120*86400000,evidence=loadEvidence().filter(function(e){return e.confirmed&&e.createdAt>=since;}),toys=guideToysForBand(band,age),activities=guideActivitiesForBand(band,age);
  var status=function(id){var s=guideCapabilityStatus(id,age,evidence);return s?'<span class="guide-personal-mark" data-capability-id="'+esc(id)+'">'+esc(s)+'</span>':'';};
  var domains=DOMAIN_IDS.map(function(d){var items=(band.domains[d]||[]).slice(0,2);return '<div class="guide-domain-row"><h4>'+esc(DOMAIN_META[d].name.slice(2).trim())+'</h4><div>'+items.map(function(x){return '<p>'+esc(x.text)+status(x.capability_id)+'</p>';}).join('')+'</div></div>';}).join('');
  var opportunities=band.opportunities.slice(0,6).map(function(x){return '<li>'+esc(x.text)+'</li>';}).join('');
  var games=activities.length?'<div class="guide-related"><h4>相关游戏</h4><div class="guide-game-list">'+activities.map(function(a){return '<details class="guide-game"><summary>'+esc(a.title)+'<span>'+esc(a.duration.label)+'</span></summary><p>'+esc(a.description)+'</p><ol>'+activityStepsHtml(a)+'</ol><p class="guide-game-safety">'+esc(a.safety_notes)+'</p></details>';}).join('')+'</div></div>':'';
  var toyGroup=function(group,title,caption){return '<div class="guide-toy-group guide-toy-'+group+'"><h4>'+title+'</h4><p>'+caption+'</p><div class="guide-toy-grid">'+toys[group].map(function(toy){return '<article class="guide-toy-card"><span class="guide-toy-art" aria-hidden="true"></span><strong>'+esc(toy.name)+'</strong><small>'+esc(toy.category)+'</small>'+(toy.replacement_materials.length?'<span class="guide-toy-replace">也可用：'+esc(toy.replacement_materials.join('、'))+'</span>':'')+'</article>';}).join('')+'</div></div>';};
  var life=band.life_participation.slice(0,5).map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
  var observe=band.observe_points.map(function(x){return '<li>'+esc(x.text)+status(x.capability_id)+'</li>';}).join('');
  var refs=band.source_refs.map(function(id){return capabilityById(id);}).filter(Boolean),seen={};refs=refs.filter(function(c){if(seen[c.source])return false;seen[c.source]=true;return true;});
  box.innerHTML='<div class="guide-heading"><div><span class="guide-eyebrow">'+age+'个月 · '+band.age_range[0]+'～'+band.age_range[1]+'月龄阶段</span><h2 id="developmentGuideTitle">本月发育指南</h2><p>'+esc(band.title)+'</p></div><span class="guide-heading-art" aria-hidden="true">☁</span></div><p class="guide-stage-context">'+esc(band.stage_context)+' 这里是通用阶段背景；完成评估后生成的本月成长总结，才结合小宝自己的记录。</p>'+
    '<div class="guide-block guide-domains"><h3>本月发育要点</h3><p class="guide-intro">这个阶段常见的探索方向，不是这个月必须完成的清单。</p>'+domains+'</div>'+
    '<div class="guide-block guide-opportunities"><h3>这个月多提供这些机会</h3><ul>'+opportunities+'</ul>'+games+'</div>'+
    '<div class="guide-block guide-toys"><h3>这个月适合什么玩具 / 材料</h3><p class="guide-intro">先玩家里已有的，不需要每个月买新玩具。下面的“可考虑”也不是必买清单。</p>'+toyGroup('continue','家里有就继续玩','同一件东西可以换着玩法反复玩。')+toyGroup('consider','如果缺，可以考虑补 1 件','仅在家里缺少类似玩法时考虑，最多选一件。')+toyGroup('no_buy','不买也能玩','大号、安全的日常材料就很好用。')+'<p class="guide-safety-note">3岁以下只用完整的大尺寸材料，检查没有可脱落配件；玩时成人在旁边。</p></div>'+
    '<div class="guide-block guide-life"><h3>这个月可以让她参与</h3><p class="guide-intro">参与就好，不要求做得完整。</p><ul>'+life+'</ul></div>'+
    '<div class="guide-block guide-observe"><h3>本月值得留意</h3><p class="guide-intro">顺便看看自然出现的变化，不用专门测试。</p><ul>'+observe+'</ul></div>'+
    '<details class="guide-sources"><summary>阶段内容依据</summary><p>发展要点引用项目已校准的能力锚点；生活、材料与游戏建议来自现有内容库，不设新评分线。</p><ul>'+refs.map(function(c){return '<li>'+esc(c.label)+'：'+esc(c.source)+'</li>';}).join('')+'</ul></details>';
}
