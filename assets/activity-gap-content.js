/* Phase 2.5B: editorial activity data. One group is one parent-facing core play. */
var ACTIVITY_GAP_GROUPS=[
  {id:'gap_request_again',title:'停一停，等你说再来',domain:'lang',secondary:['soc'],type:'request',context:'play',effort:'low',materials:'正在玩的完整大玩具',tags:[],summary:'在愉快的游戏中短暂停一下，等孩子用看、指、声音或词表示“再来”。',safety:'不拿走孩子需要的物品；只在她愿意继续的游戏里短暂停顿，不逼她开口。',variants:[
    {id:'gap_request_again',label:'拍一拍再来',steps:['成人和孩子拍手或敲腿两三下','成人停约两秒，看看孩子是否用眼神、动作、声音或词表示继续','无论她怎么表达都回应“再来”，再玩两轮；她转开或不想玩就结束']},
    {id:'gap_request_again_open',label:'打开再来',materials:'无锁扣的大号敞口纸箱、完整大玩具',steps:['把完整大玩具放在敞口纸箱里，由成人轻盖住一部分','停约两秒，等孩子指、看、发声或说“开”','成人说“打开”，一起拿出玩具；玩两三次就结束'],safety:'纸箱不用硬盖、绳带或锁扣，不让孩子钻入；不扣留孩子需要的物品。'}]},
  {id:'gap_choose_two',title:'两样选一样',domain:'lang',secondary:['cog'],type:'choice',context:'daily_life',effort:'low',materials:'两件完整的大号物品',tags:[],summary:'给两个真实可选项，接受看、指、拿或说词作选择。',safety:'两项都应适龄且真的可以提供；不以说出名称作为取得物品的条件。',variants:[
    {id:'gap_choose_two',label:'选玩具',steps:['成人坐着拿两件完整大玩具，各说一次名字','等孩子看、指、拿或说其中一个','把选中的交给她，玩约3分钟后结束；不追问“这是什么”']},
    {id:'gap_choose_two_clothes',label:'选衣物',materials:'两件合适的大衣物',steps:['穿衣时给两件都合适的衣物','问“这件还是那件”，等她看、指或拿','说“你选了这件”，帮她穿好就结束']}]},
  {id:'gap_expand_one_word',title:'接住她的一个词',domain:'lang',secondary:['soc'],type:'expansion',context:'daily_life',effort:'low',materials:'无',tags:[],summary:'孩子主动说一个词时，成人自然接一句稍长的话，不要求复述。',safety:'跟随孩子当前注意的对象；不纠正发音、不要求重复。',variants:[
    {id:'gap_expand_one_word',label:'说物品',steps:['听到孩子说“球”等一个词时，先看她指的东西','自然回应“大球”或“球滚了”','等她继续看或玩，回应两三次就结束，不请她复述']},
    {id:'gap_expand_one_word_action',label:'说动作',steps:['孩子说“走”或用动作表达时，成人回应“我们走”','让她继续原来的动作，不打断游戏','再出现一两次时照样自然回应，随后结束']}]},
  {id:'gap_sound_reply',title:'声音你来我来',domain:'lang',secondary:['soc'],type:'sound_imitation',context:'play',effort:'low',materials:'完整大号动物或车辆玩具，也可不用玩具',tags:['animals','vehicles'],summary:'成人发一个熟悉的动物或车辆声音，留出空隙让孩子自由回应。',safety:'不把模仿声音当测试；孩子可以只笑、看或用动作回应。',variants:[
    {id:'gap_sound_reply',label:'动物声音',steps:['成人拿完整大号动物玩具，轻声说“汪汪”','停两秒，等孩子看、笑、动或发声','成人模仿她的回应，再玩两三轮就结束']},
    {id:'gap_sound_reply_vehicle',label:'车辆声音',materials:'完整大号玩具车',steps:['成人推一下大玩具车，说“嘟嘟”','停两秒，看孩子想不想推或发声','回应她的动作或声音，再玩两三轮就结束']}]},
  {id:'gap_drum_turn',title:'轮流拍大鼓',domain:'soc',secondary:['fine'],type:'turn_taking',context:'play',effort:'low',materials:'完整稳固的大号塑料盆',tags:['music'],summary:'一人用手轻拍一下大盆，再把位置让给另一人。',safety:'只用完整稳定的大盆，放在防滑地面；不用鼓槌或可脱落小配件。',variants:[
    {id:'gap_drum_turn',label:'成人先来',steps:['成人坐着用手轻拍大盆一次','说“轮到你”，等孩子愿意再拍','交换两三轮就结束，不要求她等待很久']},
    {id:'gap_drum_turn_child',label:'孩子先来',steps:['把稳固的大盆放在孩子够得到的地面','等她先拍，成人轻拍一次作为回应','轮流两三轮；她想一直拍也可以，结束时一起把盆放好']}]},
  {id:'gap_parallel_play',title:'在旁边各玩一份',domain:'soc',secondary:[],type:'parallel_play',context:'play',effort:'medium',recommendation_eligible:false,materials:'两份完整的大号同类玩具',tags:[],summary:'遇到其他孩子时，两人在附近各玩相似材料，成人照看，不要求分享或合作。',safety:'各有一份适龄完整的大玩具；成人持续看护，孩子不愿靠近时尊重距离。',variants:[
    {id:'gap_parallel_play',label:'各搭各的',materials:'两份适龄大块积木',steps:['在安全地垫上给两个孩子各放几块大积木','让他们各自搭，成人描述“你在放一块”即可','玩约5分钟，任何一方不想玩就结束']},
    {id:'gap_parallel_play_cups',label:'各摆各的',materials:'两份完整大号叠叠杯',steps:['把两份大叠叠杯分开放在同一安全区域','允许孩子各自叠、拆、看对方，不要求交换','玩约5分钟后各自收好就结束']}]},
  {id:'gap_carry_together',title:'一起抬空篮子',domain:'soc',secondary:['motor'],type:'cooperation',context:'daily_life',effort:'medium',materials:'完整轻巧的空篮子',tags:['sorting'],summary:'成人和孩子各扶空篮一侧，慢慢把它移到近处。',safety:'篮子保持空且无硬尖角；只在平坦地面短距离走，成人随时接住，不强求同步。',variants:[
    {id:'gap_carry_together',label:'一起移到地垫',steps:['成人把空轻篮放在平坦地面，邀请孩子扶一侧','成人扶另一侧，慢慢移到一两步外的地垫','到达后放下，重复一次就结束']},
    {id:'gap_carry_together_return',label:'一起送回原处',steps:['收拾时请孩子扶住空轻篮的一侧','成人扶稳另一侧，慢慢送回原处','放下后说“我们一起放好了”，就结束']}]},
  {id:'gap_greeting_reply',title:'门口打个招呼',domain:'soc',secondary:['lang'],type:'greeting',context:'transition',effort:'low',recommendation_eligible:false,materials:'无',tags:[],summary:'在真实见面或离开时成人先挥手，给孩子自由回应的机会。',safety:'不强迫孩子接触、拥抱或说话；孩子只看一眼也可以。',variants:[
    {id:'gap_greeting_reply',label:'见面时',steps:['见到熟悉家人时，成人先挥手说“你好”','停两秒，接受孩子看、挥手或发声','对方简单回应后就自然继续，不重复要求']},
    {id:'gap_greeting_reply_leave',label:'离开时',steps:['准备离开熟悉的人时，成人先挥手说“再见”','给孩子一点时间看、挥手或发声','回应她的方式后就离开，不把道别拖长']}]},
  {id:'gap_big_footprints',title:'踩大脚印走两步',domain:'motor',secondary:['cog'],type:'target_stepping',context:'play',effort:'low',materials:'两张完整大纸、防滑纸胶带',tags:[],summary:'成人坐在旁边，孩子在平地上踩两张相隔很近的大纸。',safety:'纸张必须贴平防滑，间距只需一步；不用台阶或高处，不要求准确踩中。',variants:[
    {id:'gap_big_footprints',label:'向前踩',steps:['成人把两张大纸贴平在无障碍地面，相距约一步','坐在旁边指一张，让孩子自愿踩上、再踩下一张','往返两轮就结束，纸边翘起立即收起']},
    {id:'gap_big_footprints_side',label:'向旁边踩',steps:['把两张大纸贴平在孩子左右近处','成人坐着示意其中一张，孩子可侧迈一步','左右各试一两次就结束，不催速度']}]},
  {id:'gap_reach_big_cloth',title:'碰一碰大布片',domain:'motor',secondary:['fine'],type:'reach_balance',context:'play',effort:'low',materials:'完整的大号软布片',tags:[],summary:'成人坐着拿完整大布片，孩子站着伸手轻碰不同位置。',safety:'布片不挂高、不遮住头脸；只放在孩子自然够得到的位置，地面防滑。',variants:[
    {id:'gap_reach_big_cloth',label:'左右伸手',steps:['成人坐着把大布片拿在孩子胸口高度的左侧','等她自然伸手碰到，再换到右侧','左右各两次就结束；不让她失去平衡']},
    {id:'gap_reach_big_cloth_low',label:'高低轻碰',steps:['成人坐着把大布片先放在胸口高度','孩子碰到后，把布片移到她稍微弯膝就能碰到的位置','上下各两次就结束，不要求踮脚或深蹲']}]},
  {id:'gap_turn_to_picture',title:'转身找大图',domain:'motor',secondary:['cog'],type:'pivot_orientation',context:'play',effort:'low',materials:'一张完整大图片',tags:[],summary:'成人坐在原地，孩子站在平地转身看看大图片的位置。',safety:'图片由成人手持，不贴高处；在无障碍防滑地面慢慢转，不催促。',variants:[
    {id:'gap_turn_to_picture',label:'看看左边',steps:['成人坐着把大图片拿在孩子左侧稍远处','等她自己转身看或走近一点','再换右侧一次就结束']},
    {id:'gap_turn_to_picture_back',label:'回头看看',steps:['成人坐着先把大图片放在孩子前方给她看','她转开后，轻声说“图片还在这里”','等她自己回头看一眼，重复两次就结束']}]},
];

