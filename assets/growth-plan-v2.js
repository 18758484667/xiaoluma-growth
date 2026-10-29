/* Growth plan presentation: the only active growth page. */
(function(global){
  'use strict';
  var root,tab='observation',archiveMonth=null,queued=false,ready=false,guideKey=null;
  var original={};
  function node(id){return document.getElementById(id);}
  function text(v){return esc(v==null?'':v);}
  function monthLabel(key){return key.slice(0,4)+'年'+Number(key.slice(5,7))+'月';}
  function excerpt(value,sentences,chars){return growthDisplayExcerpt(value,sentences||2,chars||125);}
  function actionExcerpt(value){var sentences=String(value||'').match(/[^。！？!?]+[。！？!?]?/g)||[];return excerpt(sentences.find(function(line){return /提供|多给|可以|遇到|建议|请查看|顺便|留意|尝试/.test(line);})||value,1,95);}
  function section(title,body,cls){return '<section class="gv-section '+(cls||'')+'"><h2>'+title+'</h2>'+body+'</section>';}
  function empty(message){return '<p class="gv-empty">'+text(message)+'</p>';}
  function patch(id,html){
    var el=node(id);if(!el||el.__viewHTML===html)return;
    var opened=Array.from(el.querySelectorAll('details[open][data-view-key]')).map(function(x){return x.getAttribute('data-view-key');});
    el.innerHTML=html;el.__viewHTML=html;
    el.querySelectorAll('details[data-view-key]').forEach(function(x){if(opened.indexOf(x.getAttribute('data-view-key'))>=0)x.open=true;});
  }
  function summaryHtml(vm){
    var s=vm.summary,a=vm.assessment;
    if(!s)return '<section class="gv-summary"><span class="gv-eyebrow">'+monthLabel(vm.month)+' · '+vm.age+'个月</span><h2>本月成长总结</h2><p>'+(a&&a.completedAt?'本月评估已完成，还没有保存本月总结。':'先记下日常的小变化，完成本月成长评估后，这里会整理出本月总结与陪伴重点。')+'</p><button type="button" class="gv-link" onclick="'+(a&&a.completedAt?'GrowthPageV2.updateSummary()':'GrowthPageV2.selectTab(\'assessment\')')+'">'+(a&&a.completedAt?'生成本月总结':'查看本月成长评估')+' →</button><button type="button" class="gv-link" onclick="WeeklyPlanUI.open(\'brain\')">查看本周早教计划 →</button></section>';
    var short=excerpt(s.overall_summary);
    return '<section class="gv-summary"><span class="gv-eyebrow">'+monthLabel(s.month_key)+' · '+s.age_months+'个月</span><h2>本月成长总结</h2><p class="gv-overall">'+text(short)+'</p>'+(short!==s.overall_summary?'<details class="gv-disclosure" data-view-key="overall"><summary>查看完整总结</summary><p>'+text(s.overall_summary)+'</p></details>':'')+'<div class="gv-summary-actions"><button type="button" class="gv-link" onclick="GrowthPageV2.updateSummary()">更新本月总结 ↻</button><button type="button" class="gv-link" onclick="WeeklyPlanUI.open(\'brain\')">查看本周早教计划 →</button><span>补记观察后，可以主动更新本月总结</span></div></section>';
  }
  function focusHtml(vm){
    if(!vm.summary)return '';
    return section('本月最值得关注的方向',vm.focus.length?'<div class="gv-focus-list">'+vm.focus.map(function(f,i){return '<article class="gv-focus-item"><span class="gv-focus-number" aria-hidden="true">'+(i+1)+'</span><div><h3>'+text(f.title)+'</h3><p>'+text(excerpt(f.reason,1,60))+'</p><p class="gv-focus-action">'+text(actionExcerpt(f.action))+'</p><details class="gv-disclosure" data-view-key="focus-'+i+'"><summary>为什么选这个方向？</summary><p>'+text(f.reason)+'</p><p>'+text(f.action)+'</p></details></div></article>';}).join('')+'</div>':empty('没有特别需要强化的方面，继续按她的节奏生活和游戏即可。'));
  }
  function planHtml(plan){
    var interactions=(plan.interaction||[]).slice(0,3),games=(plan.activities||[]).slice(0,3),life=(plan.life_opportunities||[]).slice(0,3);
    return '<div class="gv-plan"><div><h3><span aria-hidden="true">☀</span> 日常互动</h3>'+(interactions.length?interactions.map(function(x){return '<p>'+text(x)+'</p>';}).join(''):empty('这份总结尚未保存日常互动建议。'))+'</div><div><h3><span aria-hidden="true">♧</span> 玩一玩</h3>'+(games.length?games.map(function(a,i){return '<details class="gv-disclosure" data-view-key="plan-game-'+i+'"><summary>'+text(a.title)+' <small>'+text(a.duration)+'</small></summary><p>'+text(a.description)+'</p><ol>'+(a.steps||[]).map(function(s){return '<li>'+text(s)+'</li>';}).join('')+'</ol><p class="gv-caption">'+text(a.safety_notes)+'</p></details>';}).join(''):empty('完成本月评估后，这里会显示已保存的游戏建议。'))+'</div><div><h3><span aria-hidden="true">❀</span> 生活参与</h3>'+(life.length?life.map(function(x){return '<p><b>'+text(x.title)+'</b><br>'+text(x.text)+'</p>';}).join(''):empty('这份总结尚未保存生活参与建议。'))+'</div></div>';
  }
  function observationHtml(vm){
    function rows(list){return list.length?'<ol class="gv-observation-list">'+list.map(function(e){return '<li><time>'+text(e.date)+'</time><p>'+text(e.raw_record)+'</p><span>'+text(EVIDENCE_STATUS[e.evidence_type])+(e.caregiver_concern?' · 家长对此有担忧':'')+'</span></li>';}).join('')+'</ol>':empty('还没有观察记录。看到一个新动作、新词或小变化时，随手记下来。');}
    return '<div class="gv-observation-count">本月已记录 <b>'+vm.monthObservations.length+'</b> 条观察</div>'+section('最近观察',rows(vm.observations.slice(0,5)))+'<details class="gv-history-disclosure" data-view-key="older-observations"><summary>历史观察 · '+Math.max(0,vm.observations.length-5)+' 条</summary>'+rows(vm.observations.slice(5))+'</details>';
  }
  function brainObservationHtml(ability){
    var events=[];
    ability.observations.forEach(function(o){var key=o.event_id||o.source_id;var event=events.find(function(item){return item.key===key;});if(!event){event={key:key,date:o.date,source:o.source_label,items:[]};events.push(event);}event.items.push(o);});
    return events.map(function(event,index){
      var spoon=event.source==='月度评估'?event.items.filter(function(o){return o.source_capability_id==='fine_spoon'||o.source_capability_id==='fine_spoon_eat';}):[];
      var pair=spoon.some(function(o){return o.source_capability_id==='fine_spoon';})&&spoon.some(function(o){return o.source_capability_id==='fine_spoon_eat';});
      var spoonShown=false;
      var records=event.items.map(function(o){
        if(pair&&(o.source_capability_id==='fine_spoon'||o.source_capability_id==='fine_spoon_eat')){
          if(spoonShown)return '';spoonShown=true;
          return '<li>使用勺子（本次评估的相关回答）<details class="gv-brain-original" data-view-key="brain-original-'+ability.ability_id+'-'+index+'"><summary>查看原始记录</summary><ul>'+spoon.map(function(raw){return '<li>'+text(raw.behavior)+'</li>';}).join('')+'</ul></details></li>';
        }
        return '<li>'+text(o.behavior)+'</li>';
      }).join('');
      return '<div class="gv-brain-observation"><time>'+text(event.date)+' · '+text(event.source)+'</time><p>'+(event.source==='月度评估'?'本次月度评估包含以下相关记录：':'本次记录到：')+'</p><ul>'+records+'</ul></div>';
    }).join('');
  }
  function fiveBrainHtml(map){
    if(!map)return '';
    var labels={limited_observation:'记录较少',no_observation:'继续观察',early_observed:'已看到一些早期表现',early_context:'早期表现阶段'};
    var groups=map.groups.map(function(group){
      var active=group.abilities.filter(function(a){return a.applicability==='active_observation';});
      var early=group.abilities.filter(function(a){return a.applicability==='early_signal_only';});
      var future=group.abilities.filter(function(a){return a.applicability==='future';});
      var support=group.abilities.filter(function(a){return a.applicability==='support_context';});
      var pending=group.abilities.filter(function(a){return a.applicability==='pending_review';});
      var rows=active.map(function(a){
        if(!a.observations.length)return '<div class="gv-brain-ability gv-brain-ability-empty"><strong>'+text(a.name)+'</strong><span>'+labels[a.display_status]+'</span></div>';
        return '<details class="gv-brain-ability" data-view-key="brain-'+a.ability_id+'"><summary><strong>'+text(a.name)+'</strong><span>'+labels[a.display_status]+'</span></summary><div class="gv-brain-ability-body">'+brainObservationHtml(a)+'</div></details>';
      }).join('');
      var earlyHtml=early.length?'<p class="gv-brain-stage"><strong>'+early.map(function(a){return text(a.name);}).join(' · ')+'</strong><br>'+text(early.some(function(a){return a.display_status==='early_observed';})?'已看到一些早期表现，仍不需要评价能力水平。':'早期表现阶段，可以自然留意，还不需要评价能力水平。')+'</p>':'';
      var futureHtml=future.length?'<p class="gv-brain-stage gv-brain-future">'+future.map(function(a){return text(a.name);}).join(' · ')+'<br>这些能力会在再大一些后逐渐变得更容易观察。现在的假装、探索和自由尝试，就是很自然的早期经验。</p>':'';
      var supportHtml=support.length?'<p class="gv-brain-stage gv-brain-support"><strong>生活与健康支持</strong><br>睡眠、饮食、活动机会、安全环境与日常照护是成长背景，不是孩子的能力等级。</p>':'';
      var pendingHtml=pending.length?'<p class="gv-brain-stage">这一年龄阶段的观察规则仍待审核，暂不展示能力状态。</p>':'';
      return '<section class="gv-brain-group"><h3>'+text(group.name)+'</h3>'+rows+earlyHtml+futureHtml+supportHtml+pendingHtml+'</section>';
    }).join('');
    return '<section class="gv-five-brain-map" aria-labelledby="gvFiveBrainTitle"><header><span class="gv-eyebrow">'+text(map.age_months)+'个月 · 成长观察</span><h2 id="gvFiveBrainTitle">五脑成长地图</h2><p>成长地图会随着日常真实观察慢慢丰富。没有记录只表示还没留下相关观察，不代表能力缺失。</p></header>'+groups+'</section>';
  }
  function archiveHtml(vm){
    if(!vm.archives.length)return empty('还没有月度档案。记录观察或完成月度评估后，月份会留在这里。');
    return '<ol class="gv-months">'+vm.archives.map(function(a){var s=a.snapshot,seen=s?(s.new_capabilities||[]):[],focus=s?(s.monthly_focus||[]):[];return '<li><button type="button" class="gv-month-button" onclick="GrowthPageV2.openArchive(\''+a.month+'\')"><time>'+monthLabel(a.month)+'</time><strong>'+text(s?excerpt(s.overall_summary,1,65):a.observations.length?'这个月留下了 '+a.observations.length+' 条日常观察。':'本月评估尚未完成。')+'</strong><span>新出现：'+text(seen.length?seen.slice(0,2).map(function(x){return x.text;}).join('；'):'当月未记录明确的新表现')+'</span><span>当月重点：'+text(focus.length?focus.slice(0,2).map(function(x){return x.title;}).join('；'):s?'继续按日常节奏陪伴':'暂无固定总结')+'</span><span class="gv-month-arrow" aria-hidden="true">›</span></button></li>';}).join('')+'</ol>';
  }
  function archiveDetailHtml(vm){
    var a=vm.archives.find(function(x){return x.month===archiveMonth;});if(!a)return '';
    var s=a.snapshot,body='<button type="button" class="gv-link" onclick="GrowthPageV2.closeArchive()">← 返回历史月份</button><h2>'+monthLabel(a.month)+'</h2>';
    if(!s)return body+empty('这个月份没有保存的成长总结，以下仅展示当时留下的原始观察。')+'<ul class="gv-evidence-list">'+a.observations.map(function(e){return '<li>'+text(e.date)+' · '+text(e.raw_record)+'<small>'+text(EVIDENCE_STATUS[e.evidence_type])+'</small></li>';}).join('')+'</ul>';
    body+='<p class="gv-eyebrow">'+s.age_months+'个月 · 历史快照</p><p>'+text(s.overall_summary)+'</p>'+section('当月重点',(s.monthly_focus||[]).map(function(f){return '<h3>'+text(f.title)+'</h3><p>'+text(f.reason)+'</p><p>'+text(f.action)+'</p>';}).join('')||empty('继续按日常节奏陪伴。'));
    body+=section('当月新出现 / 最近变化','<ul>'+(s.recent_changes||[]).map(function(x){return '<li>'+text(x.text)+'</li>';}).join('')+'</ul>'+(s.recent_changes&&s.recent_changes.length?'':empty('当月尚无足够的连续记录。')));
    body+='<details class="gv-history-disclosure" data-view-key="snapshot-dimensions"><summary>查看当月完整五维记录</summary>'+DOMAIN_IDS.map(function(d){var x=(s.dimensions||{})[d];if(!x)return '';return '<section class="gv-section"><h3>'+GrowthViewModel.names[d]+' · '+text(x.state_label)+'</h3><p>'+text((x.observed_items||[]).join('；'))+'</p><p>'+text(x.recommendation)+'</p><p>'+text(x.next_observation||'')+'</p><details class="gv-disclosure"><summary>当时的依据</summary><p>'+text(x.why)+'</p><p>'+text(x.evidence_label)+'</p><p>'+text((x.emerging_capabilities||[]).map(function(c){return c.label+' · 正在出现';}).join('；'))+'</p><details class="gv-disclosure"><summary>当月评估答案</summary><ul>'+(x.assessment_answers||[]).map(function(answer){return '<li>'+text(answer.label)+' · '+text(EVIDENCE_STATUS[answer.status])+(answer.caregiver_concern?' · 家长对此有担忧':'')+'</li>';}).join('')+'</ul></details><ul>'+(x.key_evidence||[]).map(function(e){return '<li>'+text(e.date)+' · '+text(e.text)+'</li>';}).join('')+'</ul></details></section>';}).join('')+'</details>';
    body+=section('当时保存的30天建议',planHtml(s.next_30_days||{}))+section('当时的下月观察点','<p>'+text((s.next_month_check||[]).join('；'))+'</p>');return body;
  }
  function shell(){return '<header class="gv-header"><div><h1>成长计划</h1><p id="gvPageMeta"></p></div></header><div class="gv-tabs" role="tablist" aria-label="成长计划栏目">'+[['summary','本月总结'],['observation','成长观察'],['archive','月度档案'],['assessment','成长评估']].map(function(x){var selected=x[0]===tab;return '<button type="button" id="gvTab-'+x[0]+'" role="tab" aria-controls="gvPanel-'+x[0]+'" aria-selected="'+selected+'" tabindex="'+(selected?'0':'-1')+'" onclick="GrowthPageV2.selectTab(\''+x[0]+'\')">'+x[1]+'</button>';}).join('')+'</div><div class="assessment-save-notice" id="assessmentSaveNotice" role="status" aria-live="polite" hidden></div><p class="gv-notice" id="gvNotice" role="status" hidden></p>'+ 
    '<div id="gvPanel-summary" role="tabpanel" aria-labelledby="gvTab-summary" hidden><div id="gvSummary"></div><div id="gvFocus"></div><div id="gvPlan"></div><details class="gv-guide-entry" id="gvGuide"><summary><strong id="gvGuideTitle">月龄发育指南</strong><span>看看这个阶段通常在发展什么、适合怎么玩 →</span></summary><div id="gvGuideBody"></div></details></div>'+ 
    '<div id="gvPanel-observation" role="tabpanel" aria-labelledby="gvTab-observation"><div id="gvFiveBrainMap"></div><section class="gv-observation-editor"><h2>记录今天的小变化</h2><p class="gv-caption">记下具体发生的事，不急着给结论。</p><textarea id="obsNote" placeholder="例如：今天第一次说「妈妈抱」。"></textarea><div class="gv-observation-fields"><label>可能相关领域<select id="obsDomain"><option value="">暂不确定</option><option value="motor">大运动</option><option value="fine">精细动作</option><option value="lang">语言沟通</option><option value="cog">认知探索</option><option value="soc">社会交往 / 社会情绪</option></select></label><label>观察状态<select id="obsEvidenceStatus"><option value="observed">已观察到</option><option value="emerging">正在出现</option><option value="unobserved">尚未观察</option><option value="not_yet">家长确认尚未出现</option><option value="concern">家长有担忧</option></select></label></div><button type="button" class="gv-primary" onclick="addObservation()">保存观察</button></section><div id="gvObservations"></div></div>'+ 
    '<div id="gvPanel-archive" role="tabpanel" aria-labelledby="gvTab-archive" hidden><div id="gvArchiveList"></div><article id="gvArchiveDetail" hidden></article><details class="gv-history-disclosure"><summary>按月整理原始记录 / 打印</summary><div class="gv-archive-tools"><label>月份<input type="month" id="archiveMonth"></label><button type="button" class="gv-secondary" onclick="genGrowthArchive()">生成成长档案</button><button type="button" class="gv-secondary" onclick="genGrowthArchive();window.print()">打印 / 导出PDF</button></div><div id="archiveArea"></div></details></div>'+
    '<div id="gvPanel-assessment" role="tabpanel" aria-labelledby="gvTab-assessment" hidden><section class="gv-assessment"><h2>本月成长小评估</h2><p>根据现有记录了解这个月的表现，通常约5–10分钟。</p><div id="dxStatus"></div><div class="obs-progress"><div class="obs-progress-fill" id="dxProgress"></div></div><div id="dxList"></div><button type="button" id="finishAssessmentBtn" onclick="finishAssessment()" style="display:none">完成本月评估</button></section><button type="button" class="gv-link" onclick="GrowthPageV2.selectTab(\'archive\')">查看评估历史 →</button><button type="button" class="gv-link" onclick="showPage(\'milestone\')">发展里程碑 →</button><section class="gv-section gv-checkpoint"><h2>关键月龄核对</h2><div id="gvCheckpointAvailability"></div><section id="milestoneCheckpointSection" aria-label="关键月龄官方核对"></section></section><details class="regression-entry"><summary>记录已掌握能力的明显倒退</summary><p>只在孩子原来已经会、现在明显失去这项能力时记录；一般的起伏请用普通观察。</p><label>原来会的表现<select id="regressionCapability"></select></label><label>发现日期<input type="date" id="regressionDate"></label><label class="regression-confirm"><input type="checkbox" id="regressionConfirmed"> 我确认这项能力原来已经掌握，现在明显丧失</label><textarea id="regressionNote" placeholder="可选：记录发生时的具体情况"></textarea><button type="button" class="gv-secondary" onclick="saveRegressionReport()">保存倒退记录</button><div id="regressionSaveNotice" role="status"></div></details><p class="gv-boundary">成长记录帮助观察和安排日常陪伴，不替代专业发育筛查或医疗诊断。如有持续担忧或能力倒退，建议与儿保或儿科专业人员讨论。</p></div>';}
  function refresh(){
    if(!ready)return;var vm=GrowthViewModel.build();
    node('gvPageMeta').textContent=vm.age+'个月 · '+monthLabel(vm.month);
    patch('gvSummary',summaryHtml(vm));patch('gvFocus',focusHtml(vm));
    patch('gvPlan',vm.summary?section('接下来30天',planHtml(vm.plan)):'');if(typeof FiveBrainGrowthViewModel!=='undefined'&&typeof FiveBrainOntology!=='undefined')patch('gvFiveBrainMap',fiveBrainHtml(FiveBrainGrowthViewModel.build({ageMonths:vm.age,evidence:loadEvidence(),approvedMappings:typeof FIVE_BRAIN_APPROVED_EVIDENCE!=='undefined'?FIVE_BRAIN_APPROVED_EVIDENCE:[],ontologyApi:FiveBrainOntology})));patch('gvObservations',observationHtml(vm));patch('gvArchiveList',archiveHtml(vm));patch('gvArchiveDetail',archiveDetailHtml(vm));
    node('gvArchiveList').hidden=!!archiveMonth;node('gvArchiveDetail').hidden=!archiveMonth;
    node('gvGuideTitle').textContent=vm.guide?vm.guide.age_range[0]+'～'+vm.guide.age_range[1]+'月龄发育指南':'月龄发育指南';
    var nextGuideKey=vm.age+'|'+(localStorage.getItem(EVIDENCE_KEY)||'');
    if(nextGuideKey!==guideKey){original.renderDevelopmentGuide(vm.age);guideKey=nextGuideKey;}
    var def=checkpointDefinition(vm.age),ages=Object.keys(MILESTONE_CHECKPOINTS).map(Number),source=def||checkpointDefinition(ages[0]),availability='';
    if(!def)availability='<p>关键月龄为'+ages.join('、')+'个月，当前'+vm.age+'个月暂无到龄核对。</p>';
    availability+='<p class="gv-caption">'+ages.map(function(age){return age+'月龄 · '+(checkpointReady(age)?'已审核':'待审核');}).join('　')+'</p>'+(source?'<p class="gv-caption">来源：<a href="'+text(source.source_url)+'" target="_blank" rel="noopener">'+text(source.source_name)+'</a></p>':'');
    patch('gvCheckpointAvailability',availability);
  }
  function schedule(){if(queued||!ready)return;queued=true;Promise.resolve().then(function(){queued=false;refresh();});}
  function selectTab(value){
    if(['summary','observation','archive','assessment'].indexOf(value)<0)return;tab=value;
    root.querySelectorAll('[role="tab"]').forEach(function(button){var active=button.id==='gvTab-'+tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    root.querySelectorAll('[role="tabpanel"]').forEach(function(panel){panel.hidden=panel.id!=='gvPanel-'+tab;});
    if(tab==='assessment')renderAssessment();refresh();
  }
  function openArchive(month){archiveMonth=month;refresh();node('gvArchiveDetail').scrollIntoView({block:'start',behavior:'smooth'});}
  function closeArchive(){archiveMonth=null;refresh();}
  function updateSummary(){updateCurrentMonthSummary();refresh();node('gvNotice').textContent='本月总结已更新。';node('gvNotice').hidden=false;}
  function onPageChange(id){
    document.body.classList.toggle('growth-v2-active',id==='brain');
    if(id==='brain'){renderAssessment();renderDevelopmentGuide();renderMilestoneCheckpoint();renderRegressionEntry();refresh();}
  }
  function wire(){
    ['renderAssessment','renderDevelopmentGuide'].forEach(function(name){original[name]=global[name];global[name]=function(){var result=original[name].apply(this,arguments);schedule();return result;};});
    ['finishAssessment','saveAssessmentEdit'].forEach(function(name){original[name]=global[name];global[name]=function(){var result=original[name].apply(this,arguments);if(ready&&currentAssessment()&&currentAssessment().completedAt&&!assessmentEditDraft){selectTab('summary');root.scrollIntoView({block:'start',behavior:'smooth'});}return result;};});
    root.querySelector('.gv-tabs').addEventListener('keydown',function(event){if(['ArrowLeft','ArrowRight','Home','End'].indexOf(event.key)<0)return;var ids=['summary','observation','archive','assessment'],index=ids.indexOf(tab);index=event.key==='Home'?0:event.key==='End'?3:(index+(event.key==='ArrowRight'?1:3))%4;event.preventDefault();selectTab(ids[index]);node('gvTab-'+ids[index]).focus();});
  }
  function init(){
    root=node('growthV2Root');if(!root)return;root.innerHTML=shell();wire();ready=true;
    node('archiveMonth').value=fmt(new Date()).slice(0,7);
    renderAssessment();renderDevelopmentGuide();renderMilestoneCheckpoint();renderRegressionEntry();refresh();
  }
  global.GrowthPageV2={init:init,refresh:refresh,selectTab:selectTab,openArchive:openArchive,closeArchive:closeArchive,updateSummary:updateSummary,onPageChange:onPageChange,getTab:function(){return tab;},renderers:{summary:summaryHtml,archive:archiveHtml,fiveBrain:fiveBrainHtml}};
  init();
})(window);
