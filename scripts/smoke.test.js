const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', '育儿系统看板.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const designCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'design-system.css'), 'utf8');
const growthCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'growth-plan.css'), 'utf8');
const monthlyScript = fs.readFileSync(path.join(__dirname, '..', 'assets', 'monthly-growth.js'), 'utf8');
const guideContentScript = fs.readFileSync(path.join(__dirname, '..', 'assets', 'development-guide-content.js'), 'utf8');
const guideScript = fs.readFileSync(path.join(__dirname, '..', 'assets', 'development-guide.js'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];

class El {
  constructor() {
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.style = {};
    this._cls = new Set();
    this.href = '';
    this.download = '';
  }
  get classList() {
    const s = this._cls;
    return {
      add: (c) => s.add(c),
      remove: (c) => s.delete(c),
      toggle: (c, f) => { if (f === undefined) f = !s.has(c); f ? s.add(c) : s.delete(c); },
      contains: (c) => s.has(c)
    };
  }
  querySelector() { return new El(); }
  querySelectorAll() { return []; }
  setAttribute() {}
  getAttribute() { return null; }
  appendChild() {}
  scrollIntoView() {}
  getContext() { return {}; }
  click() {}
}

const elements = {};
const storage = new Map();
const ctx = {
  console, Date, Math, JSON, Promise, Array, Object, String, Number, RegExp, Blob,
  isNaN, isFinite, setTimeout: (fn) => fn(), clearTimeout: () => {},
  getComputedStyle: () => ({ getPropertyValue: () => '#F44336' }),
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  localStorage: {
    getItem: (k) => storage.has(k) ? storage.get(k) : null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  },
  confirm: () => ctx.__confirmReturn,
  alert: () => {},
  document: {
    documentElement: { style: { setProperty() {} } },
    body: new El(),
    getElementById: (id) => elements[id] || (elements[id] = new El()),
    querySelectorAll: () => [],
    querySelector: () => new El(),
    createElement: () => new El()
  },
  window: { scrollY: 0, pageYOffset: 0, scrollTo: (x, y) => { ctx.window.scrollY = y; ctx.window.pageYOffset = y; ctx.__scrollTo = [x, y]; } },
  indexedDB: undefined,
  FileReader: class { readAsText() { this.result = ctx.__fileContent; this.onload(); } }
};
class ChartStub { constructor() {} destroy() {} }
ctx.window.Chart = ChartStub;
ctx.__confirmReturn = true;
ctx.__fileContent = '';

vm.createContext(ctx);
vm.runInContext(monthlyScript, ctx, { filename: 'monthly-growth.js' });
vm.runInContext(guideContentScript, ctx, { filename: 'development-guide-content.js' });
vm.runInContext(guideScript, ctx, { filename: 'development-guide.js' });
vm.runInContext(script, ctx, { filename: 'inline.js' });

let pass = 0;
let fail = 0;
function assert(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra || ''); }
}

assert('页面初始化无异常', true);

assert('每月发育要点数据完整',
  Object.keys(ctx.MONTH_DEV).length >= 19 && ctx.MONTH_DEV['19'].points.length === 3 && ctx.MONTH_DEV['19'].attention.length === 2,
  JSON.stringify(Object.keys(ctx.MONTH_DEV)));
assert('每月生活准备数据完整',
  ctx.MONTH_DEV['19'].life.length === 3 && ctx.MONTH_DEV['24'].life.some((x) => x.name.includes('如厕训练包')),
  JSON.stringify(ctx.MONTH_DEV['24'].life));
assert('每周重点可取', !!ctx.weekNoteFor(ctx.birthWeekOf(new Date()))?.t);

const stepHtml = ctx.fmtSteps({ mat: '球', steps: '1.先拿球 2.放进盒子' });
assert('详细玩法按步骤拆分', (stepHtml.match(/gc-step/g) || []).length === 2, stepHtml);
const fallbackHtml = ctx.fmtSteps({ mat: '纸杯', steps: '贴纸装饰' });
assert('简单玩法自动补详细', (fallbackHtml.match(/gc-step/g) || []).length === 5, fallbackHtml);

const mapped = ctx.normalizeObs([{ wk: '2026-08-03', ratings: { cog: 4, lang: 3, soc: 5, motor: 2, fine: 4 } }]);
assert('旧版ratings映射到五大脑',
  mapped.length === 1 && mapped[0].scores.cog === 4 && mapped[0].scores.emo === 5
  && mapped[0].scores.mov === 2 && mapped[0].scores.cre === 4, JSON.stringify(mapped));

ctx.saveObs([{ wk: '2026-08-03', items: { i0: 5, i1: 3 }, scores: {}, note: '<b>测试</b>', ts: 1 }]);
const loaded = ctx.loadObs();
assert('saveObs规范化分数', loaded.length === 1 && loaded[0].scores.cog === 4, JSON.stringify(loaded));

ctx.__fileContent = JSON.stringify({ weekly: [{ wk: '2026-07-06', ratings: { cog: 4, lang: 3, soc: 5, motor: 2, fine: 4 }, note: '旧数据' }] });
ctx.__confirmReturn = true;
ctx.importData({ files: [{}] });
const afterOldImport = ctx.loadObs();
assert('旧版weekly文件可直接导入',
  afterOldImport.some((e) => e.wk === '2026-07-06' && e.scores.emo === 5 && e.scores.mov === 2 && e.scores.cre === 4),
  JSON.stringify(afterOldImport.map((e) => ({ wk: e.wk, s: e.scores }))));

ctx.__fileContent = JSON.stringify({ obs: [{ wk: '2026-06-01', items: { i0: 5 }, note: '六月' }] });
ctx.importData({ files: [{}] });
const afterMerge = ctx.loadObs();
assert('导入支持合并',
  afterMerge.some((e) => e.wk === '2026-06-01') && afterMerge.some((e) => e.wk === '2026-07-06'),
  JSON.stringify(afterMerge.map((e) => e.wk)));

const beforeCancel = ctx.loadObs().length;
ctx.__fileContent = JSON.stringify({ obs: [] });
ctx.__confirmReturn = false;
ctx.importData({ files: [{}] });
assert('空文件取消不清空', ctx.loadObs().length === beforeCancel, `${beforeCancel} -> ${ctx.loadObs().length}`);

ctx.setDx('d0', 5);
ctx.setDx('d4', 3);
const dx = ctx.loadDx();
assert('旧版评估数据仍可保存并迁移', dx.length === 1 && dx[0].scores.cog === 5 && dx[0].scores.lang === 3, JSON.stringify(dx));

ctx.saveObs([
  { wk: '2026-05-04', items: { i0: 5 }, note: '', ts: 1 },
  { wk: '2026-06-01', items: { i1: 3 }, note: '', ts: 2 }
]);
ctx.renderTrend();
assert('旧版月度趋势兼容渲染无异常', true);

ctx.document.getElementById('archiveMonth').value = '2026-07';
ctx.genGrowthArchive();
assert('生成新版成长档案无异常', true);

assert('21–23月有独立观察题库',
  Array.isArray(ctx.OBS_ITEMS_BY_AGE[21]) && ctx.OBS_ITEMS_BY_AGE[21].length === 10
  && ctx.OBS_ITEMS_BY_AGE[21][0].text.includes('颜色'));

assert('历史均分只平均已观察维度',
  ctx.averageObservedScores({ cog: 5, lang: 5, emo: 5, mov: 5, cre: 5 }) === 5
  && ctx.averageObservedScores({ cog: 5, lang: 3, emo: 0, mov: 0, cre: 0 }) === 4);

assert('年龄筛选使用累计最小月龄',
  ctx.ageMinMonths('18月+') === 18 && ctx.ageMinMonths('2岁+') === 24
  && ctx.allGames.some((g) => ctx.ageMinMonths(g.age) === 18)
  && ctx.allGames.some((g) => ctx.ageMinMonths(g.age) === 24));

assert('3岁以下高风险小物件与磁力活动被识别',
  ctx.unsafeForAge({ name: '豆子游戏', age: '18月+', mat: '硬豆子', steps: '' })
  && ctx.unsafeForAge({ name: '磁力片', age: '2岁+', mat: '磁力部件', steps: '' })
  && !ctx.unsafeForAge({ name: '追球', age: '18月+', mat: '大软球', steps: '' }));
assert('真实高风险游戏数据被识别',
  ctx.unsafeForAge(ctx.allGames.find((g) => g.name === '橡皮泥杯子蛋糕')));
ctx.fState.cat = 'all'; ctx.fState.src = 'all'; ctx.fState.age = '2岁+'; ctx.renderGames();
const renderedGames = ctx.document.getElementById('gameGrid').innerHTML;
const expectedSafeGames = ctx.allGames.filter((g) => !ctx.unsafeForAge(g) && ctx.ageMinMonths(g.age) <= 24);
assert('安全过滤后的游戏集不含高风险项',
  !expectedSafeGames.some((g) => g.name === '橡皮泥杯子蛋糕'));
assert('游戏库实际渲染时隔离高风险活动',
  !renderedGames.includes('感官寻宝') && !renderedGames.includes('磁力片搭建')
  && !renderedGames.includes('<h4>✋ 橡皮泥杯子蛋糕</h4>'));

ctx.localStorage.removeItem(ctx.OBS_KEY);
ctx.renderObserve();
assert('打开观察页不自动创建空周记录', ctx.loadObs().length === 0, JSON.stringify(ctx.loadObs()));

ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.document.getElementById('obsNote').value = '今天第一次说妈妈抱';
ctx.document.getElementById('obsDomain').value = 'lang';
ctx.document.getElementById('obsEvidenceStatus').value = 'observed';
ctx.addObservation();
const evidence = ctx.loadEvidence();
assert('日常观察文字可保存为结构化证据',
  evidence.length === 1 && evidence[0].raw_record.includes('妈妈抱')
  && evidence[0].domains[0] === 'lang' && evidence[0].source === 'parent_record', JSON.stringify(evidence));

ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
assert('无记录不等于不会', ctx.domainState('lang').key === 'unknown' && ctx.domainState('lang').evidenceLevel === 'low');

ctx.saveEvidence([
  { observation_id: 'e1', date: '2026-09-01', raw_record: '会说妈妈抱', domains: ['lang'], capability_ids: ['lang_two_words'], evidence_strength: 1, evidence_type: 'observed', source: 'parent_record', confirmed: true, createdAt: Date.now() - 86400000 },
  { observation_id: 'e2', date: '2026-10-01', raw_record: '再次出现两词句', domains: ['lang'], capability_ids: ['lang_two_words'], evidence_strength: 2, evidence_type: 'observed', source: 'monthly_assessment', confirmed: true, createdAt: Date.now() }
]);
assert('稳定掌握需要不同日期的重复证据', !!ctx.stableCapabilityIds().lang_two_words);
assert('动态选题排除已稳定掌握能力',
  !ctx.assessmentQuestionSet(24).some((c) => c.capability_id === 'lang_two_words'));

