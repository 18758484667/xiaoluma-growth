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
      toggle: (c, f) => { if (f === undefined) f = !s.has(c); f ? s.add(c) : s.delete(c); }
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
    getElementById: (id) => elements[id] || (elements[id] = new El()),
    querySelectorAll: () => [],
    querySelector: () => new El(),
    createElement: () => new El()
  },
  window: {},
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
assert('深度诊断可保存并计分', dx.length === 1 && dx[0].scores.cog === 5 && dx[0].scores.lang === 3, JSON.stringify(dx));

ctx.saveObs([
  { wk: '2026-05-04', items: { i0: 5 }, note: '', ts: 1 },
  { wk: '2026-06-01', items: { i1: 3 }, note: '', ts: 2 }
]);
ctx.renderTrend();
assert('月度趋势渲染无异常', true);

ctx.document.getElementById('archiveMonth').value = '2026-07';
ctx.genArchive();
assert('生成档案无异常', true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
