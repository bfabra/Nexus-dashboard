// ═══════════════════════════════════════════════════
// MODULE: DIARIO
// ═══════════════════════════════════════════════════
import { DATA, saveData, todayKey } from '../app.js';

export let selectedMood = '';

const MAX_WORDS = 500;
const MAX_LENGTH = 3100;

function defaultDailyLogEntry() {
  return {
    morningFeel: '',
    morningBodyNeeds: '',
    intermedio: '',
    nightDidForMyself: '',
    nightLearned: '',
  };
}

function toStr(v) {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.filter(Boolean).join(' ') || '';
  return '';
}

function getDailyLog(dateKey) {
  if (!DATA.dailyLog) DATA.dailyLog = {};
  const raw = DATA.dailyLog[dateKey];
  if (!raw) return defaultDailyLogEntry();
  return {
    morningFeel: toStr(raw.morningFeel),
    morningBodyNeeds: toStr(raw.morningBodyNeeds),
    intermedio: toStr(raw.intermedio),
    nightDidForMyself: toStr(raw.nightDidForMyself),
    nightLearned: toStr(raw.nightLearned),
  };
}

function setDailyLog(dateKey, entry) {
  if (!DATA.dailyLog) DATA.dailyLog = {};
  DATA.dailyLog[dateKey] = entry;
  saveData(DATA);
}

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function clampWords(text, max) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, max).join(' ');
}

export function renderDailyLogForm() {
  const wrap = document.getElementById('dailyLogFormWrap');
  const dateInput = document.getElementById('dailyLogDate');
  if (!wrap || !dateInput) return;
  const dateKey = dateInput.value || todayKey();
  if (!dateInput.value) dateInput.value = dateKey;
  const log = getDailyLog(dateKey);

  wrap.innerHTML = `
    <div class="daily-log-block daily-log-morning collapsed" data-block="morning">
      <div class="daily-log-block-header" role="button" tabindex="0">
        <span class="daily-log-block-title">🌅 Mañana</span>
        <span class="daily-log-block-arrow" aria-hidden="true">▼</span>
      </div>
      <div class="daily-log-block-body">
        <p class="daily-log-question">¿Cómo me siento hoy?</p>
        <textarea class="textarea-field daily-log-single" data-field="morningFeel" maxlength="${MAX_LENGTH}" rows="2" placeholder="Máx. 500 palabras">${escapeHtml(log.morningFeel)}</textarea>
        <span class="daily-log-wordcount" data-for="morningFeel">${wordCount(log.morningFeel)}/${MAX_WORDS} palabras</span>
        <p class="daily-log-question">¿Qué necesita mi cuerpo? — Intención del día</p>
        <textarea class="textarea-field daily-log-single" data-field="morningBodyNeeds" maxlength="${MAX_LENGTH}" rows="2" placeholder="Máx. 500 palabras">${escapeHtml(log.morningBodyNeeds)}</textarea>
        <span class="daily-log-wordcount" data-for="morningBodyNeeds">${wordCount(log.morningBodyNeeds)}/${MAX_WORDS} palabras</span>
        <button type="button" class="btn btn-gold btn-sm daily-log-save" data-block="morning">Guardar Mañana</button>
      </div>
    </div>
    <div class="daily-log-block daily-log-intermedio collapsed" data-block="intermedio">
      <div class="daily-log-block-header" role="button" tabindex="0">
        <span class="daily-log-block-title">🌿 Durante el día</span>
        <span class="daily-log-block-arrow" aria-hidden="true">▼</span>
      </div>
      <div class="daily-log-block-body">
        <p class="daily-log-question">Entrada · ¿Cómo te sientes?</p>
        <textarea class="textarea-field daily-log-single" data-field="intermedio" maxlength="${MAX_LENGTH}" rows="2" placeholder="Máx. 500 palabras">${escapeHtml(log.intermedio)}</textarea>
        <span class="daily-log-wordcount" data-for="intermedio">${wordCount(log.intermedio)}/${MAX_WORDS} palabras</span>
        <button type="button" class="btn btn-gold btn-sm daily-log-save" data-block="intermedio">Guardar Durante el día</button>
      </div>
    </div>
    <div class="daily-log-block daily-log-night collapsed" data-block="night">
      <div class="daily-log-block-header" role="button" tabindex="0">
        <span class="daily-log-block-title">🌙 Noche</span>
        <span class="daily-log-block-arrow" aria-hidden="true">▼</span>
      </div>
      <div class="daily-log-block-body">
        <p class="daily-log-question">¿Qué hice hoy por mí?</p>
        <textarea class="textarea-field daily-log-single" data-field="nightDidForMyself" maxlength="${MAX_LENGTH}" rows="2" placeholder="Máx. 500 palabras">${escapeHtml(log.nightDidForMyself)}</textarea>
        <span class="daily-log-wordcount" data-for="nightDidForMyself">${wordCount(log.nightDidForMyself)}/${MAX_WORDS} palabras</span>
        <p class="daily-log-question">¿Qué aprendí? — Agradecimientos</p>
        <textarea class="textarea-field daily-log-single" data-field="nightLearned" maxlength="${MAX_LENGTH}" rows="2" placeholder="Máx. 500 palabras">${escapeHtml(log.nightLearned)}</textarea>
        <span class="daily-log-wordcount" data-for="nightLearned">${wordCount(log.nightLearned)}/${MAX_WORDS} palabras</span>
        <button type="button" class="btn btn-gold btn-sm daily-log-save" data-block="night">Guardar Noche</button>
      </div>
    </div>
  `;

  wrap.querySelectorAll('.daily-log-block-header').forEach(h => {
    h.addEventListener('click', () => {
      const block = h.closest('.daily-log-block');
      block.classList.toggle('collapsed');
      const arrow = block.querySelector('.daily-log-block-arrow');
      if (arrow) arrow.textContent = block.classList.contains('collapsed') ? '▼' : '▲';
    });
    h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.click(); } });
  });

  wrap.querySelectorAll('.daily-log-single').forEach(inp => {
    inp.addEventListener('input', () => {
      const wc = document.querySelector(`.daily-log-wordcount[data-for="${inp.dataset.field}"]`);
      if (wc) wc.textContent = wordCount(inp.value) + '/' + MAX_WORDS + ' palabras';
    });
    inp.addEventListener('blur', () => {
      const val = clampWords(inp.value, MAX_WORDS);
      if (val !== inp.value) inp.value = val;
    });
  });

  wrap.querySelectorAll('.daily-log-save').forEach(btn => {
    btn.addEventListener('click', () => saveDailyLogBlock(btn.dataset.block));
  });

  if (!dateInput._dailyLogBound) {
    dateInput._dailyLogBound = true;
    dateInput.addEventListener('change', () => renderDailyLogForm());
  }
}

