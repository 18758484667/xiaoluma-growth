/* Phase 2.5A editorial decisions. IDs remain stable; no source row is deleted. */
var ACTIVITY_CONTENT_CLEANUP={
  act_14_泡泡追跑:{decision:'keep',safety_notes:'只在远离车道、水边和台阶的平坦空地玩；成人负责吹泡泡并全程近距离看护，地面湿滑就结束。'},
  act_24_橡皮糖牙签建筑:{decision:'remove_candidate',reason:'核心依赖牙签与糖果；改为大积木后与现有搭建玩法重复。'},
  act_28_粘土怪物军队:{decision:'revise',materials:'适龄大块软黏土',steps:['给孩子一整块适龄软黏土，先压扁、捏圆','一起捏出一个大怪兽，不加珠子或可脱落装饰','玩约5分钟，黏土开始掉小块或孩子想入口时结束'],safety_notes:'不使用烤箱、加热工具或细小装饰；成人全程在旁，及时收走掉落的小块。'},
  act_31_冰格藏宝:{decision:'blocked_under_3',reason:'冰块融化后“宝藏”材质和尺寸不明确；当前没有经审核的大尺寸方案。'},
  act_33_室内沙粒盒:{decision:'revise',title:'大布片触摸盒',description:'从敞开的纸箱里拿出完整的大布片，摸摸不同触感。',materials:'大号纸箱、整块不同触感的干净布',steps:['把三块完整的大布片放进无订书钉的纸箱','孩子摸一摸、拿出一块，家长说“软软的”或“粗粗的”','玩约5分钟后一起把布放回箱里'],safety_notes:'不用沙粒、米粒、豆类或可脱落的小工具；布片须完整、尺寸足够大，成人在旁看护。',prep_level:'low',cleanup_level:'low'},
  act_35_冰山与海洋:{decision:'blocked_under_3',reason:'原玩法同时使用冰块、水盆和小船，暂缺安全替代内容。'},
  act_36_自制灯箱:{decision:'remove_candidate',reason:'核心依赖自制电气装置；现有游戏价值不足以支持该风险与准备成本。'},
  act_38_感官游戏大混战:{decision:'revise',title:'大物件触感托盘',description:'拿起几件完整的大物件，摸一摸，再放进碗里。',materials:'大号完整布片、软玩具、塑料碗',steps:['在地垫上放两三种完整的大件材料','让孩子自由拿起、摸一摸、放进大碗','家长跟着她的动作说“软”“硬”，约5分钟后一起收好'],safety_notes:'不用彩色米、豆类、意面、土壤或小件；材料必须完整、可清洁，成人在旁。',prep_level:'low',cleanup_level:'low'},
  act_41_数字串珠:{decision:'remove_candidate',reason:'串珠与意面小件是核心材料；替换为大积木后与现有分类活动重复。'},
  act_47_硬币拓印:{decision:'remove_candidate',reason:'硬币是核心材料且有误吞风险；替换为大形状板后与现有印画内容重复。'},
  act_53_小蜜蜂的家:{decision:'remove_candidate',reason:'竹筒、扭扭棒与高处悬挂主要由成人制作，幼儿独立玩法价值不足。'},
  act_55_纸箱电视机:{decision:'revise',title:'纸箱小剧场',description:'在敞开的纸箱前，用大纸片或布娃娃演一小段故事。',materials:'去除钉子和胶带残留的大号纸箱、整张大画纸',steps:['成人检查纸箱边缘，剪开一面作敞开的“舞台”','孩子拿完整大纸片或布娃娃在开口前演一小段','玩约5分钟后把道具放回纸箱'],safety_notes:'不使用衣架、锡纸、订书钉或可脱落小配件；成人负责剪裁，箱体保持敞开通风。'},
  act_62_魔光轮:{decision:'remove_candidate',reason:'发光棒破裂及内部液体风险；去掉发光棒后与现有轮转/印画活动重复。'},
  act_64_彩虹冰城堡:{decision:'blocked_under_3',reason:'原核心为小冰砖堆叠和融化；当前缺适龄大块与涉水边界。'},
  act_71_灯箱彩色米:{decision:'remove_candidate',reason:'彩色米粒与自制灯箱双重风险，且与现有感官/灯箱候选重复。'},
  act_73_气球与球拍:{decision:'revise',title:'轻布球与软拍',description:'把完整的大布球轻轻送来送去，孩子用软拍碰一碰。',materials:'完整大号轻布球、软拍',steps:['在没有玻璃和尖角的空地，把大布球轻轻送到孩子面前','孩子用软拍碰一碰，家长接住后再送回','玩约5分钟，球或软拍有破损就停止'],safety_notes:'不用气球、未充气或破裂气球碎片；只用完整、适龄的大布球和无硬边软拍，成人在旁。'},
  act_74_穿越红外线:{decision:'revise',title:'地面胶带绕线走',description:'沿着地面短胶带线慢慢走，愿意时跨过一条平面线。',materials:'可移除的宽纸胶带',steps:['成人只在地面贴两三条短线，留出宽路','孩子沿线走或跨过平面线，家长在旁扶稳','走两三轮后一起撕除胶带'],safety_notes:'不把胶带拉到空中、跨门框或家具之间；不用长绳带，地面防滑，成人近距离保护。',space_requirement:'normal'},
  act_80_靠垫桥:{decision:'revise',materials:'防滑地垫、单层稳固软垫',steps:['把一块单层软垫铺在防滑地面','扶孩子试一次走上和走下','稳定后再让她自己跨过，玩两三轮就结束'],safety_notes:'只在地面用单层稳固软垫；不摆高桥、不跑跳、不用家具，成人始终在一臂距离内。',space_requirement:'normal'},
  act_81_玻璃鱼缸雪球:{decision:'remove_candidate',reason:'玻璃容器及亮片是核心材料；替换后与既有感官瓶/摇晃玩法重复。'},
  act_84_心连心鸟食挂饰:{decision:'remove_candidate',reason:'扭扭棒和麦圈小件由成人悬挂，幼儿参与价值不足。'},
  act_89_靠垫房屋:{decision:'revise',title:'地面靠垫小角落',description:'在地面单层靠垫上坐一坐、走下来，或给大软玩具找位置。',materials:'单层靠垫、地垫',steps:['在地面平铺一块靠垫，旁边留出敞开空间','孩子坐上、走下或把大软玩具放上去','约5分钟后把靠垫放回原处'],safety_notes:'不堆高、不盖住头脸、不搭封闭屋顶；靠垫防滑，成人全程在旁。',space_requirement:'normal'},
  act_92_陶瓷茶具上色:{decision:'revise',title:'杯子描圆',description:'成人扶稳大塑料杯，孩子在大纸上沿杯口描一个圆。',materials:'完整大号塑料杯、大张纸、适龄粗杆可水洗蜡笔',steps:['成人把完整大塑料杯倒扣在大张纸上并扶稳','孩子拿粗杆蜡笔沿杯口描一段圆线','描两三次就结束，折断的蜡笔及时收走'],safety_notes:'不使用陶瓷、玻璃或小茶具；只用适龄完整材料，成人在旁看护。'},
  act_95_弹珠水彩画:{decision:'remove_candidate',reason:'弹珠是核心动作材料且可误吞；替换后与大球滚画重复。'},
  act_97_折纸船:{decision:'remove_candidate',reason:'原步骤把吹风机和水放在同一玩法，不能作为家庭幼儿活动保留。'},
  act_100_玩啫喱:{decision:'blocked_under_3',reason:'啫喱粉加温水成胶状，存在入口误认且缺审核过的适龄材料。'},
  act_116_纸转盘:{decision:'revise',title:'大纸盘转一转',description:'成人手持完整的大纸盘慢慢转，孩子看看、指指方向。',materials:'完整大纸盘',steps:['成人拿住完整大纸盘的边缘，慢慢转给孩子看','孩子可以指一指方向或轻碰盘面','转几轮就停下，纸盘有破损即收起'],safety_notes:'不使用拉绳、长带、短柄或可脱落轴件；成人手持，孩子不独自操作。'},
  act_117_追泡泡_推行小车:{decision:'keep',safety_notes:'只在远离车道、水边和台阶的平坦空地，使用稳固适龄小车；成人在孩子身后一臂距离内持续跟随，地面湿滑就结束。'},
  act_118_居家障碍闯关:{decision:'revise',materials:'地面胶带、单层防滑软垫',steps:['清空地面，用胶带贴出绕行线','只放一块不会滑动的薄软垫','孩子绕过线或跨过软垫，玩两轮就结束'],safety_notes:'只做地面低矮路线；不使用桌椅、凳子、床或叠放家具，成人始终在一臂距离内保护。',space_requirement:'large'},
  act_126_水果寻宝:{decision:'revise',title:'找大水果放篮子',materials:'完整的大水果、轻篮子',steps:['成人放两种完整的大水果在桌上或地面','说出一种水果名称，让孩子指一指或拿来放篮子','找两三次就结束；需要吃时由成人另行按适龄方式切配'],safety_notes:'不蒙眼、不边走边吃；游戏中只用完整大水果，食用时由成人另行处理误吸风险。'},
  act_129_障碍爬行大冒险:{decision:'revise',materials:'地面毯子、宽大稳固的敞口纸箱',steps:['成人清空地面并检查纸箱无钉子和硬边','把纸箱两端敞开，放在地垫上','孩子自愿从宽敞通道爬过，成人在旁接应，玩两轮就结束'],safety_notes:'不用椅子、沙发或高架家具搭通道；纸箱两端保持通风，成人全程近距离保护。',space_requirement:'large'},
  act_131_趣味玩水探索:{decision:'revise',description:'在成人伸手可及处，用大杯把浅盘里的少量水舀起再倒回。',materials:'稳定浅盘、少量温水、完整大号塑料杯',steps:['成人在防滑地面放稳定浅盘，只倒少量温水','孩子在成人伸手可及处用大杯舀水、倒回盘里','玩3～5分钟立即倒空水、擦干地面'],safety_notes:'成人全程保持伸手可及，绝不暂时离开；不用桶或深盆，结束立即倒空容器并擦干地面。',cleanup_level:'medium'}
};

