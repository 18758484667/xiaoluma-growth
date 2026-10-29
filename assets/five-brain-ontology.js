/* Product observation vocabulary, not an official screening or diagnostic standard.
 * This static configuration is intentionally not loaded by the current page.
 * Pending age rules are visible for review but never returned as effective status. */
var FIVE_BRAIN_ONTOLOGY=(function(){
  var windows=[
    {window_id:'18_23',min_months:18,max_months:23},
    {window_id:'24_29',min_months:24,max_months:29},
    {window_id:'30_35',min_months:30,max_months:35},
    {window_id:'36_47',min_months:36,max_months:47},
    {window_id:'48_59',min_months:48,max_months:59},
    {window_id:'60_plus',min_months:60,max_months:null}
  ];
  var brains=[
    {brain_id:'intelligence',name_zh:'智力脑',description:'整理注意、探索、记忆与尝试办法的真实行为；不是独立脑区。',ability_ids:['int_perceptual_attention','int_problem_solving','int_memory_learning','int_executive_function'],display_order:1},
    {brain_id:'creativity',name_zh:'创意脑',description:'整理开放探索等早期表现和以后可观察的思维方式；不是独立脑区。',ability_ids:['cre_divergent_thinking','cre_growth_mindset','cre_counterfactual_thinking'],display_order:2},
    {brain_id:'language',name_zh:'语言脑',description:'整理听懂、表达及与图书和留痕相关的早期参与；不是独立脑区。',ability_ids:['lang_comprehension','lang_expression','lang_reading_readiness','lang_writing_readiness'],display_order:3},
    {brain_id:'emotion',name_zh:'情绪脑',description:'整理情绪线索、成人支持下的调节及与他人的互动；不是独立脑区。',ability_ids:['emo_recognition','emo_regulation','emo_social_cognition','emo_social_relationships'],display_order:4},
    {brain_id:'movement',name_zh:'运动脑',description:'整理身体动作与健康支持背景；不是独立脑区。',ability_ids:['mov_gross_motor','mov_fine_motor','mov_fitness','mov_health_context'],display_order:5}
  ];
  // The 18–23 month values reproduce the confirmed 21-month product design.
  // Values in later windows are inert carry-forward review placeholders, not age claims.
  var definitions=[
    ['int_perceptual_attention','intelligence','感知注意','孩子怎样注意到人、物和变化，并跟随自己感兴趣的事情。','active_observation',['cog'],['joint_attention','search_and_find','simple_matching'],'现有能力库没有独立注意锚点；只记录具体注意行为。'],
    ['int_problem_solving','intelligence','问题解决','孩子遇到一个小目标时，怎样试办法并利用结果继续行动。','active_observation',['cog'],['search_and_find','simple_matching','hands_on_action'],'记录实际尝试过程；一次成功不代表一般问题解决能力。'],
    ['int_memory_learning','intelligence','记忆学习','孩子怎样保留过去经历的信息，并在之后的行为里再次使用。','active_observation',['cog'],['search_and_find','deferred_imitation'],'需隔一段时间的实际行为；同一次反复玩不算记忆证据。'],
    ['int_executive_function','intelligence','执行功能','在成人支持下开始停一停、选择和转换动作的早期迹象。','early_signal_only',['cog','lang'],['self_choice','wait_for_response'],'仅记录前身行为，不判断完整执行功能或自控强弱。'],
    ['cre_divergent_thinking','creativity','发散性思维','将来可研究一个情境中尝试不止一种合适办法的表现。','future',['cog'],[],'21个月只可另记开放探索前身，不能判断完整构念。'],
    ['cre_growth_mindset','creativity','成长型思维','将来可研究面对困难、反馈和练习时的想法与做法。','future',['cog'],[],'21个月只可另记自愿继续尝试，不据此判断思维类型。'],
    ['cre_counterfactual_thinking','creativity','反事实思维','将来可研究对“如果换个条件会怎样”的理解与表达。','future',['cog'],[],'简单假装不等于反事实推理。'],
    ['lang_comprehension','language','语言理解','孩子怎样从熟悉的话语中理解意思并作出合适回应。','active_observation',['lang'],['joint_attention','wait_for_response'],'理解需独立的回应行为，不能从能说话反推。'],
    ['lang_expression','language','语言表达','孩子怎样用动作、声音、词语把需要或想法传给别人。','active_observation',['lang'],['language_expansion','self_choice','wait_for_response'],'手势、声音和词分别保留，未来两词组合不作当前缺失。'],
    ['lang_reading_readiness','language','阅读准备','孩子在共同看书时逐渐参与图画、翻页和交流的前身表现。','early_signal_only',['lang','fine'],['joint_attention'],'翻页不等于识字或阅读能力。'],
    ['lang_writing_readiness','language','书写准备','孩子探索画线工具和留痕动作的前身表现。','early_signal_only',['fine'],['hands_on_action'],'不要求握笔姿势、字形或写字。'],
    ['emo_recognition','emotion','情绪识别','孩子开始留意自己或他人的情绪线索的早期迹象。','early_signal_only',['soc'],['joint_attention'],'表达情绪不等于识别情绪。'],
    ['emo_regulation','emotion','情绪调节','在成人陪伴下逐渐从强烈情绪回到可继续活动的状态。','early_signal_only',['soc'],['wait_for_response'],'不要求独立控制情绪，一次哭闹不能判差。'],
    ['emo_social_cognition','emotion','社会认知','在日常来回互动中开始留意别人正在做什么、轮到谁。','active_observation',['soc'],['turn_taking','imitation'],'只观察基础互动，不推断完整同理心。'],
    ['emo_social_relationships','emotion','社会关系','孩子怎样与熟悉照护者建立来回互动并逐渐接触其他孩子。','active_observation',['soc'],['turn_taking','joint_attention'],'独自玩不等于关系问题，未来同伴锚点不作当前缺失。'],
    ['mov_gross_motor','movement','粗大运动','孩子怎样用身体移动、保持平衡并适应地面与台阶。','active_observation',['motor'],['active_movement'],'依据具体动作；会跑 not_yet 不单独升级关注。'],
    ['mov_fine_motor','movement','精细动作','孩子怎样用手和手指操作适龄、安全的日常物品。','active_observation',['fine'],['hands_on_action','simple_matching'],'依据具体手部行为，保留原能力年龄窗口和来源。'],
    ['mov_fitness','movement','体适能','对持续移动、停歇和不同动作经验的观察性描述。','early_signal_only',['motor'],['active_movement'],'不做耐力、强度、心肺或体重等级。'],
    ['mov_health_context','movement','健康管理','睡眠、饮食、活动、屏幕与健康照护等支持成长的背景。','support_context',[],[],'这是照护背景，不是儿童能力等级。']
  ];
  var abilities=definitions.map(function(row){
    var rules=windows.map(function(window,index){return {
      window_id:window.window_id,
      age_observation_status:row[4],
      review_status:index===0?'product_baseline':'pending_review',
      evidence_basis:index===0?'confirmed_21_month_product_design':'unreviewed_carry_forward_placeholder'
    };});
    return {ability_id:row[0],brain_id:row[1],name_zh:row[2],parent_definition:row[3],
      age_observation_rules:rules,evidence_policy:row[7],related_legacy_domains:row[5],
      related_mechanisms:row[6],review_status:'design_baseline'};
  });
  var mechanismIds=[].concat.apply([],abilities.map(function(a){return a.related_mechanisms;}));
  var mechanismLinks=mechanismIds.filter(function(id,index){return mechanismIds.indexOf(id)===index;})
    .map(function(id){return {mechanism_id:id,review_status:'pending_review'};});
  return {version:'1.0.0',review_status:'product_design_baseline',brains:brains,abilities:abilities,
    age_windows:windows,mechanism_links:mechanismLinks,legacy_domain_links:[
      {legacy_domain_id:'motor',candidate_brain_ids:['movement'],review_status:'metadata_only'},
      {legacy_domain_id:'fine',candidate_brain_ids:['movement','language'],review_status:'metadata_only'},
      {legacy_domain_id:'lang',candidate_brain_ids:['language','intelligence'],review_status:'metadata_only'},
      {legacy_domain_id:'cog',candidate_brain_ids:['intelligence','creativity'],review_status:'metadata_only'},
      {legacy_domain_id:'soc',candidate_brain_ids:['emotion'],review_status:'metadata_only'}
    ]};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FIVE_BRAIN_ONTOLOGY;
