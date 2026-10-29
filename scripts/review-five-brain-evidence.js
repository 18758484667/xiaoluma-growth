#!/usr/bin/env node
/* Read-only Phase 3.3B pilot: inspect an explicit local JSON backup.
 * This tool does not modify the backup, product storage, or project data. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const api=require('../assets/five-brain-ontology-api.js');
const pilot=require('../assets/five-brain-evidence-pilot.js');
const schema=require('../assets/five-brain-mapping-schema.js');
const input=process.argv[2];
if(!input){console.error('Usage: node scripts/review-five-brain-evidence.js /absolute/path/to/backup.json');process.exit(2);}
const backup=JSON.parse(fs.readFileSync(input,'utf8'));
const records=Array.isArray(backup)?backup:backup.evidence;
const birthDate=backup.birth;
if(!Array.isArray(records)||!/^\d{4}-\d{2}-\d{2}$/.test(birthDate||'')){
  console.error('Expected exported JSON with birth and evidence array. No data was changed.');process.exit(2);
}
const html=fs.readFileSync(path.join(__dirname,'..','育儿系统看板.html'),'utf8');
const match=html.match(/var CAPABILITIES=(\[[\s\S]*?\]);\s*enrichCapabilitySources/);
if(!match){console.error('Cannot read existing capability catalog.');process.exit(2);}
const catalog=vm.runInNewContext('('+match[1]+')');
const capabilityIndex=Object.fromEntries(catalog.map(x=>[x.capability_id,x]));
const preferred=new Set(Object.keys(pilot.directRules));
const ordered=records.filter(x=>x&&x.observation_id).slice().sort((a,b)=>{
  const score=x=>{
    const id=Array.isArray(x.capability_ids)&&x.capability_ids.length===1?x.capability_ids[0]:null;
    return (x.confirmed===true?8:0)+(preferred.has(id)?4:0)+(x.source==='monthly_assessment'?4:0)+(['not_yet','unobserved'].includes(x.evidence_type)?2:0);
  };
  return score(b)-score(a)||String(b.date||'').localeCompare(String(a.date||''))||String(a.observation_id).localeCompare(String(b.observation_id));
}).slice(0,20);
const result=pilot.audit(ordered,{birthDate,ontologyApi:api,capabilityIndex});
const schemaErrors=schema.validateMappings(result.mappings,api);
if(schemaErrors.length){console.error(schemaErrors.join('\n'));process.exit(1);}
const output={pilot_version:'3.3B-preview',source_backup_path:path.resolve(input),source_total_count:records.length,
  reviewed_count:result.reviewed_count,mapped_source_count:result.mapped_source_count,
  mapping_count:result.mapping_count,unmapped_count:result.unmapped_count,
  mappings:result.mappings,unmapped:result.unmapped,
  developer_summary:pilot.summary(result.mappings,api)};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