ctx.saveEvidence([
  { observation_id: 'edge1', date: '2026-10-02', raw_record: '传球互动正在出现', domains: ['soc'], capability_ids: ['soc_ball'], evidence_strength: 1, evidence_type: 'emerging', source: 'parent_record', confirmed: true, createdAt: Date.now() }
]);
const prioritized = ctx.assessmentQuestionSet(20);
assert('动态选题优先当前发展边缘的能力',
  prioritized.find((c) => c.domain === 'soc').capability_id === 'soc_ball');

ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.localStorage.removeItem(ctx.ASSESSMENT_KEY);
const draft = ctx.assessmentDraft();
assert('月度评估是动态题集并覆盖五维',
  draft.selectedCapabilityIds.length >= 5 && draft.selectedCapabilityIds.length <= 10
  && new Set(draft.selectedCapabilityIds.map((id) => ctx.CAPABILITIES.find((c) => c.capability_id === id).domain)).size === 5,
  JSON.stringify(draft.selectedCapabilityIds));

assert('能力点具备来源类型与重要性语义', ctx.CAPABILITIES.every((c) =>
  c.capability_id && c.domain && c.label
  && ['normal', 'key', 'red_flag_related'].includes(c.importance)
  && ['official_anchor', 'adapted_anchor', 'product_observation'].includes(c.source_type) && c.source));
assert('product_observation 不强行伪造月龄窗口', ctx.CAPABILITIES.filter((c) => c.source_type === 'product_observation').every((c) =>
  c.min_age_months === null && c.typical_age_start === null && c.typical_age_end === null));
assert('缺来源能力点已按官方内容校准',
  ctx.capabilityById('motor_run').label === '会跑'
  && ctx.capabilityById('fine_spoon').typical_age_end === 18
  && ctx.capabilityById('fine_spoon_eat').typical_age_end === 24
  && ctx.capabilityById('lang_two_words').source_type === 'official_anchor'
  && ctx.capabilityById('cog_color_one').typical_age_end === 30
  && ctx.capabilityById('soc_peers').typical_age_end === 30);
const recalibratedLegacy = ctx.normalizeEvidence([
  { observation_id: 'legacy_cog', date: '2026-08-07', raw_record: '能模仿你做的简单动作（拍手、点头）', domains: ['cog'], capability_ids: ['cog_pretend'], evidence_type: 'observed', source: 'legacy_weekly_observation', confirmed: true },
  { observation_id: 'legacy_fine', date: '2026-08-07', raw_record: '能用拇指+食指对捏起小物品', domains: ['motor'], capability_ids: [], evidence_type: 'emerging', source: 'legacy_weekly_observation', confirmed: true }
]);
assert('旧数据不再把普通动作模仿误关联为假装游戏', recalibratedLegacy[0].capability_ids.length === 0);
assert('旧数据中拇指食指对捏修正为精细动作', recalibratedLegacy[1].domains[0] === 'fine');

const makeEvidence = (id, domain, capabilityId, status, date, source = 'parent_record') => ({
  observation_id: id, date, raw_record: `${capabilityId} ${status}`, domains: [domain],
  capability_ids: [capabilityId], evidence_strength: source === 'monthly_assessment' ? 2 : 1,
  evidence_type: status, source, confirmed: true, createdAt: new Date(`${date}T12:00:00`).getTime()
});
const evaluate = (domain, age, rows) => ctx.evaluateDomainState(domain, age, rows, '2026-10-09');

const basicOnly = evaluate('lang', 20, [
  makeEvidence('b1', 'lang', 'lang_words', 'observed', '2026-09-01'),
  makeEvidence('b2', 'lang', 'lang_request', 'observed', '2026-10-01')
]);
assert('两条基础 observed 不会自动得到表现较丰富', basicOnly.key !== 'rich', JSON.stringify(basicOnly));

const noEvidence = evaluate('lang', 20, []);
assert('无记录返回 unknown 而非发展弱', noEvidence.key === 'unknown' && noEvidence.evidenceLevel === 'low');
const productOnly = evaluate('lang', 20, [
  makeEvidence('po1', 'lang', 'lang_request', 'observed', '2026-09-01'),
  makeEvidence('po2', 'lang', 'lang_request', 'observed', '2026-10-01', 'monthly_assessment')
]);
assert('product_observation 不单独触发强发展结论', productOnly.key === 'unknown');

const futureNotYet = evaluate('cog', 20, [
  makeEvidence('f1', 'cog', 'cog_object_use', 'observed', '2026-09-01'),
  makeEvidence('f2', 'cog', 'cog_pretend', 'observed', '2026-10-01', 'monthly_assessment'),
  makeEvidence('f3', 'cog', 'cog_color_one', 'not_yet', '2026-10-01', 'monthly_assessment')
]);
assert('future capability 的 not_yet 不降低当前状态', futureNotYet.key === 'on_track', JSON.stringify(futureNotYet));
const futureOnly = evaluate('cog', 20, [
  makeEvidence('fo1', 'cog', 'cog_color_one', 'not_yet', '2026-09-01'),
  makeEvidence('fo2', 'cog', 'cog_color_one', 'not_yet', '2026-10-01', 'monthly_assessment')
]);
assert('future capability 的 not_yet 不抬高证据充分度', futureOnly.key === 'unknown' && futureOnly.evidenceLevel === 'low');

const currentEmerging = evaluate('lang', 20, [makeEvidence('ce1', 'lang', 'lang_two_words', 'emerging', '2026-10-01')]);
assert('当前阶段 capability 的 emerging 进入正在发展', currentEmerging.key === 'emerging');

const currentObserved = evaluate('cog', 20, [
  makeEvidence('co1', 'cog', 'cog_object_use', 'observed', '2026-09-01'),
  makeEvidence('co2', 'cog', 'cog_pretend', 'observed', '2026-10-01', 'monthly_assessment')
]);
assert('多个当前阶段能力 observed 可判为 on_track', currentObserved.key === 'on_track', JSON.stringify(currentObserved));

const richEvidence = evaluate('motor', 20, [
  makeEvidence('r1', 'motor', 'motor_stairs', 'observed', '2026-08-25'),
  makeEvidence('r2', 'motor', 'motor_run', 'observed', '2026-09-15'),
  makeEvidence('r3', 'motor', 'motor_jump', 'emerging', '2026-10-01', 'monthly_assessment')
]);
assert('多能力、跨日期、含较高层能力可进入 rich', richEvidence.key === 'rich' && richEvidence.evidenceLevel === 'high', JSON.stringify(richEvidence));

const singleNotYet = evaluate('lang', 20, [makeEvidence('ny1', 'lang', 'lang_two_words', 'not_yet', '2026-10-01')]);
assert('单条 not_yet 不会自动 concern', singleNotYet.key !== 'concern');

const repeatedPastDue = evaluate('lang', 24, [
  makeEvidence('pd1', 'lang', 'lang_words', 'not_yet', '2026-09-01'),
  makeEvidence('pd2', 'lang', 'lang_words', 'not_yet', '2026-10-01', 'monthly_assessment')
]);
assert('关键能力重复 not_yet 且超过缓冲窗口进入 watch', repeatedPastDue.key === 'watch', JSON.stringify(repeatedPastDue));

const explicitConcern = evaluate('lang', 20, [makeEvidence('ec1', 'lang', 'lang_two_words', 'concern', '2026-10-01')]);
assert('concern 显式输入优先', explicitConcern.key === 'concern');

const onlyUnobserved = evaluate('lang', 20, [makeEvidence('uo1', 'lang', 'lang_two_words', 'unobserved', '2026-10-01')]);
assert('unobserved 不等于 not_yet', onlyUnobserved.key === 'unknown' && onlyUnobserved.evidenceLevel === 'low');

assert('证据充分度与发展状态独立',
  explicitConcern.key === 'concern' && explicitConcern.evidenceLevel === 'low'
  && currentObserved.key === 'on_track' && currentObserved.evidenceLevel === 'medium');
assert('unknown 在雷达图中不被绘制成最低能力', ctx.radarValueForState(noEvidence) === null);

// Phase 2：「今天」个性化行动助手
ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
ctx.localStorage.removeItem(ctx.TODAY_PREFS_KEY);
const unknownStates = Object.fromEntries(ctx.DOMAIN_IDS.map((d) => [d, ctx.evaluateDomainState(d, 20, [], '2026-10-09')]));
const defaultPrefs = ctx.loadTodayPrefs();
const defaultToday = ctx.recommendActivities(defaultPrefs, 20, '2026-10-09', unknownStates);
assert('五维全部 unknown 仍正常推荐', defaultToday.length === 3, JSON.stringify(defaultToday.map((a) => a.title)));
assert('默认推荐覆盖零准备、小活动和生活场景三类', new Set(defaultToday.map((a) => a.slot)).size === 3, JSON.stringify(defaultToday.map((a) => a.slot)));
assert('unknown 不被解释为能力弱', defaultToday.every((a) => !a._reasons.join('').includes('弱') && !a._reasons.join('').includes('落后')), JSON.stringify(defaultToday.map((a) => a._reasons)));
const catalog = ctx.activityCatalog();
assert('137个旧游戏与18个新大运动游戏均具备结构化字段', ctx.allGames.length === 137 && catalog.length === 155 && catalog.every((a) => a.activity_id && a.title && Number.isFinite(a.min_age_months) && Number.isFinite(a.max_age_months) && Array.isArray(a.domains) && a.duration && Array.isArray(a.location) && a.materials && a.prep_level && a.cleanup_level && a.caregiver_energy && a.caregiver_effort && Array.isArray(a.interest_tags) && a.safety_level && a.safety_notes && a.description && Array.isArray(a.steps) && Array.isArray(a.observation_prompts)));

const tiredPrefs = { duration: '10_15', context: 'home', energy: 'low', interests: [] };
const tiredToday = ctx.recommendActivities(tiredPrefs, 20, '2026-10-09', unknownStates);
assert('很累时不出现 high caregiver effort 活动', tiredToday.length === 3 && tiredToday.every((a) => a.caregiver_effort !== 'high'), JSON.stringify(tiredToday.map((a) => ({t:a.title,e:a.caregiver_effort}))));
assert('很累且 low 候选充足时不用 medium/high 填充', tiredToday.every((a) => a.caregiver_effort === 'low' && a.duration.max <= 10 && a.cleanup_level !== 'medium'), JSON.stringify(tiredToday.map((a) => ({t:a.title,e:a.caregiver_effort,d:a.duration.max,c:a.cleanup_level}))));
const fallbackPool = ctx.energyCandidatePool([
  {activity_id:'low1',caregiver_effort:'low',prep_level:'none',cleanup_level:'none',duration:{max:5}},
  {activity_id:'medium1',caregiver_effort:'medium',prep_level:'none',cleanup_level:'low',duration:{max:10}},
  {activity_id:'high1',caregiver_effort:'high',prep_level:'none',cleanup_level:'none',duration:{max:5}}
], tiredPrefs);
assert('low 候选不足时只逐级温和放宽', fallbackPool.some((a) => a.activity_id === 'medium1') && !fallbackPool.some((a) => a.activity_id === 'high1'), JSON.stringify(fallbackPool));