/* Phase 3.3C4: keep the original activity rows and IDs, but withhold their
   current materials/steps from the under-three product until content review. */
var ACTIVITY_AGE21_SAFETY_HOLDS={
  act_7_撕贴收纳:{reason:'当前步骤要求把纸撕成小条、碎片后捡拾；21个月可接触碎片。',followup:'safe_content_revision'},
  act_8_瓶盖配对拧动:{reason:'当前材料和玩法依赖多枚可拆卸瓶盖，尺寸和防吞咽条件未核实。',followup:'safe_content_revision'},
  act_9_翻书找物:{reason:'当前步骤要求把小贴纸贴到绘本页并移动，贴纸可脱落。',followup:'safe_content_revision'},
  act_128_撕彩纸贴贴乐:{reason:'当前材料和步骤要求把彩纸撕成碎片并粘贴；21个月可接触碎片。',followup:'safe_content_revision'},
  act_4_颜色配对分类:{reason:'当前材料明确写有“同色小物”，与通用大尺寸安全提示矛盾，尺寸未核实。',followup:'safe_content_revision'}
};

/* 17 effort and 7 scene corrections from activity-content-actions.md. */
var ACTIVITY_EFFORT_CORRECTIONS={
  act_1_假装游戏:'medium',act_9_翻书找物:'medium',act_126_水果寻宝:'medium',act_133_小小家务能手:'medium',
  act_24_橡皮糖牙签建筑:'high',act_28_粘土怪物军队:'medium',act_33_室内沙粒盒:'medium',act_36_自制灯箱:'high',act_89_靠垫房屋:'medium',act_97_折纸船:'high',act_100_玩啫喱:'high',act_117_追泡泡_推行小车:'high',act_131_趣味玩水探索:'high',
  gm_walk_from_stroller:'medium',gm_walk_to_tree:'medium',gm_leaf_collect:'medium',gm_garden_loop:'medium'
};
var ACTIVITY_SCENE_CORRECTIONS={
  act_32_自然色彩配对:{location:['outdoor']},act_53_小蜜蜂的家:{location:['outdoor']},
  act_84_心连心鸟食挂饰:{location:['indoor','outdoor']},act_87_方便面碗鸟食小屋:{location:['indoor','outdoor']},
  act_89_靠垫房屋:{space_requirement:'normal'},act_118_居家障碍闯关:{space_requirement:'large'},gm_low_soft_course:{space_requirement:'large'}
};
var ACTIVITY_TEMPLATE_REWRITES={
  act_61_蝴蝶昆虫印刷:{title:'折纸印蝴蝶',materials:'大张纸、少量适龄可水洗颜料',steps:['成人在大张纸一侧点少量适龄可水洗颜料','孩子帮忙对折纸，成人轻按后展开看看对称图案','换一种颜色再印一次，玩约5分钟后洗手收好'],description:'对折纸、轻按再展开，看颜色怎样印到另一边。',safety_notes:'成人保管颜料，避免入口；不用小装饰或尖锐工具，结束后洗手。'},
  act_111_蝴蝶印刷画:{title:'折纸印蝴蝶',materials:'大张纸、少量适龄可水洗颜料',steps:['成人在大张纸一侧点少量适龄可水洗颜料','孩子和成人一起对折、轻按，再展开看看图案','愿意的话换一种颜色再印，约5分钟后洗手收好'],description:'用同样的对折印画动作，换颜色再看一次。',safety_notes:'成人保管颜料，避免入口；不用小装饰或尖锐工具，结束后洗手。'},
  act_75_藏猫猫:{steps:['在安全的小范围先躲到门边或大人身后','发出声音让孩子找，找到后一起笑一笑','换孩子藏、大人找；玩两三轮就结束'],description:'在看得见、找得到的安全范围轮流藏和找。',safety_notes:'不进入衣柜、箱子或封闭角落；避开楼梯、水边和车道，成人始终看得到孩子。'},
  act_76_漫天泡泡:{steps:['成人在防滑地面吹出几个泡泡，轻声说“大泡泡”“小泡泡”','让孩子看看大小不同的泡泡，愿意就伸手碰一碰','玩约5分钟后擦干地面和手，不要求孩子跟说'],description:'成人吹出大小不同的泡泡，用短句说一说，孩子看一看、碰一碰。',domains:['motor','lang'],secondary_domains:['lang'],safety_notes:'泡泡液由成人保管，不让孩子入口；地面湿滑时立刻结束。'},
  act_105_和爸爸乱弹吉他:{steps:['成人稳稳抱住乐器，孩子用手轻轻拨一下弦','成人回应一个短短的节奏，等孩子再拨','玩约5分钟，孩子不想继续就收起乐器'],description:'成人抱稳乐器，和孩子轮流拨一下、听一下。',safety_notes:'成人保管乐器，不让孩子拉扯琴弦或接触可脱落配件。'},
  act_25_乐高大颗粒娃娃屋:{steps:['只用适龄完整的大块积木搭一个矮矮的屋角','让孩子把完整布娃娃放进去、再拿出来','跟着孩子编一句小故事，玩约5分钟后一起收好'],description:'用适龄大块积木搭矮屋角，让娃娃进出。',safety_notes:'只用适龄大块、无可拆小件的积木；不搭高墙或可倒塌的屋顶。'}
};
