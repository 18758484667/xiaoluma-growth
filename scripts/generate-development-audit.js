// Regenerate the two content inventories without changing product data.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, '育儿系统看板.html'), 'utf8');
const capabilityDeclaration = html.match(/var CAPABILITIES=\[[\s\S]*?\n\];/);
if (!capabilityDeclaration) throw new Error('CAPABILITIES declaration not found');
const context = {};
vm.createContext(context);
vm.runInContext(capabilityDeclaration[0] + '\n' + fs.readFileSync(path.join(root, 'assets/development-guide-content.js'), 'utf8'), context);
const capabilities = context.CAPABILITIES;
const bands = context.DEVELOPMENT_GUIDE_CONTENT;
const toys = context.DEVELOPMENT_GUIDE_TOYS;
const capById = Object.fromEntries(capabilities.map(c => [c.capability_id, c]));
const toyById = Object.fromEntries(toys.map(t => [t.toy_id, t]));
const domainNames = { motor:'大运动', fine:'精细动作', lang:'语言沟通', cog:'认知探索', soc:'社会交往／情绪' };
const sources = {
  nhc:'https://www.nhc.gov.cn/wjw/c100378/202502/658e7e4eb5024746b13186ac0f97a27b/files/1741749469944_58197.pdf',
  cdc18:'https://www.cdc.gov/act-early/milestones/18-months.html',
  cdc24:'https://www.cdc.gov/act-early/milestones/2-years.html',
  cdc30:'https://www.cdc.gov/act-early/milestones/30-months.html',
  cpsc:'https://www.cpsc.gov/FAQ/Small-Parts-and-Choking-Hazard-Labeling-FAQs'
};
const clean = value => String(value == null ? '未设置' : value).replace(/\|/g, '／').replace(/\n/g, ' ');
const line = cells => '| ' + cells.map(clean).join(' | ') + ' |';
const sourceLevel = c => c.source_type==='official_anchor'?'官方锚点（产品标签需核对原文）':c.source_type==='adapted_anchor'?'官方内容的产品改写':'产品观察项；非官方年龄锚点';
const sourceLink = c => c.source.includes('CDC') ? (c.typical_age_end===18?sources.cdc18:c.typical_age_end===30?sources.cdc30:sources.cdc24) : c.source.includes('卫健委') ? sources.nhc : null;
const bandName = b => `${b.age_range[0]}～${b.age_range[1]} 月龄`;
const guideUses = id => bands.filter(b => Object.values(b.domains).flat().some(x=>x.capability_id===id)||b.opportunities.some(x=>x.capability_ids.includes(id))||b.observe_points.some(x=>x.capability_id===id)).map(b=>`${b.age_range[0]}～${b.age_range[1]}`);
const capabilityGroup = c => c.typical_age_end===18?0:c.typical_age_end===24?2:c.typical_age_end===30?4:6;
const canWatch = c => c.source_type==='product_observation'?'不能凭 not_yet；无年龄窗':'关键项过缓冲期 not_yet 或当前冲突；普通项仅冲突';
const canConcern = c => c.source_type==='product_observation'?'不能凭 not_yet；文字匹配“倒退”仍可能触发':c.importance==='key'?'与另一项过期关键锚点均跨日 not_yet 且证据非 low；或“倒退”文字':'不能凭 not_yet；“倒退”文字可触发';
const canNext = c => c.source_type==='product_observation'?'可能（unknown 阶段未排除；需复核）':'非 future 且非稳定掌握时可能；优先级由状态、阶段和年龄终点排序';
const canFocus = c => c.source_type==='product_observation'?'不直接；可能影响领域正向证据':'可通过领域状态／当前 not_yet／emerging 间接进入；future not_yet 不应进入';

