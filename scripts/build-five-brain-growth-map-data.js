/* Local-only bridge for the reviewed child evidence links. Never commit the output. */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = path.join(root, 'local-data/five-brain-evidence-mappings.json');
const target = path.join(root, 'local-data/five-brain-evidence-approved.js');
if (!fs.existsSync(source)) throw new Error('Reviewed local evidence mappings are unavailable');
const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const keys = ['mapping_id','source_evidence_id','source_capability_id','observed_behavior','observed_at','age_months_at_time','ability_id','age_status_at_time','mapping_reason','mapping_source','review_status','reviewed_at','source_evidence_status','mapping_kind'];
const rows = data.mappings.filter(row => row.review_status === 'approved').map(row => Object.fromEntries(keys.map(key => [key, row[key]])));
if (rows.length !== 7 || rows.some(row => !row.source_evidence_id || !row.reviewed_at || !row.mapping_reason)) throw new Error('Reviewed evidence links are incomplete');
const output = '/* Private local evidence links; generated from the reviewed mapping file. */\nvar FIVE_BRAIN_APPROVED_EVIDENCE = ' + JSON.stringify(rows, null, 2) + ';\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) throw new Error('Local growth map bridge is out of date');
} else fs.writeFileSync(target, output);
