#!/usr/bin/env node
/* Developer-only editorial queue. Suggestions never become confirmed labels without typed human input. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),readline=require('node:readline/promises');
const root=path.join(__dirname,'..'),queueFile=path.join(root,'activity-mechanism-review.json'),outputFile=path.join(root,'assets/activity-mechanism-confirmed.js');
const queue=JSON.parse(fs.readFileSync(queueFile,'utf8')),context={Number};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/brain-knowledge-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/activity-mechanism-confirmed.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/brain-knowledge-foundation.js'),'utf8'),context);
const allowed=new Set(context.BRAIN_MECHANISMS.map(x=>x.mechanism_id));
function save(){
  const confirmed={};queue.filter(x=>x.status==='confirmed').forEach(x=>{confirmed[x.activity_id]={status:'confirmed',mechanism_ids:x.mechanism_ids,reviewed_at:x.reviewed_at,reviewed_by:x.reviewed_by};});
  const mapScript='/* Generated only from explicit human confirmations. */\nvar ACTIVITY_MECHANISMS_CONFIRMED='+JSON.stringify(confirmed,null,2)+';\n';
  fs.writeFileSync(queueFile+'.tmp',JSON.stringify(queue,null,2)+'\n');fs.renameSync(queueFile+'.tmp',queueFile);
  fs.writeFileSync(outputFile+'.tmp',mapScript);fs.renameSync(outputFile+'.tmp',outputFile);
}
if(process.argv.includes('--list')){
  queue.forEach(x=>console.log(`${x.status}\t${x.activity_id}\t${x.title}\t建议：${x.suggested_mechanism_ids.join('、')||'无'}`));
  process.exit(0);
}
if(!process.argv.includes('--review')||!process.stdin.isTTY){
  console.error('用法：node scripts/review-activity-mechanisms.js --list；人工确认时在终端运行 --review');
  process.exit(1);
}
(async()=>{
  const rl=readline.createInterface({input:process.stdin,output:process.stdout});
  try{
    const reviewer=(await rl.question('审核人姓名：')).trim();if(!reviewer)throw Error('必须填写审核人');
    for(const row of queue.filter(x=>x.status==='pending_human_review')){
      console.log(`\n${row.title} (${row.activity_id})\n${row.description}\n候选：${row.suggested_mechanism_ids.join('、')||'无'}\n可选机制：${[...allowed].join('、')}`);
      const raw=(await rl.question('输入确认的 mechanism_id（逗号分隔）；s 跳过；q 结束：')).trim();
      if(raw==='q')break;
      if(raw==='s'){row.status='skipped';row.mechanism_ids=[];row.reviewed_by=reviewer;row.reviewed_at=new Date().toISOString();save();continue;}
      const ids=[...new Set(raw.split(/[,，\s]+/).map(x=>x.trim()).filter(Boolean))];
      if(!ids.length||ids.some(id=>!allowed.has(id))){console.log('未保存：机制 ID 为空或不在 taxonomy 中。');continue;}
      const confirm=(await rl.question(`确认将 ${row.activity_id} 标为 ${ids.join('、')}？输入 yes 保存：`)).trim();
      if(confirm!=='yes'){console.log('未保存。');continue;}
      row.mechanism_ids=ids;row.status='confirmed';row.reviewed_by=reviewer;row.reviewed_at=new Date().toISOString();save();
      console.log('已保存人工确认。');
    }
  }finally{rl.close();}
})().catch(e=>{console.error(e.message);process.exit(1);});