const energeticPrefs = { duration: '10_15', context: 'home', energy: 'high', interests: [] };
const energeticToday = ctx.recommendActivities(energeticPrefs, 20, '2026-10-09', unknownStates);
assert('有精力时可正常出现更高参与度活动', energeticToday.some((a) => ['medium','high'].includes(a.caregiver_effort)), JSON.stringify(energeticToday.map((a) => ({t:a.title,e:a.caregiver_effort}))));
assert('只切换精力时推荐结果有肉眼可感知差异', JSON.stringify(tiredToday.map((a) => a.activity_id)) !== JSON.stringify(energeticToday.map((a) => a.activity_id)), JSON.stringify({low:tiredToday.map((a) => a.title),high:energeticToday.map((a) => a.title)}));

const tiredMotor = tiredToday.filter((a) => a.domains.includes('motor'));
assert('很累时也能推荐至少1项大运动', tiredMotor.length >= 1, JSON.stringify(tiredToday.map((a) => ({t:a.title,d:a.domains}))));
assert('low-energy 大运动不要求家长持续跑动', tiredMotor.every((a) => a.caregiver_effort === 'low' && !/\u5bb6长持续跟随|\u5927人跟着跑|\u5c0f范围追逐/.test(a.description)), JSON.stringify(tiredMotor.map((a) => ({t:a.title,e:a.caregiver_effort,d:a.description}))));
assert('low-energy 大运动准备和收拾不高于low', tiredMotor.every((a) => ['none','low'].includes(a.prep_level) && ['none','low'].includes(a.cleanup_level)), JSON.stringify(tiredMotor.map((a) => ({t:a.title,p:a.prep_level,c:a.cleanup_level}))));
const mediumBall = ctx.recommendActivities({duration:'10_15',context:'home',energy:'medium',interests:['balls']},20,'2026-10-09',unknownStates);
const mediumVehicle = ctx.recommendActivities({duration:'10_15',context:'home',energy:'medium',interests:['vehicles']},20,'2026-10-09',unknownStates);
const mediumOutdoor = ctx.recommendActivities({duration:'10_15',context:'outdoor',energy:'medium',interests:['climbing']},20,'2026-10-09',unknownStates);
assert('medium 能正常出现追球、推拉和户外走动', mediumBall.some((a) => a.activity_id === 'gm_chase_kick_ball') && mediumVehicle.some((a) => a.activity_id === 'gm_push_pull_walk') && mediumOutdoor.some((a) => a.activity_id === 'gm_gentle_slope'), JSON.stringify({ball:mediumBall.map((a)=>a.title),vehicle:mediumVehicle.map((a)=>a.title),outdoor:mediumOutdoor.map((a)=>a.title)}));
assert('持续跟随保护的障碍活动只在high候选池出现', !ctx.energyCandidatePool(ctx.eligibleActivities(20,{duration:'20_plus',context:'home',energy:'medium',interests:[]}),{energy:'medium'}).some((a) => a.activity_id === 'gm_low_soft_course') && ctx.energyCandidatePool(ctx.eligibleActivities(20,{duration:'20_plus',context:'home',energy:'high',interests:[]}),{energy:'high'}).some((a) => a.activity_id === 'gm_low_soft_course'));
const motorCatalog = catalog.filter((a) => a.domains.includes('motor'));
assert('危险家具攀爬内容不进入大运动推荐数据', motorCatalog.every((a) => !/\u9760垫\u6905子|\u4e0d稳定凳子|\u5bb6具堆叠|\u9ad8床跳下/.test(a.materials+' '+a.description+' '+a.steps.join(' '))), JSON.stringify(motorCatalog.filter((a) => /\u9760垫\u6905子|\u4e0d稳定凳子|\u5bb6具堆叠|\u9ad8床跳下/.test(a.materials+' '+a.description+' '+a.steps.join(' '))).map((a)=>a.title)));
const strollerWalk = catalog.find((a) => a.activity_id === 'gm_walk_from_stroller');
assert('推车只是交通工具，下车自己走才标记主动大运动', strollerWalk.active_movement === true && strollerWalk.description.includes('从推车下来') && !motorCatalog.some((a) => a.active_movement && /\u5750推车|\u5750在推车/.test(a.title+a.description)));
ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
ctx.updateActivityFeedback('gm_roll_fetch','enjoyment','love');
assert('大运动游戏“玩过”不会自动生成 observed', ctx.loadEvidence().length === 0);
ctx.recordActivityObservation('gm_roll_fetch','motor_run','observed');
assert('只有主动观察确认才写入大运动 growth evidence', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].source === 'game_feedback' && ctx.loadEvidence()[0].domains.includes('motor') && ctx.loadEvidence()[0].evidence_type === 'observed', JSON.stringify(ctx.loadEvidence()));
ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);

assert('首页今日游戏提供换一换入口', html.includes('onclick="refreshTodayActivities()"') && html.includes('↻ 换一换'));
assert('换一换不再显示多余的成功提示', !html.includes('已按当前条件换了一批') && !html.includes('id="todayRefreshHint"'));
assert('通用推荐理由不再展示给家长', html.includes('.today-why{display:none}') && html.includes('<summary>查看玩法与安全提示</summary>') && !html.includes('查看玩法、推荐理由与安全提示'));
assert('移动端正文与操作文字保持可读字号', html.includes('/* 阅读字号校准：手机上正文不低于 15–16px') && html.includes('.today-actions button,.today-chip,.feedback-row button{\n  font-size:15px;') && html.includes('.today-desc{line-height:1.7}'));
assert('移动端使用共享的固定五项导航', html.includes('<nav class="nav" aria-label="主要导航">') && designCss.includes('grid-template-columns:repeat(5,minmax(0,1fr))') && designCss.includes('height:calc(var(--ds-nav-height) + env(safe-area-inset-bottom,0px))'));
assert('桌面端使用共享的固定左侧导航', designCss.includes('@media(min-width:900px)') && html.includes('body{padding:0 0 0 112px}') && designCss.includes('width:112px;height:100dvh'));
assert('今日条件入口位于生活机会之后', html.indexOf('id="todayLife"') < html.indexOf('id="todayConditionDock"') && html.indexOf('id="todayConditionDock"') < html.indexOf('</div>\n\n<!-- ===== 成长计划'));
assert('导航切换同步无障碍当前页状态', html.includes("b.removeAttribute('aria-current')") && html.includes("btn.setAttribute('aria-current','page')"));
ctx.localStorage.removeItem(ctx.TODAY_PLAN_KEY);
const shufflePrefs = {duration:'10_15',context:'home',energy:'low',interests:[]};
ctx.saveTodayPrefs(shufflePrefs);
const shuffleBefore = ctx.todayRecommendations(shufflePrefs,20,'2026-10-10',unknownStates);
const prefsBeforeShuffle = JSON.stringify(ctx.loadTodayPrefs());
const shuffleAfter = ctx.refreshTodayActivityBatch(shufflePrefs,20,'2026-10-10',unknownStates);
const shufflePersisted = ctx.todayRecommendations(shufflePrefs,20,'2026-10-10',unknownStates);
const allowedAfterShuffle = new Set(ctx.energyCandidatePool(ctx.eligibleActivities(20,shufflePrefs),shufflePrefs).map((a) => a.activity_id));
assert('同一设置下换一换会生成不同的三个游戏', shuffleAfter.length === 3 && JSON.stringify(shuffleBefore.map((a)=>a.activity_id)) !== JSON.stringify(shuffleAfter.map((a)=>a.activity_id)), JSON.stringify({before:shuffleBefore.map((a)=>a.title),after:shuffleAfter.map((a)=>a.title)}));
assert('换一换不修改时间、场景、精力和兴趣', JSON.stringify(ctx.loadTodayPrefs()) === prefsBeforeShuffle, JSON.stringify(ctx.loadTodayPrefs()));
assert('换一换仍遵守年龄、安全、场景、时长和精力过滤', shuffleAfter.every((a) => allowedAfterShuffle.has(a.activity_id) && a.min_age_months <= 20 && a.max_age_months >= 20 && a.safety_level !== 'blocked' && a.location.some((x)=>ctx.contextLocations('home').includes(x)) && a.duration.max <= 15 && a.caregiver_effort === 'low'), JSON.stringify(shuffleAfter.map((a)=>({t:a.title,e:a.caregiver_effort,l:a.location,d:a.duration.max}))));
assert('换一换结果刷新页面后仍保留', JSON.stringify(shuffleAfter.map((a)=>a.activity_id)) === JSON.stringify(shufflePersisted.map((a)=>a.activity_id)));
assert('换一换本身不写游戏历史或成长证据', ctx.loadActivityFeedback().length === 0 && ctx.loadEvidence().length === 0);
const shuffleAgain = ctx.refreshTodayActivityBatch(shufflePrefs,20,'2026-10-10',unknownStates);
assert('连续换一换优先避免立即重复上一批', shuffleAgain.every((a) => !shuffleAfter.some((b) => b.activity_id === a.activity_id)), JSON.stringify({previous:shuffleAfter.map((a)=>a.title),next:shuffleAgain.map((a)=>a.title)}));
ctx.localStorage.removeItem(ctx.TODAY_PLAN_KEY);
ctx.renderTodayActivities();
const visibleBeforeRefresh=JSON.parse(ctx.localStorage.getItem(ctx.TODAY_PLAN_KEY)).activity_ids.join(','),refreshPrefs=JSON.stringify(ctx.loadTodayPrefs()),refreshEvidence=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
ctx.document.getElementById('todayActivities').scrollLeft=120;
ctx.refreshTodayActivities();
const visibleAfterRefresh=JSON.parse(ctx.localStorage.getItem(ctx.TODAY_PLAN_KEY)).activity_ids.join(',');
assert('首页换一换按钮处理函数沿用原轮换并将横滑位置归零', visibleBeforeRefresh!==visibleAfterRefresh && ctx.document.getElementById('todayActivities').scrollLeft===0 && JSON.stringify(ctx.loadTodayPrefs())===refreshPrefs && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===refreshEvidence);
ctx.localStorage.removeItem(ctx.TODAY_PLAN_KEY);

const fiveMin = ctx.recommendActivities({ duration: '5', context: 'home', energy: 'medium', interests: [] }, 20, '2026-10-09', unknownStates);
assert('5分钟不推荐20分钟活动', fiveMin.length > 0 && fiveMin.every((a) => a.duration.max <= 5), JSON.stringify(fiveMin.map((a) => a.duration)));

