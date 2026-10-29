/* Isolated responsive navigation check; user storage is never touched. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const RealDate=Date,fixed=RealDate.parse('2026-10-26T10:00:00+08:00');window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};});
 let passed=0;function ok(name,value){assert.ok(value,name);passed++;console.log('PASS',name);}
 const growth=()=>page.evaluate(()=>JSON.stringify([EVIDENCE_KEY,ASSESSMENT_KEY,OBS_KEY,DX_KEY].map(k=>[k,localStorage.getItem(k)])));
 await page.goto('file://'+path.join(__dirname,'..','育儿系统看板.html'));
 const before=await growth(),labels=await page.locator('nav.nav > button .nav-label').allTextContents();
 ok('一级导航只有今天成长游戏脑科学',labels.join('|')==='今天|成长|游戏|脑科学');
 ok('生活与我的内容保留但退出一级导航',await page.locator('#page-life').count()===1&&await page.locator('#page-me').count()===1&&!labels.includes('生活')&&!labels.includes('我的'));
 ok('四项使用同一组 SVG 图标',await page.locator('nav.nav > button .nav-icon use').count()===4);
 for(const [id,section] of [['navHome','home'],['navBrain','brain'],['navGames','games'],['navTheory','theory']]){
  await page.locator('#'+id).click();ok(section+' 页面与 active 同步',await page.locator('#page-'+section).isVisible()&&await page.locator('#'+id).getAttribute('aria-current')==='page'&&await page.locator('nav.nav > button.active').count()===1);
 }
 await page.locator('.mobile-data-entry').click();
 ok('手机右上角打开原数据管理',await page.locator('#dataManagementDialog').isVisible()&&await page.getByRole('button',{name:'导出全部数据'}).count()===1);
 await page.getByRole('button',{name:'关闭数据管理'}).click();
 await page.locator('#navBrain').click();await page.getByRole('tab',{name:'成长评估'}).click();await page.getByRole('button',{name:'发展里程碑 →'}).click();
 ok('发展里程碑归属成长并可返回',await page.locator('#page-milestone').isVisible()&&await page.locator('#navBrain').getAttribute('aria-current')==='page');
 await page.locator('#page-milestone .nav-return-link').click();ok('返回成长保留原评估页签',await page.locator('#page-brain').isVisible()&&await page.locator('#gvPanel-assessment').isVisible());
 await page.locator('#navGames').click();await page.locator('#gameFilterPanel button[onclick="setF(this,\'energy\',\'low\')"]').click();
 await page.locator('#gameGrid .game-card').first().locator('.library-favorite').click();const favorites=await page.locator('#favoriteCount').textContent();
 await page.locator('#navTheory').click();await page.locator('#navHome').click();await page.locator('#navGames').click();
 ok('切页保留游戏筛选和收藏',await page.evaluate(()=>fState.energy==='low')&&await page.locator('#favoriteCount').textContent()===favorites);
 const out=path.join(__dirname,'..','qa-screenshots');fs.mkdirSync(out,{recursive:true});
 for(const [name,width,height] of [['390',390,844],['430',430,932],['768',768,960],['1280',1280,900]]){
  await page.setViewportSize({width,height});await page.locator('#navHome').click();await page.evaluate(()=>window.scrollTo(0,0));
  const geometry=await page.locator('nav.nav').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,bottom:r.bottom,width:r.width,height:r.height,pageWidth:document.documentElement.scrollWidth};});
  ok(name+' 四导航且无横向滚动',await page.locator('nav.nav > button').count()===4&&geometry.pageWidth<=width);
  if(width<900){ok(name+' 底部固定导航和右上设置',Math.abs(geometry.bottom-height)<2&&Math.abs(geometry.width-width)<2&&await page.locator('.mobile-data-entry').isVisible());}
  else{ok(name+' 左栏导航和底部数据管理',Math.abs(geometry.left)<2&&Math.abs(geometry.top)<2&&geometry.width>=160&&await page.locator('.nav-settings button').isVisible()&&!(await page.locator('.mobile-data-entry').isVisible()));}
  await page.screenshot({path:path.join(out,'navigation-'+name+'.png')});
 }
 ok('页面浏览不写成长数据',await growth()===before);
 ok('无浏览器脚本异常',errors.length===0);
 console.log(`Navigation browser: ${passed} passed, 0 failed`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
