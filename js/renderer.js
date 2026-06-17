import { WX_COLORS, WX_BG, getRelationClass, getRelationLabel, getVerdictClass } from './core.js';

const gColors = {
  daan:'var(--green)', liulian:'#5a4a3a', suxi:'var(--gold-dark)',
  chikou:'#c0392b', xiaoji:'var(--blue)', kongwang:'var(--purple)'
};

function palaceCard(g, label, role, fin) {
  return `<div class="palace-card gong-${g.pinyin} ${fin ? 'final' : ''}" ${fin ? `style="border-color:${gColors[g.pinyin]}"` : ''}>
    <div class="palace-label">${label}</div>
    <div class="palace-role">${role}</div>
    <div class="palace-icon">${g.icon}</div>
    <div class="palace-name">${g.name}</div>
    <span class="palace-nature">${g.nature}</span>
  </div>`;
}

function renderOverview(report) {
  return `<div class="overview-card">
    <div class="overview-head">
      <div class="score-ring">${report.score}</div>
      <div>
        <div class="headline">${report.headline}</div>
        <div class="keywords">${report.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}</div>
      </div>
    </div>
    <div class="verdict ${getVerdictClass(report.verdict)}">${report.categoryName} · ${report.verdict}</div>
    <p class="summary">${report.summary}</p>
  </div>`;
}

function renderTimeline(report) {
  return `<div class="card">
    <div class="card-title">📖 三宫轨迹</div>
    <div class="timeline">
      ${report.timeline.map(item => `<div class="timeline-item">
        <h4>${item.title}</h4>
        <p>${item.text}</p>
        <div class="keywords">${item.tags.map(t => `<span class="mini-tag">${t}</span>`).join('')}</div>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderSections(report) {
  return `<div class="cat-reading">
    <h3>🔮 ${report.categoryName}详断</h3>
    <div class="section-grid">
      ${report.sections.map(s => `<div class="reading-section"><h4>${s.title}</h4><p>${s.text}</p></div>`).join('')}
    </div>
  </div>`;
}

function renderWuxing(report) {
  const rows = [
    ['起因 → 经过', report.wuxing.causeToProcess],
    ['经过 → 结果', report.wuxing.processToResult],
    ['起因 → 结果', report.wuxing.causeToResult]
  ];
  return `<div class="card">
    <div class="card-title">🔥 五行气势</div>
    <div class="wuxing-row">
      <span class="wuxing-tag">${report.first.name} ${report.first.element}·${report.first.deity}</span>
      <span class="wuxing-tag">${report.middle.name} ${report.middle.element}·${report.middle.deity}</span>
      <span class="wuxing-tag">${report.final.name} ${report.final.element}·${report.final.deity}</span>
    </div>
    ${rows.map(([title, item]) => `<div class="analysis-section">
      <h4>▸ ${title}：${item.label}</h4><p>${item.text}</p>
    </div>`).join('')}
  </div>`;
}

function renderShichen(report, shichenName, shichenElement) {
  if (!report.shichenRelation) return '';
  const final = report.final;
  const rel = report.shichenRelation.rel;
  return `<div class="relation-card">
    <div class="card-title">⚖️ 时辰与落宫生克</div>
    <div class="relation-header">
      <div class="relation-element">
        <span class="el-label">${shichenName}时</span>
        <span class="el-value" style="color:${WX_COLORS[shichenElement]};border-color:${WX_COLORS[shichenElement]};background:${WX_BG[shichenElement]}">${shichenElement}</span>
      </div>
      <div class="relation-arrow">→</div>
      <div class="relation-element">
        <span class="el-label">${final.name}</span>
        <span class="el-value" style="color:${WX_COLORS[final.element]};border-color:${WX_COLORS[final.element]};background:${WX_BG[final.element]}">${final.element}</span>
      </div>
    </div>
    <div class="relation-result ${getRelationClass(rel)}">${getRelationLabel(rel)}</div>
    <div class="relation-detail">${report.shichenRelation.text}</div>
  </div>`;
}

function renderAdvice(report) {
  return `<div class="card">
    <div class="card-title">🧭 应期、方位与行动建议</div>
    <div class="advice-list">
      <div class="advice-box"><h4>宜</h4><ul>${report.advice.do.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="advice-box"><h4>忌</h4><ul>${report.advice.avoid.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="advice-box"><h4>应期</h4><ul><li>${report.advice.timing}</li></ul></div>
      <div class="advice-box"><h4>方位与人物</h4><ul><li>${report.advice.direction}</li><li>${report.advice.people}</li></ul></div>
    </div>
  </div>`;
}

function renderProcess(processText) {
  return `<div class="card"><div class="card-title">📐 推算过程</div>
    ${processText.map((t, i) => `<div class="process-step">${'①②③'[i]} ${t}</div>`).join('')}
  </div>`;
}

export function renderReading({ report, processText, shichenName, shichenElement }) {
  const h = `<div id="results">
    <div class="three-palaces">
      ${palaceCard(report.first, '第一宫', '起因·背景', false)}
      ${palaceCard(report.middle, '第二宫', '经过·发展', false)}
      ${palaceCard(report.final, '第三宫', '结果·现状', true)}
    </div>
    ${renderOverview(report)}
    ${renderProcess(processText)}
    ${renderShichen(report, shichenName, shichenElement)}
    ${renderTimeline(report)}
    ${renderSections(report)}
    ${renderWuxing(report)}
    ${renderAdvice(report)}
  </div>`;
  document.getElementById('results').outerHTML = h;
}