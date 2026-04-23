// ═══════════════════════════════════════════════════
// MODULE: HÁBITOS DIARIO — Registro por día
// ═══════════════════════════════════════════════════
import { DATA, saveData, todayKey } from '../app.js';

const MOOD_OPTIONS = ['', 'Maravillosamente', 'Excelente',  'Bien', 'Regular', 'Bajo'];
const DAYS_TO_SHOW = 14;

function getEntry(dateKey) {
  if (!DATA.habitEntries) DATA.habitEntries = {};
  return DATA.habitEntries[dateKey] || { completed: [], mood: '', notes: '' };
}

function setEntry(dateKey, entry) {
  if (!DATA.habitEntries) DATA.habitEntries = {};
  DATA.habitEntries[dateKey] = entry;
  saveData(DATA);
}

export function renderHabits() {
  const wrap = document.getElementById('habitsTableWrap');
  if (!wrap) return;
  const defs = DATA.habitDefinitions || [];
  if (!defs.length) {
    wrap.innerHTML = '<div class="empty-state"><span class="empty-icon">📌</span>No hay hábitos definidos</div>';
    return;
  }

  const today = todayKey();
  const dates = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  let html = `
    <div class="habits-toolbar">
      <span class="habits-progress-summary" id="habitsProgressSummary"></span>
    </div>
    <div class="habits-table-scroll">
    <table class="habits-table">
      <thead>
        <tr>
          <th class="habits-col-date">Fecha</th>
          ${defs.map(h => `<th class="habits-col-check" title="${escapeHtml(h.name)}">${h.icon}</th>`).join('')}
          <th class="habits-col-total">Total</th>
          <th class="habits-col-mood">Estado de ánimo</th>
          <th class="habits-col-notes">Notas</th>
        </tr>
      </thead>
      <tbody>
  `;

  dates.forEach(dateKey => {
    const entry = getEntry(dateKey);
    const completed = entry.completed || [];
    const total = completed.length;
    const pct = defs.length ? Math.round((total / defs.length) * 100) : 0;
    const isToday = dateKey === today;
    const dateLabel = formatDateLabel(dateKey);
    const rowClass = isToday ? 'habits-row today' : 'habits-row';
    html += `<tr class="${rowClass}" data-date="${dateKey}">`;
    html += `<td class="habits-col-date" data-label="Fecha">${dateLabel}${isToday ? ' <span class="habits-badge-hoy">Hoy</span>' : ''}</td>`;
    defs.forEach(h => {
      const checked = completed.includes(h.id);
      html += `<td class="habits-col-check" data-label="${escapeHtml(h.name)}" title="${escapeHtml(h.name)}"><input type="checkbox" class="habit-check" data-date="${dateKey}" data-habit="${h.id}" ${checked ? 'checked' : ''} title="${escapeHtml(h.name)}"></td>`;
    });
    html += `<td class="habits-col-total" data-label="Total"><div class="habits-total-cell"><span class="habits-total-num">${total}</span><div class="progress-bar habits-total-bar"><div class="progress-fill fill-sage" style="width:${pct}%"></div></div></div></td>`;
    html += `<td class="habits-col-mood" data-label="Estado de ánimo"><select class="habit-mood" data-date="${dateKey}" title="Estado de ánimo">${MOOD_OPTIONS.map(o => `<option value="${o}" ${(entry.mood || '') === o ? 'selected' : ''}>${o || '—'}</option>`).join('')}</select></td>`;
    html += `<td class="habits-col-notes" data-label="Notas"><input type="text" class="habit-notes-input" data-date="${dateKey}" value="${escapeHtml(entry.notes || '')}" placeholder="Notas..."></td>`;
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  wrap.innerHTML = html;

  // Progress summary (últimos 7 días)
  const last7 = dates.slice(0, 7);
  const withData = last7.filter(dk => {
    const e = getEntry(dk);
    return (e.completed && e.completed.length > 0) || e.mood || (e.notes && e.notes.trim());
  }).length;
  const summaryEl = document.getElementById('habitsProgressSummary');
  if (summaryEl) summaryEl.textContent = `Últimos 7 días: ${withData} con registro`;

  // Event delegation
  wrap.querySelectorAll('.habit-check').forEach(cb => {
    cb.addEventListener('change', function() {
      toggleHabit(this.dataset.date, this.dataset.habit);
    });
  });
  wrap.querySelectorAll('.habit-mood').forEach(sel => {
    sel.addEventListener('change', function() {
      saveHabitMood(this.dataset.date, this.value);
    });
  });
  wrap.querySelectorAll('.habit-notes-input').forEach(inp => {
    inp.addEventListener('change', function() {
      saveHabitNotes(this.dataset.date, this.value.trim());
    });
    inp.addEventListener('blur', function() {
      saveHabitNotes(this.dataset.date, this.value.trim());
    });
  });
}

function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function toggleHabit(dateKey, habitId) {
  const entry = getEntry(dateKey);
  const completed = [...(entry.completed || [])];
  const idx = completed.indexOf(habitId);
  if (idx >= 0) completed.splice(idx, 1);
  else completed.push(habitId);
  setEntry(dateKey, { ...entry, completed });
  renderHabits();
}

function saveHabitMood(dateKey, mood) {
  const entry = getEntry(dateKey);
  setEntry(dateKey, { ...entry, mood });
}

function saveHabitNotes(dateKey, notes) {
  const entry = getEntry(dateKey);
  setEntry(dateKey, { ...entry, notes });
}