function saveDailyLogBlock(blockName) {
  const dateInput = document.getElementById('dailyLogDate');
  const dateKey = dateInput?.value || todayKey();
  const log = getDailyLog(dateKey);
  const wrap = document.getElementById('dailyLogFormWrap');
  if (!wrap) return;
  if (blockName === 'morning') {
    wrap.querySelectorAll('[data-field="morningFeel"], [data-field="morningBodyNeeds"]').forEach(inp => {
      log[inp.dataset.field] = clampWords(inp.value, MAX_WORDS);
    });
  } else if (blockName === 'intermedio') {
    const inp = wrap.querySelector('[data-field="intermedio"]');
    if (inp) log.intermedio = clampWords(inp.value, MAX_WORDS);
  } else if (blockName === 'night') {
    wrap.querySelectorAll('[data-field="nightDidForMyself"], [data-field="nightLearned"]').forEach(inp => {
      log[inp.dataset.field] = clampWords(inp.value, MAX_WORDS);
    });
  }
  setDailyLog(dateKey, log);
  if (typeof window.showToast === 'function') window.showToast('✅ Guardado');
  renderPlannerEmocionalList();
}

export function openPlannerModal() {
  const dateInput = document.getElementById('dailyLogDate');
  if (dateInput && !dateInput.value) dateInput.value = todayKey();
  renderDailyLogForm();
  if (typeof window.openModal === 'function') window.openModal('plannerModal');
}
window.openPlannerModal = openPlannerModal;

export function openDiarioForDate(dateKey) {
  const dateInput = document.getElementById('dailyLogDate');
  if (dateInput) dateInput.value = dateKey;
  if (typeof window.switchTab === 'function') window.switchTab('diario');
  openPlannerModal();
}
window.openDiarioForDate = openDiarioForDate;

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function renderDiary() {
  const c = document.getElementById('diaryList');
  if (!c) return;
  if (!DATA.diary.length) {
    c.innerHTML = '<div class="empty-state"><span class="empty-icon">📓</span>Sin entradas aún.<br>¡Escribe tu primer registro!</div>';
    return;
  }
  c.innerHTML = '';
  [...DATA.diary].reverse().forEach((e, ri) => {
    const i = DATA.diary.length - 1 - ri;
    const d = document.createElement('div'); d.className = 'log-entry';
    d.innerHTML = `
      <div class="log-date">${e.date}${e.mood ? ' · ' + e.mood : ''}</div>
      <div class="log-text">${e.text}</div>
      ${e.tags && e.tags.length ? `<div class="log-tags">${e.tags.map(t => `<span class="badge badge-sage">${t}</span>`).join('')}</div>` : ''}
      <div class="log-entry-actions">
        <button type="button" class="btn btn-sm btn-ghost edit-btn" data-idx="${i}" title="Editar">✏️ Editar</button>
        <button class="delete-btn" data-idx="${i}">✕</button>
      </div>
    `;
    d.querySelector('.delete-btn').onclick = () => deleteDiary(i);
    d.querySelector('.edit-btn').onclick = () => openLogModalForEdit(i);
    c.appendChild(d);
  });
}

