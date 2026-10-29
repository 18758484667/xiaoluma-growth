/* Isolated browser profile; does not read or write the user's saved records. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let passed=0;function ok(name,result){assert.ok(result,name);passed++;console.log('PASS',name);}
  await page.goto('file://'+path.join(__dirname,'..','育儿系统看板.html'));
  const before=await page.evaluate(()=>[localStorage.getItem(EVIDENCE_KEY),localStorage.getItem(ASSESSMENT_KEY),localStorage.getItem(WEEKLY_PLAN_KEY),localStorage.getItem(ACTIVITY_FEEDBACK_KEY)]);
  await page.locator('#navTheory').click();
  ok('旧脑科学页面仍可打开',await page.locator('#page-theory').isVisible());
  ok('原有两组六张知识卡仍完整显示',await page.locator('#theoryBrain .theory-card').count()===6&&await page.locator('#theoryMem .theory-card').count()===6);
  ok('卡片标题、来源及原文来自结构化数据',await page.evaluate(()=>{const first=BRAIN_KNOWLEDGE[0],card=document.querySelector('#theoryBrain .theory-card');return card.querySelector('h4').textContent.includes(first.title)&&card.querySelector('.source-badge').textContent===first.source_short_name&&card.querySelector('.t-metaphor').textContent===first.metaphor&&card.querySelector('.t-scene').textContent===first.scene&&card.querySelector('.t-text').textContent===first.why&&card.querySelector('.t-action').textContent===first.action;}));
  ok('12条旧内容全部未审核且自动连接为空',await page.evaluate(()=>BRAIN_KNOWLEDGE.every(k=>k.review_status==='unreviewed')&&BrainKnowledgeFoundation.forTheme('自己动起来',21,'why_theme').length===0));
  ok('浏览知识页不写成长、周计划或游戏反馈',JSON.stringify(await page.evaluate(()=>[localStorage.getItem(EVIDENCE_KEY),localStorage.getItem(ASSESSMENT_KEY),localStorage.getItem(WEEKLY_PLAN_KEY),localStorage.getItem(ACTIVITY_FEEDBACK_KEY)]))===JSON.stringify(before));
  ok('无浏览器脚本错误',errors.length===0);
  console.log(`Brain knowledge browser: ${passed} passed, 0 failed`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
