/* Run in an isolated browser profile. No real localStorage is read or modified. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const RealDate=Date,fixed=RealDate.parse('2026-10-26T10:00:00+08:00');window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};});
 let passed=0;const ok=(name,condition)=>{assert.ok(condition,name);passed++;console.log('PASS',name);};
 const store=()=>page.evaluate(()=>JSON.stringify([EVIDENCE_KEY,ASSESSMENT_KEY,OBS_KEY,DX_KEY,MILESTONE_CHECKPOINT_KEY,REGRESSION_REPORT_KEY].map(k=>[k,localStorage.getItem(k)])));
 await page.goto('file://'+path.join(__dirname,'..','育儿系统看板.html'));await page.waitForFunction(()=>window.GrowthPageV2&&document.getElementById('gvPageMeta').textContent);
 await page.locator('#navBrain').click();
 ok('正式成长页默认五脑成长观察且无旧展示层',await page.locator('#gvPanel-observation').isVisible()&&await page.locator('#gvFiveBrainMap .gv-brain-group').count()===5&&await page.locator('#growthLegacyView').count()===0);
 ok('成长页不再有常驻备份条',await page.locator('#backupBar').count()===0&&await page.locator('.mobile-data-entry .backup-notice-dot').isVisible());
 await page.reload();await page.locator('#navBrain').click();
 ok('刷新后备份状态仍只在设置入口提示',await page.locator('#backupBar').count()===0&&await page.locator('.mobile-data-entry .backup-notice-dot').isVisible());
 ok('四个顶部Tab存在',await page.locator('#growthV2Root [role=tab]').count()===4);
 const emptyStore=await store();
 for(const name of ['成长观察','月度档案','成长评估','本月总结'])await page.getByRole('tab',{name,exact:true}).click();
 ok('空数据切Tab不创建评估证据或快照',await store()===emptyStore);
 ok('表单与容器无重复ID',await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size;}));
 ok('旧版开关和样式已移除',await page.evaluate(()=>typeof setGrowthViewV2==='undefined'&&typeof GROWTH_VIEW_V2==='undefined'&&!document.getElementById('growthLegacyStyles')));
 await page.getByRole('tab',{name:'月度档案',exact:true}).click();
 ok('月度档案不混入备份管理',await page.locator('#gvPanel-archive').getByText('导出全部数据').count()===0&&await page.locator('#gvPanel-archive').getByText('导入备份').count()===0);
 await page.getByRole('tab',{name:'本月总结',exact:true}).click();
 await page.getByRole('button',{name:'数据管理',exact:true}).click();
 ok('独立数据管理保留导入导出',await page.locator('#dataManagementDialog').isVisible()&&await page.getByRole('button',{name:'导出全部数据'}).count()===1&&await page.getByRole('button',{name:'导入备份'}).count()===1);
 await page.getByRole('button',{name:'关闭数据管理'}).click();
 ok('数据管理打开关闭不写成长记录',await store()===emptyStore);
 // Synthetic answers enter the existing completion path; summary generation is never called by V2.
 await page.evaluate(()=>{
   const a=assessmentDraft();if(!a.selectedCapabilityIds.includes('motor_run'))a.selectedCapabilityIds.push('motor_run');
   for(const id of a.selectedCapabilityIds)a.answers[id]={status:id==='motor_run'?'observed':'unobserved',confirmed:true,answeredAt:Date.now()};
   localStorage.setItem(ASSESSMENT_KEY,JSON.stringify([a]));
   const c=capabilityById('motor_stairs');localStorage.setItem(EVIDENCE_KEY,JSON.stringify([{observation_id:'qa-stairs',date:'2026-10-25',raw_record:c.label,domains:['motor'],capability_ids:[c.capability_id],evidence_type:'observed',source:'parent_record',confirmed:true,createdAt:Date.now()-86400000}]));
   renderAssessment();GrowthPageV2.refresh();
 });
 await page.getByRole('tab',{name:'成长评估',exact:true}).click();await page.locator('#finishAssessmentBtn').click();
 ok('完成原评估后V2显示已保存总结',await page.locator('#gvPanel-summary').isVisible()&&await page.evaluate(()=>!!currentAssessment().monthly_growth_summary));
 await page.getByRole('tab',{name:'成长评估',exact:true}).click();await page.locator('#dxList .assessment-edit-link').click();
 // Use original edit navigation to locate the running question; answer through the visible original UI.
 await page.evaluate(()=>{const a=currentAssessment();assessmentEditIndex=a.selectedCapabilityIds.indexOf('motor_run');renderAssessment();});
 await page.locator('#dxList .obs-btns').getByRole('button',{name:'尚未出现',exact:true}).click();await page.getByRole('button',{name:'保存修改',exact:true}).click();
 ok('修改原评估后V2返回总结并同步快照',await page.locator('#gvPanel-summary').isVisible()&&await page.evaluate(()=>currentAssessment().answers.motor_run.status==='not_yet'&&loadAssessments().length===1));
 const vm=await page.evaluate(()=>{const v=GrowthViewModel.build(),d=v.dimensions.find(x=>x.domain==='motor');return {past:d.trajectory.past.capability.capability_id,current:d.trajectory.current.capability.capability_id,status:growthTimelineEvidenceStatus(d.trajectory.current),future:d.trajectory.future.capability.capability_id};});
 ok('V2轨迹复用21月龄真实证据',vm.past==='motor_stairs'&&vm.current==='motor_run'&&vm.status==='not_yet'&&vm.future==='motor_jump');
 ok('重点默认展示原建议里的行动句',(await page.locator('.gv-focus-action').first().textContent()).includes('提供'));
 ok('专业五维旧判定仍存在但不再作为前台主模块',vm.past==='motor_stairs'&&await page.locator('#gvTrajectory, #gvDimensions').count()===0);
 await page.getByRole('tab',{name:'成长观察',exact:true}).click();
 ok('五脑地图不把会跑尚未出现当负向观察',await page.locator('#gvFiveBrainMap').textContent().then(x=>!x.includes('会跑')&&!x.includes('符合当前阶段')&&!x.includes('正在发展')));
 await page.evaluate(()=>{const rows=loadAssessments(),old=JSON.parse(JSON.stringify(rows[0]));old.assessment_id='qa-history';old.monthKey='2026-09';old.monthly_growth_summary.month_key='2026-09';old.monthly_growth_summary.overall_summary='九月保存的原始快照，不能被当前规则覆盖。';localStorage.setItem(ASSESSMENT_KEY,JSON.stringify(rows.concat(old)));GrowthPageV2.refresh();});
 const beforeRead=await store();
 await page.getByRole('tab',{name:'月度档案',exact:true}).click();await page.locator('.gv-month-button').filter({hasText:'2026年9月'}).click();
 ok('月度档案读取历史snapshot原文',(await page.locator('#gvArchiveDetail').textContent()).includes('九月保存的原始快照，不能被当前规则覆盖。'));
 await page.getByRole('button',{name:'返回历史月份'}).click();
 for(const name of ['成长观察','成长评估','本月总结'])await page.getByRole('tab',{name,exact:true}).click();
 await page.getByRole('tab',{name:'本月总结',exact:true}).click();await page.locator('#gvGuide>summary').click();await page.reload();await page.locator('#navBrain').click();
 ok('历史展开返回指南和刷新均不写成长数据',await store()===beforeRead);
 const oldSnapshot=await page.evaluate(()=>JSON.stringify(loadAssessments().find(a=>a.monthKey==='2026-09')));
 await page.evaluate(()=>{const rows=loadAssessments();rows.find(a=>a.monthKey==='2026-10').monthly_growth_summary.overall_summary='待主动更新的旧总结';localStorage.setItem(ASSESSMENT_KEY,JSON.stringify(rows));GrowthPageV2.refresh();});
 await page.getByRole('tab',{name:'本月总结',exact:true}).click();await page.getByRole('button',{name:'更新本月总结 ↻',exact:true}).click();
 ok('显式更新调用原路径并刷新V2',!(await page.locator('#gvSummary').textContent()).includes('待主动更新的旧总结'));
 ok('更新本月总结不改历史snapshot',await page.evaluate(()=>JSON.stringify(loadAssessments().find(a=>a.monthKey==='2026-09')))===oldSnapshot);
 await page.getByRole('tab',{name:'成长观察',exact:true}).click();await page.locator('#obsNote').fill('今天扶着栏杆走上一级台阶。');await page.locator('#obsDomain').selectOption('motor');await page.getByRole('button',{name:'保存观察',exact:true}).click();
 ok('原观察保存路径可用且V2刷新',(await page.locator('#gvObservations').textContent()).includes('今天扶着栏杆走上一级台阶。'));

 await page.evaluate(()=>{window.__qaAgeInfo=ageInfo;ageInfo=()=>({totM:30,y:2,mo:6});renderMilestoneCheckpoint();GrowthPageV2.refresh();});
 await page.getByRole('tab',{name:'成长评估',exact:true}).click();
 ok('30月龄待审核不出现可提交核对',!(await page.locator('#milestoneCheckpointForm').count())&&(await page.locator('#gvCheckpointAvailability').textContent()).includes('30月龄 · 待审核'));
 await page.evaluate(()=>{ageInfo=()=>({totM:24,y:2,mo:0});renderMilestoneCheckpoint();GrowthPageV2.refresh();});
 ok('已审核24月龄复用原核对表单',await page.locator('#milestoneCheckpointForm fieldset').count()===5);
 await page.evaluate(()=>{ageInfo=window.__qaAgeInfo;renderMilestoneCheckpoint();GrowthPageV2.refresh();});
 // Keep realistic source records and capture all layouts with no transient success message.
 await page.reload();await page.locator('#navBrain').click();
 const out=path.join(__dirname,'..','qa-screenshots');fs.mkdirSync(out,{recursive:true});
 for(const [name,width,height] of [['390',390,844],['430',430,932],['desktop',1440,1000]]){
  await page.setViewportSize({width,height});
  for(const tabName of ['本月总结','成长观察','月度档案','成长评估']){
   await page.getByRole('tab',{name:tabName,exact:true}).click();
   ok(name+' '+tabName+'无横向滚动',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(name==='390'){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'growth-v2-390-'+({'本月总结':'summary','成长观察':'observation','月度档案':'archive','成长评估':'assessment'}[tabName])+'.png')});}
  }
  await page.getByRole('tab',{name:'本月总结',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,'growth-v2-'+name+'.png'),fullPage:false});
  if(name==='desktop')ok('PC成长内容限制在800px',await page.locator('#growthV2Root').evaluate(e=>e.getBoundingClientRect().width<=800));
 }
 ok('浏览器无运行异常',errors.length===0);
 console.log(`Growth V2 browser: ${passed} passed, 0 failed`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
