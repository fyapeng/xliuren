import { CATEGORIES, CATEGORY_NAMES, COMBO_RULES, getSections } from './data.js';
import { buildWuxingMatrix, getRelation } from '../core.js';

const scoreLabel = score => {
  if (score >= 82) return '大吉';
  if (score >= 66) return '吉';
  if (score >= 50) return '平';
  if (score >= 34) return '平凶';
  return '凶';
};

function clampScore(n) {
  return Math.max(8, Math.min(96, Math.round(n)));
}

function comboKey(a, b) {
  return `${a.pinyin}-${b.pinyin}`;
}

function getCombo(a, b) {
  return COMBO_RULES[comboKey(a, b)] || {
    theme: `${a.name}转${b.name}`,
    meaning: `前段呈现${a.keywords.slice(0, 2).join('、')}之象，后段转入${b.keywords.slice(0, 2).join('、')}之象。`,
    advice: '按阶段处理，不宜用同一种策略贯穿始终。'
  };
}

function buildScore(first, middle, final, wuxing) {
  let score = 50 + first.polarity * 5 + middle.polarity * 7 + final.polarity * 12;
  Object.values(wuxing).forEach(item => {
    if (item.rel === 'sheng' || item.rel === 'bei_ke') score += 5;
    if (item.rel === 'ke' || item.rel === 'bei_sheng') score -= 5;
    if (item.rel === 'same') score += final.polarity >= 0 ? 3 : -3;
  });
  return clampScore(score);
}

function buildHeadline(first, middle, final, c12, c23) {
  if (final.polarity > 0 && middle.polarity < 0) return `先有波折，终归${final.name}`;
  if (final.polarity < 0 && first.polarity > 0) return `起势尚稳，终防${final.name}`;
  if (first.pinyin === final.pinyin) return `${first.name}贯穿，首尾同气`;
  return `${c12.theme}，${c23.theme}`;
}

function buildSummary(category, first, middle, final, c12, c23) {
  const cat = CATEGORIES[category];
  const prefix = cat ? `此卦以「${cat.name}」为问，重点看${cat.focus}。` : '此卦以综合问事为主。';
  return `${prefix}起因为${first.name}，表示${first.cause}经过为${middle.name}，表示${middle.process}结果落${final.name}，表示${final.result}${c12.meaning}${c23.meaning}`;
}

function buildTimeline(first, middle, final, c12, c23) {
  return [
    { title: `起因 · ${first.name}`, text: first.cause, tags: first.keywords.slice(0, 3) },
    { title: `经过 · ${middle.name}`, text: `${middle.process}${c12.meaning}`, tags: middle.keywords.slice(0, 3) },
    { title: `结果 · ${final.name}`, text: `${final.result}${c23.meaning}`, tags: final.keywords.slice(0, 3) }
  ];
}

function buildCategorySections(category, first, middle, final, wuxing) {
  if (category === 'general') {
    return [
      { title: '总体气势', text: `${first.name}起事、${middle.name}发展、${final.name}收束。此卦重点在于由「${first.keywords[0]}」转向「${final.keywords[0]}」。` },
      { title: '主要矛盾', text: `${middle.name}居中，说明过程阶段最值得关注：${middle.general}` },
      { title: '结果判断', text: `${final.name}为最终落宫，主结果：${final.result}` },
      { title: '行动方向', text: buildAdviceText(final, wuxing) }
    ];
  }

  const base = final.categoryBase[category];
  const sections = getSections(category);
  const points = base.points;
  const wxHint = wuxing.processToResult.rel === 'sheng'
    ? '过程能推动结果，可顺势加力。'
    : wuxing.processToResult.rel === 'ke'
      ? '过程会压制结果，需先处理阻力。'
      : '过程与结果关联不算强，应回到事项本身判断。';

  return sections.map((title, idx) => ({
    title,
    text: [
      points[idx % points.length],
      idx === 0 ? `最终落${final.name}，本项结论为「${base.verdict}」。` : '',
      idx === 2 ? `${middle.name}居过程位，提示：${middle.process}` : '',
      idx === 4 ? wxHint : '',
      idx === 5 ? `应期可参考：${final.timing.fast}；若事体较慢，则看${final.timing.slow}。` : ''
    ].filter(Boolean).join('')
  }));
}