const outdoor = ctx.recommendActivities({ duration: '10_15', context: 'outdoor', energy: 'medium', interests: [] }, 20, '2026-10-09', unknownStates);
assert('户外场景排除室内专属活动', outdoor.length > 0 && outdoor.every((a) => a.location.includes('outdoor')), JSON.stringify(outdoor.map((a) => ({t:a.title,l:a.location}))));
assert('高风险活动永不进入推荐', defaultToday.concat(tiredToday, fiveMin, outdoor).every((a) => a.safety_level !== 'blocked'));
assert('年龄不匹配活动无法进入推荐', defaultToday.every((a) => a.min_age_months <= 20 && a.max_age_months >= 20));

const repeatedId = defaultToday[0].activity_id;
ctx.saveActivityFeedbackRows([{ feedback_id:'recent', activity_id:repeatedId, date:'2026-10-08', enjoyment:'okay', difficulty:'just_right', context:'home' }]);
const afterRecent = ctx.recommendActivities(defaultPrefs, 20, '2026-10-09', unknownStates);
assert('最近玩过的活动权重降低', !afterRecent.some((a) => a.activity_id === repeatedId), JSON.stringify(afterRecent.map((a) => a.title)));

const candidate = ctx.activityCatalog().find((a) => a.activity_id === repeatedId);
ctx.saveActivityFeedbackRows([{ feedback_id:'liked', activity_id:repeatedId, date:'2026-09-10', enjoyment:'love', difficulty:'just_right', context:'home' }]);
const likedScore = ctx.activityScore(candidate, 20, defaultPrefs, unknownStates, '2026-10-09').score;
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
const neutralScore = ctx.activityScore(candidate, 20, defaultPrefs, unknownStates, '2026-10-09').score;
assert('很喜欢的活动以后可适度复现', likedScore > neutralScore, `${likedScore} <= ${neutralScore}`);
const bookActivities = catalog.filter((a) => a.interest_tags.includes('books')).slice(0, 2);
ctx.saveActivityFeedbackRows(bookActivities.map((a, i) => ({ feedback_id:`book_${i}`, activity_id:a.activity_id, date:`2026-09-0${i+1}`, enjoyment:'love', difficulty:'just_right', context:'home' })));
assert('多次很喜欢会形成轻量兴趣标签', ctx.learnedInterestTags().includes('books'), JSON.stringify(ctx.learnedInterestTags()));

ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
const selectableInterests = Object.keys(ctx.INTEREST_LABELS);
const interestResults = selectableInterests.map((tag) => ({
  tag,
  rows: ctx.recommendActivities({ duration:'10_15', context:'home', energy:'medium', interests:[tag] }, 20, '2026-10-10', unknownStates)
}));
assert('手动选择的兴趣会明确进入推荐结果', interestResults.every((x) => x.rows.some((a) => a.interest_tags.includes(x.tag))), JSON.stringify(interestResults.map((x) => ({tag:x.tag,titles:x.rows.map((a) => a.title),tags:x.rows.map((a) => a.interest_tags)}))));

ctx.localStorage.removeItem(ctx.TODAY_PLAN_KEY);
ctx.saveTodayPrefs({ duration:'10_15', context:'home', energy:'medium', interests:[] });
const beforeInterestToggle = ctx.todayRecommendations(ctx.loadTodayPrefs(), 20, '2026-10-10', unknownStates).map((a) => a.activity_id);
ctx.toggleTodayInterest('books');
const afterInterestToggle = ctx.todayRecommendations(ctx.loadTodayPrefs(), 20, '2026-10-10', unknownStates);
assert('首页切换兴趣会主动重建当天推荐', JSON.stringify(beforeInterestToggle) !== JSON.stringify(afterInterestToggle.map((a) => a.activity_id)) && afterInterestToggle.some((a) => a.interest_tags.includes('books')), JSON.stringify(afterInterestToggle.map((a) => a.title)));
ctx.localStorage.removeItem(ctx.TODAY_PREFS_KEY);
ctx.toggleTodayInterest('books');
ctx.toggleTodayInterest('music');
assert('最近感兴趣按钮支持稳定多选', ctx.loadTodayPrefs().interests.includes('books') && ctx.loadTodayPrefs().interests.includes('music'), JSON.stringify(ctx.loadTodayPrefs()));
ctx.toggleTodayInterest('books');
assert('再次点击只取消当前兴趣', !ctx.loadTodayPrefs().interests.includes('books') && ctx.loadTodayPrefs().interests.includes('music'), JSON.stringify(ctx.loadTodayPrefs()));
ctx.renderTodaySettings();
const settingsHtml = ctx.document.getElementById('todaySettings').innerHTML;
assert('兴趣选项使用非提交按钮并保留无障碍选中态', settingsHtml.includes('type="button"') && settingsHtml.includes('可多选') && settingsHtml.includes('aria-pressed="true"'), settingsHtml);
assert('首页保留轻量条件入口和底部面板', html.includes('class="today-condition-inline"') && html.includes('id="todayConditionDock"') && html.includes('id="todaySettingsSheet"') && html.includes('onclick="openTodaySettings()"'));
assert('首页底部为导航预留安全间距', fs.readFileSync(path.join(__dirname, '..', 'assets', 'today-sky.css'), 'utf8').includes('padding-bottom:96px'));
assert('iPhone safe-area 用于底栏和底部面板', designCss.includes('height:calc(var(--ds-nav-height) + env(safe-area-inset-bottom,0px))') && html.includes('padding:8px 18px calc(18px + env(safe-area-inset-bottom,0px))'));
ctx.renderTodayPrefsSummary({duration:'10_15',context:'home',energy:'medium',interests:['music','animals']});
assert('底栏只显示当前时间、场景和精力', ctx.document.getElementById('todayPrefsSummary').textContent === '10–15分钟 · 家里 · 还好', ctx.document.getElementById('todayPrefsSummary').textContent);
ctx.saveTodayPrefs({duration:'5',context:'home',energy:'low',interests:['music']});
ctx.setTodayPreference('duration','20_plus');
ctx.setTodayPreference('context','outdoor');
ctx.setTodayPreference('energy','high');
assert('修改条件后底栏立即同步', ctx.document.getElementById('todayPrefsSummary').textContent === '20分钟+ · 户外 · 有精力', ctx.document.getElementById('todayPrefsSummary').textContent);
assert('条件沿用本地存储规则', ctx.loadTodayPrefs().duration === '20_plus' && ctx.loadTodayPrefs().context === 'outdoor' && ctx.loadTodayPrefs().energy === 'high');
ctx.window.scrollY = 321; ctx.window.pageYOffset = 321;
ctx.openTodaySettings();
assert('打开底部面板时锁定背景滚动', ctx.document.getElementById('todaySettingsBackdrop').classList.contains('open') && ctx.document.body.style.position === 'fixed' && ctx.document.body.style.top === '-321px');
ctx.closeTodaySettings();
assert('关闭底部面板后恢复原滚动位置', !ctx.document.getElementById('todaySettingsBackdrop').classList.contains('open') && ctx.document.body.style.position === '' && ctx.__scrollTo[1] === 321, JSON.stringify(ctx.__scrollTo));
ctx.setTodayDockVisibility(false);
assert('离开首页时隐藏今日条件栏', ctx.document.getElementById('todayConditionDock').style.display === 'none' && !ctx.document.body.classList.contains('today-dock-visible'));
ctx.setTodayDockVisibility(true);
assert('回到首页时恢复今日条件栏', ctx.document.getElementById('todayConditionDock').style.display === 'flex' && ctx.document.body.classList.contains('today-dock-visible'));
ctx.setTodayPreference('context','outdoor');
const afterContextToggle = ctx.todayRecommendations(ctx.loadTodayPrefs(), 20, '2026-10-10', unknownStates);
assert('首页切换场景会主动重建可行推荐', afterContextToggle.length > 0 && afterContextToggle.every((a) => a.location.includes('outdoor')), JSON.stringify(afterContextToggle.map((a) => ({t:a.title,l:a.location}))));

ctx.saveActivityFeedbackRows([{ feedback_id:'disliked', activity_id:repeatedId, date:'2026-10-01', enjoyment:'no_interest', difficulty:null, context:'home' }]);
const dislikedScore = ctx.activityScore(candidate, 20, defaultPrefs, unknownStates, '2026-10-09').score;
assert('没兴趣会在短期降低权重', dislikedScore < neutralScore, `${dislikedScore} >= ${neutralScore}`);

ctx.localStorage.removeItem(ctx.EVIDENCE_KEY);
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
ctx.localStorage.removeItem(ctx.TODAY_PLAN_KEY);
const liveDate = ctx.fmt(new Date());
const fixedBeforeFeedback = ctx.todayRecommendations(defaultPrefs, 20, liveDate, unknownStates).map((a) => a.activity_id);
assert('选择或展开活动不会记录为玩过', ctx.loadActivityFeedback().length === 0);
ctx.updateActivityFeedback(fixedBeforeFeedback[0], 'enjoyment', 'love');
const fixedAfterFeedback = ctx.todayRecommendations(defaultPrefs, 20, liveDate, unknownStates).map((a) => a.activity_id);
assert('当天点击活动反馈后三张推荐卡保持不变', JSON.stringify(fixedBeforeFeedback) === JSON.stringify(fixedAfterFeedback), JSON.stringify({before:fixedBeforeFeedback,after:fixedAfterFeedback}));
assert('当天反馈不立即触发近期重复降权', ctx.feedbackSummary(fixedBeforeFeedback[0], liveDate).recent === 0);
assert('真正提交活动反馈后才写入 activity history', ctx.loadActivityFeedback().length === 1 && ctx.loadActivityFeedback()[0].activity_id === fixedBeforeFeedback[0]);
ctx.localStorage.removeItem(ctx.ACTIVITY_FEEDBACK_KEY);
ctx.updateActivityFeedback(repeatedId, 'difficulty', 'easy');
assert('太简单不直接产生发展证据', ctx.loadEvidence().length === 0, JSON.stringify(ctx.loadEvidence()));
ctx.updateActivityFeedback(repeatedId, 'enjoyment', 'love');
assert('玩过活动不直接产生 observed', ctx.loadEvidence().length === 0, JSON.stringify(ctx.loadEvidence()));

const promptActivity = ctx.activityCatalog().find((a) => a.observation_prompts.length && a.safety_level !== 'blocked' && a.min_age_months <= 20);
ctx.recordActivityObservation(promptActivity.activity_id, promptActivity.observation_prompts[0].capability_id, 'observed');
assert('手动点击「看到了」才进入成长证据', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].source === 'game_feedback' && ctx.loadEvidence()[0].evidence_type === 'observed', JSON.stringify(ctx.loadEvidence()));
const productState = ctx.evaluateDomainState('lang', 20, [makeEvidence('product', 'lang', 'lang_request', 'unobserved', '2026-10-09')], '2026-10-09');
assert('product_observation 不被错误解释为发育不足', productState.key === 'unknown');
assert('推荐理由与真实规则一致', tiredToday.every((a) => !a._reasons.includes('大人可以坐着或原地陪伴') || a.caregiver_effort === 'low'));

