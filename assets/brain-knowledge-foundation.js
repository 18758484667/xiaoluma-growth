/* Product interaction labels, not developmental standards or scientific claims. */
var BRAIN_MECHANISMS=[
  {mechanism_id:'active_movement',name:'主动移动',definition:'孩子在安全空间里自己走、追、搬或去拿东西，成人提供空间并照看。',domains:['motor'],example:'孩子自己走过去捡大软球。',status:'active'},
  {mechanism_id:'search_and_find',name:'藏找与寻找',definition:'成人藏起或提示一个可见范围内的物品，孩子自己寻找。',domains:['cog'],example:'一起找被大杯子盖住的玩具。',status:'active'},
  {mechanism_id:'simple_matching',name:'简单配对',definition:'孩子把两件相似的安全大物品放在一起或找出相同的一件。',domains:['cog','fine'],example:'在两只大袜子中找相同的一只。',status:'active'},
  {mechanism_id:'self_choice',name:'自己选择',definition:'成人提供两个真实可选项，孩子用看、指、拿、声音或词表达选择。',domains:['lang','cog'],example:'从两件合适的衣物中选一件。',status:'active'},
  {mechanism_id:'turn_taking',name:'轮流互动',definition:'成人和孩子围绕同一玩法交替做一个简单动作。',domains:['soc'],example:'一人轻拍一下大盆，再轮到另一人。',status:'active'},
  {mechanism_id:'wait_for_response',name:'等待回应',definition:'成人说完或发出邀请后短暂停顿，让孩子有机会用动作、声音或词回应。',domains:['lang','soc'],example:'唱到熟悉儿歌的末尾时停一停。',status:'active'},
  {mechanism_id:'language_expansion',name:'自然扩展表达',definition:'孩子主动表达后，成人接住原意并自然说一句稍长的话，不要求复述。',domains:['lang'],example:'孩子说“球”，成人回应“球滚了”。',status:'active'},
  {mechanism_id:'imitation',name:'示范与模仿',definition:'一方做简单动作，另一方愿意时跟着做或换成自己的动作。',domains:['soc','motor','fine'],example:'你拍手，她也拍手；随后你模仿她。',status:'active'},
  {mechanism_id:'deferred_imitation',name:'延迟模仿',definition:'孩子观察一个动作或简单动作序列后，示范已经结束、动作信息不再持续呈现，并经过真实短暂间隔，再根据先前看到的动作尝试重新做出相关动作。',domains:['cog'],example:'看成人给大熊盖好毯子；先做一件别的小事，过一小会儿再让孩子自由尝试给大熊盖毯子。',status:'active'},
  {mechanism_id:'hands_on_action',name:'自己动手',definition:'孩子自己拿、放、装、舀或操作适龄完整物品，成人在旁支持。',domains:['fine','cog'],example:'自己把大积木放进盒子。',status:'active'},
  {mechanism_id:'joint_attention',name:'共同关注',definition:'成人跟随孩子正在看的物品或动作，一起看、指或说。',domains:['lang','soc'],example:'孩子指向树叶，成人也看向树叶并回应。',status:'active'},
  {mechanism_id:'sensory_exploration',name:'触感探索',definition:'通过触摸、按压、抓握、比较质地或其他感官操作探索物体特征。',domains:['cog','fine'],example:'摸一摸两块完整大布片的不同质地。',status:'active'},
  {mechanism_id:'pretend_play',name:'简单假装',definition:'用物体、动作或角色代表现实中的简单情境。',domains:['soc','cog'],example:'用空碗和大勺假装喂娃娃。',status:'active'}
];

var BRAIN_THEME_MECHANISMS={
  '自己动起来':['active_movement'],
  '自己动手完成':['hands_on_action','imitation'],
  '把想法说出来':['wait_for_response','language_expansion','self_choice'],
  '找一找，看看在哪里':['search_and_find','simple_matching'],
  '我和你轮流来':['turn_taking','joint_attention']
};

var BrainKnowledgeFoundation=(function(){
  var modes=['why_theme','why_activity','further_reading'];
  function approved(k,age,mode){
    return !!(k&&k.review_status==='approved'&&k.reviewed_at&&k.summary&&k.source_type&&k.source_type!=='legacy_unverified'&&k.source_title&&k.source_url&&k.source_date&&Array.isArray(k.related_mechanisms)&&k.related_mechanisms.length&&Array.isArray(k.use_mode)&&k.use_mode.indexOf(mode)>=0&&modes.indexOf(mode)>=0&&k.age_range&&Number.isFinite(k.age_range.min_months)&&Number.isFinite(k.age_range.max_months)&&age>=k.age_range.min_months&&age<=k.age_range.max_months);
  }
  function intersect(a,b){return a.some(function(id){return b.indexOf(id)>=0;});}
  function forTheme(theme,age,mode,records){
    var ids=BRAIN_THEME_MECHANISMS[theme]||[];
    if(!ids.length)return [];
    return (records||BRAIN_KNOWLEDGE).filter(function(k){return approved(k,age,mode)&&intersect(k.related_mechanisms,ids);});
  }
  function forActivity(activity,age,mode,records){
    if(!activity)return [];
    var id=typeof canonicalActivityId==='function'?canonicalActivityId(activity.activity_id):activity.activity_id;
    var reviewed=ACTIVITY_MECHANISMS_CONFIRMED[id],ids=reviewed&&reviewed.status==='confirmed'?reviewed.mechanism_ids:activity.mechanism_review_status==='confirmed'?activity.mechanism_ids:[];
    if(!Array.isArray(ids)||!ids.length)return [];
    return (records||BRAIN_KNOWLEDGE).filter(function(k){return approved(k,age,mode)&&intersect(k.related_mechanisms,ids);});
  }
  return {mechanisms:BRAIN_MECHANISMS,themeMechanisms:BRAIN_THEME_MECHANISMS,forTheme:forTheme,forActivity:forActivity};
})();