let md = '# 发育内容审计清单\n\n';
md += '生成依据：当前工作区 `CAPABILITIES` 与 `DEVELOPMENT_GUIDE_CONTENT`，未改写任何产品内容。审计日期：2026-10-24。这里的 `source_level` 是**审计推断**，代码尚无该字段；“可触发”描述当前实现，不代表医学有效性。\n\n';
md += `能力 ${capabilities.length} 项；指南 ${bands.length} 个阶段；玩具／材料 ${toys.length} 项。全局缓冲期为 4 个月，代码未按来源或单项设置。\n\n`;
md += '## Capability 全量清单\n\n';
md += '每项的“当前用途”包括动态月度评估、证据关联与五维状态。`min_age_months` 用于选题，不等于官方达标年龄；典型窗口和缓冲期由产品算法解释。\n\n';
for (let i=0;i<bands.length;i++) {
  const b=bands[i];
  const group=capabilities.filter(c=>capabilityGroup(c)===i);
  md += `### ${bandName(b)}：${i===1||i===3||i===5?'无新增固定锚点；见本阶段指南':'对应锚点'}\n\n`;
  if (!group.length) md += '本阶段没有首次对应的固定年龄锚点；已有能力仍可能作为生活机会或回顾内容。\n\n';
  for(const c of group){
    const uses=guideUses(c.capability_id);
    md += `#### ${c.capability_id}｜${c.label}\n\n`;
    md += line(['字段','当前值'])+'\n'+line(['---','---'])+'\n';
    const rows=[
      ['capability_id',c.capability_id],['中文名称',c.label],['domain',`${c.domain}（${domainNames[c.domain]}）`],
      ['min_age_months',c.min_age_months],['typical_age_start',c.typical_age_start],['typical_age_end',c.typical_age_end],
      ['grace period',`${c.typical_age_end==null?'不适用':'全局 4 个月；非来源原文'} `],['importance',c.importance],
      ['source',c.source],['source_type',c.source_type],['source_level',sourceLevel(c)],
      ['当前产品如何使用',`月度选题／证据关联／领域状态${uses.length?'；指南涉及 '+uses.join('、')+' 月龄':'；未进入指南正文'}`],
      ['是否参与状态判定',c.source_type==='product_observation'?'正向证据可参与；无年龄窗负向评分':'是；按 future／current／grace／overdue 阶段'],
      ['是否可触发 watch',canWatch(c)],['是否可触发 concern',canConcern(c)],
      ['是否可作为 next_observation',canNext(c)],['是否可作为 monthly_focus',canFocus(c)]
    ];
    for(const row of rows)md += line(row)+'\n';
    if(sourceLink(c))md += `\n原始来源：[查看官方材料](${sourceLink(c)})。\n`;
    md += '\n';
  }
}
const unaged=capabilities.filter(c=>capabilityGroup(c)===6);
md += '### 无固定年龄窗口：产品观察项\n\n这些项目不能被硬塞进上述年龄段；可在多个阶段作为日常记录，未设置官方典型年龄。\n\n';
for(const c of unaged){
  md += `#### ${c.capability_id}｜${c.label}\n\n`;
  md += line(['字段','当前值'])+'\n'+line(['---','---'])+'\n';
  const rows=[['capability_id',c.capability_id],['中文名称',c.label],['domain',`${c.domain}（${domainNames[c.domain]}）`],['min_age_months',c.min_age_months],['typical_age_start',c.typical_age_start],['typical_age_end',c.typical_age_end],['grace period','不适用'],['importance',c.importance],['source',c.source],['source_type',c.source_type],['source_level',sourceLevel(c)],['当前产品如何使用',`日常证据／领域正向证据${guideUses(c.capability_id).length?'；指南机会涉及 '+guideUses(c.capability_id).join('、')+' 月龄':'；不在指南阶段正文'}`],['是否参与状态判定','正向证据可参与；not_yet 无年龄窗负向评分'],['是否可触发 watch',canWatch(c)],['是否可触发 concern',canConcern(c)],['是否可作为 next_observation',canNext(c)],['是否可作为 monthly_focus',canFocus(c)]];
  for(const row of rows)md += line(row)+'\n';
  md += '\n';
}

