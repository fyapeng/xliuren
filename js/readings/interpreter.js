import { CATEGORY_NAMES, getSections } from './data.js';
import { getPairRule, getTripleRule, listRuleCoverage } from './rules.js';
import { buildAdvancedInsights } from './advanced.js';
import { buildWuxingMatrix, getRelation } from '../core.js';

function scoreOf(first, middle, final, scRelation, wuxing) {
  let score = 3;
  score += first.polarity * 0.25;
  score += middle.polarity * 0.55;
  score += final.polarity * 1.25;
  if (['sheng','bei_ke'].includes(wuxing.causeToProcess.rel)) score += 0.2;
  if (['sheng','bei_ke'].includes(wuxing.processToResult.rel)) score += 0.35;
  if (['ke','bei_sheng'].includes(wuxing.causeToProcess.rel)) score -= 0.2;
  if (['ke','bei_sheng'].includes(wuxing.processToResult.rel)) score -= 0.35;
  if (scRelation === 'sheng' || scRelation === 'bei_ke') score += 0.35;
  if (scRelation === 'ke' || scRelation === 'bei_sheng') score -= 0.35;
  return Math.max(1, Math.min(5, Math.round(score)));
}
function verdictFrom(score, final) { if (score >= 5) return final.nature.includes('凶') ? '先阻后通' : '大吉'; if (score === 4) return '吉'; if (score === 3) return '平'; if (score === 2) return '平凶'; return '凶'; }
function buildHeadline(first, middle, final, triple, score) {
  const prefix = score >= 4 ? '趋势较顺' : score <= 2 ? '过程有阻' : '稳中有变';
  return `${prefix}，${triple.theme}`;
}
function summaryText(category, first, middle, final, triple, pair12, pair23, advanced, score) {
  const catName = CATEGORY_NAMES[category] || '综合';
  const tone = score >= 4 ? '整体可顺势推进，但仍需稳住节奏。' : score <= 2 ? '整体阻力偏重，宜先稳住局面，不宜急进。' : '整体有进有阻，关键在于处理过程中的反复与卡点。';
  return `本次问【${catName}】，起因落在【${first.name}】，过程落在【${middle.name}】，结果落在【${final.name}】。此象显示：${triple.meaning} ${tone} 当前最需要关注的是“${pair23.theme}”：${pair23.meaning} 最终以【${final.name}】收束，主调为：${final.result} 应期节奏偏${advanced.timing.pace}，可参考：${advanced.timing.window}。`;
}
function buildDetail(category, first, middle, final, pair12, pair23, triple, wuxing, advanced) {
  const sections = getSections(category);
  const finalBase = final.categoryBase[category];
  const middleBase = middle.categoryBase[category];
  const firstBase = first.categoryBase[category];
  const values = [
    `${finalBase.points[0]} 此事的根子在【${first.name}】，多与${first.keywords.slice(0,2).join('、')}有关。`,
    `${firstBase.points[1]} 事情进入【${middle.name}】阶段后，表现为：${middle.process}`,
    `${middleBase.points[2]} 阻力主要来自【${middle.name}】的${middle.keywords.slice(0,2).join('、')}，处理上宜避免反复消耗。`,
    `${finalBase.points[1]} 最终【${final.name}】落局，转机多在${advanced.location.direction}、${advanced.location.places.join('、')}，或与${advanced.location.hint}有关的场景。`,
    `${finalBase.points[2]} 整体格局为“${triple.theme}”，行动上宜：${triple.advice}`,
    `节奏判断为${advanced.timing.pace}，参考窗口：${advanced.timing.window}。应期仅作传统文化参考。`
  ];
  return sections.map((title, i) => ({ title, text: values[i] || final.general }));
}
function buildAdvice(category, first, middle, final, pair12, pair23, triple, advanced) {
  return { suitable: [`先处理【${first.name}】所代表的${first.keywords[0]}问题。`, pair12.advice, pair23.advice], avoid: [final.polarity < 0 ? '避免继续加码投入。' : '避免因局势较顺而轻忽细节。', middle.polarity < 0 ? `避免放大【${middle.name}】带来的阻力。` : '避免过度依赖他人。', '此结果仅供传统文化与娱乐参考，不替代现实中的专业判断。'], direction: `${advanced.location.direction}、${advanced.location.places.join('、')}`, people: advanced.persona.main, pattern: triple.theme };
}
export function buildReading({ category, first, middle, final, shichenElement }) {
  const pair12 = getPairRule(first, middle);
  const pair23 = getPairRule(middle, final);
  const triple = getTripleRule(first, middle, final);
  const wuxing = buildWuxingMatrix(first, middle, final);
  const scRelation = shichenElement ? getRelation(shichenElement, final.element) : 'neutral';
  const score = scoreOf(first, middle, final, scRelation, wuxing);
  const coverage = listRuleCoverage();
  const advanced = buildAdvancedInsights({ first, middle, final, category, score, wuxing });
  return { category, categoryName: CATEGORY_NAMES[category] || '综合', score, verdict: category === 'general' ? verdictFrom(score, final) : final.categoryBase[category].verdict, headline: buildHeadline(first, middle, final, triple, score), keywords: [...new Set([...first.keywords.slice(0,2), ...middle.keywords.slice(0,2), ...final.keywords.slice(0,3), triple.theme, advanced.timing.pace])].slice(0,8), summary: summaryText(category, first, middle, final, triple, pair12, pair23, advanced, score), timeline: [{ label:'起因', palace:first.name, text:first.cause }, { label:'经过', palace:middle.name, text:middle.process }, { label:'结果', palace:final.name, text:final.result }], detail: category === 'general' ? [] : buildDetail(category, first, middle, final, pair12, pair23, triple, wuxing, advanced), combos: [triple, pair12, pair23], wuxing, advanced, advice: buildAdvice(category, first, middle, final, pair12, pair23, triple, advanced), coverage };
}
