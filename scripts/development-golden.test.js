// Confirmed Phase 1.10A product boundaries, run against the browser implementation.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const smokeFile = path.join(__dirname, 'smoke.test.js');
const bootstrap = fs.readFileSync(smokeFile, 'utf8').split('let pass = 0;')[0];
if (!bootstrap.includes('vm.runInContext(script, ctx')) throw new Error('Smoke bootstrap changed');
const loader = new Module(smokeFile, module);
loader.filename = smokeFile;
loader.paths = Module._nodeModulePaths(__dirname);
loader._compile(bootstrap + '\nmodule.exports = { ctx };', smokeFile);
const { ctx } = loader.exports;

const referenceDate = '2026-10-15';
const evidence = (id, cap, status, date = '2026-10-05', source = 'monthly_assessment', extra = {}) => {
  const c = ctx.capabilityById(cap);
  return { observation_id:id, date, raw_record:c.label, domains:[c.domain], capability_ids:[cap],
    evidence_strength:source==='monthly_assessment'?2:1, evidence_type:status, source,
    confirmed:true, createdAt:Date.parse(date+'T12:00:00'), ...extra };
};
const state = (domain, age, rows) => ctx.evaluateDomainState(domain, age, rows, referenceDate);
const summary = (age, rows) => ctx.generateMonthlyGrowthSummary({
  assessment:{assessment_id:'golden',monthKey:'2026-10',ageMonths:age,completedAt:Date.parse(referenceDate+'T12:00:00'),
    selectedCapabilityIds:rows.filter(x=>x.source==='monthly_assessment').flatMap(x=>x.capability_ids),answers:{}},
  evidence:rows,referenceDate,prefs:{duration:'10_15',context:'home',energy:'medium',interests:[]}
});
const repeated = (prefix, cap, status = 'not_yet') => [
  evidence(prefix+'1',cap,status,'2026-09-05','parent_record'),
  evidence(prefix+'2',cap,status,'2026-10-05','monthly_assessment')
];

