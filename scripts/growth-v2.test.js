const fs=require('fs'),path=require('path'),Module=require('module'),vm=require('vm');
const smokeFile=path.join(__dirname,'smoke.test.js'),bootstrap=fs.readFileSync(smokeFile,'utf8').split('let pass = 0;')[0];
const loader=new Module(smokeFile,module);loader.filename=smokeFile;loader.paths=Module._nodeModulePaths(__dirname);loader._compile(bootstrap+'\nmodule.exports={ctx,storage};',smokeFile);
const {ctx,storage}=loader.exports;
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','assets/growth-view-model.js'),'utf8'),ctx);ctx.GrowthViewModel=ctx.window.GrowthViewModel;
const getElement=ctx.document.getElementById;ctx.document.getElementById=id=>['growthV2Root','growthLegacyView'].includes(id)?null:getElement(id);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','assets/growth-plan-v2.js'),'utf8'),ctx);
const render=ctx.window.GrowthPageV2.renderers;
let passed=0,failed=0;function check(name,ok){if(ok){passed++;console.log('PASS',name);}else{failed++;console.error('FAIL',name);}}
const before=JSON.stringify([...storage]);let view=ctx.GrowthViewModel.build();
check('V2空数据适配只读且不创建评估',!view.assessment&&!view.summary&&JSON.stringify([...storage])===before);
check('V2底层保留五领域，前台不再绘制轨迹',view.dimensions.length===5&&view.dimensions.every(d=>d.trajectory===null)&&!render.trajectory&&!render.dimensions);
ctx.ageInfo=()=>({totM:21,y:1,mo:9});
const month=ctx.fmt(new Date()).slice(0,7),today=ctx.fmt(new Date());
function evidence(id,status,index){const c=ctx.capabilityById(id);return {observation_id:'v2-test-'+id,date:today,raw_record:c.label,domains:[c.domain],capability_ids:[id],confirmed:true,evidence_type:status,source:'parent_record',createdAt:Date.now()-index*1000};}
storage.set(ctx.EVIDENCE_KEY,JSON.stringify([evidence('motor_stairs','observed',2),evidence('motor_run','not_yet',1),evidence('motor_jump','not_yet',0)]));
view=ctx.GrowthViewModel.build();let motor=view.dimensions.find(d=>d.domain==='motor');
check('V2轨迹直接复用原选择结果',motor.trajectory.past.capability.capability_id==='motor_stairs'&&motor.trajectory.current.capability.capability_id==='motor_run'&&motor.trajectory.future.capability.capability_id==='motor_jump');
check('V2能力状态来自真实not_yet证据',motor.current.some(x=>x.id==='motor_run'&&x.status==='not_yet'));
check('V2未来能力不列入当前缺失',!motor.current.some(x=>x.id==='motor_jump'));
check('V2底层能力不因领域状态改成emerging',motor.current.some(x=>x.id==='motor_run'&&x.status==='not_yet'));
const summary={month_key:month,age_months:21,overall_summary:'保存的原始总结。继续沿用原记录。',monthly_focus:[],dimensions:{},next_30_days:{},recent_changes:[]};
const assessment={assessment_id:'v2-month',monthKey:month,ageMonths:21,completedAt:Date.now(),selectedCapabilityIds:['motor_run'],answers:{motor_run:{status:'not_yet',confirmed:true}},monthly_growth_summary:summary};
storage.set(ctx.ASSESSMENT_KEY,JSON.stringify([assessment,{...assessment,assessment_id:'v2-previous',monthKey:'2026-01',monthly_growth_summary:{...summary,month_key:'2026-01',overall_summary:'历史快照原文，不重新生成。'}}]));
const persisted=JSON.stringify([...storage]);view=ctx.GrowthViewModel.build();
check('V2本月摘要读取保存的snapshot',view.summary.overall_summary===summary.overall_summary&&render.summary(view).includes(summary.overall_summary));
check('V2评估依据读取原assessment答案',view.dimensions.find(d=>d.domain==='motor').assessmentAnswers[0].answer.status==='not_yet');
check('V2月度档案读取原历史snapshot',view.archives.find(a=>a.month==='2026-01').snapshot.overall_summary==='历史快照原文，不重新生成。');
check('V2观察统计排除月度评估来源',view.observations.every(e=>e.source!=='monthly_assessment'));
for(let i=0;i<5;i++){view=ctx.GrowthViewModel.build();render.summary(view);render.archive(view);}
check('V2反复读取和渲染不改写任何存储',JSON.stringify([...storage])===persisted);
console.log(`Growth V2 adapter: ${passed} passed, ${failed} failed`);if(failed)process.exit(1);
