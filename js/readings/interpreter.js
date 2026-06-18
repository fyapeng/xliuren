import { CATEGORY_NAMES, getSections } from './data.js';
import { getPairRule, getTripleRule, listRuleCoverage } from './rules.js';
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

function verdictFrom(score, final) {
  if (score >= 5) return final.nature.includes('凶') ? '先阻后通' : '大吉';
  if (score === 4) return '吉';
  if (score === 3) return '平';
  if (score === 2) return '平凶';
  return '凶';
}

function buildHeadline(first, middle, final, triple) {
  return `${triple.theme}｜${first.name}→${middle.name}→${final.name}`;
}

function summaryText(category, first, middle, final, triple, pair12, pair23, coverage) {
  const catName = CATEGORY_NAMES[category] || '综合';
  return `本卦以【${first.name}】为起因、【${middle.name}】为经过、【${final.name}】为结果。问【${catName}】时，系统会调用完整规则层：${coverage.pairRules} 条二宫转化规则可覆盖全部 ${coverage.generatedTripleRules} 种三宫组合，并优先命中特殊三宫格局。当前格局为：${triple.meaning} 前段“${pair12.theme}”：${pair12.meaning} 后段“${pair23.theme}”：${pair23.meaning} 最终落在【${final.name}】，主调为：${final.result}`;
}

function buildDetail(category, first, middle, final, pair12, pair23, triple, wuxing) {
  const sections = getSections(category);
  const finalBase = final.categoryBase[category];
  const middleBase = middle.categoryBase[category];
  const firstBase = first.categoryBase[category];
  const values = [
    `${finalBase.points[0]} 起因端见【${first.name}】，根子在于${first.keywords.slice(0,2).join('、')}；${pair12.meaning}`,
    `${firstBase.points[1]} 事情进入【${middle.name}】阶段后，表现为：${middle.process} ${wuxing.causeToProcess.text}`,
    `${middleBase.points[2]} 阻力主要来自【${middle.name}】的${middle.keywords.slice(0,2).join('、')}；后段规则为“${pair23.theme}”。`,
    `${finalBase.points[1]} 最终【${final.name}】落局，转机多在${final.image.person[0]}、${final.image.place[0]}或与${final.keywords[0]}有关的场景。${wuxing.processToResult.text}`,
    `${finalBase.points[2]} 三宫总势为“${triple.theme}”，行动上宜：${triple.advice}`,
    `快看${final.timing.fast}；慢看${final.timing.slow}。应期仅作传统文化参考。`
  ];
  return sections.map((title, i) => ({ title, text: values[i] || final.general }));
}

function buildAdvice(category, first, middle, final, pair12, pair23, triple) {
  return {
    suitable: [
      `先处理【${first.name}】的${first.keywords[0]}之因。`,
      `过程阶段按“${pair12.theme}”处理：${pair12.advice}`,
      `结果阶段按“${pair23.theme}”收束：${pair23.advice}`
    ],
    avoid: [
      final.polarity < 0 ? '避免继续加码投入。' : '避免因局势较顺而轻忽细节。',
      middle.polarity < 0 ? `避免放大【${middle.name}】带来的阻力。` : '避免过度依赖他人。',
      '此结果仅供传统文化与娱乐参考，不替代现实中的专业判断。'
    ],
    direction: `${final.position}、${final.image.place.join('、')}`,
    people: final.image.person.join('、'),
    pattern: triple.theme
  };
}

export function buildReading({ category, first, middle, final, shichenElement }) {
  const pair12 = getPairRule(first, middle);
  const pair23 = getPairRule(middle, final);
  const triple = getTripleRule(first, middle, final);
  const wuxing = buildWuxingMatrix(first, middle, final);
  const scRelation = shichenElement ? getRelation(shichenElement, final.element) : 'neutral';
  const score = scoreOf(first, middle, final, scRelation, wuxing);
  const coverage = listRuleCoverage();
  return {
    category,
    categoryName: CATEGORY_NAMES[category] || '综合',
    score,
    verdict: category === 'general' ? verdictFrom(score, final) : final.categoryBase[category].verdict,
    headline: buildHeadline(first, middle, final, triple),
    keywords: [...new Set([...first.keywords.slice(0,2), ...middle.keywords.slice(0,2), ...final.keywords.slice(0,3), triple.theme])].slice(0,7),
    summary: summaryText(category, first, middle, final, triple, pair12, pair23, coverage),
    timeline: [
      { label:'起因', palace:first.name, text:first.cause },
      { label:'经过', palace:middle.name, text:middle.process },
      { label:'结果', palace:final.name, text:final.result }
    ],
    detail: category === 'general' ? [] : buildDetail(category, first, middle, final, pair12, pair23, triple, wuxing),
    combos: [triple, pair12, pair23],
    wuxing,
    advice: buildAdvice(category, first, middle, final, pair12, pair23, triple),
    coverage
  };
}
