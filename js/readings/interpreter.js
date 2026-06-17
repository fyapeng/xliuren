import { CATEGORY_NAMES, COMBO_RULES, getSections } from './data.js';
import { buildWuxingMatrix, getRelation } from '../core.js';

function combo(a, b) { return COMBO_RULES[`${a.key}-${b.key}`] || null; }
function scoreOf(first, middle, final, scRelation) {
  let score = 3 + first.polarity * 0.35 + middle.polarity * 0.55 + final.polarity * 1.15;
  if (scRelation === 'sheng' || scRelation === 'bei_ke') score += 0.35;
  if (scRelation === 'ke' || scRelation === 'bei_sheng') score -= 0.35;
  return Math.max(1, Math.min(5, Math.round(score)));
}
function verdictFrom(score, final) {
  if (score >= 5) return final.nature.includes('凶') ? '先阻后通' : '大吉';
  if (score === 4) return '吉';
  if (score === 3) return '平';
  if (score === 2) return '平凶';
  return '凶';
}
function buildHeadline(first, middle, final, c12, c23) {
  if (c12 && c23) return `${c12.theme}，${c23.theme}`;
  if (c23) return `${middle.name}转${final.name}：${c23.theme}`;
  if (c12) return `${first.name}转${middle.name}：${c12.theme}`;
  return `${first.name}起事，${middle.name}行事，${final.name}成局`;
}
function summaryText(category, first, middle, final, c12, c23) {
  const catName = CATEGORY_NAMES[category] || '综合';
  const comboText = [c12?.meaning, c23?.meaning].filter(Boolean).join(' ');
  return `本卦以【${first.name}】为起因、【${middle.name}】为经过、【${final.name}】为结果。问【${catName}】时，重点不只看最终落宫，还要看前因如何推动过程、过程如何转入结果。${comboText || `整体呈现“${first.keywords[0]}—${middle.keywords[0]}—${final.keywords[0]}”的递进。`} 最终落在【${final.name}】，主调为：${final.result}`;
}
function buildDetail(category, first, middle, final) {
  const sections = getSections(category);
  const finalBase = final.categoryBase[category];
  const middleBase = middle.categoryBase[category];
  const firstBase = first.categoryBase[category];
  const values = [
    `${finalBase.points[0]} 起因端见【${first.name}】，说明此事的根子在于${first.keywords.slice(0,2).join('、')}。`,
    `${firstBase.points[1]} 事情进入【${middle.name}】阶段后，表现为${middle.process}`,
    `${middleBase.points[2]} 主要阻力来自【${middle.name}】的${middle.keywords.slice(0,2).join('、')}之象。`,
    `${finalBase.points[1]} 最终【${final.name}】落局，转机多在${final.image.person[0]}、${final.image.place[0]}或与${final.keywords[0]}有关的场景。`,
    `${finalBase.points[2]} ${final.categoryBase[category].verdict.includes('凶') ? '宜先控风险，再求推进。' : '宜顺势推进，但保持边界。'}`,
    `快看${final.timing.fast}；慢看${final.timing.slow}。应期仅作传统文化参考。`
  ];
  return sections.map((title, i) => ({ title, text: values[i] || final.general }));
}
function buildAdvice(category, first, middle, final, c23) {
  return {
    suitable: [`顺应【${final.name}】的${final.keywords[0]}之象。`, `优先处理【${first.name}】所代表的起因问题。`, c23?.advice || `以【${middle.name}】阶段的表现作为调整重点。`],
    avoid: [final.polarity < 0 ? '避免继续加码投入。' : '避免因局势较顺而轻忽细节。', middle.polarity < 0 ? `避免放大【${middle.name}】带来的阻力。` : '避免过度依赖他人。', '此结果仅供传统文化与娱乐参考，不替代现实中的专业判断。'],
    direction: `${final.position}、${final.image.place.join('、')}`,
    people: final.image.person.join('、')
  };
}
export function buildReading({ category, first, middle, final, shichenElement }) {
  const c12 = combo(first, middle);
  const c23 = combo(middle, final);
  const wuxing = buildWuxingMatrix(first, middle, final);
  const scRelation = shichenElement ? getRelation(shichenElement, final.element) : 'neutral';
  const score = scoreOf(first, middle, final, scRelation);
  return {
    category, categoryName: CATEGORY_NAMES[category] || '综合', score,
    verdict: category === 'general' ? verdictFrom(score, final) : final.categoryBase[category].verdict,
    headline: buildHeadline(first, middle, final, c12, c23),
    keywords: [...new Set([...first.keywords.slice(0,2), ...middle.keywords.slice(0,2), ...final.keywords.slice(0,3)])].slice(0,6),
    summary: summaryText(category, first, middle, final, c12, c23),
    timeline: [{label:'起因',palace:first.name,text:first.cause},{label:'经过',palace:middle.name,text:middle.process},{label:'结果',palace:final.name,text:final.result}],
    detail: category === 'general' ? [] : buildDetail(category, first, middle, final),
    combos: [c12, c23].filter(Boolean), wuxing,
    advice: buildAdvice(category, first, middle, final, c23)
  };
}