function buildAdviceText(final, wuxing) {
  const rel = wuxing.processToResult.rel;
  if (final.polarity > 0 && (rel === 'sheng' || rel === 'same')) return `结果宫为${final.name}，且过程能助结果，宜主动推进，把握窗口。`;
  if (final.polarity > 0) return `结果宫为${final.name}，总体可成，但宜稳步推进，不宜贪快。`;
  if (final.polarity < 0 && (rel === 'ke' || rel === 'bei_sheng')) return `结果宫为${final.name}且过程受阻，宜先止损、查实、缓行。`;
  return `结果宫为${final.name}，不宜强求，先整理条件与信息。`;
}

function buildAdvice(first, middle, final, category, wuxing) {
  const base = category !== 'general' ? final.categoryBase[category] : null;
  return {
    do: [
      buildAdviceText(final, wuxing),
      `利用${final.deity}之象：${final.deity === '青龙' ? '守正、稳住基本盘' : final.deity === '六合' ? '借助合作与调解' : final.deity === '朱雀' ? '重视沟通和文书' : final.deity === '玄武' ? '查清暗线和旧问题' : final.deity === '白虎' ? '降温冲突，保留证据' : '查实基础，减少虚耗'}。`,
      base ? base.points[0] : final.general
    ],
    avoid: [
      middle.polarity < 0 ? `过程见${middle.name}，忌在阻力未清时强推。` : '忌因阶段顺利而忽略细节。',
      final.polarity < 0 ? `结果见${final.name}，忌继续扩大投入。` : '忌贪多贪快，见好应收。',
      '本工具仅供传统文化学习和娱乐参考，不作为现实决策依据。'
    ],
    timing: `快看${final.timing.fast}，慢看${final.timing.slow}。`,
    direction: `${final.position}、${final.image.place.join('、')}可作为象意参考。`,
    people: `${final.image.person.join('、')}可能与事情推进有关。`
  };
}

export function buildReading({ category, first, middle, final, shichenRelation = null }) {
  const wuxing = buildWuxingMatrix(first, middle, final);
  const c12 = getCombo(first, middle);
  const c23 = getCombo(middle, final);
  const score = buildScore(first, middle, final, wuxing);
  const base = category !== 'general' ? final.categoryBase[category] : null;

  return {
    category,
    categoryName: CATEGORY_NAMES[category] || '综合',
    first, middle, final,
    score,
    verdict: base?.verdict || scoreLabel(score),
    headline: buildHeadline(first, middle, final, c12, c23),
    keywords: [...new Set([...first.keywords.slice(0, 2), ...middle.keywords.slice(0, 2), ...final.keywords.slice(0, 2)])].slice(0, 6),
    summary: buildSummary(category, first, middle, final, c12, c23),
    timeline: buildTimeline(first, middle, final, c12, c23),
    sections: buildCategorySections(category, first, middle, final, wuxing),
    wuxing,
    shichenRelation,
    advice: buildAdvice(first, middle, final, category, wuxing),
    combos: { causeToProcess: c12, processToResult: c23 }
  };
}

export function buildShichenRelation(shichenElement, final) {
  if (!shichenElement) return null;
  const rel = getRelation(shichenElement, final.element);
  const texts = {
    sheng: `时辰五行（${shichenElement}）生落宫五行（${final.element}），外部时机对结果有助力。`,
    ke: `时辰五行（${shichenElement}）克落宫五行（${final.element}），外部环境对结果有压制。`,
    bei_sheng: `落宫五行（${final.element}）生时辰五行（${shichenElement}），事情本身容易被外部消耗。`,
    bei_ke: `落宫五行（${final.element}）克时辰五行（${shichenElement}），当事方对外部条件有一定制约力，但会耗力。`,
    same: `时辰与落宫同属${final.element}，同气相求，吉凶力量都会被放大。`,
    neutral: `时辰五行与落宫五行无直接生克，主要看卦象本身。`
  };
  return { rel, text: texts[rel] };
}