ctx.localStorage.removeItem(ctx.TODAY_PREFS_KEY);
assert('无用户条件输入仍正常推荐', ctx.recommendActivities(ctx.loadTodayPrefs(), 20, '2026-10-09', unknownStates).length === 3);
const fallbackActivity = ctx.normalizeActivity({ name:'字段不完整活动', age:'18月+', cat:'cog', mat:'', steps:'', time:'' }, 999);
assert('缺少活动字段时有安全 fallback', fallbackActivity.location[0] === 'indoor' && fallbackActivity.prep_level && fallbackActivity.cleanup_level && fallbackActivity.safety_level === 'standard', JSON.stringify(fallbackActivity));

ctx.renderTodayActivities();
const gameTiles = ctx.document.getElementById('todayActivities').innerHTML;
assert('首页以三张图片卡呈现推荐', (gameTiles.match(/class="today-activity"/g) || []).length === 3 && (gameTiles.match(/today-activity-art/g) || []).length === 3);
assert('正式插画按活动映射', ctx.todayActivityImage({activity_id:'gm_roll_fetch',title:'球滚远了'}).includes('illustrations/activity/activity-ball-fetch.png') && ctx.todayActivityImage({activity_id:'gm_seated_soft_kick',title:'坐着踢球'}).includes('illustrations/activity/activity-kick-ball-seated.png') && ctx.todayActivityImage({activity_id:'other',title:'藏猫猫'}).includes('illustrations/activity/activity-hide-and-seek.png'));
assert('无插画活动使用统一 fallback', ctx.todayActivityImage({activity_id:'other',title:'没有配图的活动'}) === '' && gameTiles.includes('is-fallback'));
const firstTile = ctx.todayRecommendations(ctx.loadTodayPrefs(), ctx.ageInfo().totM, ctx.fmt(new Date()), ctx.currentDomainStates())[0];
ctx.openTodayActivity(firstTile.activity_id);
const activityDetail = ctx.document.getElementById('todayActivityDetail').innerHTML;
assert('图卡展开后保留玩法、观察与反馈', activityDetail.includes('查看玩法与安全提示') && activityDetail.includes('她玩得怎么样？') && activityDetail.includes('updateActivityFeedback'));
ctx.closeTodayActivity();
assert('图卡详情可以收起', ctx.document.getElementById('todayActivityDetail').innerHTML === '');

ctx.__fileContent = JSON.stringify({ schemaVersion: 3, evidence: [makeEvidence('json1', 'lang', 'lang_two_words', 'observed', '2026-10-03')], assessments: [{ assessment_id: 'a_json', monthKey: '2026-10', selectedCapabilityIds: ['lang_two_words'], answers: {}, completedAt: 1 }], activityFeedback:[{ feedback_id:'af_json', activity_id:repeatedId, date:'2026-10-03', enjoyment:'love' }], todayPreferences:{duration:'5',context:'home',energy:'low',interests:['books']}, todayObservationHistory:[{date:'2026-10-03',capability_id:'lang_two_words',status:'observed'}] });
ctx.__confirmReturn = false;
ctx.importData({ files: [{}] });
assert('JSON 导入保留成长证据、评估与今日助手数据', ctx.loadEvidence().some((e) => e.observation_id === 'json1') && ctx.loadAssessments().some((a) => a.assessment_id === 'a_json') && ctx.loadActivityFeedback().some((x) => x.feedback_id === 'af_json') && ctx.loadTodayPrefs().energy === 'low');
ctx.Blob = class { constructor(parts) { ctx.__exportedJson = parts.join(''); } };
ctx.exportData();
const exported = JSON.parse(ctx.__exportedJson);
assert('JSON 导出包含成长证据、评估与今日助手数据', exported.schemaVersion === 3 && Array.isArray(exported.evidence) && Array.isArray(exported.assessments) && Array.isArray(exported.activityFeedback) && exported.todayPreferences);

const backedUp = {};
ctx.idbSet = (key, value) => { backedUp[key] = value; };
ctx.autoBackup();
assert('IndexedDB 备份覆盖成长证据与月度评估', Array.isArray(backedUp.growth_evidence_v2) && Array.isArray(backedUp.growth_assessments_v2));
assert('IndexedDB 备份覆盖活动反馈与今日设置', Array.isArray(backedUp.activity_feedback_v1) && backedUp.today_prefs_v1 && Array.isArray(backedUp.today_observation_history_v1));

ctx.saveAssessments([]);
ctx.saveEvidence([makeEvidence('daily-only', 'motor', 'motor_run', 'observed', '2026-09-12')]);
ctx.renderGrowthTrend();
assert('仅有日常观察的月份也进入成长记录', ctx.document.getElementById('trendArea').innerHTML.includes('2026-09'));
assert('月龄轨迹以月份节点呈现且不使用小字表格', ctx.document.getElementById('trendArea').innerHTML.includes('growth-timeline') && ctx.document.getElementById('trendArea').innerHTML.includes('个月') && !ctx.document.getElementById('trendArea').innerHTML.includes('arch-table'));
assert('月度档案说明使用当前成长观察数据', html.includes('汇总当月的日常成长观察和已完成的小评估') && !html.includes('每月自动汇总「每周观察」记录'));

ctx.saveAssessments([]);
ctx.saveEvidence([]);
const assessmentIds = ctx.assessmentDraft().selectedCapabilityIds;
assert('本月小评估有可回答的问题', assessmentIds.length > 0);
ctx.setAssessmentAnswer(assessmentIds[0], 'observed');
let savedAssessment = ctx.currentAssessment();
assert('点击小评估选项后答案立即保存', savedAssessment?.answers[assessmentIds[0]]?.status === 'observed' && ctx.document.getElementById('dxList').innerHTML.includes('obs-btn active'));
ctx.setAssessmentAnswer(assessmentIds[0], 'emerging');
savedAssessment = ctx.currentAssessment();
assert('改选同一题只更新答案', ctx.loadAssessments().length === 1 && savedAssessment.answers[assessmentIds[0]].status === 'emerging');
assessmentIds.slice(1).forEach((id) => ctx.setAssessmentAnswer(id, 'unobserved'));
ctx.finishAssessment();
assert('完成小评估写回完成状态与成长证据', !!ctx.currentAssessment()?.completedAt && ctx.loadEvidence().filter((e) => e.source === 'monthly_assessment').length === assessmentIds.length);
assert('完成小评估同时保存结构化月度总结快照', ctx.currentAssessment()?.monthly_growth_summary?.snapshot === true && Object.keys(ctx.currentAssessment().monthly_growth_summary.dimensions).length === 5 && ctx.currentAssessment().monthly_growth_summary.monthly_focus.length <= 2);
assert('完成后在画像前显示可理解总结与重点', html.indexOf('id="monthlySummarySection"')<html.indexOf('class="growth-profile-feature"') && ctx.document.getElementById('monthlySummarySection').hidden===false && ctx.document.getElementById('monthlySummarySection').innerHTML.includes('这个月最值得做的') && ctx.document.getElementById('monthlySummarySection').innerHTML.includes('为什么这样判断？'));
assert('IndexedDB 备份包含月度总结快照', backedUp.growth_assessments_v2.some((a)=>a.monthly_growth_summary?.snapshot===true));
ctx.exportData();
assert('JSON 导出包含固定月度总结', JSON.parse(ctx.__exportedJson).assessments.some((a)=>a.monthly_growth_summary?.snapshot===true));
const finishedSnapshot=JSON.stringify(ctx.currentAssessment().monthly_growth_summary);
ctx.finishAssessment();
assert('重复点击完成评估不重复写成长证据', ctx.loadEvidence().filter((e) => e.source === 'monthly_assessment').length === assessmentIds.length);
assert('重复点击完成评估不重建总结', JSON.stringify(ctx.currentAssessment().monthly_growth_summary)===finishedSnapshot);

// Phase 1.8 验收：纠正同一次评估，保留其他答案与日常观察。
const editMonth=ctx.fmt(new Date()).slice(0,7);
const editRecord={assessment_id:'edit_same_assessment',schemaVersion:2,monthKey:editMonth,ageMonths:ctx.ageInfo().totM,selectedCapabilityIds:['motor_run','lang_two_words'],answers:{motor_run:{status:'observed',confirmed:true,answeredAt:Date.now()},lang_two_words:{status:'unobserved',confirmed:true,answeredAt:Date.now()}},startedAt:Date.now()-10000,completedAt:Date.now()-5000};
const unrelatedEvidence=makeEvidence('daily_untouched','lang','lang_request','observed',ctx.fmt(new Date()));
const initialEditEvidence=ctx.assessmentEvidenceRows(editRecord).concat([unrelatedEvidence]);
editRecord.monthly_growth_summary=ctx.generateMonthlyGrowthSummary({assessment:editRecord,evidence:initialEditEvidence,referenceDate:ctx.fmt(new Date())});
ctx.saveAssessments([editRecord]);ctx.saveEvidence(initialEditEvidence);ctx.renderAssessment();
assert('本月总结和评估详情都有修改入口', ctx.document.getElementById('monthlySummarySection').innerHTML.includes('修改本次评估') && ctx.document.getElementById('dxList').innerHTML.includes('修改本次评估') && ctx.document.getElementById('monthlySummarySection').innerHTML.includes('更新本月总结'));
const initialSummary=JSON.stringify(ctx.currentAssessment().monthly_growth_summary);
const originalSetItem=ctx.localStorage.setItem;
let assessmentWriteCount=0;
ctx.localStorage.setItem=(key,value)=>{assessmentWriteCount++;originalSetItem(key,value);};
ctx.beginAssessmentEdit();
assert('修改页预填原答案并显示原题目', ctx.assessmentEditDraft.answers.motor_run.status==='observed' && ctx.document.getElementById('dxList').innerHTML.includes('会跑') && ctx.document.getElementById('dxList').innerHTML.includes('obs-btn active'));
ctx.moveAssessmentEdit(1);
assert('可前后检查题目且原答案仍在', ctx.document.getElementById('dxList').innerHTML.includes('能把至少两个词') && ctx.document.getElementById('dxList').innerHTML.includes('obs-btn active'));
ctx.moveAssessmentEdit(-1);ctx.setAssessmentEditAnswer('motor_run','not_yet');
assert('进入修改页并改选仍不写数据', assessmentWriteCount===0 && ctx.currentAssessment().answers.motor_run.status==='observed' && ctx.loadEvidence().find((e)=>e.observation_id==='assess_edit_same_assessment_motor_run').evidence_type==='observed');
ctx.cancelAssessmentEdit();
assert('取消修改使评估、证据和总结完全不变', assessmentWriteCount===0 && ctx.assessmentEditDraft===null && ctx.currentAssessment().answers.motor_run.status==='observed' && JSON.stringify(ctx.currentAssessment().monthly_growth_summary)===initialSummary);
ctx.localStorage.setItem=originalSetItem;

