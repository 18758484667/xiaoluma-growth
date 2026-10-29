const fs=require('fs'),path=require('path'),Module=require('module');
const smokeFile=path.join(__dirname,'smoke.test.js'),bootstrap=fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0];
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(bootstrap+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
let passed=0,failed=0;
function check(label,ok){if(ok){passed++;console.log('PASS',label);}else{failed++;console.error('FAIL',label);}}
function clear(){[ctx.ACTIVITY_EXPOSURE_KEY,ctx.ACTIVITY_PREFERENCE_PROFILE_KEY,ctx.ACTIVITY_FEEDBACK_KEY,ctx.ACTIVITY_FAVORITES_KEY,ctx.TODAY_PLAN_KEY,ctx.EVIDENCE_KEY,ctx.ASSESSMENT_KEY].forEach(k=>storage.delete(k));}
function date(day){return '2026-10-'+String(day).padStart(2,'0');}
function feedback(id,day,enjoyment){let rows=ctx.loadActivityFeedback();rows.push({feedback_id:'sim_'+id+'_'+day,activity_id:id,date:date(day),enjoyment,difficulty:null});storage.set(ctx.ACTIVITY_FEEDBACK_KEY,JSON.stringify(rows));}
const prefs=[
  ['很累/家里/5分钟',{duration:'5',context:'home',energy:'low',interests:[]}],
  ['很累/家里/10–15分钟',{duration:'10_15',context:'home',energy:'low',interests:[]}],
  ['还好/家里',{duration:'10_15',context:'home',energy:'medium',interests:[]}],
  ['有精力/家里',{duration:'10_15',context:'home',energy:'high',interests:[]}],
  ['有精力/户外',{duration:'10_15',context:'outdoor',energy:'high',interests:[]}]
];
function simulate(p,mode){clear();let days=[],target='ball_play';
  for(let n=1;n<=14;n++){
    let items=ctx.todayRecommendations(p,21,date(n),{});days.push(items.map(a=>a.activity_id));ctx.recordActivityExposure(items,'today_home',date(n));
    if(mode==='normal'&&items[0])feedback(items[0].activity_id,n,n%3===0?'love':'okay');
    if((mode==='love'||mode==='no_interest')&&items.length){let match=items.find(a=>ctx.activityPlayType(a)===target)||items[0];feedback(match.activity_id,n,mode==='love'?'love':'no_interest');}
  }
  const sameAdjacent=days.slice(1).filter((row,i)=>row.join('|')===days[i].join('|')).length;
  const canonicalUnique=new Set(days.flat()).size;
  const targetCount=days.flat().filter(id=>ctx.activityPlayType(ctx.activityById(id))===target).length;
  const domainTriple=days.filter(row=>row.length===3&&new Set(row.map(id=>ctx.activityById(id).domains[0])).size===1).length;
  return {sameAdjacent,canonicalUnique,targetCount,domainTriple,days};
}
clear();const catalog=ctx.activityCatalog(),first=catalog[0],second=catalog[1],ref=date(10);
check('曝光按 canonical ID、日期、surface 去重',ctx.recordActivityExposure([first,first],'today_home',ref)===1&&ctx.recordActivityExposure([first],'today_home',ref)===0&&ctx.loadActivityExposures(ref).length===1);
check('首页与换一换分别记 surface',ctx.recordActivityExposure([first],'swap_result',ref)===1&&ctx.loadActivityExposures(ref).length===2);
check('近期展示逐渐恢复且45天外清理',ctx.recentExposurePenalty(first.activity_id,date(11))>ctx.recentExposurePenalty(first.activity_id,date(14))&&ctx.recentExposurePenalty(first.activity_id,date(16))<ctx.recentExposurePenalty(first.activity_id,date(14))&&ctx.loadActivityExposures('2026-12-01').length===0);
check('曝光不写成长或反馈',!storage.has(ctx.EVIDENCE_KEY)&&!storage.has(ctx.ASSESSMENT_KEY)&&!storage.has(ctx.ACTIVITY_FEEDBACK_KEY));
const alias=Object.keys(ctx.ACTIVITY_ALIASES||{})[0];if(alias){clear();ctx.recordActivityExposure([alias],'today_home',ref);check('旧 variant ID 共享 canonical 曝光',ctx.loadActivityExposures(ref)[0].activity_id===ctx.canonicalActivityId(alias)&&ctx.recentExposurePenalty(ctx.canonicalActivityId(alias),ref)>0);}else check('旧 variant ID 共享 canonical 曝光',false);
clear();feedback(first.activity_id,9,'love');const played=ctx.feedbackSummary(first.activity_id,ref).recent*30;ctx.recordActivityExposure([second],'today_home',date(9));check('近期玩过降权强于仅展示',played>ctx.recentExposurePenalty(second.activity_id,ref));
clear();feedback(first.activity_id,7,'no_interest');check('一次没兴趣近期降权',ctx.feedbackSummary(first.activity_id,ref).disliked===1);feedback(first.activity_id,9,'love');check('后来喜欢可解除旧无兴趣降权',ctx.feedbackSummary(first.activity_id,ref).disliked===0);
clear();let profile0=ctx.buildActivityPreferenceProfile(ref);ctx.recordActivityExposure([first],'today_home',date(9));let profile1=ctx.buildActivityPreferenceProfile(ref);check('仅展示不推断兴趣',JSON.stringify(profile0.features)===JSON.stringify(profile1.features));
clear();feedback(first.activity_id,7,'love');feedback(first.activity_id,8,'love');let profile=ctx.buildActivityPreferenceProfile(ref);check('多日明确反馈产生轻量玩法偏好',ctx.activityPreferenceBonus(first,profile)>0&&ctx.activityPreferenceBonus(first,profile)<=6);
clear();const samplePrefs=prefs[2][1],sample=ctx.recommendActivities(samplePrefs,21,date(10),{})[0];storage.set(ctx.ACTIVITY_FAVORITES_KEY,JSON.stringify([{activity_id:sample.activity_id,created_at:date(9)}]));ctx.recordActivityExposure([sample],'today_home',date(9));feedback(sample.activity_id,9,'love');let scored=ctx.activityScore(sample,21,samplePrefs,{},date(10));check('收藏与很喜欢不抵消次日近期降权',scored.score<ctx.activityScore(sample,21,samplePrefs,{},date(20)).score);
clear();const originalBlob=ctx.Blob;ctx.Blob=class{constructor(parts){ctx.__exportedJson=parts.join('');}};ctx.recordActivityExposure([first],'today_home',date(10));ctx.exportData();const exported=JSON.parse(ctx.__exportedJson);check('JSON 导出展示和偏好且不包含整份游戏副本',Array.isArray(exported.activityExposure)&&exported.activityExposure.length===1&&exported.activityPreferenceProfile.version===1&&exported.activityExposure[0].title===undefined);clear();ctx.__fileContent=ctx.__exportedJson;ctx.importData({files:[{}]});check('JSON 导入恢复展示，旧备份仍可用',ctx.loadActivityExposures().length===1&&ctx.loadActivityExposures()[0].activity_id===first.activity_id);ctx.Blob=originalBlob;
clear();let idb={};const oldIdb=ctx.idbSet;ctx.idbSet=(key,value)=>{idb[key]=value;};ctx.recordActivityExposure([first],'today_home',date(10));ctx.saveActivityPreferenceProfile();ctx.autoBackup();check('IndexedDB 备份包含展示与偏好',Array.isArray(idb.activity_exposure_v1)&&idb.activity_preference_profile_v1.version===1);ctx.idbSet=oldIdb;
clear();const available=ctx.eligibleActivities(21,prefs[2][1],{}),ranked=ctx.rankedActivityCandidates(prefs[2][1],21,date(10),{}),diverse=ctx.selectDiverseActivityBatch(ranked,[]);check('前三项避免单一槽位和同一玩法',diverse.length===3&&new Set(diverse.map(a=>a.slot)).size===3&&new Set(diverse.map(a=>ctx.activityPlayType(a))).size>=2);
const report=[];for(const [label,p] of prefs){let modes={};for(const mode of ['passive','normal','love','no_interest'])modes[mode]=simulate(p,mode);report.push({label,modes});check(label+'：14天被动浏览不是固定三项',modes.passive.sameAdjacent<13&&modes.passive.canonicalUnique>3);check(label+'：正常使用有轮换',modes.normal.sameAdjacent<13&&modes.normal.canonicalUnique>3);}
report.forEach(x=>check(x.label+'：明确喜欢相似玩法较没兴趣更常回来',x.modes.love.targetCount>x.modes.no_interest.targetCount));
clear();ctx.document.getElementById('page-home').classList.add('active');ctx.renderTodayActivities();const homeExposures=ctx.loadActivityExposures(),homeEvidence=storage.get(ctx.EVIDENCE_KEY),homeFeedback=storage.get(ctx.ACTIVITY_FEEDBACK_KEY),homePrefs=JSON.stringify(ctx.loadTodayPrefs()),homePlan=JSON.parse(storage.get(ctx.TODAY_PLAN_KEY));ctx.renderTodayActivities();check('首页真实卡片重复 render 仅记录三项曝光',homeExposures.length===3&&ctx.loadActivityExposures().length===3&&homeExposures.every(x=>x.surface==='today_home'));ctx.refreshTodayActivities();const swapped=JSON.parse(storage.get(ctx.TODAY_PLAN_KEY));check('换一换沿用原条件并记录 swap_result',swapped.signature===homePlan.signature&&swapped.activity_ids.join('|')!==homePlan.activity_ids.join('|')&&ctx.loadActivityExposures().some(x=>x.surface==='swap_result')&&JSON.stringify(ctx.loadTodayPrefs())===homePrefs);check('展示与换一换均不写成长证据或反馈',storage.get(ctx.EVIDENCE_KEY)===homeEvidence&&storage.get(ctx.ACTIVITY_FEEDBACK_KEY)===homeFeedback);
const summary=report.map(x=>`| ${x.label} | ${x.modes.passive.canonicalUnique} / ${x.modes.passive.sameAdjacent} | ${x.modes.normal.canonicalUnique} / ${x.modes.normal.sameAdjacent} | ${x.modes.passive.targetCount} / ${x.modes.love.targetCount} / ${x.modes.no_interest.targetCount} | ${x.modes.passive.domainTriple} |`).join('\n');
fs.writeFileSync(path.join(__dirname,'..','activity-rotation-report.md'),'# Phase 2.5C｜14天推荐模拟\n\n21 月龄，固定条件；每个场景独立清空展示与反馈，日期为 2026-10-01～14。正常使用每天对首项反馈；兴趣模式每天对球类（若当日无球类则首项）反馈。每种模式均从空的测试存储重新开始。\n\n| 条件 | 被动：不同主游戏 / 相邻完全相同组 | 正常：不同主游戏 / 相邻完全相同组 | 球类出现次数：被动 / 喜欢 / 没兴趣 | 被动三项同领域天数 |\n|---|---:|---:|---:|---:|\n'+summary+'\n\n同日页面反复渲染不会新增相同日期、同一位置、同一主游戏的展示；数天后允许回访。模拟只操作测试 VM 的内存存储。\n');
console.log(`Activity rotation: ${passed} passed, ${failed} failed`);if(failed)process.exit(1);
