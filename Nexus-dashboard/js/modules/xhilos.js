// ═══════════════════════════════════════════════════
// MODULE: HILOS X
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function renderXDates() {
  const c = document.getElementById('xDatesList');
  if (!c) return;
  const dates = window.getXDates ? window.getXDates() : [];
  if (!dates.length) { c.innerHTML = ''; return; }
  const byMonth = {};
  dates.forEach(d => {
    const [y, m] = d.key.split('-');
    const monthKey = `${y}-${m}`;
    if (!byMonth[monthKey]) byMonth[monthKey] = [];
    byMonth[monthKey].push(d);
  });
  const monthOrder = Object.keys(byMonth).sort();
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  c.innerHTML = '';
  monthOrder.forEach(monthKey => {
    const [y, m] = monthKey.split('-');
    const monthName = MESES[parseInt(m, 10) - 1];
    const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const section = document.createElement('div');
    section.className = 'x-month-section';
    section.dataset.monthKey = monthKey;
    const expanded = monthKey === currentMonthKey;
    section.classList.toggle('x-month-expanded', expanded);
    const daysContainer = document.createElement('div');
    daysContainer.className = 'x-month-days';
    byMonth[monthKey].forEach(d => {
      const globalIndex = (DATA.xCalendar || []).findIndex(ent => ent.key === d.key);
      const done = DATA.xDates[d.key];
      const dayMonth = `${d.day} ${MESES[parseInt(m, 10) - 1]}`;
      const div = document.createElement('div');
      div.className = 'twitter-date';
      div.innerHTML = `
        <div class="date-num">${d.day}</div>
        <div class="date-info">
          <div class="date-label">${d.label}</div>
          <div class="date-status">${dayMonth}</div>
        </div>
        <span class="badge ${done ? 'badge-sage' : 'badge-gold'}">${done ? '✅ Publicado' : 'Pendiente'}</span>
        <button type="button" class="btn btn-sm btn-ghost x-edit-btn" data-index="${globalIndex}" title="Editar título y temas">✏️</button>
        <div class="status-dot ${done ? 'dot-done' : 'dot-pending'}" data-key="${d.key}" title="${done ? 'Marcar pendiente' : 'Marcar publicado'}"></div>
      `;
      div.querySelector('.status-dot').onclick = (e) => {
        e.stopPropagation();
        const key = e.target.dataset.key;
        DATA.xDates[key] = !DATA.xDates[key];
        saveData(DATA);
        renderXDates();
      };
      div.querySelector('.x-edit-btn').onclick = (e) => {
        e.stopPropagation();
        openXEntryEditModal(globalIndex);
      };
      daysContainer.appendChild(div);
    });
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'x-month-header';
    header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    header.innerHTML = `<span class="x-month-title">${monthNameCap} ${y}</span><span class="x-month-chevron" aria-hidden="true">▼</span>`;
    header.onclick = () => {
      const sec = header.closest('.x-month-section');
      const wasExpanded = sec.classList.contains('x-month-expanded');
      document.querySelectorAll('.x-month-section').forEach(s => s.classList.remove('x-month-expanded'));
      if (!wasExpanded) sec.classList.add('x-month-expanded');
      header.setAttribute('aria-expanded', !wasExpanded ? 'true' : 'false');
    };
    section.appendChild(header);
    section.appendChild(daysContainer);
    c.appendChild(section);
  });
}

export function renderXDrafts() {
  const c = document.getElementById('xDraftsList');
  if (!c) return;
  if (!DATA.xDrafts.length) {
    c.innerHTML = '<div class="empty-state"><span class="empty-icon">✍️</span>Sin borradores aún</div>';
    return;
  }
  c.innerHTML = '';
  DATA.xDrafts.forEach((d, i) => {
    const div = document.createElement('div'); div.className = 'log-entry';
    div.innerHTML = `
      <div class="log-date">${d.targetDate || ''} · Borrador</div>
      <div style="font-weight:600;font-size:0.87rem;margin-bottom:0.3rem;">${d.title}</div>
      <div class="log-text">${d.content}</div>
      <button class="delete-btn" data-idx="${i}">✕</button>
    `;
    div.querySelector('.delete-btn').onclick = () => {
      DATA.xDrafts.splice(i, 1);
      saveData(DATA);
      renderXDrafts();
    };
    c.appendChild(div);
  });
}

export function saveXDraft() {
  const title = document.getElementById('xDraftTitle')?.value.trim();
  const content = document.getElementById('xDraftContent')?.value.trim();
  if (!title || !content) return;
  DATA.xDrafts.push({
    id: Date.now(),
    title,
    content,
    targetDate: document.getElementById('xDraftDate')?.value || ''
  });
  saveData(DATA);
  ['xDraftTitle', 'xDraftContent', 'xDraftDate'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  if (typeof window.closeModals === 'function') window.closeModals();
  renderXDrafts();
}

function openXEntryEditModal(index) {
  if (!DATA.xCalendar || !DATA.xCalendar[index]) return;
  const entry = DATA.xCalendar[index];
  const dateLabel = document.getElementById('xEntryEditDateLabel');
  const indexInput = document.getElementById('xEntryEditIndex');
  const titleInput = document.getElementById('xEntryEditTitle');
  const topicsInput = document.getElementById('xEntryEditTopics');
  if (dateLabel) dateLabel.textContent = entry.key + ' · ' + (entry.day + ' ' + MESES[parseInt(entry.key.split('-')[1], 10) - 1]);
  if (indexInput) indexInput.value = String(index);
  if (titleInput) titleInput.value = entry.label || '';
  if (topicsInput) topicsInput.value = entry.topics || '';
  document.getElementById('xEntryEditModal')?.classList.add('open');
}
window.openXEntryEditModal = openXEntryEditModal;

function saveXEntryEdit() {
  const index = parseInt(document.getElementById('xEntryEditIndex')?.value, 10);
  const title = document.getElementById('xEntryEditTitle')?.value.trim();
  const topics = (document.getElementById('xEntryEditTopics')?.value || '').trim();
  if (isNaN(index) || !DATA.xCalendar || !DATA.xCalendar[index]) return;
  DATA.xCalendar[index].label = title || DATA.xCalendar[index].label;
  DATA.xCalendar[index].topics = topics;
  saveData(DATA);
  if (typeof window.closeModals === 'function') window.closeModals();
  renderXDates();
  if (window.showToast) window.showToast('✅ Publicación actualizada');
}
window.saveXEntryEdit = saveXEntryEdit;
