// Complete transition rule layer.
// 36 pair rules are the canonical rule base. A 3-palace reading is composed from
// cause->process and process->result, then enriched by special 3-palace patterns.

const PAIR_RULES = {
  'daan-daan': ['稳上加稳', '前后皆稳，事情基础厚，发展慢但不乱。', '忌因过度保守错过窗口。', '守正推进，定期检查进度。'],
  'daan-liulian': ['稳后生滞', '原本平稳，但后续出现拖延、观望或旧事牵制。', '节奏变慢，承诺落地不足。', '先清流程与责任，再推进。'],
  'daan-suxi': ['稳中见喜', '稳定基础上出现消息、机会或积极反馈。', '容易因喜讯而过快改变原计划。', '守住根基，把握窗口。'],
  'daan-chikou': ['稳中起争', '原本安定的局面中出现分歧、口舌或利益摩擦。', '稳定关系被言语或立场破坏。', '先降温，避免硬碰硬。'],
  'daan-xiaoji': ['稳后小成', '平稳基础转入和合，小有收获。', '成果不大，忌贪多。', '借助熟人与合作稳步推进。'],
  'daan-kongwang': ['稳中见空', '表面稳定，但关键资源、回应或承诺可能不实。', '基础被高估，后续落空。', '重新核实条件，不急于投入。'],

  'liulian-daan': ['滞后归稳', '拖延与反复之后，局势逐渐回到稳定。', '前期消耗较多。', '耐心收束旧问题。'],
  'liulian-liulian': ['反复留滞', '前后皆迟，事情多次反复。', '久拖不决，容易消磨信心。', '设定期限与退出条件。'],
  'liulian-suxi': ['久滞忽动', '拖延之后突然有消息或转机。', '消息虽快，但未必稳定。', '抓住反馈，同时继续核实。'],
  'liulian-chikou': ['旧事引争', '旧问题、暧昧或拖延引发争执。', '旧账重提，沟通失控。', '先清旧账，再谈推进。'],
  'liulian-xiaoji': ['拖后小成', '虽有拖延，但最终有人情与合作转机。', '成果偏小，过程偏慢。', '耐心处理细节，等待可用的人。'],
  'liulian-kongwang': ['久拖成空', '拖延太久后，机会、回应或资源逐渐落空。', '时间成本变高。', '及时止损，另备方案。'],

  'suxi-daan': ['喜后趋稳', '好消息之后转入稳定阶段。', '热度下降，推进变慢。', '把即时机会沉淀为长期安排。'],
  'suxi-liulian': ['喜后生拖', '起初顺利，但后续卡在流程、态度或细节。', '先快后慢，预期落差明显。', '把口头消息变成明确确认。'],
  'suxi-suxi': ['喜上加喜', '连续出现积极反馈，进展快。', '太快则细节不足。', '趁势推进，同时留痕确认。'],
  'suxi-chikou': ['快喜生争', '消息来得快，但表达、节奏或分配不当引发冲突。', '乐极生争，言多有失。', '快事慢说，喜事谨办。'],
  'suxi-xiaoji': ['喜入和合', '好消息转入合作与人情支持。', '成果偏小但可持续。', '主动联络贵人与伙伴。'],
  'suxi-kongwang': ['先喜后空', '起初积极，后续可能热度下降或承诺落空。', '只听消息容易误判。', '以实际行动验证消息。'],

  'chikou-daan': ['争后归稳', '冲突之后局势趋于冷却与稳定。', '修复需要时间。', '先停争，再重建秩序。'],
  'chikou-liulian': ['争后拖延', '冲突发生后难以快速收场，变成长期消耗。', '反复拉扯。', '设边界，减少无效沟通。'],
  'chikou-suxi': ['争中见信', '冲突中出现消息、通知或转折。', '信息刺激可能加剧争执。', '先确认事实，再回应。'],
  'chikou-chikou': ['争上加争', '前后皆冲，矛盾明显。', '硬碰硬损耗加重。', '避免激化，保留证据与余地。'],
  'chikou-xiaoji': ['争后转和', '过程虽有冲突，但后续有缓和余地。', '一时言语伤关系。', '退一步，借第三方调和。'],
  'chikou-kongwang': ['争后成空', '争执之后事情失去实质推进。', '消耗大于收益。', '评估成本，必要时停止纠缠。'],

  'xiaoji-daan': ['小成归稳', '小的收获或合作之后进入稳定。', '扩张动力不足。', '见好就收，稳住成果。'],
  'xiaoji-liulian': ['和中生滞', '原本和合，但后续出现拖延或态度不明。', '人情变成牵扯。', '明确边界与期限。'],
  'xiaoji-suxi': ['和合生喜', '合作、人情或介绍带来好消息。', '过度依赖他人。', '主动维护关系，顺势推进。'],
  'xiaoji-chikou': ['和中起争', '合作关系中出现分歧。', '小事变口舌。', '先沟通规则，再谈结果。'],
  'xiaoji-xiaoji': ['小吉连生', '连续小成，利合作与渐进推进。', '成果分散，不宜贪大。', '持续积累，逐步放大。'],
  'xiaoji-kongwang': ['小成后空', '初有帮助或小收获，但后续承接不足。', '人情承诺落空。', '确认资源能否持续。'],

  'kongwang-daan': ['虚后归稳', '虚浮或落空之后回到安全状态。', '需要重建基础。', '先止损，再稳住基本盘。'],
  'kongwang-liulian': ['空后留滞', '基础不足又遇拖延，推进困难。', '无实质进展。', '暂停投入，重新查证。'],
  'kongwang-suxi': ['空中见信', '无望中忽有消息或反馈。', '消息可能短暂。', '先验证，再行动。'],
  'kongwang-chikou': ['虚中生争', '基础不实引发争执或误解。', '因空话、误判而冲突。', '回到事实与材料。'],
  'kongwang-xiaoji': ['空后小助', '落空之后仍有人情或小机会可用。', '帮助有限。', '小步尝试，不做重投。'],
  'kongwang-kongwang': ['空上加空', '前后皆虚，所求难实。', '继续投入成本高。', '止损、观望、重起新局。']
};

