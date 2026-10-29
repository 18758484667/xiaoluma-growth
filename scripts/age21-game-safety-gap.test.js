const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const Module=require('node:module');
const smokeFile=path.join(__dirname,'smoke.test.js');
const loader=new Module(smokeFile,module);
loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0]+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
const holds=ctx.ACTIVITY_AGE21_SAFETY_HOLDS;
const ids=['act_7_撕贴收纳','act_8_瓶盖配对拧动','act_9_翻书找物','act_128_撕彩纸贴贴乐','act_4_颜色配对分类'];
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
function digest(file){return crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file))).digest('hex');}
const mappingHashes=['data/activity-five-brain-mappings.json','data/activity-five-brain-mappings-batch2.json','data/activity-five-brain-mappings-batch3.json'].map(digest);
const raw=ctx.rawActivityCatalog(),catalog=ctx.activityCatalog();
const prefs={duration:'20_plus',context:'home',energy:'high',interests:[]};
check('三个已发现游戏逐项核实材料、玩法及风险',()=>{
  assert.match(ctx.activityById(ids[0]).materials,/贴纸/);assert.match(ctx.activityById(ids[0]).steps.join(' '),/碎片/);
  assert.match(ctx.activityById(ids[1]).materials,/瓶盖/);assert.match(ctx.activityById(ids[1]).steps.join(' '),/瓶盖/);
  assert.match(ctx.activityById(ids[2]).materials,/小贴纸/);assert.match(ctx.activityById(ids[2]).steps.join(' '),/贴纸/);
});
check('另外两项基于具体材料和步骤限制，安全的大件配对游戏保留',()=>{
  assert.match(ctx.activityById(ids[3]).materials,/碎片/);assert.match(ctx.activityById(ids[4]).materials,/小物/);
  for(const id of ['act_123_简易配对','act_132_颜色形状配对','act_13_积木塔'])assert.equal(ctx.activityAvailableAtAge(ctx.activityById(id),21),true,id);
});
check('五项21个月及整个3岁以下不可展示，ID、原年龄窗口和原正文仍在',()=>{
  assert.deepEqual(Object.keys(holds).sort(),ids.slice().sort());
  for(const id of ids){const a=ctx.activityById(id);assert.ok(a);assert.equal(a.min_age_months,18);assert.equal(a.max_age_months,35);assert.equal(a.safety_level,'blocked_under_3');assert.equal(a.content_cleanup_status,'age21_safety_hold');for(const age of [18,21,24,35,36])assert.equal(ctx.activityAvailableAtAge(a,age),false,id+' '+age);assert.equal(ctx.activityLibrarySafe(a,21),false);}
  assert.ok(raw.every(a=>!ids.includes(a.activity_id)||a.safety_review_reason));
});
check('安全治理保留，已审核内容并库后21月57项、21至24月并集84项',()=>{
  assert.equal(catalog.filter(a=>ctx.activityAvailableAtAge(a,21)).length,57);
  assert.equal(new Set([21,22,23,24].flatMap(age=>catalog.filter(a=>ctx.activityAvailableAtAge(a,age)).map(a=>a.activity_id))).size,84);
});
check('Today候选及多条件推荐均不返回受限游戏，其他安全候选足够',()=>{
  for(const p of [prefs,{duration:'10_15',context:'home',energy:'low',interests:[]},{duration:'20_plus',context:'outdoor',energy:'high',interests:[]}]){
    const eligible=ctx.eligibleActivities(21,p,{}),recommended=ctx.recommendActivities(p,21,'2026-10-28',{});
    assert.ok(eligible.length>=3);assert.ok(recommended.length>=3);
    assert.ok(eligible.concat(recommended).every(a=>!ids.includes(a.activity_id)));
  }
});
check('新周计划与旧快照的本周推荐读取均屏蔽受限游戏',()=>{
  const plan=ctx.buildWeeklyPlan('2026-10-28');assert.ok(plan);assert.ok(plan.suggested_activities.every(a=>!ids.includes(a.activity_id)));
  const old={...plan,suggested_activities:[{activity_id:ids[0],domain:'fine'},{activity_id:'gm_roll_fetch',domain:'motor'}]};
  assert.deepEqual(ctx.weeklyPlanActivityIds(old),['gm_roll_fetch']);
});
check('游戏库所有筛选态和旧ID详情入口均不显示受限玩法',()=>{
  for(const age of ['current','all']){ctx.fState.age=age;ctx.fState.favorites=false;ctx.fState.weekly=false;ctx.renderGames();const html=ctx.document.getElementById('gameGrid').innerHTML;for(const id of ids)assert.ok(!html.includes(id),id+' '+age);}
  const before=ctx.selectedGameLibraryId;ctx.openGameDetail(ids[0]);assert.equal(ctx.selectedGameLibraryId,before);
});
check('旧收藏、别名与反馈读取不损坏，隐藏受限收藏但不删存储',()=>{
  const favorites=[{activity_id:ids[0],created_at:'2026-10-01T00:00:00.000Z'},{activity_id:'act_117_追泡泡_推行小车',created_at:'2026-10-01T00:00:00.000Z'}];
  storage.set(ctx.ACTIVITY_FAVORITES_KEY,JSON.stringify(favorites));
  assert.equal(ctx.loadActivityFavorites().length,2);assert.ok(!ctx.validFavoriteIds().includes(ids[0]));
  assert.ok(ctx.validFavoriteIds().includes('act_14_泡泡追跑'));
  assert.equal(JSON.parse(storage.get(ctx.ACTIVITY_FAVORITES_KEY)).length,2);
  storage.set(ctx.ACTIVITY_FEEDBACK_KEY,JSON.stringify([{activity_id:ids[0],date:'2026-10-01',enjoyment:'love'}]));
  assert.equal(ctx.loadActivityFeedback()[0].activity_id,ids[0]);
});
check('安全限制与读取不写成长证据，五脑映射文件和游戏正文数据未修改',()=>{
  const evidence=JSON.stringify(ctx.loadEvidence());ctx.renderGames();ctx.buildWeeklyPlan('2026-10-28');
  assert.equal(JSON.stringify(ctx.loadEvidence()),evidence);
  assert.deepEqual(['data/activity-five-brain-mappings.json','data/activity-five-brain-mappings-batch2.json','data/activity-five-brain-mappings-batch3.json'].map(digest),mappingHashes);
  assert.equal(digest('assets/activity-gap-content.js'),'6eb1085c1d7f8bf886d8001337d704a5a1c2ab8840c160448ff816c70a207fdd');
});
console.log(`Age21 game safety gap: ${passed} passed, 0 failed`);