ctx.beginAssessmentEdit();ctx.setAssessmentEditAnswer('motor_run','not_yet');ctx.saveAssessmentEdit();
const firstCorrected=ctx.currentAssessment(),correctedEvidence=ctx.loadEvidence().filter((e)=>e.observation_id==='assess_edit_same_assessment_motor_run');
assert('会跑修正后仍是同一条本月评估', ctx.loadAssessments().length===1 && firstCorrected.assessment_id==='edit_same_assessment' && firstCorrected.completedAt===editRecord.completedAt && firstCorrected.revision_count===1);
assert('只修改一题时其他答案保持不变', firstCorrected.answers.motor_run.status==='not_yet' && firstCorrected.answers.lang_two_words.status==='unobserved');
assert('旧评估证据被同一稳定 ID 的新状态替换', correctedEvidence.length===1 && correctedEvidence[0].evidence_type==='not_yet' && !ctx.loadEvidence().some((e)=>e.source==='monthly_assessment'&&e.capability_ids.includes('motor_run')&&e.evidence_type==='observed'));
assert('修改不会产生重复日常观察或评估证据', ctx.loadEvidence().filter((e)=>e.source==='parent_record').length===1 && ctx.loadEvidence().filter((e)=>e.source==='monthly_assessment').length===2);
assert('五维状态与证据充分度重新使用修正证据', firstCorrected.monthly_growth_summary.dimensions.motor.state===ctx.domainState('motor').key && firstCorrected.monthly_growth_summary.dimensions.motor.evidence_level===ctx.domainState('motor').evidenceLevel && !firstCorrected.monthly_growth_summary.dimensions.motor.observed_capabilities.some((x)=>x.capability_id==='motor_run'));
assert('单项尚未出现不会直接变成担忧', firstCorrected.monthly_growth_summary.dimensions.motor.state!=='concern' && firstCorrected.monthly_growth_summary.dimensions.motor.key_evidence.some((x)=>x.observation_id==='assess_edit_same_assessment_motor_run'&&x.status==='not_yet'));
assert('修正自动重建本月总结及下月建议', JSON.stringify(firstCorrected.monthly_growth_summary)!==initialSummary && firstCorrected.monthly_growth_summary.dimensions.motor.assessment_answers.some((x)=>x.capability_id==='motor_run'&&x.status==='not_yet') && Array.isArray(firstCorrected.monthly_growth_summary.next_30_days.activities) && firstCorrected.monthly_growth_summary.assessment_id==='edit_same_assessment');
assert('保存后显示反馈和最后修改日期', ctx.document.getElementById('assessmentSaveNotice').textContent==='本次评估已修改，成长总结已同步更新。' && ctx.document.getElementById('assessmentSaveNotice').hidden===false && ctx.document.getElementById('dxStatus').innerHTML.includes('最后修改：'));
const correctedStorage=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY),correctedEvidenceStorage=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
vm.runInContext(script,ctx,{filename:'assessment-edit-reload.js'});
assert('修改后刷新仍保留原评估与修正证据', ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===correctedStorage && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===correctedEvidenceStorage && ctx.currentAssessment().answers.motor_run.status==='not_yet');
ctx.beginAssessmentEdit();ctx.setAssessmentEditAnswer('motor_run','emerging');ctx.saveAssessmentEdit();
assert('连续修改两次仍只有一份本月评估与一份题目证据', ctx.loadAssessments().length===1 && ctx.currentAssessment().revision_count===2 && ctx.loadEvidence().filter((e)=>e.observation_id==='assess_edit_same_assessment_motor_run').length===1 && ctx.loadEvidence().find((e)=>e.observation_id==='assess_edit_same_assessment_motor_run').evidence_type==='emerging');
const answersBeforeSummaryRefresh=JSON.stringify(ctx.currentAssessment().answers),evidenceBeforeSummaryRefresh=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
ctx.updateCurrentMonthSummary();
assert('更新本月总结不修改评估答案或证据', JSON.stringify(ctx.currentAssessment().answers)===answersBeforeSummaryRefresh && ctx.currentAssessment().revision_count===2 && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===evidenceBeforeSummaryRefresh);
const readOnlyAssessment=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY),readOnlyEvidence=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
assessmentWriteCount=0;ctx.localStorage.setItem=(key,value)=>{assessmentWriteCount++;originalSetItem(key,value);};
ctx.showPage('brain',new El());ctx.renderMonthlyGrowthSummary();ctx.showBrainSub('assess',ctx.document.getElementById('subt-assess'));ctx.renderAssessment();ctx.showHistoricalGrowthSummary(editMonth);ctx.closeHistoricalGrowthSummary();ctx.renderMonthlyGrowthHistory();ctx.renderGrowthProfile();ctx.showGrowthDetail('motor');
vm.runInContext(script,ctx,{filename:'assessment-readonly-reload.js'});
assert('查看总结、评估、依据、历史、返回和刷新完全只读', assessmentWriteCount===0 && ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===readOnlyAssessment && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===readOnlyEvidence);
ctx.localStorage.setItem=originalSetItem;

ctx.saveEvidence([]);
ctx.localStorage.removeItem(ctx.TODAY_OBS_HISTORY_KEY);
ctx.respondTodayObservation('motor_run', 'observed');
ctx.respondTodayObservation('motor_run', 'observed');
ctx.respondTodayObservation('motor_run', 'emerging');
assert('今天留意重复点击只保留当日一条并更新状态', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].evidence_type === 'emerging' && JSON.parse(ctx.localStorage.getItem(ctx.TODAY_OBS_HISTORY_KEY)).length === 1);
const oldClick = ctx.loadEvidence()[0];
ctx.localStorage.setItem(ctx.EVIDENCE_KEY, JSON.stringify([oldClick, {...oldClick, observation_id:'old-duplicate', evidence_type:'observed', createdAt:oldClick.createdAt + 1}]));
assert('旧版同日重复点击记录在成长历史中合并显示', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].evidence_type === 'observed');
ctx.saveEvidence([]);
ctx.recordActivityObservation(promptActivity.activity_id, promptActivity.observation_prompts[0].capability_id, 'observed');
ctx.recordActivityObservation(promptActivity.activity_id, promptActivity.observation_prompts[0].capability_id, 'emerging');
assert('游戏观察重复点击只保留当日一条', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].evidence_type === 'emerging');
ctx.saveEvidence([]);
ctx.document.getElementById('obsNote').value = '今天试着自己收玩具';
ctx.document.getElementById('obsDomain').value = 'cog';
ctx.document.getElementById('obsEvidenceStatus').value = 'observed';
ctx.addObservation();
ctx.document.getElementById('obsNote').value = '今天试着自己收玩具';
ctx.document.getElementById('obsDomain').value = 'cog';
ctx.document.getElementById('obsEvidenceStatus').value = 'emerging';
ctx.addObservation();
assert('手动保存同日同内容观察只更新状态', ctx.loadEvidence().length === 1 && ctx.loadEvidence()[0].evidence_type === 'emerging');