const SPECIAL_TRIPLES = {
  'daan-suxi-xiaoji': ['稳喜成合', '稳定基础上得喜讯，最终以合作、人情、小成收束，是较顺的格局。'],
  'liulian-chikou-kongwang': ['拖争成空', '拖延引发争执，最后实质推进不足，宜尽早止损。'],
  'chikou-liulian-kongwang': ['争拖两耗', '先争后拖，最终容易空耗，重点在减少无效消耗。'],
  'kongwang-suxi-daan': ['空中得信而归稳', '原本不足，后来有消息推动，最后回到稳定。'],
  'suxi-chikou-xiaoji': ['快争后和', '消息来得快，过程有争执，但最终可转为和合。'],
  'xiaoji-suxi-daan': ['人助喜成稳', '人情合作带来好消息，最终稳定落地。'],
  'daan-liulian-suxi': ['稳滞后动', '先稳后滞，最后有消息推动，可慢后转快。'],
  'kongwang-kongwang-kongwang': ['三空格', '三宫皆空，象意极虚，宜暂停强求、重新起局。'],
  'suxi-suxi-suxi': ['三喜格', '三宫皆喜，信息与机会连续出现，但仍需防过快失细。'],
  'chikou-chikou-chikou': ['三争格', '三宫皆争，冲突性强，宜先降温。'],
  'daan-daan-daan': ['三安格', '三宫皆稳，守成为佳，利长期不利速成。'],
  'xiaoji-xiaoji-xiaoji': ['三合格', '三宫皆和，利合作、人缘、小成累积。'],
  'liulian-liulian-liulian': ['三留格', '三宫皆滞，反复拖延明显，需设期限。']
};

export function getPairRule(a, b) {
  const raw = PAIR_RULES[`${a.key}-${b.key}`];
  return { theme: raw[0], meaning: raw[1], risk: raw[2], advice: raw[3], from: a.key, to: b.key };
}

export function getTripleRule(a, b, c) {
  const special = SPECIAL_TRIPLES[`${a.key}-${b.key}-${c.key}`];
  if (special) return { theme: special[0], meaning: special[1], advice: '以三宫整体格局优先，再参考两段转化。', special: true };
  const first = getPairRule(a, b);
  const second = getPairRule(b, c);
  return {
    theme: `${first.theme}，${second.theme}`,
    meaning: `三宫形成“${a.name}→${b.name}→${c.name}”之势：前段为“${first.theme}”，后段为“${second.theme}”。整体应先处理${a.keywords[0]}所代表的起因，再观察${b.keywords[0]}如何转入${c.keywords[0]}。`,
    advice: second.advice,
    special: false
  };
}

export function listRuleCoverage() {
  return { pairRules: Object.keys(PAIR_RULES).length, generatedTripleRules: 216, specialTriples: Object.keys(SPECIAL_TRIPLES).length };
}
