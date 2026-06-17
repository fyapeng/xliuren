import { PALACES, CATEGORY_NAMES, CATEGORIES, COMBO_RULES, getSections } from './data.js';
import { buildWuxingMatrix, getRelation, getRelationLabel, describeRelation } from '../core.js';
import { SHICHEN_NAMES, SHICHEN_ELEMENTS } from '../lunar.js';

function pairRule(a, b) {
  return COMBO_RULES[`${a.key}-${b.key}`] || null;
}

function scoreReading(first, middle, final, shichenRel) {
  let score = 60 + first.polarity * 6 + middle.polarity * 8 + final.polarity * 14;
  if (shichenRel === 'sheng' || shichenRel === 'bei_ke') score += 8;
  if (shichenRel === 'ke' || shichenRel === 'bei_sheng') score -= 8;
  if (shichenRel === 'same') score += final.polarity >= 0 ? 5 : -5;
  return Math.max(5, Math.min(95, score));
}

function verdictFromScore(score) {
  if (score >= 82) return '大吉';
  if (score >= 68) return '吉';
  if (score >= 52) return '平';
  if (score >= 36) return '平凶';
  return '凶';
}

function headlineFrom(first, middle, final, combo12, combo23) {
  if (combo23) return `${combo23.theme}，终落${final.name}`;
  if (combo12) return `${combo12.theme}，以${final.name}收局`;
  return `${first.name}起事，${middle.name}行局，${final.name}定局`;
}

function buildSummary(categoryKey, first, middle, final, combo12, combo23) {
  const categoryName = CATEGORY_NAMES[categoryKey] || '综合';
  const lines = [
    `本卦以【${first.name}】为起因，【${middle.name}】为过程，【${final.name}】为结果。`,
    `问${categoryName}，重点不只看最终落宫，还要看前因如何推至结果。`
  ];
  if (combo12) lines.push(`前段组合为“${combo12.theme}”：${combo12.meaning}`);
  if (combo23) lines.push(`后段组合为“${combo23.theme}”：${combo23.meaning}`);
  lines.push(`最终以【${final.name}】定局：${final.result}`);
  return lines.join('');
}

function buildTimeline(first, middle, final) {
  return [
    { title: `起因 · ${first.name}`, text: first.cause, tags: first.keywords.slice(0, 3) },
    { title: `经过 · ${middle.name}`, text: middle.process, tags: middle.keywords.slice(0, 3) },
    { title: `结果 · ${final.name}`, text: final.result, tags: final.keywords.slice(0, 3) }
  ];
}

function categoryDetail(categoryKey, first, middle, final) {
  if (categoryKey === 'general') return null;
  const base = final.categoryBase[categoryKey];
  const sections = getSections(categoryKey);
  const combo12 = pairRule(first, middle);
  const combo23 = pairRule(middle, final);
  const focus = CATEGORIES[categoryKey]?.focus || '所问事项';
  const paragraphs = [
    { title: sections[0], text: `${base.points[0]}此项以“${focus}”为核心，最终落在【${final.name}】，说明结果层面的主象是${final.keywords.join('、')}。` },
    { title: sections[1], text: `起因为【${first.name}】：${first.cause}` },
    { title: sections[2], text: `过程为【${middle.name}】：${middle.process}${combo12 ? ` 前段呈“${combo12.theme}”，${combo12.advice}` : ''}` },
    { title: sections[3], text: `${base.points[1]}${combo23 ? ` 后段呈“${combo23.theme}”，${combo23.advice}` : ''}` },
    { title: sections[4], text: base.points[2] },
    { title: sections[5], text: `快看${final.timing.fast}，慢看${final.timing.slow}。方位可参考${final.position}，场景可留意：${final.image.place.join('、')}。` }
  ];
  return { verdict: base.verdict, sections: paragraphs };
}

function generalQuickLook(final) {
  return Object.entries(final.categoryBase).map(([key, item]) => ({
    name: CATEGORY_NAMES[key],
    verdict: item.verdict,
    text: item.points.join('')
  }));
}

function buildWuxing(first, middle, final) {
  const matrix = buildWuxingMatrix(first, middle, final);
  return {
    tags: [`${first.name} ${first.element}·${first.deity}`, `${middle.name} ${middle.element}·${middle.deity}`, `${final.name} ${final.element}·${final.deity}`],
    sections: [
      { title: `起因 → 经过：${matrix.causeToProcess.label}`, text: matrix.causeToProcess.text },
      { title: `经过 → 结果：${matrix.processToResult.label}`, text: matrix.processToResult.text },
      { title: `起因 → 结果：${matrix.causeToResult.label}`, text: matrix.causeToResult.text }
    ],
    summary: `六神为${first.deity}起事，${middle.deity}行局，${final.deity}定局。五行关系用于判断事情气势承接，不单独替代宫象。`
  };
}

function buildShichen(scIdx, final) {
  if (scIdx < 0) return null;
  const scEl = SHICHEN_ELEMENTS[scIdx];
  const rel = getRelation(scEl, final.element);
  return {
    shichen: SHICHEN_NAMES[scIdx],
    shichenElement: scEl,
    palaceName: final.name,
    palaceElement: final.element,
    rel,
    label: getRelationLabel(rel),
    text: describeRelation(scEl, final.element, rel, `${SHICHEN_NAMES[scIdx]}时`, final.name)
  };
}

function buildAdvice(categoryKey, first, middle, final) {
  const doList = [
    `按【${middle.name}】的过程象处理当前阶段：${middle.process}`,
    `以【${final.name}】定策略：${final.result}`,
    `优先关注${final.position}、${final.image.place.slice(0, 2).join('、')}等象意线索。`
  ];
  const avoidList = [
    final.polarity < 0 ? '不宜强行推进，应先查实条件、降低消耗。' : '不宜因局势较顺就忽略细节。',
    middle.pinyin === 'chikou' ? '忌口舌争执，关键沟通要留文字记录。' : '忌频繁改动判断，先看事情自身节奏。',
    categoryKey === 'health' || categoryKey === 'lawsuit' ? '涉及现实风险的事项，请以专业意见和现实证据为准。' : '本结果仅作传统文化娱乐参考，不替代现实决策。'
  ];
  return { doList, avoidList };
}

export function buildReading({ categoryKey, monthKey, dayKey, timeKey, scIdx = -1 }) {
  const first = { ...PALACES[monthKey], key: monthKey };
  const middle = { ...PALACES[dayKey], key: dayKey };
  const final = { ...PALACES[timeKey], key: timeKey };
  const shichen = buildShichen(scIdx, final);
  const score = scoreReading(first, middle, final, shichen?.rel);
  const combo12 = pairRule(first, middle);
  const combo23 = pairRule(middle, final);
  const categoryDetailData = categoryDetail(categoryKey, first, middle, final);
  return {
    categoryKey,
    categoryName: CATEGORY_NAMES[categoryKey],
    first,
    middle,
    final,
    score,
    verdict: categoryDetailData?.verdict || verdictFromScore(score),
    headline: headlineFrom(first, middle, final, combo12, combo23),
    keywords: [...new Set([...final.keywords.slice(0, 3), combo12?.theme, combo23?.theme].filter(Boolean))],
    summary: buildSummary(categoryKey, first, middle, final, combo12, combo23),
    timeline: buildTimeline(first, middle, final),
    categoryDetail: categoryDetailData,
    generalQuickLook: categoryKey === 'general' ? generalQuickLook(final) : null,
    wuxing: buildWuxing(first, middle, final),
    shichen,
    advice: buildAdvice(categoryKey, first, middle, final)
  };
}