/* Variants of established mechanics, never separate parent-facing cards. */
var ACTIVITY_GAP_EXTRA_VARIANTS=[
  {canonical_id:'act_12_场景旁白沟通',id:'gap_variant_shoes_narration',label:'穿鞋时说两句',domain:'lang',context:'caregiving',location:['indoor'],steps:['穿鞋时成人跟着动作说“脚进去”','换另一只时说“另一只”','穿好就结束，不要求孩子跟说'],summary:'把真实穿鞋动作说成两句短话。'},
  {canonical_id:'act_14_泡泡追跑',id:'gap_variant_bubble_again',label:'泡泡停一下再来',domain:'lang',context:'outdoor',location:['outdoor'],effort:'medium',steps:['成人在安全平地吹几个泡泡后停两秒','看孩子是否用看、指、声音或词表示“再来”','回应后再吹两轮，地面湿滑就结束'],summary:'在已有吹泡泡玩法中留一个自然请求机会。'},
  {canonical_id:'act_2_家务变游戏',id:'gap_variant_pass_diaper',label:'递一件尿布',domain:'soc',context:'caregiving',location:['indoor'],steps:['换尿布前把一片完整尿布放在孩子够得到的低处','请她递给成人，成人接住并说“谢谢”','递一次就结束，不让孩子接触护理用品'],summary:'真实照护时请孩子递一片完整尿布。'},
  {canonical_id:'act_124_动作模仿游戏',id:'gap_variant_copy_face',label:'轮流做表情',domain:'soc',context:'play',location:['indoor'],steps:['成人坐在孩子面前做一个轻松表情','等孩子愿意做自己的表情，成人再模仿她','轮流两三次就结束，不要求做得一样'],summary:'把已有动作模仿换成表情回应。'},
  {canonical_id:'act_122_厚页绘本共读',canonical_title:'厚页绘本共读',id:'gap_variant_book_action',label:'指角色动作',domain:'lang',context:'play',location:['indoor','on_the_go'],steps:['让孩子选一页熟悉的厚页绘本','成人指角色说“在走”“在睡”，孩子可以指或做动作','看两三页就结束，不连问“这是什么”'],summary:'共读时说角色在做什么，接受孩子指或做动作。'},
  {canonical_id:'gm_music_walk_stop',canonical_title:'音乐走走停停',id:'gap_variant_walk_words',label:'走和停说出来',domain:'lang',context:'play',location:['indoor'],steps:['成人坐着说“走”，孩子愿意就自由走几步','说“停”时成人停下拍手，孩子可以继续走','轮两三次就结束，不要求听令准确'],summary:'在已有音乐走停中自然配上“走”和“停”。'},
  {canonical_id:'gm_roll_fetch',canonical_title:'球滚远了，捡回来',id:'gap_variant_ball_again',label:'滚球说再来',domain:'soc',context:'play',location:['indoor'],steps:['成人坐着把完整大软球滚到两三米内','孩子送回时成人停两秒，等她用动作或声音表示继续','再滚两三轮就结束'],summary:'在已有滚球往返中留出一个轮流与请求的空隙。'},
  {canonical_id:'act_3_手指谣与歌曲',canonical_title:'手指谣与歌曲',id:'gap_variant_song_last_word',label:'儿歌留一个空',domain:'lang',context:'play',location:['indoor','on_the_go'],steps:['唱孩子熟悉的一句儿歌，最后一个词前停一秒','孩子看、动、发声或说词都算回应，成人自然把句子唱完','唱两轮就结束，不要求填词'],summary:'熟悉的儿歌唱到末尾稍停，给孩子自由接话机会。'}
];

