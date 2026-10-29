/* Phase 1.10A: daily observation and official milestone checkpoints are separate. */
var NHC_CHECKPOINT_SOURCE='https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf';
var CDC_MILESTONE_SOURCE={18:'https://www.cdc.gov/act-early/milestones/18-months.html',24:'https://www.cdc.gov/act-early/milestones/2-years.html',30:'https://www.cdc.gov/act-early/milestones/30-months.html'};
var CAPABILITY_SOURCE_META={
  motor_stairs:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,18,'source_verified'],
  motor_run:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[24],24,'source_verified'],
  motor_jump:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,24,'pending_review'],
  fine_lid:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,18,'pending_review'],
  fine_spoon:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[18],18,'source_verified'],
  fine_spoon_eat:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[24],24,'source_verified'],
  fine_pages:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,24,'source_verified'],
  lang_words:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,18,'source_verified'],
  lang_request:[null,null,null,'pending_review'],
  lang_two_words:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[24],24,'source_verified'],
  cog_object_use:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,18,'pending_review'],
  cog_sort:[null,null,null,'pending_review'],
  cog_color_one:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[30],30,'source_verified'],
  cog_pretend:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,24,'pending_review'],
  soc_ball:['国家卫健委3岁以下婴幼儿心理行为发育标志自评表',NHC_CHECKPOINT_SOURCE,18,'pending_review'],
  soc_emotion:[null,null,null,'pending_review'],
  soc_peers:['CDC Learn the Signs. Act Early',CDC_MILESTONE_SOURCE[30],30,'source_verified']
};
function enrichCapabilitySources(caps){
  caps.forEach(function(c){var m=CAPABILITY_SOURCE_META[c.capability_id]||[null,null,null,'pending_review'];
    c.source_level=c.source_type==='official_anchor'?'official_original':(c.source_type==='adapted_anchor'?'adapted':'product');
    c.source_name=m[0];c.source_url=m[1];c.official_age_months=m[2];c.review_status=m[3];c.reviewed_at=null;
  });
}