md += '## Phase 1.9 指南全量内容（逐阶段原文）\n\n';
for(const b of bands){
  md += `### ${bandName(b)}｜${b.title}\n\n`;
  md += `阶段说明：${b.stage_context}\n\n`;
  md += '#### 五领域发育要点\n\n';
  for(const [domain,items] of Object.entries(b.domains)) md += `- **${domainNames[domain]}**：${items.map(x=>`${x.text}（${x.capability_id}）`).join('；')}\n`;
  md += '\n#### 机会（opportunities）\n\n';
  for(const x of b.opportunities)md += `- ${x.text}（关联：${x.capability_ids.join('、')}）\n`;
  md += '\n#### 玩具／材料建议与替代品\n\n';
  for(const [key,label] of [['continue','已有继续玩'],['consider','缺少时考虑'],['no_buy','不买也能玩']]){
    md += `- **${label}**：${(b.toys[key]||[]).map(id=>{const t=toyById[id];return t?`${t.name}（${id}；替代：${t.replacement_materials.length?t.replacement_materials.join('、'):'无'}）`:`未找到 ${id}`;}).join('；')}\n`;
  }
  md += '\n#### 生活参与（life participation）\n\n';
  for(const x of b.life_participation)md += `- ${x}\n`;
  md += '\n#### 观察点（observe points）\n\n';
  for(const x of b.observe_points)md += `- ${x.text}（${x.capability_id}）\n`;
  md += '\n#### 安全说明与来源\n\n';
  md += '- 页面通用安全提示：3 岁以下只用完整的大尺寸材料，检查没有可脱落配件；成人在旁。\n';
  const ids=[...new Set(Object.values(b.toys).flat())];
  for(const id of ids){const t=toyById[id];if(t)md += `- ${t.name}：${t.safety_notes}（标称最小部件 ${t.min_piece_cm} cm；适用 ${t.age_range.join('～')} 月龄）\n`;}
  md += `- source_refs：${b.source_refs.map(id=>`${id}（${capById[id]?.source||'未找到'}）`).join('；')}\n`;
  md += `- 相关游戏标题：${b.activity_titles.join('；')}\n\n`;
}
md += '## 材料库总表（全部 13 项）\n\n';
md += line(['ID','名称','年龄','最小部件 cm','替代材料','安全说明','来源'])+'\n'+line(['---','---','---','---','---','---','---'])+'\n';
for(const t of toys)md += line([t.toy_id,t.name,t.age_range.join('～'),t.min_piece_cm,t.replacement_materials.join('、')||'无',t.safety_notes,'代码未记录逐项外部来源'])+'\n';
md += `\n小部件风险参照 [CPSC 官方说明](${sources.cpsc})。代码的 \`min_piece_cm\` 是人工填写的单一数值，不能代替实物小部件圆筒测试及脱落检查。\n`;
fs.writeFileSync(path.join(root,'development-content-audit.md'),md);

const originals={
  motor_stairs:'扶着墙或栏杆上楼梯', motor_run:'Runs（会跑）', motor_jump:'双脚同时离地跳起',
  fine_lid:'用手旋拧（如拧瓶盖、上发条等）',fine_spoon:'Tries to use a spoon（尝试用勺子）',
  fine_spoon_eat:'Eats with a spoon（用勺子吃饭）',fine_pages:'一页页地翻书',lang_words:'说出 3 个有意义的词',
  lang_two_words:'Says at least two words together（至少两个词连用）',cog_object_use:'知道常用物品用途（如杯子用来喝水、灯会亮）',
  cog_color_one:'Shows he knows at least one color（能辨认至少一种颜色）',soc_ball:'与他人玩传球等互动游戏',
  soc_peers:'Plays next to other children and sometimes plays with them（并排玩，有时一起玩）'
};
let anchors='# 官方发育锚点表\n\n';
anchors+='仅收录当前 `source_type=official_anchor` 的 13 项。这里的“官方”表示来源可核对，**不表示现有产品风险算法已经获得官方验证**。`adapted_anchor` 与 `product_observation` 均排除。\n\n';
anchors+=line(['官方年龄','领域','capability_id','官方原始语义（简译）','产品映射','官方来源','当前是否参与风险判断／审计意见'])+'\n'+line(['---','---','---','---','---','---','---'])+'\n';
for(const c of capabilities.filter(c=>c.source_type==='official_anchor').sort((a,b)=>a.typical_age_end-b.typical_age_end)){
  const url=sourceLink(c),risk=c.importance==='key'?'当前代码可在过期后触发 watch；与另一项持续缺失时可 concern。规则需审核。':'当前代码通常不凭单项 not_yet 升级；倒退文字仍可 concern。';
  anchors+=line([`${c.typical_age_end} 月龄`,domainNames[c.domain],c.capability_id,originals[c.capability_id]||'待核对',c.label,`[${c.source.includes('CDC')?'CDC':'国家卫健委'}](${url})`,risk])+'\n';
}
anchors+='\n### 明确排除\n\n- `cog_pretend`：`adapted_anchor`，虽指向国家卫健委 24 月龄“玩装扮游戏”，产品改写后不能混作官方原文锚点。\n- `lang_request`、`cog_sort`、`soc_emotion`：`product_observation`，无官方固定年龄窗口。\n\n';
anchors+=`国家卫健委自评表还列有 30、36 月龄官方项目，但本项目未全部收录；这是一项**覆盖范围缺口**，不应把当前 13 项误认为完整官方量表。原表对相应月龄未出现 1 项或 2 项以上分别给出求助指导，现有统一 4 个月缓冲规则与该原文并不一致，详见总审计报告。[原表](${sources.nhc})。\n`;
fs.writeFileSync(path.join(root,'official-development-anchors.md'),anchors);
console.log(`Generated ${capabilities.length} capabilities, ${bands.length} guide bands, ${toys.length} toys, ${capabilities.filter(x=>x.source_type==='official_anchor').length} official anchors.`);