assert('成长画像位于页签与观察表单之前且只有一个容器', html.indexOf('id="dxHistory"') < html.indexOf('class="brain-subtabs"') && html.indexOf('class="brain-subtabs"') < html.indexOf('id="bsub-obs"') && (html.match(/id="dxHistory"/g) || []).length === 1);
ctx.renderGrowthProfile();
assert('成长画像保留雷达图与五个可点选维度', ctx.document.getElementById('dxHistory').innerHTML.includes('id="growthRadar"') && (ctx.document.getElementById('dxHistory').innerHTML.match(/onclick="showGrowthDetail/g) || []).length === 5);
ctx.showGrowthDetail('motor');
assert('点选画像维度可打开证据与接下来留意', ctx.document.getElementById('growthProfileDetail').innerHTML.includes('为什么这样判断') && ctx.document.getElementById('growthProfileDetail').innerHTML.includes('接下来该留意什么'));
const growthNavButton = new El();
const assessmentCountBeforeEntry = ctx.loadAssessments().length;
ctx.showPage('brain', growthNavButton);
assert('进入成长页可渲染并不新增空评估', ctx.document.getElementById('page-brain').classList.contains('active') && ctx.loadAssessments().length === assessmentCountBeforeEntry && growthNavButton.classList.contains('active'));
['obs', 'arch', 'assess'].forEach((sub) => {
  const tabButton = new El();
  ctx.showBrainSub(sub, tabButton);
  assert(`成长页「${sub}」入口可打开`, ctx.document.getElementById(`bsub-${sub}`).classList.contains('active') && tabButton.classList.contains('active'));
});
assert('成长页状态与排版使用共享 tokens', growthCss.includes('var(--ds-page)') && growthCss.includes('var(--ds-font-body)') && growthCss.includes('growth-state-unknown'));

const summaryAssessment = (id, age, rows) => ({
  assessment_id:id, monthKey:'2026-10', ageMonths:age, completedAt:Date.parse('2026-10-09T12:00:00'),
  selectedCapabilityIds:rows.filter((e)=>e.date.startsWith('2026-10')&&e.source==='monthly_assessment').map((e)=>e.capability_ids[0]),
  answers:Object.fromEntries(rows.filter((e)=>e.date.startsWith('2026-10')&&e.source==='monthly_assessment').map((e)=>[e.capability_ids[0],{status:e.evidence_type,confirmed:true}]))
});
const summaryFor = (id, age, rows, previousAssessment = null) => ctx.generateMonthlyGrowthSummary({
  assessment:summaryAssessment(id,age,rows), evidence:rows, referenceDate:'2026-10-09', previousAssessment,
  prefs:{duration:'10_15',context:'home',energy:'medium',interests:[]}
});
const steadyCases = [
  ['motor','motor_stairs','motor_run'], ['fine','fine_lid','fine_spoon'],
  ['lang','lang_words','lang_two_words'], ['cog','cog_object_use','cog_pretend'],
  ['soc','soc_ball','soc_emotion']
].flatMap(([domain,a,b],i)=>[
  makeEvidence(`steady_${i}_a`,domain,a,'observed','2026-10-01'),
  makeEvidence(`steady_${i}_b`,domain,b,'observed','2026-10-04','monthly_assessment')
]);
const steadySummary = summaryFor('steady',18,steadyCases);
assert('五维均稳定时总结积极且不生成训练任务', ctx.DOMAIN_IDS.every((d)=>['on_track','rich'].includes(steadySummary.dimensions[d].state)) && steadySummary.monthly_focus.length===0 && steadySummary.overall_summary.includes('继续') && !/弱项|落后|训练/.test(steadySummary.overall_summary));

const emergingSummary = summaryFor('emerging',20,[makeEvidence('em1','lang','lang_two_words','emerging','2026-10-03','monthly_assessment')]);
assert('正在发展进入重点并给自然机会', emergingSummary.dimensions.lang.state==='emerging' && emergingSummary.monthly_focus.some((x)=>x.domain==='lang'&&x.type==='opportunity') && !emergingSummary.dimensions.lang.recommendation.includes('咨询'));
assert('月度总结给出下个月可自然比较的观察线索', emergingSummary.next_month_check.length<=2 && emergingSummary.next_month_check.some((x)=>x.includes('能把至少两个词组合在一起')) && ctx.monthlySummaryHtml(emergingSummary,false).includes('下个月回来时'));

const unknownSummary = summaryFor('unknown',20,[]);
assert('证据少时保持暂无法判断且只建议观察', ctx.DOMAIN_IDS.every((d)=>unknownSummary.dimensions[d].state==='unknown'&&unknownSummary.dimensions[d].evidence_level==='low'&&unknownSummary.dimensions[d].recommendation_type==='observe'&&unknownSummary.dimensions[d].observed_items.length===0) && unknownSummary.monthly_focus.length<=1 && !/弱项|落后|补弱/.test(unknownSummary.overall_summary));

const watchRows=[makeEvidence('watch1','lang','lang_words','not_yet','2026-09-01'),makeEvidence('watch2','lang','lang_words','not_yet','2026-10-01','monthly_assessment')];
const watchSummary=summaryFor('watch',24,watchRows);
assert('建议继续观察指向具体行为且不医学化', watchSummary.dimensions.lang.state==='watch' && watchSummary.dimensions.lang.recommendation_type==='monitor' && watchSummary.dimensions.lang.recommendation.includes('能说出至少3个有意义的词') && !watchSummary.dimensions.lang.recommendation.includes('诊断'));

const concernRows=[
  makeEvidence('concern1','lang','lang_two_words','concern','2026-10-01'),
  makeEvidence('concern2','lang','lang_words','observed','2026-10-02'),
  makeEvidence('concern3','lang','lang_request','emerging','2026-10-03','monthly_assessment')
];
const concernSummary=summaryFor('concern',20,concernRows);
assert('担忧解释来源并提供有条件的专业咨询提示', concernSummary.dimensions.lang.state==='concern' && concernSummary.dimensions.lang.recommendation_type==='professional_check' && concernSummary.dimensions.lang.key_evidence.some((e)=>e.status==='concern') && concernSummary.dimensions.lang.recommendation.includes('如') && !concernSummary.overall_summary.includes('发育迟缓'));
assert('无历史证据不硬生成最近变化', concernSummary.recent_changes.length===0 && concernSummary.new_capabilities.length===0);

const changeRows=[makeEvidence('change_old','lang','lang_two_words','not_yet','2026-09-12'),makeEvidence('change_new','lang','lang_two_words','observed','2026-10-03','monthly_assessment')];
const previousMonthAssessment={assessment_id:'previous',monthKey:'2026-09',ageMonths:19,completedAt:Date.parse('2026-09-30T12:00:00'),answers:{}};
const changeSummary=summaryFor('change',20,changeRows,previousMonthAssessment);
assert('连续两个月证据可生成具体变化而非标签升降', changeSummary.new_capabilities.some((x)=>x.capability_id==='lang_two_words'&&x.evidence_refs.includes('change_new')) && changeSummary.recent_changes.length>0 && !/\+1|升级为/.test(changeSummary.recent_changes[0].text));
const unobservedThenObserved=summaryFor('not_proven_new',20,[makeEvidence('unknown_old','lang','lang_two_words','unobserved','2026-09-12'),makeEvidence('unknown_new','lang','lang_two_words','observed','2026-10-03')]);
assert('上月仅尚未观察不宣称本月新出现', unobservedThenObserved.new_capabilities.length===0);
assert('月度活动沿用年龄、安全、场景、精力筛选并保留现有玩法', emergingSummary.next_30_days.activities.length>=2 && emergingSummary.next_30_days.activities.every((a)=>{const source=ctx.activityById(a.activity_id);return source&&source.safety_level!=='blocked'&&source.min_age_months<=20&&source.max_age_months>=20&&source.location.includes('indoor')&&a.steps.length>0;}));
assert('月度活动优先匹配发展重点', emergingSummary.next_30_days.activities.some((a)=>a.domains.includes('lang')));
assert('生活机会只从现有适龄条目映射', emergingSummary.next_30_days.life_opportunities.every((x)=>ctx.LIFE_OPPORTUNITIES.some((y)=>y.title===x.title&&y.min_age_months<=20)));
const outdoorUnknown=ctx.generateMonthlyGrowthSummary({assessment:summaryAssessment('outdoor_unknown',20,[]),evidence:[],referenceDate:'2026-10-09',prefs:{duration:'10_15',context:'outdoor',energy:'medium',interests:[]}});
assert('证据不足时不推需要主动走坡的生活机会', !outdoorUnknown.next_30_days.life_opportunities.some((x)=>x.title.includes('小坡')));

const historyRecord={...summaryAssessment('history',20,changeRows),monthly_growth_summary:changeSummary};
ctx.saveAssessments([historyRecord]);
ctx.saveEvidence(changeRows);
ctx.saveEvidence(ctx.loadEvidence().concat([makeEvidence('later_note','lang','lang_words','observed','2026-10-08')]));
const countBeforeUpdate=ctx.loadEvidence().length;
ctx.updateCurrentMonthSummary();
assert('明确点击更新本月总结才重建快照且不新增证据', ctx.loadAssessments().length===1 && ctx.loadEvidence().length===countBeforeUpdate && ctx.currentAssessment().monthly_growth_summary.input_summary.current_month_evidence_count===2);
const historyBefore=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY),evidenceBefore=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
ctx.renderMonthlyGrowthHistory();ctx.showHistoricalGrowthSummary('2026-10');ctx.renderMonthlyGrowthSummary();ctx.renderAssessment();
assert('历史总结与展开只读且显示固定快照', ctx.document.getElementById('monthlySummaryHistoryDetail').innerHTML.includes('历史快照') && ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===historyBefore && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===evidenceBefore);
ctx.closeHistoricalGrowthSummary();
assert('从历史总结返回只清除视图', ctx.document.getElementById('monthlySummaryHistoryDetail').innerHTML==='' && ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===historyBefore);
ctx.saveEvidence(ctx.loadEvidence().concat([makeEvidence('after_snapshot','lang','lang_request','observed','2026-10-09')]));
const savedSnapshotText=JSON.stringify(ctx.currentAssessment().monthly_growth_summary);
ctx.showHistoricalGrowthSummary('2026-10');
assert('后来新增观察不会改写历史快照', JSON.stringify(ctx.currentAssessment().monthly_growth_summary)===savedSnapshotText && ctx.document.getElementById('monthlySummaryHistoryDetail').innerHTML.includes('历史快照'));
const snapshotImport=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY);
ctx.__fileContent=JSON.stringify({assessments:JSON.parse(snapshotImport)});ctx.__confirmReturn=false;ctx.importData({files:[{}]});ctx.__confirmReturn=true;
assert('导入保留月度总结快照', JSON.stringify(ctx.currentAssessment().monthly_growth_summary)===savedSnapshotText);
const oldMonth={assessment_id:'old_month',monthKey:'2026-09',ageMonths:19,completedAt:Date.parse('2026-09-30T12:00:00'),selectedCapabilityIds:[],answers:{}};
ctx.saveAssessments(ctx.loadAssessments().concat([oldMonth]));
const noSnapshotBefore=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY);
ctx.showHistoricalGrowthSummary('2026-09');
assert('旧月份无快照时说明原因且不自动补写', ctx.document.getElementById('monthlySummaryHistoryDetail').innerHTML.includes('暂无固定快照') && ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===noSnapshotBefore);
ctx.saveAssessments([historyRecord]);
const reloadAssessmentBefore=ctx.localStorage.getItem(ctx.ASSESSMENT_KEY),reloadEvidenceBefore=ctx.localStorage.getItem(ctx.EVIDENCE_KEY);
vm.runInContext(script,ctx,{filename:'inline-reload.js'});
assert('重复刷新不新增评估、总结或观察', ctx.localStorage.getItem(ctx.ASSESSMENT_KEY)===reloadAssessmentBefore && ctx.localStorage.getItem(ctx.EVIDENCE_KEY)===reloadEvidenceBefore);

