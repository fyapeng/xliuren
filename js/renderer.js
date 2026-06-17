import { WX_COLORS, WX_BG, getRelationClass, getVerdictClass } from './core.js';

const gColors = {
  daan: 'var(--green)',
  liulian: '#5a4a3a',
  suxi: 'var(--gold-dark)',
  chikou: '#c0392b',
  xiaoji: 'var(--blue)',
  kongwang: 'var(--purple)'
};

function palaceCard(g, label, role, isFinal) {
  return `<div class="palace-card gong-${g.pinyin} ${isFinal ? 'final' : ''}" ${isFinal ? `style="border-color:${gColors[g.pinyin]}"` : ''}>
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
  return `<div class="card"><div class="card-title">📖 三宫发展轨迹</div>
    <div class="timeline">
      ${report.timeline.map(item => `<div class="timeline-item"><h4>${item.title}</h4><p>${item.text}</p><div class="keywords">${item.tags.map(t => `<span class="mini-tag">${t}</span>`).join('')}</div></div>`).join('')}
    </div>
  </div>`;
}

function renderCategory(report) {
  if (report.categoryDetail) {
    const detail = report.categoryDetail;
    return `<div class="cat-reading"><h3>🔮 ${report.categoryName}分层详断（${report.final.name}定局）</h3>
      <div class="verdict ${getVerdictClass(detail.verdict)}">${detail.verdict}</div>
      <div class="section-grid">${detail.sections.map(s => `<div class="reading-section"><h4>▸ ${s.title}</h4><p>${s.text}</p></div>`).join('')}</div>
    </div>`;
  }
  return `<div class="card"><div class="card-title">🔮 各事项速查（${report.final.name}定局）</div>
    <div class="section-grid">${report.generalQuickLook.map(item => `<div class="reading-section"><h4>▸ ${item.name}：${item.verdict}</h4><p>${item.text}</p></div>`).join('')}</div>
  </div>`;
}

function renderWuxing(report) {
  return `<div class="card"><div class="card-title">🔥 五行与六神气势</div>
    <div class="wuxing-row">${report.wuxing.tags.map(t => `<span class="wuxing-tag">${t}</span>`).join('')}</div>
    ${report.wuxing.sections.map(s => `<div class="analysis-section"><h4>▸ ${s.title}</h4><p>${s.text}</p></div>`).join('')}
    <div class="analysis-section"><p>${report.wuxing.summary}</p></div>
  </div>`;
}

function renderShichen(report) {
  if (!report.shichen) return '';
  const s = report.shichen;
  const relClass = getRelationClass(s.rel);
  return `<div class="relation-card">
    <div class="card-title">⚖️ 时辰与落宫生克</div>
    <div class="relation-header">
      <div class="relation-element"><span class="el-label">${s.shichen}时</span><span class="el-value" style="color:${WX_COLORS[s.shichenElement]};border-color:${WX_COLORS[s.shichenElement]};background:${WX_BG[s.shichenElement]}">${s.shichenElement}</span></div>
      <div class="relation-arrow">→</div>
      <div class="relation-element"><span class="el-label">${s.palaceName}</span><span class="el-value" style="color:${WX_COLORS[s.palaceElement]};border-color:${WX_COLORS[s.palaceElement]};background:${WX_BG[s.palaceElement]}">${s.palaceElement}</span></div>
    </div>
    <div class="relation-result ${relClass}">${s.label}</div>
    <div class="relation-detail">${s.text}</div>
  </div>`;
}

function renderAdvice(report) {
  return `<div class="card"><div class="card-title">🧭 应对建议与提醒</div>
    <div class="advice-list">
      <div class="advice-box"><h4>宜</h4><ul>${report.advice.doList.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="advice-box"><h4>忌</h4><ul>${report.advice.avoidList.map(x => `<li>${x}</li>`).join('')}</ul></div>
    </div>
  </div>`;
}

export function renderResults(report, processText) {
  const html = `<div id="results">
    <div class="three-palaces">
      ${palaceCard(report.first, '第一宫', '起因·背景', false)}
      ${palaceCard(report.middle, '第二宫', '经过·发展', false)}
      ${palaceCard(report.final, '第三宫', '结果·现状', true)}
    </div>
    ${renderOverview(report)}
    <div class="card"><div class="card-title">📐 推算过程</div>${processText.map((t, i) => `<div class="process-step">${'①②③'[i]} ${t}</div>`).join('')}</div>
    ${renderShichen(report)}
    ${renderTimeline(report)}
    ${renderCategory(report)}
    ${renderWuxing(report)}
    ${renderAdvice(report)}
  </div>`;
  document.getElementById('results').outerHTML = html;
}