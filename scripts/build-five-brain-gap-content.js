const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pilot = JSON.parse(fs.readFileSync(path.join(root, 'data/five-brain-gap-content-pilot.json'), 'utf8'));
const allowed = ['activity_id', 'canonical_id', 'decision', 'title', 'age_range', 'primary_domain', 'secondary_domains', 'duration', 'caregiver_effort', 'location', 'prep_cost', 'cleanup_cost', 'materials', 'safety_notes', 'activity_context_type', 'core_play', 'steps'];
const rows = pilot.items.filter(item => item.mapping_status === 'approved').map(item => Object.fromEntries(allowed.map(key => [key, item[key]])));
if (rows.length !== 6 || rows.some(item => !item.activity_id || !item.materials || !item.steps?.length)) throw new Error('Reviewed content is incomplete');
const output = '/* Generated from reviewed pilot content; five-brain mapping is intentionally excluded. */\nvar FIVE_BRAIN_GAP_CONTENT = ' + JSON.stringify(rows, null, 2) + ';\n';
const target = path.join(root, 'assets/five-brain-gap-content.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) throw new Error('Reviewed game content asset is out of date');
} else fs.writeFileSync(target, output);
