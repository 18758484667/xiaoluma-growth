const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', '育儿系统看板.html');
const html = fs.readFileSync(htmlPath, 'utf8');
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

assert('首页今日游戏提供换一换入口', html.includes('onclick="refreshTodayActivities()"') && html.includes('🔄 换一换'));
assert('换一换不再显示多余的成功提示', !html.includes('已按当前条件换了一批') && !html.includes('id="todayRefreshHint"'));
assert('通用推荐理由不再展示给家长', html.includes('.today-why{display:none}') && html.includes('<summary>查看玩法与安全提示</summary>') && !html.includes('查看玩法、推荐理由与安全提示'));
assert('移动端正文与操作文字保持可读字号', html.includes('/* 阅读字号校准：手机上正文不低于 15–16px') && html.includes('.today-actions button,.today-chip,.feedback-row button{\n  font-size:15px;') && html.includes('.today-desc{line-height:1.7}'));
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
assert('首页使用固定条件栏和底部面板', html.includes('.today-condition-dock{position:fixed') && html.includes('id="todayConditionDock"') && html.includes('id="todaySettingsSheet"') && html.includes('onclick="openTodaySettings()"'));
assert('常驻栏为最后内容预留安全间距', html.includes('body.today-dock-visible .container{padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))'));
assert('iPhone safe-area 同时用于底栏和底部面板', html.includes('bottom:calc(10px + env(safe-area-inset-bottom,0px))') && html.includes('padding:8px 18px calc(18px + env(safe-area-inset-bottom,0px))'));
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
