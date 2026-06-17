import { formatCurrentTime, getShiChenIndex, SHICHEN_NAMES } from './lunar.js';
import { calcGong } from './core.js';
import { PALACES } from './readings/data.js';
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
      document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
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

function getNumbersFromMode() {
  let n1, n2, n3, processText, shichenIndex = -1;
  if (currentMode === 'time') {
    const now = new Date();
    const info = formatCurrentTime(now);
    const lunar = info.lunarData;
    shichenIndex = getShiChenIndex(now.getHours());
    n1 = lunar.lunarMonth;
    n2 = lunar.lunarDay;
    n3 = shichenIndex + 1;
    const result = calcGong(n1, n2, n3);
    processText = [
      `从【大安】起正月，顺数到农历【${lunar.monthName}】（第${n1}个），落在【${PALACES[result.monthKey].name}】`,
      `从月上【${PALACES[result.monthKey].name}】起初一，顺数到【${lunar.dayName}】（第${n2}个），落在【${PALACES[result.dayKey].name}】`,
      `从日上【${PALACES[result.dayKey].name}】起子时，顺数到【${SHICHEN_NAMES[shichenIndex]}时】（第${n3}个），最终落在【${PALACES[result.timeKey].name}】`
    ];
  } else {
    n1 = Math.max(1, parseInt(document.getElementById('num1').value, 10) || 1);
    n2 = Math.max(1, parseInt(document.getElementById('num2').value, 10) || 1);
    n3 = Math.max(1, parseInt(document.getElementById('num3').value, 10) || 1);
    const result = calcGong(n1, n2, n3);
    processText = [
      `从【大安】起，顺数第一个数【${n1}】，落在【${PALACES[result.monthKey].name}】`,
      `从【${PALACES[result.monthKey].name}】起，顺数第二个数【${n2}】，落在【${PALACES[result.dayKey].name}】`,
      `从【${PALACES[result.dayKey].name}】起，顺数第三个数【${n3}】，最终落在【${PALACES[result.timeKey].name}】`
    ];
  }
  return { n1, n2, n3, processText, shichenIndex };
}

function divine() {
  const { n1, n2, n3, processText, shichenIndex } = getNumbersFromMode();
  const result = calcGong(n1, n2, n3);
  const reading = buildReading({
    categoryKey: selectedCategory,
    monthKey: result.monthKey,
    dayKey: result.dayKey,
    timeKey: result.timeKey,
    scIdx: shichenIndex
  });
  renderResults(reading, processText);
}

window.divine = divine;
bindTabs();
bindCategories();
updateTimeInfo();
setInterval(updateTimeInfo, 1000);