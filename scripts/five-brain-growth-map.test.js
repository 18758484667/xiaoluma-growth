const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ontology=require('../assets/five-brain-ontology-api.js');
const model=require('../assets/five-brain-growth-view-model.js');
const review=require('../local-data/five-brain-evidence-mappings.json');
const backup=require(path.join(process.env.HOME||'', 'Downloads',review.source_backup_file));
const root=path.join(__dirname,'..');
const bridge=fs.readFileSync(path.join(root,'local-data/five-brain-evidence-approved.js'),'utf8');
const context={};vm.runInNewContext(bridge,context);
const approved=Array.from(context.FIVE_BRAIN_APPROVED_EVIDENCE);
const build=(evidence,mappings=approved)=>model.build({ageMonths:21,evidence,approvedMappings:mappings,ontologyApi:ontology});
const snapshot=JSON.stringify([backup.evidence,approved,review]);
let passed=0;function check(name,fn){fn();passed++;console.log('PASS',name);}
const map=build(backup.evidence);
const abilities=map.groups.flatMap(group=>group.abilities);
const byId=id=>abilities.find(a=>a.ability_id===id);
const pageContext={window:{},document:{getElementById:()=>null},esc:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/growth-plan-v2.js'),'utf8'),pageContext);
const render=pageContext.window.GrowthPageV2.renderers.fiveBrain;

check('五脑19项与21个月年龄状态分组正确',()=>{
  assert.equal(map.groups.length,5);assert.equal(abilities.length,19);
  const counts=Object.fromEntries(['active_observation','early_signal_only','future','support_context'].map(s=>[s,abilities.filter(a=>a.applicability===s).length]));
  assert.deepEqual(counts,{active_observation:9,early_signal_only:6,future:3,support_context:1});
});
check('7条批准链接按当前原始记录匹配，恰好4项能力有记录',()=>{
  assert.equal(approved.length,7);
  assert.equal(abilities.reduce((n,a)=>n+a.observations.length,0),7);
  assert.deepEqual(abilities.filter(a=>a.observations.length).map(a=>a.ability_id).sort(),['emo_social_relationships','lang_expression','mov_fine_motor','mov_gross_motor']);
  assert.ok(abilities.filter(a=>a.applicability==='active_observation'&&!a.observations.length).every(a=>a.display_status==='no_observation'));
});
check('所有实际记录只显示记录较少，不依据条数输出强弱',()=>{
  assert.ok(abilities.filter(a=>a.observations.length).every(a=>a.display_status==='limited_observation'));
  assert.equal(byId('mov_fine_motor').observations.length,4);
  assert.ok(!JSON.stringify(map).match(/score|level|strength|weakness|proficiency|normality|sufficient/i));
});
check('来源、日期和原始文字可追溯，emerging仍为正在出现',()=>{
  const stair=byId('mov_gross_motor').observations[0];
  assert.equal(stair.date,'2026-10-23');assert.equal(stair.behavior,'扶着墙或栏杆上楼梯');assert.equal(stair.source_label,'月度评估');
  assert.ok(byId('mov_fine_motor').observations.some(o=>o.behavior==='尝试使用勺子进食'&&o.source_status==='emerging'));
});
check('修改或移除原始评估后，旧静态映射立即失效',()=>{
  const changed=structuredClone(backup.evidence);changed.find(x=>x.capability_ids.includes('motor_stairs')).evidence_type='not_yet';
  assert.equal(build(changed).groups.flatMap(g=>g.abilities).find(a=>a.ability_id==='mov_gross_motor').observations.length,0);
  const removed=backup.evidence.filter(x=>!x.capability_ids.includes('lang_two_words'));
  assert.equal(build(removed).groups.flatMap(g=>g.abilities).find(a=>a.ability_id==='lang_expression').observations.length,0);
});
check('not_yet、unobserved、future与未批准链接均不进入地图',()=>{
  assert.ok(!map.groups.flatMap(g=>g.abilities).some(a=>a.observations.some(o=>/会跑|双脚同时离地/.test(o.behavior))));
  const notApproved=approved.map(x=>({...x,review_status:'pending_review'}));
  assert.equal(build(backup.evidence,notApproved).groups.flatMap(g=>g.abilities).reduce((n,a)=>n+a.observations.length,0),0);
  assert.ok(abilities.filter(a=>a.applicability==='future').every(a=>a.display_status==='future'&&a.observations.length===0));
});
check('early是早期提示，健康管理只作为生活支持背景',()=>{
  assert.ok(abilities.filter(a=>a.applicability==='early_signal_only').every(a=>a.display_status==='early_context'));
  assert.equal(byId('mov_health_context').display_status,'support_context');
  assert.equal(abilities.filter(a=>a.applicability==='active_observation').length,9);
});
check('游戏、收藏、反馈和周计划来源不能改变观察状态',()=>{
  const unrelated=[...backup.evidence,{observation_id:'game-1',date:'2026-10-23',raw_record:'扶着墙或栏杆上楼梯',capability_ids:['motor_stairs'],evidence_type:'observed',source:'game_feedback',confirmed:true}];
  assert.deepEqual(build(unrelated),map);
});
check('零证据正常返回五脑地图，不要求完成评估',()=>{
  const empty=build([]);assert.equal(empty.has_observations,false);
  assert.equal(empty.groups.length,5);
  assert.ok(empty.groups.flatMap(g=>g.abilities).filter(a=>a.applicability==='active_observation').every(a=>a.display_status==='no_observation'));
});
check('视图与原始数据只读，私有桥接文件不进Git',()=>{
  assert.equal(JSON.stringify([backup.evidence,approved,review]),snapshot);
  assert.ok(fs.readFileSync(path.join(root,'.gitignore'),'utf8').includes('local-data/'));
  assert.ok(!fs.readFileSync(path.join(root,'assets/five-brain-growth-view-model.js'),'utf8').includes('localStorage.setItem'));
});
check('成长观察Tab承载地图，四Tab及旧官方入口保留',()=>{
  const script=fs.readFileSync(path.join(root,'assets/growth-plan-v2.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'育儿系统看板.html'),'utf8');
  assert.ok(script.includes('id="gvFiveBrainMap"'));
  assert.ok(script.indexOf('id="gvFiveBrainMap"')<script.indexOf('id="obsNote"'));
  for(const tab of ['本月总结','成长观察','月度档案','成长评估'])assert.ok(script.includes(tab));
  assert.ok(script.includes('milestoneCheckpointSection'));
  assert.ok(html.includes('assets/five-brain-growth-view-model.js'));
});
check('移动与桌面样式无五列布局且正文保持可读',()=>{
  const css=fs.readFileSync(path.join(root,'assets/growth-plan-v2.css'),'utf8');
  assert.ok(css.includes('.gv-five-brain-map{margin-bottom:32px;min-width:0}'));
  assert.ok(css.includes('.gv-brain-group{padding:20px 0'));
  assert.ok(css.includes('@media(max-width:600px)'));
  assert.ok(!/\.gv-brain-group\{[^}]*grid-template-columns:repeat\(5/.test(css));
});
check('成长观察默认选中且五脑为唯一主成长结构',()=>{
  const script=fs.readFileSync(path.join(root,'assets/growth-plan-v2.js'),'utf8');
  assert.ok(script.includes("tab='observation'"));
  assert.ok(script.includes('id="gvFiveBrainMap"'));
  assert.ok(!script.includes('id="gvTrajectory"')&&!script.includes('id="gvDimensions"'));
  assert.ok(!script.includes('五维发展轨迹')&&!script.includes('五维详细情况'));
});
check('真实7条映射只让4项显示记录较少，其余5项继续观察',()=>{
  const html=render(map);
  for(const name of ['智力脑','创意脑','语言脑','情绪脑','运动脑'])assert.ok(html.includes('<h3>'+name+'</h3>'));
  for(const name of ['粗大运动','精细动作','语言表达','社会关系'])assert.match(html,new RegExp('<strong>'+name+'</strong><span>记录较少</span>'));
  for(const name of ['感知注意','问题解决','记忆学习','语言理解','社会认知'])assert.match(html,new RegExp('<strong>'+name+'</strong><span>继续观察</span>'));
  assert.ok(!html.includes('五维发展轨迹')&&!html.includes('五维详细情况'));
  assert.ok(!html.includes('符合当前阶段')&&!html.includes('正在发展'));
});
check('语言表达与理解、社会关系与认知分开且观察可追溯',()=>{
  const html=render(map);
  assert.ok(html.includes('能把至少两个词组合在一起'));
  assert.ok(html.includes('能和家人玩来回传球等互动游戏'));
  assert.ok(html.includes('2026-10-23 · 月度评估'));
  assert.ok(!html.includes('4次独立观察'));
  assert.ok(!html.includes('mapping_id')&&!html.includes('confidence'));
});
check('有记录项使用原生展开，收起时不预先展示观察正文',()=>{
  const html=render(map);
  assert.match(html,/<details class="gv-brain-ability"[^>]*><summary><strong>社会关系<\/strong><span>记录较少<\/span><\/summary>/);
  assert.ok(html.includes('本次月度评估包含以下相关记录'));
  const summary=html.match(/<summary><strong>社会关系<\/strong>[\s\S]*?<\/summary>/)[0];
  assert.ok(!summary.includes('能和家人玩来回传球等互动游戏'));
  assert.match(html,/<div class="gv-brain-ability gv-brain-ability-empty"><strong>社会认知<\/strong><span>继续观察<\/span><\/div>/);
});
check('展开箭头固定在标题行右侧，不参与内容自动换行',()=>{
  const css=fs.readFileSync(path.join(root,'assets/growth-plan-v2.css'),'utf8');
  assert.match(css,/\.gv-brain-ability>summary::after\{[^}]*position:absolute;right:4px;top:50%;transform:translateY\(-50%\)/);
  assert.match(css,/\.gv-brain-ability\[open\]>summary::after\{[^}]*rotate\(180deg\)/);
});
check('同一月度评估按稳定来源事件分组，勺子回答保留原文但不并列成独立观察',()=>{
  const fine=byId('mov_fine_motor').observations;
  assert.equal(new Set(fine.map(o=>o.event_id)).size,1);
  assert.ok(fine.every(o=>o.event_id.startsWith('assess_')));
  const html=render(map);
  assert.equal((html.match(/class="gv-brain-original"/g)||[]).length,1);
  assert.ok(html.includes('使用勺子（本次评估的相关回答）'));
  assert.ok(html.includes('<summary>查看原始记录</summary><ul><li>尝试使用勺子进食</li><li>会用勺子吃饭</li></ul>'));
  assert.ok(!html.includes('4次观察')&&!html.includes('两次观察'));
});
check('不确定事件不按同日同来源合并，原始记录保持原样',()=>{
  const separate=structuredClone(backup.evidence);
  const spoon=separate.find(o=>o.capability_ids.includes('fine_spoon_eat'));
  spoon.observation_id='separate-source-fine_spoon_eat';
  const links=approved.map(o=>o.source_capability_id==='fine_spoon_eat'?{...o,source_evidence_id:spoon.observation_id}:o);
  const observations=build(separate,links).groups.flatMap(g=>g.abilities).find(a=>a.ability_id==='mov_fine_motor').observations;
  assert.equal(new Set(observations.map(o=>o.event_id)).size,2);
  assert.equal(JSON.stringify([backup.evidence,approved,review]),snapshot);
});
check('普通展开仅轻背景变化，键盘 focus 仍有可见描边',()=>{
  const css=fs.readFileSync(path.join(root,'assets/growth-plan-v2.css'),'utf8');
  assert.ok(css.includes('.gv-brain-ability[open]{background:#f8fbf8}'));
  assert.ok(!/\.gv-brain-ability\[open\]\{[^}]*border/.test(css));
  assert.ok(css.includes('summary:focus-visible{outline:2px'));
});
check('早期、未来和健康支持独立呈现且无虚假时间轴',()=>{
  const html=render(map);
  assert.ok(html.includes('早期表现阶段'));
  assert.ok(html.includes('再大一些后逐渐变得更容易观察'));
  assert.ok(html.includes('生活与健康支持'));
  assert.ok(!html.includes('18月附近')&&!html.includes('24月附近'));
  assert.ok(!html.includes('暂无能力')&&!html.includes('能力不足'));
});
check('空 evidence 仍显示五组，不因浏览而写入数据',()=>{
  const before=JSON.stringify(backup.evidence);
  const html=render(build([]));
  assert.equal((html.match(/class="gv-brain-group"/g)||[]).length,5);
  assert.ok(html.includes('成长地图会随着日常真实观察慢慢丰富'));
  assert.equal(JSON.stringify(backup.evidence),before);
});
console.log(`Five-brain growth map: ${passed} passed, 0 failed`);