const cases = [
  ['G01', '21月龄扶栏上楼梯已会、跑和跳尚未出现：不 concern', () => {
    const s=state('motor',21,[evidence('a','motor_stairs','observed'),evidence('b','motor_run','not_yet'),evidence('c','motor_jump','not_yet')]);
    return s.key!=='concern';
  }],
  ['G02', '21月龄未来双脚跳 not_yet 不改变状态', () => {
    const rows=[evidence('a','motor_stairs','observed'),evidence('b','motor_run','not_yet')];
    return state('motor',21,rows).key===state('motor',21,rows.concat(evidence('c','motor_jump','not_yet'))).key;
  }],
  ['G03', '21月龄未来双脚跳 not_yet 不抬高证据充分度', () => {
    const rows=[evidence('a','motor_run','not_yet')];
    return state('motor',21,rows).evidenceLevel===state('motor',21,rows.concat(evidence('b','motor_jump','not_yet'))).evidenceLevel;
  }],
  ['G04', '21月龄短期 next observation 不越级到跳', () => !summary(21,[evidence('a','motor_stairs','observed'),evidence('b','motor_run','not_yet'),evidence('c','motor_jump','not_yet')]).dimensions.motor.next_observation.includes('跳')],
  ['G05', '21月龄本月重点为自然移动机会', () => summary(21,[evidence('a','motor_stairs','observed'),evidence('b','motor_run','not_yet')]).monthly_focus.some(x=>x.domain==='motor'&&x.type==='opportunity')],
  ['G06', '21月龄当前窗口单项跑 not_yet 不 concern', () => state('motor',21,[evidence('a','motor_run','not_yet')]).key!=='concern'],
  ['G07', '24月龄跑 not_yet 不因单项直接 concern', () => state('motor',24,[evidence('a','motor_run','not_yet')]).key!=='concern'],
  ['G08', '24月龄双脚跳 not_yet 不因单项直接 concern', () => state('motor',24,[evidence('a','motor_jump','not_yet')]).key!=='concern'],
  ['G09', '家长担忧独立保存且不强制 concern', () => {const s=state('motor',21,[evidence('a','motor_stairs','observed'),evidence('b','motor_run','not_yet','2026-10-05','monthly_assessment',{caregiver_concern:true})]);return s.caregiverConcern&&s.key!=='concern';}],
  ['G10', '旧版 concern 证据按主观担忧兼容读取', () => {const s=state('lang',21,[evidence('a','lang_two_words','concern')]);return s.caregiverConcern&&s.key!=='concern';}],
  ['G11', '无证据为 unknown', () => state('fine',21,[]).key==='unknown'],
  ['G12', '只有 unobserved 为 unknown 且充分度 low', () => {const s=state('fine',21,[evidence('a','fine_pages','unobserved')]);return s.key==='unknown'&&s.evidenceLevel==='low';}],
  ['G13', 'product observation 不能单独 concern', () => state('lang',30,repeated('a','lang_request')).key!=='concern'],
  ['G14', '一项过期官方锚点持续缺失可 watch', () => state('lang',30,repeated('a','lang_words')).key==='watch'],
  ['G15', '普通记录即使多项已过窗口也不自动 concern', () => state('lang',30,repeated('a','lang_words').concat(repeated('b','lang_two_words'))).key!=='concern'],
  ['G16', '结构化确认能力倒退进入高优先级', () => ctx.evaluateDomainState('motor',21,[],referenceDate,{regression:{regression_reported:true,previously_observed:true,capability_id:'motor_stairs',regression_date:referenceDate}}).key==='concern'],
  ['G17', '适龄已观察到两项官方能力可维持正向状态', () => ['on_track','rich'].includes(state('fine',24,[evidence('a','fine_pages','observed'),evidence('b','fine_spoon_eat','observed')]).key)],
  ['G18', '未来30月龄颜色 not_yet 不触发 watch', () => state('cog',27,[evidence('a','cog_color_one','not_yet')]).key!=='watch'],
  ['G19', '未来30月龄同伴能力 not_yet 不触发 concern', () => state('soc',27,[evidence('a','soc_peers','not_yet')]).key!=='concern'],
  ['G20', '只有家长担忧且没有能力事实仍为 unknown', () => state('lang',21,[evidence('a','lang_two_words','unobserved','2026-10-05','parent_record',{caregiver_concern:true})]).key==='unknown'],
  // Deliberately stricter source-alignment cases; failures require content/rule review.
  ['G21', '18月龄官方核对单项未出现给原表指导', () => ctx.checkpointResult(18,Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[18].items.map((x,i)=>[x.item_id,i===0?'not_yet':'observed']))).key==='guidance'],
  ['G22', '24月龄官方核对两项未出现给原表检查建议', () => ctx.checkpointResult(24,Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[24].items.map((x,i)=>[x.item_id,i<2?'not_yet':'observed']))).key==='professional_check'],
  ['G23', '家长写“没有倒退”不应被误判为能力倒退', () => state('motor',21,[evidence('a','motor_stairs','observed','2026-10-05','parent_record',{raw_record:'没有倒退，仍会扶栏上楼梯'})]).key!=='concern'],
  ['G24', '较新 observed 应消除同一能力旧 not_yet 的冲突升级', () => state('lang',30,[evidence('a','lang_words','not_yet','2026-09-05'),evidence('b','lang_words','observed','2026-10-05')]).key!=='watch'],
  ['G25', 'adapted anchor 不与单一 official anchor 合并触发 concern', () => state('cog',30,repeated('a','cog_object_use').concat(repeated('b','cog_pretend'))).key!=='concern'],
  ['G26', '18月龄今天留意不应出现24月龄双脚跳', () => !ctx.todayObservationCandidates(18).some(x=>x.capability.capability_id==='motor_jump')],
  ['G27', '21月龄评估题集不应将24月龄双脚跳作为当前能力', () => !ctx.assessmentQuestionSet(21).some(x=>x.capability_id==='motor_jump')],
  ['G28', '多能力混合证据中的未来 not_yet 不抬高充分度', () => {const base=[evidence('a','motor_run','not_yet')],mixed={...evidence('b','motor_run','not_yet'),capability_ids:['motor_run','motor_jump']};return state('motor',21,base.concat(mixed)).evidenceSummary.capabilities===1;}],
  ['G29', '今天留意应把正在出现的当前能力正确排在前面', () => {ctx.saveEvidence([evidence('a','motor_run','emerging')]);return ctx.todayObservationCandidates(21).find(x=>x.capability.capability_id==='motor_run')?.priority===0;}],
  ['G30', '旧版 concern 评估答案编辑时应预填额外担忧', () => ctx.assessmentQuestionHtml(ctx.capabilityById('motor_run'),{status:'concern'},true).includes('assessment-concern active')],
  ['G31', '18月龄官方节点具备5项完整原意与来源', () => ctx.checkpointReady(18)&&ctx.MILESTONE_CHECKPOINTS[18].items.every(x=>x.original_meaning&&x.product_wording&&x.item_id)],
  ['G32', '24月龄官方节点具备5项完整原意与来源', () => ctx.checkpointReady(24)&&ctx.MILESTONE_CHECKPOINTS[24].items.every(x=>x.original_meaning&&x.product_wording&&x.item_id)],
  ['G33', '30月龄官方节点审核中且不能执行', () => !ctx.checkpointReady(30)&&ctx.checkpointResult(30,{}).key==='pending_review'],
  ['G34', '36月龄官方节点审核中且不能执行', () => !ctx.checkpointReady(36)&&ctx.checkpointResult(36,{}).key==='pending_review'],
  ['G35', '关键月龄未答满5项不计算未出现数量', () => ctx.checkpointResult(18,{nhc18_motor_stairs:'not_yet'}).key==='incomplete'],
  ['G36', '18月龄5项已出现只显示核对完成', () => ctx.checkpointResult(18,Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[18].items.map(x=>[x.item_id,'observed']))).key==='complete'],
  ['G37', '24月龄1项未出现按官方指导', () => ctx.checkpointResult(24,Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[24].items.map((x,i)=>[x.item_id,i===0?'not_yet':'observed']))).key==='guidance'],
  ['G38', '18月龄2项未出现按官方检查建议', () => ctx.checkpointResult(18,Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[18].items.map((x,i)=>[x.item_id,i<2?'not_yet':'observed']))).key==='professional_check'],
  ['G39', '全局4月缓冲不改变官方节点结果', () => {const a=Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[24].items.map((x,i)=>[x.item_id,i===0?'not_yet':'observed']));const before=ctx.checkpointResult(24,a).key;ctx.CAPABILITY_GRACE_MONTHS=100;const after=ctx.checkpointResult(24,a).key;ctx.CAPABILITY_GRACE_MONTHS=4;return before==='guidance'&&after===before;}],
  ['G40', '能力元数据具备机器可读来源及审核状态', () => ctx.CAPABILITIES.every(c=>['source_type','source_level','source_name','source_url','official_age_months','review_status','reviewed_at'].every(k=>Object.hasOwn(c,k)))],
  ['G41', '自由文本倒退描述不自动触发 concern', () => state('motor',21,[evidence('a','motor_stairs','not_yet','2026-10-05','parent_record',{raw_record:'以前会，现在不会了'})]).key!=='concern'],
  ['G42', '同日真实相反证据标为需复核', () => state('motor',21,[evidence('a','motor_run','observed'),evidence('b','motor_run','not_yet')]).capabilities.find(x=>x.capability.capability_id==='motor_run').conflict],
  ['G43', '官方核对不由普通 assessment 答案自动生成', () => {const before=ctx.loadMilestoneCheckpoints().length;state('motor',24,[evidence('a','motor_jump','not_yet')]);return ctx.loadMilestoneCheckpoints().length===before;}],
  ['G44', '30月龄官方节点不可被相邻月龄替代', () => ctx.MILESTONE_CHECKPOINTS[30].items.length===0],
  ['G45', '36月龄官方节点不可被相邻月龄替代', () => ctx.MILESTONE_CHECKPOINTS[36].items.length===0],
  ['G46', '普通浏览关键节点不写入任何记录', () => {const before=ctx.loadMilestoneCheckpoints().length;const old=ctx.ageInfo;ctx.ageInfo=()=>({totM:18});try{ctx.renderMilestoneCheckpoint();return ctx.loadMilestoneCheckpoints().length===before;}finally{ctx.ageInfo=old;}}],
  ['G47', '明确保存官方节点只写独立记录', () => {const old=ctx.ageInfo,form=ctx.document.getElementById('milestoneCheckpointForm');ctx.ageInfo=()=>({totM:18});form.querySelector=(selector)=>({value:selector.includes('nhc18_motor_stairs')?'not_yet':'observed'});const ev=ctx.loadEvidence().length,ass=ctx.loadAssessments().length;try{ctx.saveMilestoneCheckpoint({preventDefault(){}});return ctx.loadMilestoneCheckpoints().length===1&&ctx.loadEvidence().length===ev&&ctx.loadAssessments().length===ass;}finally{ctx.ageInfo=old;}}],
  ['G48', '再次保存同月官方节点覆盖原记录', () => {const old=ctx.ageInfo,form=ctx.document.getElementById('milestoneCheckpointForm');ctx.ageInfo=()=>({totM:18});form.querySelector=()=>({value:'observed'});try{ctx.saveMilestoneCheckpoint({preventDefault(){}});return ctx.loadMilestoneCheckpoints().length===1&&ctx.checkpointResult(18,ctx.loadMilestoneCheckpoints()[0].answers).key==='complete';}finally{ctx.ageInfo=old;}}],
  ['G49', '结构化倒退报告才触发发展关注', () => {const row={regression_id:'r1',regression_reported:true,previously_observed:true,capability_id:'motor_stairs',regression_date:referenceDate,caregiver_note:'原来会扶栏上楼梯，最近明显不会',createdAt:1};ctx.localStorage.setItem(ctx.REGRESSION_REPORT_KEY,JSON.stringify([row]));const signal=ctx.regressionSignal('motor',referenceDate);const result=ctx.evaluateDomainState('motor',21,[],referenceDate,{regression:signal});ctx.localStorage.removeItem(ctx.REGRESSION_REPORT_KEY);return signal&&result.key==='concern';}],
  ['G50', '未明确确认的倒退数据不能生效', () => {ctx.localStorage.setItem(ctx.REGRESSION_REPORT_KEY,JSON.stringify([{regression_id:'r2',regression_reported:true,previously_observed:false,capability_id:'motor_stairs',regression_date:referenceDate}]));const result=ctx.regressionSignal('motor',referenceDate);ctx.localStorage.removeItem(ctx.REGRESSION_REPORT_KEY);return result===null;}],
  ['G51', '官方核对咨询提示不受普通证据充分度限制', () => {const answer=Object.fromEntries(ctx.MILESTONE_CHECKPOINTS[18].items.map((x,i)=>[x.item_id,i===0?'not_yet':'observed']));ctx.localStorage.setItem(ctx.MILESTONE_CHECKPOINT_KEY,JSON.stringify([{checkpoint_id:'c51',monthKey:'2026-10',ageMonths:18,answers:answer}]));const signal=ctx.checkpointDomainSignal('motor',18,'2026-10');const st=ctx.evaluateDomainState('motor',18,[],referenceDate,{checkpoint:signal});ctx.localStorage.removeItem(ctx.MILESTONE_CHECKPOINT_KEY);return st.key==='concern'&&st.evidenceLevel==='low'&&ctx.monthlySuggestionType(st)==='professional_check';}],
  ['G52', '同日隔开时段从不会到会视为获得能力', () => {const first=evidence('a','motor_run','not_yet'),later=evidence('b','motor_run','observed');later.createdAt=first.createdAt+7200000;const cap=state('motor',21,[first,later]).capabilities.find(x=>x.capability.capability_id==='motor_run');return cap.status==='observed'&&!cap.conflict;}]




];

let failures=0;
for(const [id,name,run] of cases){
  let passed=false,detail='';
  try{passed=!!run();}catch(error){detail=error.message;}
  process.stdout.write(`${passed?'PASS':'FAIL'} ${id} ${name}${detail?' — '+detail:''}\n`);
  if(!passed)failures++;
}
process.stdout.write(`Golden Cases: ${cases.length} total, ${cases.length-failures} passed, ${failures} failed\n`);
if(failures)process.exitCode=1;
