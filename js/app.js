import { formatCurrentTime, solarToLunar, getShiChenIndex, SHICHEN_NAMES } from './lunar.js';
import { calcGong } from './core.js';
import { PALACES, CATEGORY_NAMES } from './readings/data.js';
import { buildReading } from './readings/interpreter.js';
import { renderResults } from './renderer.js';

let selectedCategory = 'general';
let currentMode = 'time';

function updateTimeInfo() {
  const info = formatCurrentTime(new Date());
  document.getElementById('timeInfo').innerHTML = `
    <div class="time-row"><span class="time-label">公历</span><span class="time-value">${info.solar}</span></div>
    <div class="time-row"><span class="time-label">农历</span><span class="time-value">${info.lunar}</span></div>
    <div class="time-row"><span class="time-label">时辰</span><span class="time-value">${info.shichen}</span></div>
  `;
}

function bindTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      document.querySelectorAll('.mode-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById(`mode-${currentMode}`).classList.add('active');
    });
  });
}

function bindCategories() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.cat;
    });
  });
}

function buildProcessForTime(n1, n2, n3, scIdx, gong) {
  const now = new Date();
  const lunar = solarToLunar(now);
  return [
    `从【大安】起正月，顺数到农历【${lunar.monthName}】（第${n1}个），落在【${PALACES[gong.monthKey].name}】`,
    `从月上【${PALACES[gong.monthKey].name}】起初一，顺数到【${lunar.dayName}】（第${n2}个），落在【${PALACES[gong.dayKey].name}】`,
    `从日上【${PALACES[gong.dayKey].name}】起子时，顺数到【${SHICHEN_NAMES[scIdx]}时】（第${n3}个），最终落在【${PALACES[gong.timeKey].name}】`
  ];
}

function buildProcessForRandom(n1, n2, n3, gong) {
  return [
    `从【大安】起，顺数第一个数【${n1}】，落在【${PALACES[gong.monthKey].name}】`,
    `从【${PALACES[gong.monthKey].name}】起，顺数第二个数【${n2}】，落在【${PALACES[gong.dayKey].name}】`,
    `从【${PALACES[gong.dayKey].name}】起，顺数第三个数【${n3}】，最终落在【${PALACES[gong.timeKey].name}】`
  ];
}

function divine() {
  let n1;
  let n2;
  let n3;
  let scIdx = -1;
  let processText;

  if (currentMode === 'time') {
    const now = new Date();
    const lunar = solarToLunar(now);
    scIdx = getShiChenIndex(now.getHours());
    n1 = lunar.lunarMonth;
    n2 = lunar.lunarDay;
    n3 = scIdx + 1;
    const gong = calcGong(n1, n2, n3);
    processText = buildProcessForTime(n1, n2, n3, scIdx, gong);
    renderResults(buildReading({ categoryKey: selectedCategory, ...gong, scIdx }), processText);
  } else {
    n1 = parseInt(document.getElementById('num1').value, 10) || 1;
    n2 = parseInt(document.getElementById('num2').value, 10) || 1;
    n3 = parseInt(document.getElementById('num3').value, 10) || 1;
    const gong = calcGong(n1, n2, n3);
    processText = buildProcessForRandom(n1, n2, n3, gong);
    renderResults(buildReading({ categoryKey: selectedCategory, ...gong, scIdx }), processText);
  }
}

function renderCategoryButtons() {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = Object.entries(CATEGORY_NAMES).map(([key, name]) =>
    `<button class="cat-btn ${key === selectedCategory ? 'active' : ''}" data-cat="${key}">${name}</button>`
  ).join('');
  bindCategories();
}

function init() {
  renderCategoryButtons();
  bindTabs();
  updateTimeInfo();
  setInterval(updateTimeInfo, 1000);
  document.getElementById('divineBtn').addEventListener('click', divine);
}

init();