function gapActivityRow(group,variant){
  var min=group.min_age_months||18,max=group.max_age_months||30,effort=variant.effort||group.effort;
  var duration=group.duration||({lang:{min:3,max:5,label:'3-5分钟'},soc:{min:5,max:10,label:'5-10分钟'},motor:{min:5,max:10,label:'5-10分钟'}}[group.domain]);
  var prep=group.prep_level||(group.materials==='无'?'none':'low'),cleanup=group.cleanup_level||(prep==='none'?'none':'low');
  var materials=variant.materials||group.materials,steps=variant.steps.slice();
  return {activity_id:variant.id,name:group.title,title:group.title,min_age_months:min,max_age_months:max,domains:[group.domain],secondary_domains:group.secondary.slice(),duration:Object.assign({},duration),location:(variant.location||group.location||['indoor']).slice(),caregiver_effort:effort,caregiver_energy:effort,prep_level:prep,cleanup_level:cleanup,prep_cost:prep,cleanup_cost:cleanup,materials:materials,safety_level:'standard',safety_notes:variant.safety||group.safety,core_play:group.summary,description:variant.summary||group.summary,steps:steps,activity_context_type:variant.context||group.context,play_type:group.type,recommendation_eligible:group.recommendation_eligible!==false,interest_tags:group.tags.slice(),slot:duration.max<=5?'zero':'small',source:'Phase 2.5B 内容缺口补充',source_type:'product_content',observation_prompts:[],active_movement:group.domain==='motor',legacy:{cat:group.domain,mat:materials,steps:steps.join(' '),time:duration.label,src:'Phase 2.5B 内容缺口补充'}};
}
function gapExistingVariant(base,variant){
  var row=Object.assign({},base,{activity_id:variant.id,name:base.title,title:base.title,domains:[variant.domain],secondary_domains:[base.domains[0]],description:variant.summary,steps:variant.steps.slice(),location:variant.location.slice(),caregiver_effort:variant.effort||base.caregiver_effort,caregiver_energy:variant.effort||base.caregiver_effort,safety_notes:variant.safety||base.safety_notes,core_play:base.core_play||base.description,activity_context_type:variant.context,play_type:'existing_mechanic_variant',source:'Phase 2.5B 内容缺口补充',source_type:'product_content',observation_prompts:[]});
  row.legacy={cat:variant.domain,mat:row.materials,steps:row.steps.join(' '),time:row.duration.label,src:row.source};
  return row;
}
