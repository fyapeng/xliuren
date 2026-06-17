export const PALACE_ORDER = ['daan', 'liulian', 'suxi', 'chikou', 'xiaoji', 'kongwang'];

export const WX_SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
export const WX_KE = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
export const WX_COLORS = {'木':'var(--green)','火':'var(--red)','土':'var(--gold-dark)','金':'#8a7a6a','水':'var(--blue)'};
export const WX_BG = {'木':'var(--green-light)','火':'#fce4e4','土':'var(--yellow-light)','金':'#f0ebe0','水':'var(--blue-light)'};

export function calcGong(n1, n2, n3) {
  const monthIndex = (n1 - 1) % 6;
  const dayIndex = (monthIndex + n2 - 1) % 6;
  const timeIndex = (dayIndex + n3 - 1) % 6;
  return {
    monthKey: PALACE_ORDER[monthIndex],
    dayKey: PALACE_ORDER[dayIndex],
    timeKey: PALACE_ORDER[timeIndex],
    monthIndex,
    dayIndex,
    timeIndex
  };
}

export function getRelation(a, b) {
  if (a === b) return 'same';
  if (WX_SHENG[a] === b) return 'sheng';
  if (WX_KE[a] === b) return 'ke';
  if (WX_SHENG[b] === a) return 'bei_sheng';
  if (WX_KE[b] === a) return 'bei_ke';
  return 'neutral';
}

export function getRelationLabel(rel) {
  return {
    sheng: '相生（前者生后者）',
    ke: '相克（前者克后者）',
    bei_sheng: '泄气（后者受生，前者耗力）',
    bei_ke: '受制（后者克前者）',
    same: '比和（同五行）',
    neutral: '无直接关系'
  }[rel];
}

export function getRelationClass(rel) {
  if (rel === 'sheng' || rel === 'bei_ke') return 'rel-sheng';
  if (rel === 'ke' || rel === 'bei_sheng') return 'rel-ke';
  if (rel === 'same') return 'rel-same';
  return 'rel-neutral';
}

export function describeRelation(from, to, rel, fromLabel = '前者', toLabel = '后者') {
  const texts = {
    sheng: `${fromLabel}五行（${from}）生${toLabel}五行（${to}），表示前段力量能推动后段发展。`,
    ke: `${fromLabel}五行（${from}）克${toLabel}五行（${to}），表示前段因素会压制或牵制后段。`,
    bei_sheng: `${toLabel}五行（${to}）生${fromLabel}五行（${from}），后段反来补前段，事情会因后续条件而得到缓冲。`,
    bei_ke: `${toLabel}五行（${to}）克${fromLabel}五行（${from}），后段能制住前段的问题，但需要付出代价。`,
    same: `${fromLabel}与${toLabel}五行皆为${from}，同气相求，力量会被放大。吉则更吉，凶则更凶。`,
    neutral: `${fromLabel}五行（${from}）与${toLabel}五行（${to}）无直接生克，二者关联较弱，主要看宫象本身。`
  };
  return texts[rel];
}

export function buildWuxingMatrix(first, middle, final) {
  const r12 = getRelation(first.element, middle.element);
  const r23 = getRelation(middle.element, final.element);
  const r13 = getRelation(first.element, final.element);
  return {
    causeToProcess: { rel: r12, label: getRelationLabel(r12), text: describeRelation(first.element, middle.element, r12, first.name, middle.name) },
    processToResult: { rel: r23, label: getRelationLabel(r23), text: describeRelation(middle.element, final.element, r23, middle.name, final.name) },
    causeToResult: { rel: r13, label: getRelationLabel(r13), text: describeRelation(first.element, final.element, r13, first.name, final.name) }
  };
}

export function getVerdictClass(verdict) {
  if (verdict.includes('凶')) return 'verdict-xiong';
  if (verdict.includes('吉')) return 'verdict-ji';
  return 'verdict-ping';
}