var MILESTONE_CHECKPOINT_KEY='xlma_milestone_checkpoints_v1';
var REGRESSION_REPORT_KEY='xlma_regression_reports_v1';
var MILESTONE_CHECKPOINTS={
  18:{review_status:'source_verified',source_name:'国家卫健委《3岁以下婴幼儿心理行为发育标志自评表》',source_url:NHC_CHECKPOINT_SOURCE,items:[
    {item_id:'nhc18_motor_stairs',domain:'motor',capability_id:'motor_stairs',original_meaning:'扶着墙或栏杆上楼梯',product_wording:'扶着墙或栏杆上楼梯'},
    {item_id:'nhc18_fine_twist',domain:'fine',capability_id:'fine_lid',original_meaning:'用手旋拧(如拧瓶盖、上发条等)',product_wording:'用手旋拧（如拧瓶盖、上发条等）'},
    {item_id:'nhc18_lang_words',domain:'lang',capability_id:'lang_words',original_meaning:'说出3个有意义的词',product_wording:'说出3个有意义的词'},
    {item_id:'nhc18_cog_use',domain:'cog',capability_id:'cog_object_use',original_meaning:'知道常用物品用途(如杯子用来喝水、灯会亮)',product_wording:'知道常用物品的用途'},
    {item_id:'nhc18_soc_ball',domain:'soc',capability_id:'soc_ball',original_meaning:'与他人玩传球等互动游戏',product_wording:'与他人玩传球等互动游戏'}
  ]},
  24:{review_status:'source_verified',source_name:'国家卫健委《3岁以下婴幼儿心理行为发育标志自评表》',source_url:NHC_CHECKPOINT_SOURCE,items:[
    {item_id:'nhc24_motor_jump',domain:'motor',capability_id:'motor_jump',original_meaning:'双脚同时离地跳起',product_wording:'双脚同时离地跳起'},
    {item_id:'nhc24_fine_pages',domain:'fine',capability_id:'fine_pages',original_meaning:'一页页地翻书',product_wording:'一页页地翻书'},
    {item_id:'nhc24_lang_sentence',domain:'lang',capability_id:null,original_meaning:'说简单的句子(如妈妈抱宝宝等)',product_wording:'说简单的句子（如妈妈抱宝宝）'},
    {item_id:'nhc24_cog_pretend',domain:'cog',capability_id:null,original_meaning:'玩装扮游戏(如假装给娃娃喂饭)',product_wording:'玩装扮游戏（如假装给娃娃喂饭）'},
    {item_id:'nhc24_life_toilet',domain:'soc',capability_id:null,original_meaning:'主动示意大小便',product_wording:'主动示意大小便'}
  ]},
  30:{review_status:'pending_review',source_name:'国家卫健委《3岁以下婴幼儿心理行为发育标志自评表》',source_url:NHC_CHECKPOINT_SOURCE,items:[]},
  36:{review_status:'pending_review',source_name:'国家卫健委《3岁以下婴幼儿心理行为发育标志自评表》',source_url:NHC_CHECKPOINT_SOURCE,items:[]}
};
function checkpointDefinition(age){return MILESTONE_CHECKPOINTS[age]||null;}
function checkpointReady(age){var d=checkpointDefinition(age);return !!d&&d.review_status==='source_verified'&&d.items.length===5&&d.items.every(function(x){return !!x.item_id&&!!x.original_meaning&&!!x.product_wording&&!!x.domain;});}
function checkpointResult(age,answers){
  if(!checkpointReady(age))return {key:'pending_review',missing:0,age_months:age};
  var d=checkpointDefinition(age),values=d.items.map(function(x){return answers&&answers[x.item_id];});
  if(values.some(function(v){return v!=='observed'&&v!=='not_yet';}))return {key:'incomplete',missing:0,age_months:age};
  var missing=values.filter(function(v){return v==='not_yet';}).length;
  return {key:missing>=2?'professional_check':missing===1?'guidance':'complete',missing:missing,age_months:age};
}
function loadMilestoneCheckpoints(){return safeJsonArray(MILESTONE_CHECKPOINT_KEY).filter(function(x){return x&&x.checkpoint_id&&MILESTONE_CHECKPOINTS[x.ageMonths];});}
function savedCheckpoint(age,monthKey){return loadMilestoneCheckpoints().find(function(x){return x.ageMonths===age&&x.monthKey===monthKey;})||null;}
function checkpointDomainSignal(domain,age,monthKey){
  var record=savedCheckpoint(age,monthKey),result=record&&checkpointResult(age,record.answers);
  if(!result||(result.key!=='guidance'&&result.key!=='professional_check'))return null;
  var missing=MILESTONE_CHECKPOINTS[age].items.filter(function(x){return x.domain===domain&&record.answers[x.item_id]==='not_yet';});
  return missing.length?{result:result,items:missing}:null;
}
function loadRegressionReports(){return safeJsonArray(REGRESSION_REPORT_KEY).filter(function(x){return x&&x.regression_id&&x.regression_reported===true&&x.previously_observed===true&&x.capability_id&&/^\d{4}-\d{2}-\d{2}$/.test(x.regression_date||'');});}
function regressionSignal(domain,referenceDate,reports){
  return (reports||loadRegressionReports()).find(function(x){var c=capabilityById(x.capability_id);return c&&c.domain===domain&&x.regression_reported===true&&x.previously_observed===true&&x.regression_date<=(referenceDate||fmt(new Date()));})||null;
}
function checkpointMessage(result){
  if(result.key==='professional_check')return '本次官方相应月龄核对有2项及以上尚未出现。按原表建议，带孩子到医疗机构进行相关检查。';
  if(result.key==='guidance')return '本次官方相应月龄核对有1项尚未出现。按原表建议，加强亲子交流与玩耍，并向医务人员寻求指导和帮助。';
  if(result.key==='complete')return '本次核对的5项均记录为已出现。这份家庭核对不替代专业发育筛查。';
  return '还有项目未明确记录，暂不按官方未出现项数量给出建议。';
}

