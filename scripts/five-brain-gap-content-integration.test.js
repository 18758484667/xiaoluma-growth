const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const data = require('../data/five-brain-gap-content-pilot.json');
const smokeFile = path.join(__dirname, 'smoke.test.js');
const loader = new Module(smokeFile, module);
loader.filename = smokeFile;
loader.paths = Module._nodeModulePaths(__dirname);
loader._compile(fs.readFileSync(smokeFile, 'utf8').split('let pass = 0;')[0] + '\nmodule.exports={ctx,storage};', smokeFile);
const {ctx, storage} = loader.exports;
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS', name); }
const approved = data.items.filter(x => x.mapping_status === 'approved');
const canonicals = approved.filter(x => x.decision === 'new_canonical');
const variants = approved.filter(x => x.decision === 'add_as_variant');
const catalog = ctx.activityCatalog();

check('三项新主游戏正式并库，三项玩法变化不重复计为主游戏', () => {
  assert.equal(canonicals.length, 3); assert.equal(variants.length, 3);
  assert.equal(ctx.rawActivityCatalog().length, 191); assert.equal(catalog.length, 161);
  assert.equal(catalog.filter(a => ctx.activityAvailableAtAge(a, 21)).length, 57);
  for (const x of canonicals) assert.ok(catalog.some(a => a.activity_id === x.activity_id));
  for (const x of variants) {
    assert.ok(!catalog.some(a => a.activity_id === x.activity_id));
    assert.equal(ctx.canonicalActivityId(x.activity_id), x.canonical_id);
    assert.ok(ctx.activityById(x.canonical_id).variants.some(v => v.variant_id === x.activity_id));
  }
});
check('六项材料和实际步骤均通过21个月安全边界', () => {
  for (const x of approved) {
    const row = ctx.rawActivityCatalog().find(a => a.activity_id === x.activity_id);
    assert.ok(row); assert.equal(ctx.activityAvailableAtAge(row, 21), true);
    assert.equal(row.materials, x.materials); assert.equal(row.safety_notes, x.safety_notes);
    assert.deepEqual(Array.from(row.steps), x.steps);
    assert.ok(!/瓶盖|小珠|硬币|碎片|小零件|重盖|不稳定家具/.test(row.materials));
  }
});
check('Today 原候选逻辑可使用三个新主游戏且不读取五脑能力', () => {
  const prefs = {duration:'10_15',context:'home',energy:'medium',interests:[]};
  const eligible = ctx.eligibleActivities(21, prefs, {});
  for (const x of canonicals) assert.ok(eligible.some(a => a.activity_id === x.activity_id), x.activity_id);
  const html = fs.readFileSync(path.join(__dirname, '..', '育儿系统看板.html'), 'utf8');
  assert.ok(html.includes('assets/five-brain-gap-content.js'));
  assert.ok(!html.includes('five-brain-gap-content-pilot.json'));
  assert.ok(!fs.readFileSync(path.join(__dirname, '..', 'assets/five-brain-gap-content.js'), 'utf8').includes('primary_ability_ids'));
});
check('weekly plan 沿用原候选池和安全过滤', () => {
  const plan = ctx.buildWeeklyPlan('2026-10-28');
  assert.ok(plan && Array.isArray(plan.suggested_activities));
  for (const item of plan.suggested_activities) assert.ok(ctx.activityById(item.activity_id));
});
check('新主游戏与变化可收藏、反馈，且不产生五脑或成长 evidence', () => {
  const before = JSON.stringify(ctx.loadEvidence()), five = storage.get('xlma_five_brain_evidence_v1');
  ctx.toggleActivityFavorite('gap_open_big_box');
  assert.ok(ctx.validFavoriteIds().includes('gap_open_big_box'));
  ctx.toggleActivityFavorite('gap_variant_cup_try_another');
  assert.ok(ctx.validFavoriteIds().includes('act_10_叠叠杯排序'));
  ctx.updateActivityFeedback('gap_variant_bear_sleep_recall','enjoyment','love');
  assert.ok(ctx.loadActivityFeedback().some(x => x.activity_id === 'act_1_假装游戏' && x.variant_id === 'gap_variant_bear_sleep_recall'));
  assert.equal(JSON.stringify(ctx.loadEvidence()), before);
  assert.equal(storage.get('xlma_five_brain_evidence_v1'), five);
});
check('导出、旧备份与旧别名兼容', () => {
  ctx.Blob = class { constructor(parts) { ctx.__exportedJson = parts.join(''); } };
  ctx.exportData();
  const exported = JSON.parse(ctx.__exportedJson);
  assert.ok(exported.activityFavorites.some(x => x.activity_id === 'gap_open_big_box'));
  assert.ok(exported.activityFeedback.some(x => x.activity_id === 'act_1_假装游戏'));
  assert.equal(ctx.canonicalActivityId('act_117_追泡泡_推行小车'), 'act_14_泡泡追跑');
  ctx.__fileContent = JSON.stringify({activityFavorites:[{activity_id:'act_117_追泡泡_推行小车',created_at:'2026-10-01T00:00:00.000Z'}],activityFeedback:[]});
  ctx.__confirmReturn = false; ctx.importData({files:[{}]});
  assert.ok(ctx.validFavoriteIds().includes('act_14_泡泡追跑'));
});
check('五脑映射只保留在审核数据层，变化映射未提升到主游戏', () => {
  for (const x of variants) assert.equal(x.mapping_scope, 'variant_only');
  assert.ok(!approved.some(x => x.activity_id === 'act_1_假装游戏' && x.primary_ability_ids.includes('int_memory_learning')));
  assert.ok(!approved.some(x => x.activity_id === 'act_10_叠叠杯排序' && x.primary_ability_ids.includes('int_problem_solving')));
  assert.equal(new Set(approved.filter(x => x.primary_ability_ids.includes('int_problem_solving')).map(x => x.canonical_id)).size, 3);
  assert.equal(new Set(approved.filter(x => x.primary_ability_ids.includes('int_memory_learning')).map(x => x.canonical_id)).size, 2);
});
console.log(`Five-brain gap content integration: ${passed} passed, 0 failed`);
