/* Isolated browser profile: no access to the user's saved records. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const RealDate=Date,fixed=RealDate.parse('2026-10-27T10:00:00+08:00');window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};});
 let passed=0;function ok(name,result){assert.ok(result,name);passed++;console.log('PASS',name);}
 const growth=()=>page.evaluate(()=>JSON.stringify([EVIDENCE_KEY,ASSESSMENT_KEY,OBS_KEY,DX_KEY].map(k=>[k,localStorage.getItem(k)])));
 await page.goto('file://'+path.join(__dirname,'..','育儿系统看板.html'));
 await page.waitForFunction(()=>!!weeklyPlanForDate(new Date()));
 const before=await growth();
 ok('首页有轻量本周入口',await page.locator('#homeWeeklyPlan').isVisible());
 ok('首页用自然陪伴语言且不暴露推荐算法',await page.locator('#homeWeeklyPlan').textContent().then(t=>t.includes('这周我们在陪什么')&&!t.includes('推荐会参考')&&!t.includes('主动移动')));
 ok('首页只生成一份本周快照',await page.evaluate(()=>loadWeeklyPlans().length===1));
 await page.locator('#homeWeeklyPlan button').click();
 ok('入口打开本周计划',await page.locator('#page-weekly').isVisible()&&await page.locator('.week-focus').count()>=1);
 ok('周计划展示家长可读主题而非五维课程名',await page.locator('.week-focus h2').allTextContents().then(t=>t.every(x=>!['大运动','精细动作','语言','认知','社会互动','主动移动'].includes(x))));
 ok('五个内部领域都映射为家长可读体验主题',await page.evaluate(()=>['motor','fine','lang','cog','soc'].map(domain=>WeeklyPlanUI.experienceTheme({domain,title:'内部领域'}).title).join('|')==='自己动起来|自己动手完成|把想法说出来|找一找，看看在哪里|我和你轮流来'));
 ok('五个主题说明都描述成长经验',await page.evaluate(()=>{
  const expected={motor:'给她更多自己走、追、搬、去拿东西的自然机会。',fine:'让她多尝试自己拿、放、装、舀和参与简单生活小事。',lang:'多给她表达需要、选择和回应的机会。',cog:'通过藏找、寻找和简单配对，让她多体验东西在哪里、怎么找到。',soc:'在简单互动里体验等一等、轮到我、轮到你。'};
  return Object.entries(expected).every(([domain,description])=>WeeklyPlanUI.experienceTheme({domain,title:'内部领域',target_experience:'具体游戏步骤'}).description===description);
 }));
 ok('不匹配的指南机会不会覆盖认知主题说明',await page.evaluate(()=>WeeklyPlanUI.experienceTheme({domain:'cog',title:'探索与寻找',capability_ids:['cog_find']},{opportunities:[{capability_ids:['cog_find'],text:'让她递衣服、搬轻篮子、参与手边的家务。'}]}).description==='通过藏找、寻找和简单配对，让她多体验东西在哪里、怎么找到。'));
 ok('主题说明与游戏、生活机会分区展示',await page.evaluate(()=>{
  const focus=[...document.querySelectorAll('.week-focus p')].map(x=>x.textContent),games=[...document.querySelectorAll('.week-game')].map(x=>x.textContent),life=[...document.querySelectorAll('.week-life li')].map(x=>x.textContent);
  return focus.length>0&&games.length>0&&life.length>0&&focus.every(x=>!games.includes(x)&&!life.includes(x));
 }));
 ok('选择原因默认折叠',await page.locator('.week-why').count()>=1&&await page.locator('.week-why[open]').count()===0);
 ok('周计划显示游戏、生活机会和观察提示',await page.locator('.week-game').count()>=1&&await page.locator('.week-life li').count()>=1&&await page.locator('.week-observe li').count()>=1);
 ok('游戏不重复且可直接收藏',await page.evaluate(()=>{const ids=[...document.querySelectorAll('.week-game')].map(x=>x.dataset.activityId);return ids.length===new Set(ids).size&&ids.length>=3&&ids.length<=5;})&&await page.locator('.week-favorite').count()>=1);
 const saved=await page.evaluate(()=>localStorage.getItem(WEEKLY_PLAN_KEY));
 await page.locator('.week-back').click();await page.locator('#homeWeeklyPlan button').click();
 ok('返回再打开只读',await page.evaluate(()=>localStorage.getItem(WEEKLY_PLAN_KEY))===saved&&await growth()===before);
 await page.locator('.week-actions button').click();
 ok('显式更新仍是一份本周快照',await page.evaluate(()=>loadWeeklyPlans().length===1&&!!weeklyPlanForDate(new Date()).updated_at));
 await page.locator('.week-game-open').first().click();
 ok('周计划游戏打开现有详情',await page.locator('#gameLibraryDetail').isVisible());
 await page.locator('.game-detail-back').click();await page.locator('#gameWeeklyTab').click();
 ok('游戏库本周过滤使用同一份主游戏',await page.evaluate(()=>fState.weekly&&[...document.querySelectorAll('#gameGrid .game-card')].every(c=>weeklyPlanActivityIds(weeklyPlanForDate(new Date())).includes(c.dataset.activityId))));
 await page.locator('#navBrain').click();
 ok('成长页本周计划入口可用',await page.locator('#gvSummary').getByRole('button',{name:/查看本周早教计划/}).count()===1);
 await page.locator('#gvSummary').getByRole('button',{name:/查看本周早教计划/}).click();
 ok('成长页跳转本周页且导航归属成长',await page.locator('#page-weekly').isVisible()&&await page.locator('#navBrain').getAttribute('aria-current')==='page');
 const out=path.join(__dirname,'..','qa-screenshots');fs.mkdirSync(out,{recursive:true});
 for(const [name,width,height] of [['390',390,844],['430',430,932],['pc',1440,1000]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
  ok(name+' 周计划无横向滚动',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(name==='390')ok('390 首屏能看到主题与第一款游戏',await page.evaluate(()=>document.querySelector('.week-focus').getBoundingClientRect().top<320&&document.querySelector('.week-game').getBoundingClientRect().top<760));
  await page.screenshot({path:path.join(out,'weekly-plan-'+name+'.png'),fullPage:true});
 }
 ok('浏览未写成长数据',await growth()===before);
 ok('观察区为自然留意且无任务打卡',await page.locator('#page-weekly').textContent().then(t=>t.includes('这周顺便看看')&&t.includes('没有出现也不用专门测试')&&!t.includes('完成率')&&!t.includes('周一玩')));
 await page.evaluate(()=>{
  const stamp=Date.now(),month=fmt(new Date()).slice(0,7),date=fmt(new Date());
  localStorage.setItem(EVIDENCE_KEY,JSON.stringify([
   {observation_id:'qa-stairs',date,raw_record:'扶栏上楼梯',domains:['motor'],capability_ids:['motor_stairs'],evidence_strength:1,evidence_type:'observed',source:'parent_record',confirmed:true,createdAt:stamp},
   {observation_id:'qa-run',date,raw_record:'会跑尚未出现',domains:['motor'],capability_ids:['motor_run'],evidence_strength:1,evidence_type:'not_yet',source:'parent_record',confirmed:true,createdAt:stamp},
   {observation_id:'qa-jump',date,raw_record:'双脚跳尚未出现',domains:['motor'],capability_ids:['motor_jump'],evidence_strength:1,evidence_type:'not_yet',source:'parent_record',confirmed:true,createdAt:stamp}
  ]));
  localStorage.setItem(ASSESSMENT_KEY,JSON.stringify([{assessment_id:'qa-month',monthKey:month,completedAt:stamp,monthly_growth_summary:{monthly_focus:[{domain:'motor'}]}}]));
  updateWeeklyPlan();WeeklyPlanUI.render();
 });
 const evidenceBefore=await page.evaluate(()=>localStorage.getItem(EVIDENCE_KEY));
 ok('21个月案例呈现自己动起来且不变成训练',await page.locator('.week-focus h2').allTextContents().then(t=>t.includes('自己动起来'))&&await page.locator('#page-weekly').textContent().then(t=>!['练习跑步','训练跑','练习跳跃','本周学会跑','强化大运动'].some(x=>t.includes(x))));
 await page.locator('.week-why summary').first().click();await page.locator('.week-why summary').first().click();
 ok('展开和收起依据仍不写成长证据',await page.evaluate(()=>localStorage.getItem(EVIDENCE_KEY))===evidenceBefore);
 ok('没有浏览器脚本错误',errors.length===0);
 console.log(`Weekly plan browser: ${passed} passed, 0 failed`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