function renderMilestoneCheckpoint(){
  var box=document.getElementById('milestoneCheckpointSection');if(!box)return;
  var age=ageInfo().totM,definition=checkpointDefinition(age);
  if(!definition){box.innerHTML='';box.hidden=true;return;}
  box.hidden=false;
  if(!checkpointReady(age)){box.innerHTML='<div class="milestone-checkpoint"><h2>'+age+'个月官方节点核对</h2><p>当前该月龄官方内容仍在补充审核。可继续查看普通月龄指南和记录日常观察。</p></div>';return;}
  var monthKey=fmt(new Date()).slice(0,7),saved=savedCheckpoint(age,monthKey),answers=saved&&saved.answers||{},result=checkpointResult(age,answers);
  box.innerHTML='<div class="milestone-checkpoint"><h2>'+age+'个月官方节点核对</h2><p>以下是国家卫健委相应月龄自评表的5项核对内容。请按孩子目前的实际表现逐项选择。</p><form id="milestoneCheckpointForm" onsubmit="saveMilestoneCheckpoint(event)">'+definition.items.map(function(item){var value=answers[item.item_id]||'';return '<fieldset><legend>'+esc(item.product_wording)+'</legend><label><input type="radio" name="'+item.item_id+'" value="observed"'+(value==='observed'?' checked':'')+'> 已出现</label><label><input type="radio" name="'+item.item_id+'" value="not_yet"'+(value==='not_yet'?' checked':'')+'> 尚未出现</label></fieldset>';}).join('')+'<button type="submit" class="btn ds-action-secondary">保存本次核对</button></form>'+(saved?'<p class="milestone-result">'+esc(checkpointMessage(result))+'</p>':'')+'<p class="milestone-source">来源：<a href="'+esc(definition.source_url)+'" target="_blank" rel="noopener">'+esc(definition.source_name)+'</a>。核对项保留官方原意；家庭记录不替代专业筛查。</p></div>';
}
function saveMilestoneCheckpoint(event){
  event.preventDefault();var age=ageInfo().totM,definition=checkpointDefinition(age);if(!checkpointReady(age))return;
  var form=document.getElementById('milestoneCheckpointForm'),answers={};definition.items.forEach(function(item){var choice=form.querySelector('input[name="'+item.item_id+'"]:checked');if(choice)answers[item.item_id]=choice.value;});
  if(Object.keys(answers).length!==definition.items.length){alert('请逐项选择后再保存核对。');return;}
  var monthKey=fmt(new Date()).slice(0,7),rows=loadMilestoneCheckpoints(),record=rows.find(function(x){return x.ageMonths===age&&x.monthKey===monthKey;});
  if(record){record.answers=answers;record.updatedAt=Date.now();}else rows.push({checkpoint_id:uid('checkpoint'),monthKey:monthKey,ageMonths:age,source_url:definition.source_url,answers:answers,createdAt:Date.now(),updatedAt:Date.now()});
  localStorage.setItem(MILESTONE_CHECKPOINT_KEY,JSON.stringify(rows));autoBackup();renderMilestoneCheckpoint();if(window.GrowthPageV2)GrowthPageV2.refresh();
}
function renderRegressionEntry(){
  var select=document.getElementById('regressionCapability'),date=document.getElementById('regressionDate');if(!select)return;
  if(!select.innerHTML)select.innerHTML='<option value="">请选择已掌握的能力</option>'+CAPABILITIES.map(function(c){return '<option value="'+esc(c.capability_id)+'">'+esc(c.label)+'</option>';}).join('');
  if(date&&!date.value)date.value=fmt(new Date());
}
function saveRegressionReport(){
  var id=document.getElementById('regressionCapability').value,date=document.getElementById('regressionDate').value,checked=document.getElementById('regressionConfirmed').checked,note=document.getElementById('regressionNote').value.trim(),notice=document.getElementById('regressionSaveNotice');
  if(!capabilityById(id)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!checked){notice.textContent='请选择能力、日期，并明确确认原来掌握的能力已明显丧失。';return;}
  var rows=loadRegressionReports();rows.push({regression_id:uid('regression'),regression_reported:true,capability_id:id,previously_observed:true,regression_date:date,caregiver_note:note.slice(0,2000),createdAt:Date.now()});localStorage.setItem(REGRESSION_REPORT_KEY,JSON.stringify(rows));autoBackup();
  notice.textContent='已保存。建议及时与儿保或儿科专业人员讨论。';document.getElementById('regressionConfirmed').checked=false;if(window.GrowthPageV2)GrowthPageV2.refresh();
}