export function openLogModalForEdit(idx) {
  const e = DATA.diary[idx];
  if (!e) return;
  selectedMood = e.mood || '';
  const logText = document.getElementById('logText');
  const logTags = document.getElementById('logTags');
  const editInput = document.getElementById('logEditIndex');
  const modalTitle = document.querySelector('#logModal h3');
  if (logText) logText.value = e.text || '';
  if (logTags) logTags.value = (e.tags && e.tags.length) ? e.tags.join(', ') : '';
  if (editInput) editInput.value = String(idx);
  if (modalTitle) modalTitle.textContent = '📓 Editar entrada';
  setMood(selectedMood);
  if (typeof window.openModal === 'function') window.openModal('logModal');
}
window.openLogModalForEdit = openLogModalForEdit;

function resetLogForm() {
  const logText = document.getElementById('logText');
  const logTags = document.getElementById('logTags');
  const editInput = document.getElementById('logEditIndex');
  const modalTitle = document.querySelector('#logModal h3');
  if (logText) logText.value = '';
  if (logTags) logTags.value = '';
  if (editInput) editInput.value = '';
  if (modalTitle) modalTitle.textContent = '📓 Nueva Entrada';
  setMood('');
}

function clearLogModalAndClose() {
  resetLogForm();
  if (typeof window.closeModals === 'function') window.closeModals();
}

export function openLogModal() {
  resetLogForm();
  if (typeof window.openModal === 'function') window.openModal('logModal');
}
window.openLogModal = openLogModal;

export function saveLog() {
  const text = document.getElementById('logText')?.value.trim();
  if (!text) return;
  const tagsRaw = document.getElementById('logTags')?.value || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const editInput = document.getElementById('logEditIndex');
  const editIdx = editInput && editInput.value !== '' ? parseInt(editInput.value, 10) : -1;
  if (editIdx >= 0 && editIdx < DATA.diary.length) {
    DATA.diary[editIdx] = { ...DATA.diary[editIdx], text, mood: selectedMood, tags };
  } else {
    DATA.diary.push({
      id: Date.now(),
      date: todayKey(),
      text,
      mood: selectedMood,
      tags
    });
  }
  saveData(DATA);
  clearLogModalAndClose();
  renderDiary();
}

export function renderPlannerEmocionalList() {
  const c = document.getElementById('plannerEmocionalList');
  if (!c) return;
  if (!DATA.dailyLog || Object.keys(DATA.dailyLog).length === 0) {
    c.innerHTML = '<div class="empty-state"><span class="empty-icon">🧠</span> + Sin registros del planner emocional aún.</div>';
    return;
  }
  const dates = Object.keys(DATA.dailyLog).sort((a, b) => b.localeCompare(a));
  c.innerHTML = '';
  dates.forEach(dateKey => {
    const raw = DATA.dailyLog[dateKey];
    const log = {
      morningFeel: toStr(raw.morningFeel),
      morningBodyNeeds: toStr(raw.morningBodyNeeds),
      intermedio: toStr(raw.intermedio),
      nightDidForMyself: toStr(raw.nightDidForMyself),
      nightLearned: toStr(raw.nightLearned),
    };
    const hasAny = log.morningFeel || log.morningBodyNeeds || log.intermedio || log.nightDidForMyself || log.nightLearned;
    if (!hasAny) return;
    const d = document.createElement('div');
    d.className = 'log-entry planner-entry';
    const dateLabel = new Date(dateKey + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    let body = `<div class="log-date">${dateLabel}</div>`;
    if (log.morningFeel || log.morningBodyNeeds) {
      body += `<div class="planner-section"><strong>🌅 Mañana</strong>`;
      if (log.morningFeel) body += `<div class="log-text">${escapeHtml(log.morningFeel)}</div>`;
      if (log.morningBodyNeeds) body += `<div class="log-text">${escapeHtml(log.morningBodyNeeds)}</div>`;
      body += `</div>`;
    }
    if (log.intermedio) {
      body += `<div class="planner-section"><strong>🌿 Durante el día</strong><div class="log-text">${escapeHtml(log.intermedio)}</div></div>`;
    }
    if (log.nightDidForMyself || log.nightLearned) {
      body += `<div class="planner-section"><strong>🌙 Noche</strong>`;
      if (log.nightDidForMyself) body += `<div class="log-text">${escapeHtml(log.nightDidForMyself)}</div>`;
      if (log.nightLearned) body += `<div class="log-text">${escapeHtml(log.nightLearned)}</div>`;
      body += `</div>`;
    }
    body += `<button type="button" class="btn btn-sm btn-ghost planner-edit-btn" onclick="window.openDiarioForDate && openDiarioForDate('${dateKey}')">✏️ Editar</button>`;
    d.innerHTML = body;
    c.appendChild(d);
  });
}

function deleteDiary(idx) {
  if (!confirm('¿Eliminar esta entrada del diario?')) return;
  DATA.diary.splice(idx, 1);
  saveData(DATA);
  renderDiary();
}

export function setMood(mood) {
  selectedMood = mood;
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.mood === mood);
  });
}
window.setMood = setMood;
