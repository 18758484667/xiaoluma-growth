const fs=require('fs'),path=require('path'),Module=require('module');
const smokeFile=path.join(__dirname,'smoke.test.js'),bootstrap=fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0];
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);
loader._compile(bootstrap+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
let passed=0,failed=0;
function check(label,ok){if(ok){passed++;console.log('PASS',label);}else{failed++;console.error('FAIL',label);}}
const raw=ctx.rawActivityCatalog(),p0=ctx.ACTIVITY_CONTENT_CLEANUP,ids=Object.keys(p0);
const byId=Object.fromEntries(raw.map(a=>[a.activity_id,a]));
check('P0 31 项逐项有决策且保留稳定 ID',ids.length===31&&ids.every(id=>byId[id]&&['keep','revise','blocked_under_3','remove_candidate'].includes(p0[id].decision)));
check('P0 分类为 2 keep、14 revise、4 blocked、11 remove',Object.values(p0).filter(x=>x.decision==='keep').length===2&&Object.values(p0).filter(x=>x.decision==='revise').length===14&&Object.values(p0).filter(x=>x.decision==='blocked_under_3').length===4&&Object.values(p0).filter(x=>x.decision==='remove_candidate').length===11);
for(const age of [18,21,24,30,35,36]){
  const rows=ctx.eligibleActivities(age,{duration:'20_plus',context:'home',energy:'high',interests:[]},{}).concat(ctx.eligibleActivities(age,{duration:'20_plus',context:'outdoor',energy:'high',interests:[]},{}));
  check(age+' 月龄无 blocked_under_3 / remove_candidate 推荐',rows.every(a=>!['blocked_under_3','remove_candidate','blocked'].includes(a.safety_level)));
}
check('旧活动 ID 可读取且别名映射到主游戏',ctx.activityById('act_117_追泡泡_推行小车').activity_id==='act_14_泡泡追跑'&&ctx.activityById('act_24_橡皮糖牙签建筑').activity_id==='act_24_橡皮糖牙签建筑');
storage.set(ctx.ACTIVITY_FAVORITES_KEY,JSON.stringify([{activity_id:'act_117_追泡泡_推行小车',created_at:'2026-10-01T00:00:00.000Z'}]));
check('旧 ID 收藏映射且读取不改写存储',ctx.validFavoriteIds().includes('act_14_泡泡追跑')&&JSON.parse(storage.get(ctx.ACTIVITY_FAVORITES_KEY))[0].activity_id==='act_117_追泡泡_推行小车');
storage.set(ctx.ACTIVITY_FEEDBACK_KEY,JSON.stringify([{activity_id:'act_117_追泡泡_推行小车',date:'2026-10-01',enjoyment:'love'}]));
check('旧 ID 反馈映射并保留 variant',ctx.loadActivityFeedback()[0].activity_id==='act_14_泡泡追跑'&&ctx.loadActivityFeedback()[0].variant_id==='act_117_追泡泡_推行小车');
check('小物件危险活动不可推荐', ['act_24_橡皮糖牙签建筑','act_41_数字串珠','act_47_硬币拓印','act_95_弹珠水彩画','act_31_冰格藏宝'].every(id=>!ctx.activityAvailableAtAge(byId[id],21)));
check('气球替换为布球且旧气球版本不显示',byId['act_73_气球与球拍'].materials.includes('布球')&&!byId['act_73_气球与球拍'].steps.join('').includes('气球'));
check('安全修订的标题、简介、材料和步骤不残留危险旧玩法',[
  ['act_33_室内沙粒盒',/沙粒|米粒|豆类/],['act_38_感官游戏大混战',/彩色米|意面|土壤/],
  ['act_55_纸箱电视机',/衣架|锡纸/],['act_73_气球与球拍',/气球/],['act_89_靠垫房屋',/搭房子|屋顶/],
  ['act_92_陶瓷茶具上色',/陶瓷|玻璃/],['act_116_纸转盘',/拉绳|短柄/],['act_131_趣味玩水探索',/洗澡|水盆/]
].every(([id,bad])=>!bad.test([byId[id].title,byId[id].description,byId[id].materials].concat(byId[id].steps).join(' '))));
check('涉水玩法明确全程伸手可及并立即倒空',byId['act_131_趣味玩水探索'].safety_notes.includes('全程')&&byId['act_131_趣味玩水探索'].safety_notes.includes('伸手可及')&&byId['act_131_趣味玩水探索'].steps.join('').includes('倒空'));
check('家具障碍改为地面软垫',!byId['act_118_居家障碍闯关'].steps.join('').includes('椅子')&&byId['act_118_居家障碍闯关'].safety_notes.includes('不使用桌椅'));
ctx.fState.age='all';ctx.fState.cat='all';ctx.fState.src='all';ctx.fState.favorites=false;ctx.renderGames();
const html=ctx.document.getElementById('gameGrid').innerHTML;
ctx.selectedGameLibraryId='act_33_室内沙粒盒';ctx.renderGameDetail();const gameDetail=ctx.document.getElementById('gameLibraryDetail').innerHTML;
check('游戏库详情使用修订步骤且列表隐藏撤出项目',html.includes('大布片触摸盒')&&gameDetail.includes('不用沙粒、米粒、豆类')&&!html.includes('橡皮糖牙签建筑')&&!html.includes('玻璃鱼缸雪球'));
check('游戏库“全部”仍能浏览较大月龄的安全活动，且不显示屏蔽项目',html.includes('轻布球与软拍')&&html.includes('地面胶带绕线走')&&!html.includes('冰格藏宝'));
check('21～24 月龄仍有候选', [21,22,23,24].every(age=>ctx.eligibleActivities(age,{duration:'20_plus',context:'home',energy:'medium',interests:[]},{}).length>=20));
check('21～24月龄很累、家里条件仍各有至少 3 个候选',[21,22,23,24].every(age=>ctx.energyCandidatePool(ctx.eligibleActivities(age,{duration:'10_15',context:'home',energy:'low',interests:[]},{}),{energy:'low'}).length>=3));
check('指南不会引用已撤出活动',ctx.guideActivitiesForBand(ctx.guideForAge(21),21).every(a=>ctx.activityAvailableAtAge(a,21)||a.variants&&a.variants.some(v=>ctx.activityAvailableAtAge(v,21))));
console.log(`Activity cleanup: ${passed} passed, ${failed} failed`);if(failed)process.exit(1);
