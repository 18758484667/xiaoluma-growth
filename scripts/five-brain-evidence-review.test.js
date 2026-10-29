const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ontology = require('../assets/five-brain-ontology-api.js');
const schema = require('../assets/five-brain-mapping-schema.js');
const reviewed = require('../local-data/five-brain-evidence-mappings.json');

const root = path.join(__dirname, '..');
const sourcePath = path.join(process.env.HOME || '', 'Downloads', reviewed.source_backup_file);
const source = fs.existsSync(sourcePath) ? JSON.parse(fs.readFileSync(sourcePath, 'utf8')) : null;
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const bySource = new Map((source?.evidence || []).map(row => [row.observation_id, row]));
const expectedIds = ['fine_lid','fine_pages','fine_spoon','fine_spoon_eat','lang_two_words','motor_stairs','soc_ball'].map(id => `assess_assess_mvk71ipg_4h6w9y_${id}`);
let passed = 0;
function check(label, fn) { fn(); passed++; console.log('PASS', label); }

check('仅复核原有7条候选，没有扫描或新增源记录', () => {
  assert.equal(reviewed.mappings.length, 7);
  assert.deepEqual(reviewed.mappings.map(m => m.source_evidence_id).sort(), expectedIds.sort());
  assert.equal(reviewed.unmapped.length, 3);
  assert.equal(new Set(reviewed.mappings.map(m => m.mapping_id)).size, 7);
});
check('全部决定状态明确，批准项有日期、具体行为和逐项理由', () => {
  assert.deepEqual(schema.validateMappings(reviewed.mappings, ontology), []);
  for (const m of reviewed.mappings) {
    assert.equal(m.review_status, 'approved');
    assert.equal(m.reviewed_at, '2026-10-28');
    assert.ok(m.review_note && m.mapping_reason && m.observed_behavior);
    assert.equal(m.source_type, 'monthly_assessment');
    assert.equal(m.mapping_kind, 'ability_observation');
    assert.equal(m.age_status_at_time, 'active_observation');
    assert.ok(['observed','emerging'].includes(m.source_evidence_status));
  }
});
check('源备份逐字节未变，链接只引用其中已确认的真实评估行为', () => {
  assert.ok(source, `需要原始备份：${sourcePath}`);
  assert.equal(sha256(sourcePath), reviewed.source_backup_sha256);
  assert.equal(source.evidence.length, 10);
  for (const m of reviewed.mappings) {
    const row = bySource.get(m.source_evidence_id);
    assert.ok(row && row.confirmed && row.source === 'monthly_assessment');
    assert.equal(m.observed_behavior, row.raw_record);
    assert.equal(m.source_capability_id, row.capability_ids[0]);
    assert.equal(m.source_evidence_status, row.evidence_type);
    assert.equal(m.observed_at, row.date);
  }
});
check('旧领域名称不构成跨能力推断，一条源证据最多一条现有映射', () => {
  assert.equal(new Set(reviewed.mappings.map(m => m.source_evidence_id)).size, 7);
  assert.deepEqual([...new Set(reviewed.mappings.map(m => m.ability_id))].sort(), ['emo_social_relationships','lang_expression','mov_fine_motor','mov_gross_motor']);
  assert.ok(reviewed.mappings.every(m => !['int_perceptual_attention','int_problem_solving','int_memory_learning'].includes(m.ability_id)));
});
check('not_yet、unobserved 和未来项目仍为 unmapped，不形成负向五脑证据', () => {
  const excluded = Object.fromEntries(reviewed.unmapped.map(x => [x.source_capability_id,x]));
  assert.equal(excluded.motor_run.source_evidence_status, 'unobserved');
  assert.equal(excluded.motor_jump.source_evidence_status, 'not_yet');
  assert.equal(excluded.motor_jump.reason, 'future_not_yet_kept_only_as_reference');
  assert.ok(reviewed.mappings.every(m => !['motor_run','motor_jump','cog_pretend'].includes(m.source_capability_id)));
});
check('emerging 原样保留，用勺两题不被当作两次独立复现', () => {
  const emerging = reviewed.mappings.filter(m => m.source_evidence_status === 'emerging');
  assert.equal(emerging.length, 3);
  const spoon = emerging.filter(m => ['fine_spoon','fine_spoon_eat'].includes(m.source_capability_id));
  assert.equal(spoon.length, 2);
  assert.ok(spoon.every(m => /不能算独立复现/.test(m.review_note)));
  assert.equal(new Set(reviewed.mappings.map(m => m.observed_at)).size, 1);
});
check('语言表达不自动推断理解，社会关系不自动推断社会认知', () => {
  assert.equal(reviewed.mappings.find(m => m.source_capability_id === 'lang_two_words').ability_id, 'lang_expression');
  assert.equal(reviewed.mappings.find(m => m.source_capability_id === 'soc_ball').ability_id, 'emo_social_relationships');
  assert.ok(!reviewed.mappings.some(m => ['lang_comprehension','emo_social_cognition'].includes(m.ability_id)));
});
check('early 与 future 审核边界仍有效', () => {
  const row = {...reviewed.mappings[0], ability_id:'lang_reading_readiness', age_status_at_time:'early_signal_only', mapping_kind:'ability_observation'};
  assert.ok(schema.validateMapping(row,ontology).includes('early signal requires signal_mapping'));
  const future = {...reviewed.mappings[0], ability_id:'cre_counterfactual_thinking',age_status_at_time:'future'};
  assert.ok(schema.validateMapping(future,ontology).includes('mapping cannot be approved at this age status'));
});
check('九项 active ability 摘要只表达观察覆盖，不生成强弱或充分度', () => {
  const active = ontology.getFiveBrainOntology().abilities.filter(a => ontology.getAgeObservationStatus(a.ability_id,21).age_observation_status === 'active_observation');
  assert.equal(active.length, 9); assert.equal(reviewed.developer_summary.length, 9);
  for (const ability of active) {
    const item = reviewed.developer_summary.find(x => x.ability_id === ability.ability_id);
    const rows = reviewed.mappings.filter(m => m.review_status === 'approved' && m.ability_id === ability.ability_id);
    assert.ok(item); assert.equal(item.approved_evidence_count, rows.length);
    assert.equal(item.source_evidence_count, new Set(rows.map(m => m.source_evidence_id)).size);
    assert.equal(item.latest_observation, rows.length ? '2026-10-23' : null);
    assert.equal(item.coverage_state, rows.length ? 'limited_observation' : 'no_observation');
  }
});
check('推荐、周计划与游戏映射保持原样', () => {
  const expected = {
    'assets/activity-recommendation-learning.js':'32697e66b5353256332b7929fb0fb3bd3870ddc5bb21f23e4d9afa8b64107a98',
    'assets/weekly-learning-plan.js':'607d897843a31ba91a1deb9c6e9c72b0dc00b6256309d93dea9db4109c5898ef',
    'data/activity-five-brain-mappings.json':'ed86f41aae37bcee13c843c3420f6de90e6dfd03e4fd4454bb1e88f8060293ce',
    'data/activity-five-brain-mappings-batch2.json':'c1612156df61e84dcfafa394161a8c680a3b5b685df18f45c7b347e6abe2f470',
    'data/activity-five-brain-mappings-batch3.json':'e8658d34c97b5ed38007b56f39e216670fc45d463547474db4e5ad8ff6450f2d',
    'data/five-brain-gap-content-pilot.json':'3ca9102425c879abb98347c9f5dee625df15b4d1cbd1cbc17ae49a62804c380c'
  };
  for (const [file,digest] of Object.entries(expected)) assert.equal(sha256(path.join(root,file)),digest,file);
});
console.log(`Five-brain evidence review: ${passed} passed, 0 failed`);