// Phase 1.9：通用月龄指南以已有锚点和内容库为来源，保持只读。
const guideBands=ctx.DEVELOPMENT_GUIDE_CONTENT;
assert('六个年龄段连续覆盖18～36月龄', guideBands.length===6 && Array.from({length:19},(_,i)=>i+18).every((age)=>!!ctx.guideForAge(age)) && ctx.guideForAge(17)===null && ctx.guideForAge(37)===null);
assert('每阶段具备五领域、自然机会、玩具、生活参与、观察点与来源', guideBands.every((b)=>ctx.DOMAIN_IDS.every((d)=>b.domains[d].length>=1&&b.domains[d].length<=2&&b.domains[d].every((x)=>['official_anchor','adapted_anchor'].includes(ctx.capabilityById(x.capability_id)?.source_type))) && b.opportunities.length>=4&&b.opportunities.length<=6 && b.opportunities.every((x)=>x.capability_ids.every((id)=>!!ctx.capabilityById(id))) && b.life_participation.length>=3&&b.life_participation.length<=5 && b.observe_points.length>=1 && b.source_refs.every((id)=>!!ctx.capabilityById(id))));
assert('玩具内容具备未来 Toy Box 所需的结构字段', ctx.DEVELOPMENT_GUIDE_TOYS.every((t)=>t.toy_id&&t.name&&t.category&&Array.isArray(t.age_range)&&Array.isArray(t.domains)&&Object.hasOwn(t,'owned_status')&&Array.isArray(t.replacement_materials)&&t.safety_notes));
ctx.renderDevelopmentGuide(20);
assert('20月龄显示18～20阶段指南', ctx.guideForAge(20).age_range[0]===18 && ctx.document.getElementById('developmentGuideSection').innerHTML.includes('18～20月龄阶段'));
ctx.renderDevelopmentGuide(21);
const guide21Html=ctx.document.getElementById('developmentGuideSection').innerHTML;
assert('21月龄进入21～23过渡阶段并显示五块内容', ctx.guideForAge(21).age_range[0]===21 && guide21Html.includes('21～23月龄阶段') && ['本月发育要点','这个月多提供这些机会','这个月适合什么玩具 / 材料','这个月可以让她参与','本月值得留意'].every((x)=>guide21Html.includes(x)));
const beforeBirthday=ctx.ageInfo(new Date(2027,0,15)).totM,afterBirthday=ctx.ageInfo(new Date(2027,0,16)).totM;
assert('24月龄生日后自动进入下一阶段', beforeBirthday===23 && afterBirthday===24 && ctx.guideForAge(beforeBirthday).age_range[0]===21 && ctx.guideForAge(afterBirthday).age_range[0]===24);
ctx.saveAssessments([]);ctx.saveEvidence([]);
const guideSetItem=ctx.localStorage.setItem;let guideWrites=0;ctx.localStorage.setItem=(key,value)=>{guideWrites++;guideSetItem(key,value);};
ctx.renderMonthlyGrowthSummary();ctx.renderDevelopmentGuide(21);
assert('无评估无观察也能只读显示完整指南', guideWrites===0 && ctx.document.getElementById('monthlySummarySection').hidden===true && ctx.document.getElementById('developmentGuideSection').innerHTML.includes('本月发育指南') && ctx.document.getElementById('developmentGuideSection').innerHTML.includes('不需要每个月买新玩具'));
ctx.localStorage.setItem=guideSetItem;
const guideAssessment={assessment_id:'guide_assessment',monthKey:ctx.fmt(new Date()).slice(0,7),ageMonths:21,selectedCapabilityIds:['motor_run','lang_two_words'],answers:{motor_run:{status:'not_yet',confirmed:true},lang_two_words:{status:'unobserved',confirmed:true}},completedAt:Date.now()};
ctx.saveAssessments([guideAssessment]);ctx.saveEvidence(ctx.assessmentEvidenceRows(guideAssessment));ctx.renderDevelopmentGuide(21);
const personalizedGuide=ctx.document.getElementById('developmentGuideSection').innerHTML;
assert('已有评估只附轻量个人状态且不改写阶段文字', personalizedGuide.includes('可以多给机会') && personalizedGuide.includes('还没记录到') && personalizedGuide.includes('主动移动可以变得更丰富') && ctx.currentAssessment().answers.motor_run.status==='not_yet');
assert('unknown 不写成不会或不达标', !personalizedGuide.includes('不会跑') && !personalizedGuide.includes('不达标') && ctx.guideCapabilityStatus('lang_two_words',21,ctx.loadEvidence())==='还没记录到');
ctx.saveEvidence([makeEvidence('guide_run_1','motor','motor_run','observed','2026-09-15'),makeEvidence('guide_run_2','motor','motor_run','observed','2026-10-17')]);ctx.renderDevelopmentGuide(21);
assert('稳定掌握显示已经会了且保留阶段内容', ctx.document.getElementById('developmentGuideSection').innerHTML.includes('已经会了 ✓') && ctx.document.getElementById('developmentGuideSection').innerHTML.includes('主动移动可以变得更丰富'));
const unsafeToy={toy_id:'unsafe_beads',name:'小珠子',category:'配对',age_range:[18,36],domains:['fine'],owned_status:null,replacement_materials:[],min_piece_cm:5,safety_notes:'不要使用'};
const tinyToy={toy_id:'tiny_piece',name:'迷你拼片',category:'配对',age_range:[18,36],domains:['fine'],owned_status:null,replacement_materials:[],min_piece_cm:2,safety_notes:'不要使用'};
ctx.DEVELOPMENT_GUIDE_TOYS.push(unsafeToy,tinyToy);ctx.guideForAge(21).toys.continue.push('unsafe_beads','tiny_piece');
ctx.renderDevelopmentGuide(21);
assert('3岁以下危险小物件与小尺寸材料被过滤', !ctx.guideToysForBand(ctx.guideForAge(21),21).continue.some((t)=>['unsafe_beads','tiny_piece'].includes(t.toy_id)) && !ctx.document.getElementById('developmentGuideSection').innerHTML.includes('小珠子') && !ctx.document.getElementById('developmentGuideSection').innerHTML.includes('迷你拼片'));
assert('相关游戏来自现有库并复用年龄和安全过滤', ctx.guideActivitiesForBand(ctx.guideForAge(21),21).length>0 && ctx.guideActivitiesForBand(ctx.guideForAge(21),21).length<=3 && ctx.guideActivitiesForBand(ctx.guideForAge(21),21).every((a)=>!!ctx.activityById(a.activity_id)&&a.safety_level!=='blocked'&&21>=a.min_age_months&&21<=a.max_age_months));
assert('每个阶段均能找到安全的库内游戏', guideBands.every((b)=>ctx.guideActivitiesForBand(b,b.age_range[1]).length>0 && ctx.guideActivitiesForBand(b,b.age_range[1]).length<=3), JSON.stringify(guideBands.map((b)=>[b.age_range,ctx.guideActivitiesForBand(b,b.age_range[1]).map((a)=>a.title)])));
assert('指南渲染不新增评估或成长证据', ctx.loadAssessments().length===1 && ctx.loadEvidence().length===2);

// Phase 1.9.1：首页仅展示同一份指南内容的短摘要。
assert('首页摘要位于 Hero 与今天留意之间且游戏之前', html.indexOf('id="page-home"')<html.indexOf('id="homeDevelopmentGuideSection"') && html.indexOf('today-hero ds-image-card')<html.indexOf('id="homeDevelopmentGuideSection"') && html.indexOf('id="homeDevelopmentGuideSection"')<html.indexOf('class="today-observation-section"') && html.indexOf('id="homeDevelopmentGuideSection"')<html.indexOf('class="today-games-section"'));
ctx.saveAssessments([]);ctx.saveEvidence([]);
const homeGuideSummary=ctx.homeDevelopmentGuideSummary(21),homeGuideBand=ctx.guideForAge(21);
assert('21月龄无评估显示21～23阶段的固定三条要点', homeGuideSummary.age_range[0]===21 && homeGuideSummary.age_range[1]===23 && homeGuideSummary.items.map((item)=>item.domain).join(',')==='motor,lang,fine' && homeGuideSummary.items.every((item)=>homeGuideBand.domains[item.domain].some((x)=>x.text===item.text&&x.capability_id===item.capability_id&&!item.status)));
assert('首页玩具提示只取已审核且通过安全过滤的最多三种材料', homeGuideSummary.toy_names.length===3 && homeGuideSummary.toy_names[0]===ctx.guideToysForBand(homeGuideBand,21).continue[0].name && homeGuideSummary.toy_names[2]===ctx.guideToysForBand(homeGuideBand,21).no_buy[0].name && !homeGuideSummary.toy_names.includes('小珠子'));
const homeGuideSetItem=ctx.localStorage.setItem;let homeGuideWrites=0;ctx.localStorage.setItem=(key,value)=>{homeGuideWrites++;homeGuideSetItem(key,value);};
ctx.renderHomeDevelopmentGuideSummary(21);
const homeGuideHtml=ctx.document.getElementById('homeDevelopmentGuideSection').innerHTML;
assert('首页只显示月龄、三条要点、一行材料和完整指南入口', homeGuideWrites===0 && ctx.document.getElementById('homeDevelopmentGuideSection').hidden===false && homeGuideHtml.includes('21个月') && (homeGuideHtml.match(/<li>/g)||[]).length===3 && (homeGuideHtml.match(/today-monthly-guide-toy/g)||[]).length===1 && homeGuideHtml.includes('查看完整发育指南') && !homeGuideHtml.includes('<em>') && !homeGuideHtml.includes('guide-toy-grid') && !homeGuideHtml.includes('这个月可以让她参与'));
ctx.localStorage.setItem=homeGuideSetItem;
const homeAssessment={assessment_id:'home_guide_assessment',monthKey:ctx.fmt(new Date()).slice(0,7),ageMonths:21,selectedCapabilityIds:['motor_run','lang_two_words','fine_pages'],answers:{motor_run:{status:'not_yet',confirmed:true},lang_two_words:{status:'emerging',confirmed:true},fine_pages:{status:'observed',confirmed:true}},completedAt:Date.now()};
ctx.saveAssessments([homeAssessment]);ctx.saveEvidence(ctx.assessmentEvidenceRows(homeAssessment));
const homePersonal=ctx.homeDevelopmentGuideSummary(21);
ctx.renderHomeDevelopmentGuideSummary(21);
assert('个人状态仍可计算但首页摘要不显示', homePersonal.items.map((item)=>item.status).join(',')==='可以多给机会,正在发展,已有记录' && !ctx.document.getElementById('homeDevelopmentGuideSection').innerHTML.includes('已有记录') && !ctx.document.getElementById('homeDevelopmentGuideSection').innerHTML.includes('可以多给机会'));
const homeUnknownAssessment={...homeAssessment,answers:{...homeAssessment.answers,lang_two_words:{status:'unobserved',confirmed:true}}};
ctx.saveAssessments([homeUnknownAssessment]);ctx.saveEvidence(ctx.assessmentEvidenceRows(homeUnknownAssessment));ctx.renderHomeDevelopmentGuideSummary(21);
const homeUnknownHtml=ctx.document.getElementById('homeDevelopmentGuideSection').innerHTML;
assert('首页摘要不显示 unknown 或其他个人 evidence 状态', !homeUnknownHtml.includes('还没记录到') && !homeUnknownHtml.includes('已有记录') && !homeUnknownHtml.includes('不会') && !homeUnknownHtml.includes('建议关注') && !homeUnknownHtml.includes('证据') && !homeUnknownHtml.includes('依据') && homeUnknownHtml.includes('<b>语言</b>') && homeUnknownHtml.includes('<b>精细动作</b>'));
const homeBeforeBirthday=ctx.homeDevelopmentGuideSummary(ctx.ageInfo(new Date(2027,0,15)).totM),homeAfterBirthday=ctx.homeDevelopmentGuideSummary(ctx.ageInfo(new Date(2027,0,16)).totM);
assert('24月龄生日自动切换下一阶段首页内容', homeBeforeBirthday.age_range[0]===21 && homeAfterBirthday.age_range[0]===24 && homeBeforeBirthday.items[0].text!==homeAfterBirthday.items[0].text);
const growthKeys=[ctx.OBS_KEY,ctx.EVIDENCE_KEY,ctx.ASSESSMENT_KEY],growthBefore=growthKeys.map((key)=>ctx.localStorage.getItem(key));let growthWrites=0;
ctx.localStorage.setItem=(key,value)=>{if(growthKeys.includes(key))growthWrites++;homeGuideSetItem(key,value);};
ctx.renderToday();ctx.renderToday();ctx.renderHomeDevelopmentGuideSummary(21);
vm.runInContext(script,ctx,{filename:'inline-home-guide-reload.js'});
assert('反复渲染和刷新首页不写入观察、评估、证据或总结', growthWrites===0 && growthKeys.every((key,i)=>ctx.localStorage.getItem(key)===growthBefore[i]));
let guideScrolled=false;ctx.document.getElementById('developmentGuideSection').scrollIntoView=()=>{guideScrolled=true;};
ctx.openHomeDevelopmentGuide();
assert('首页入口跳转成长页并定位完整指南且不写成长数据', growthWrites===0 && guideScrolled && ctx.document.getElementById('navBrain').classList.contains('active') && ctx.document.getElementById('page-brain').classList.contains('active'));
ctx.localStorage.setItem=homeGuideSetItem;

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
