(function(global){
  'use strict';
  var origin='home';
  /* Display-only names. The saved focus, evidence and recommendation rules stay unchanged. */
  var THEMES={
    motor:{title:'自己动起来',home:'动一动',description:'给她更多自己走、追、搬、去拿东西的自然机会。'},
    fine:{title:'自己动手完成',home:'动手试一试',description:'让她多尝试自己拿、放、装、舀和参与简单生活小事。'},
    lang:{title:'把想法说出来',home:'说说自己的想法',description:'多给她表达需要、选择和回应的机会。'},
    cog:{title:'找一找，看看在哪里',home:'找一找',description:'通过藏找、寻找和简单配对，让她多体验东西在哪里、怎么找到。'},
    soc:{title:'我和你轮流来',home:'轮流玩',description:'在简单互动里体验等一等、轮到我、轮到你。'}
  };
  function node(id){return document.getElementById(id);}
  function safe(value){return esc(value==null?'':String(value));}
  function dateLabel(value){return Number(value.slice(5,7))+'月'+Number(value.slice(8,10))+'日';}
  function theme(focus){var name=THEMES[focus.domain]||{};return {title:name.title||focus.title,home:name.home||focus.title,description:name.description||focus.target_experience||''};}
  function oneLine(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function reasonLabel(f){return {monthly_summary:'本月重点',confirmed_evidence:'近期观察',development_guide:'当前阶段机会',activity_feedback:'最近喜欢的玩法'}[f.source_type]||'本周陪伴方向';}
  function renderHome(){
    var box=node('homeWeeklyPlan');if(!box)return;
    var plan=weeklyPlanForDate(new Date());if(!plan){box.hidden=true;return;}
    var names=plan.focus_areas.map(function(f){return theme(f).home;}),opportunity=plan.opportunities&&plan.opportunities[0];
    box.hidden=false;
    box.innerHTML='<div><h2>这周我们在陪什么</h2><p>多陪她'+safe(names.join('、'))+'。</p>'+(opportunity?'<small>'+safe(oneLine(opportunity.text))+'</small>':'')+'</div><button type="button" onclick="WeeklyPlanUI.open(\'home\')">查看本周计划 <span aria-hidden="true">›</span></button>';
  }
  function focusHtml(f,i,plan){
    var display=theme(f,plan);
    return '<article class="week-focus"><span class="week-kicker">'+(i===0?'这周先陪她':'也可以陪她')+'</span><h2>'+safe(display.title)+'</h2><p>'+safe(display.description)+'</p></article>';
  }
  function gameHtml(item){
    var activity=activityById(item.activity_id);if(!activity||!gameLibraryVariants(activity).some(function(v){return activityAvailableAtAge(v,ageInfo().totM);}))return '';
    var variant=gameLibraryVariants(activity).find(function(v){return v.variant_id===item.variant_id;})||activity;
    var summary=oneLine(gameLibrarySummary(variant)||activity.description),duration=variant.duration&&variant.duration.label||'',low=variant.caregiver_effort==='low';
    return '<article class="week-game" data-activity-id="'+safe(activity.activity_id)+'">'+favoriteButtonHtml(activity.activity_id,'week-favorite')+'<button type="button" class="week-game-open" onclick="WeeklyPlanUI.openGame(\''+safe(activity.activity_id)+'\')">'+gameLibraryArt(activity)+'<span class="week-game-copy"><strong>'+safe(activity.title)+'</strong><span>'+safe(summary)+'</span><small>'+safe(duration)+(low?' · 很累也能玩':'')+' · 看玩法 ›</small></span></button></article>';
  }
  function gamesHtml(plan){
    var seen={},groups=plan.focus_areas.map(function(f){var games=plan.suggested_activities.filter(function(item){if(item.domain!==f.domain||seen[item.activity_id])return false;var a=activityById(item.activity_id);if(!a||!gameLibraryVariants(a).some(function(v){return activityAvailableAtAge(v,ageInfo().totM);}))return false;seen[item.activity_id]=true;return true;}).slice(0,3);return games.length?'<div class="week-game-group"><h3>'+safe(theme(f).title)+'</h3><div class="week-games">'+games.map(gameHtml).join('')+'</div></div>':'';}).join('');
    return groups||'<p class="week-gentle-empty">当前条件下没有合适的现有游戏，先从生活里的小机会开始就好。</p>';
  }
  function historyHtml(plan){
    return loadWeeklyPlans().filter(function(p){return p.week_start!==plan.week_start;}).map(function(p){return '<li><button type="button" onclick="WeeklyPlanUI.viewHistory(\''+p.week_start+'\')">'+dateLabel(p.week_start)+'—'+dateLabel(p.week_end)+' · '+p.focus_areas.map(function(f){return safe(theme(f).title);}).join('、')+' ›</button></li>';}).join('');
  }
  function render(){
    var plan=weeklyPlanForDate(new Date()),box=node('weeklyPlanRoot');if(!box)return;
    if(!plan){box.innerHTML='<div class="week-empty"><h1>这周我们陪什么</h1><p>当前月龄的指南还在整理，暂时没有可生成的周计划。</p></div>';return;}
    var summary='这周多给她一些'+plan.focus_areas.map(function(f){return theme(f).home;}).join('、')+'的机会。';
    var life=(plan.life_opportunities||[]).slice(0,3).map(function(x){return '<li><strong>'+safe(x.title)+'</strong><span>'+safe(x.text)+'</span></li>';}).join('');
    var observe=(plan.observation_prompts||[]).slice(0,2).map(function(x){return '<li>'+safe(x.text)+'</li>';}).join('');
    var history=historyHtml(plan);
    box.innerHTML='<header class="week-header"><div class="week-topline"><button type="button" class="week-back" onclick="WeeklyPlanUI.back()">‹ 返回</button><span>'+dateLabel(plan.week_start)+'—'+dateLabel(plan.week_end)+'</span></div><span class="week-kicker">小鹿玛 · '+plan.age_months+'个月</span><h1>这周我们陪什么</h1><p>'+safe(summary)+'</p></header>'+
      '<section class="week-section week-theme-section" aria-label="两个成长主题"><div class="week-focus-grid">'+plan.focus_areas.map(function(f,i){return focusHtml(f,i,plan);}).join('')+'</div><details class="week-why"><summary>为什么这周选这些方向？</summary><ul>'+plan.focus_areas.map(function(f){return '<li><strong>'+safe(theme(f).title)+'</strong><span>'+safe(reasonLabel(f))+' · '+safe(f.why_now)+'</span></li>';}).join('')+'</ul></details></section>'+
      '<section class="week-section"><h2>这周可以怎么玩</h2><p class="week-section-intro">挑喜欢的玩一玩，一周内任选。</p>'+gamesHtml(plan)+'</section>'+
      '<section class="week-section"><h2>日常里顺手做</h2><ul class="week-life">'+life+'</ul></section>'+
      '<section class="week-section"><h2>这周顺便看看</h2><ul class="week-observe">'+(observe||'<li>留意她自己发起的小变化。</li>')+'</ul><p class="week-observe-note">看到了就记下来，没有出现也不用专门测试。</p></section>'+
      '<div class="week-actions"><button type="button" onclick="WeeklyPlanUI.update()">根据最新观察更新本周计划</button><span id="weekUpdateNotice" role="status"></span></div>'+
      '<details class="week-history"><summary>之前的周计划</summary><ul>'+(history||'<li>还没有之前的周计划。</li>')+'</ul></details>';
    updateFavoriteControls();
  }
  function open(from){origin=from||'home';showPage('weekly');render();node('page-weekly').scrollIntoView({block:'start'});}
  function back(){showPage(origin==='brain'?'brain':origin==='games'?'games':'home');}
  function update(){updateWeeklyPlan();render();node('weekUpdateNotice').textContent='本周计划已更新。';renderHome();if(typeof renderGames==='function')renderGames();}
  function openGame(id){showPage('games');openGameDetail(id);}
  function viewHistory(weekStart){
    var plan=loadWeeklyPlans().find(function(p){return p.week_start===weekStart;});if(!plan)return;
    var box=node('weekHistoryDetail');if(!box)return;box.hidden=false;
    box.innerHTML='<h2>'+dateLabel(plan.week_start)+'—'+dateLabel(plan.week_end)+'</h2><p>'+plan.focus_areas.map(function(f){var display=theme(f,plan);return '<strong>'+safe(display.title)+'</strong> · '+safe(display.description);}).join('<br>')+'</p><button type="button" onclick="document.getElementById(\'weekHistoryDetail\').hidden=true">收起</button>';
    box.scrollIntoView({block:'nearest'});
  }
  function setGameFilter(enabled){fState.weekly=!!enabled;var button=node('gameWeeklyTab');if(button){button.classList.toggle('active',fState.weekly);button.setAttribute('aria-pressed',String(fState.weekly));}renderGames();}
  global.WeeklyPlanUI={open:open,back:back,update:update,render:render,renderHome:renderHome,openGame:openGame,viewHistory:viewHistory,setGameFilter:setGameFilter,experienceTheme:theme};
  renderHome();
})(window);
