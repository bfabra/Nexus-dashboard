// ═══════════════════════════════════════════════════
// MODULE: PROYECTOS
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

const statusLabel = { active: '🟢 En desarrollo', planning: '🟣 Planificación', paused: '🟡 Pausado', done: '✅ Completado' };
const statusClass = { active: 'status-active', planning: 'status-planning', paused: 'status-paused', done: 'status-done' };
const fillByStatus = { active: 'fill-violet', planning: 'fill-blue', paused: 'fill-gold', done: 'fill-sage' };

export function renderProyectos() {
  const c = document.getElementById('proyectosList');
  if (!c) return;
  if (!DATA.proyectos.length) {
    c.innerHTML = '<div class="empty-state"><span class="empty-icon">💻</span>Sin proyectos aún.<br>¡Crea tu primer proyecto!</div>';
    return;
  }
  c.innerHTML = '';
  DATA.proyectos.forEach((p, i) => {
    const div = document.createElement('div'); div.className = 'project-card';
    div.innerHTML = `
      <div class="project-header">
        <div class="project-icon">${p.icon || '💻'}</div>
        <div class="project-meta">
          <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
            <div class="project-name">${p.name}</div>
            <span class="project-status-badge ${statusClass[p.estado] || 'status-active'}">${statusLabel[p.estado] || p.estado}</span>
          </div>
          <div class="project-desc">${p.desc}</div>
          <div class="project-badges">
            ${p.stack ? `<span class="badge badge-blue">🔧 ${p.stack}</span>` : ''}
            ${p.inicio ? `<span class="badge badge-gold">📅 Inicio: ${p.inicio}</span>` : ''}
            ${p.meta ? `<span class="badge badge-sage">🎯 ${p.meta}</span>` : ''}
          </div>
        </div>
        <div class="project-actions-bar">
          <button class="btn-icon" data-id="${p.id}" data-action="log" title="Registrar avance">📝</button>
          <button class="btn-icon" data-idx="${i}" data-action="edit" title="Editar proyecto">✏️</button>
          <button class="btn-icon danger" data-idx="${i}" data-action="delete" title="Eliminar">✕</button>
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Progreso</span><span>${p.pct}%</span></div>
        <div class="progress-bar" style="height:8px;"><div class="progress-fill ${fillByStatus[p.estado] || 'fill-violet'}" style="width:${p.pct}%"></div></div>
      </div>
      ${p.logs && p.logs.length ? `
      <div style="margin-top:0.85rem;">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:0.5rem;">Últimas actualizaciones</div>
        <div style="max-height:200px;overflow-y:auto;">
        ${([].concat(p.logs)).reverse().map((l, revIdx) => {
          const logIdx = p.logs.length - 1 - revIdx;
          return `<div class="project-log-item">
            <div class="project-log-date">${escapeHtml(l.date)}</div>
            <div style="flex:1;color:var(--ink-light);min-width:0;">${escapeHtml(l.text)}</div>
            <button type="button" class="btn btn-sm btn-ghost project-log-edit" data-proj-index="${i}" data-log-index="${logIdx}" title="Editar texto">✏️</button>
          </div>`;
        }).join('')}
        </div>
      </div>` : ''}
    `;
    div.querySelector('[data-action="log"]').onclick = () => openProyectoLog(i);
    div.querySelector('[data-action="edit"]').onclick = () => openProyectoModal(i);
    div.querySelector('[data-action="delete"]').onclick = () => deleteProyecto(i);
    div.querySelectorAll('.project-log-edit').forEach(btn => {
      btn.onclick = () => openEditLog(parseInt(btn.dataset.projIndex, 10), parseInt(btn.dataset.logIndex, 10));
    });
    c.appendChild(div);
  });
}

function setProyectoForm(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val != null ? val : '';
}

export function openProyectoModal(index) {
  const titleEl = document.getElementById('proyectoModalTitle');
  const editInput = document.getElementById('proyectoEditIndex');
  if (editInput) editInput.value = String(index);
  if (titleEl) titleEl.textContent = index >= 0 ? '✏️ Editar proyecto' : '💻 Nuevo Proyecto';
  if (index >= 0 && DATA.proyectos[index]) {
    const p = DATA.proyectos[index];
    setProyectoForm('pNombre', p.name);
    setProyectoForm('pIcono', p.icon);
    setProyectoForm('pDesc', p.desc);
    setProyectoForm('pStack', p.stack);
    setProyectoForm('pInicio', p.inicio);
    setProyectoForm('pMeta', p.meta);
    setProyectoForm('pEstado', p.estado || 'active');
  } else {
    ['pNombre', 'pDesc', 'pIcono', 'pStack', 'pInicio', 'pMeta'].forEach(id => setProyectoForm(id, ''));
    setProyectoForm('pEstado', 'active');
  }
  if (typeof window.openModal === 'function') window.openModal('proyectoModal');
}
window.openProyectoModal = openProyectoModal;

export function saveProyecto() {
  const name = document.getElementById('pNombre').value.trim();
  if (!name) return;
  const index = parseInt(document.getElementById('proyectoEditIndex')?.value, 10);
  const payload = {
    icon: document.getElementById('pIcono')?.value?.trim() || '💻',
    name,
    desc: document.getElementById('pDesc')?.value?.trim() || '',
    stack: document.getElementById('pStack')?.value?.trim() || '',
    inicio: document.getElementById('pInicio')?.value?.trim() || '',
    meta: document.getElementById('pMeta')?.value?.trim() || '',
    estado: document.getElementById('pEstado')?.value || 'active',
  };
  if (index >= 0 && index < DATA.proyectos.length) {
    const p = DATA.proyectos[index];
    p.icon = payload.icon;
    p.name = payload.name;
    p.desc = payload.desc;
    p.stack = payload.stack;
    p.inicio = payload.inicio;
    p.meta = payload.meta;
    p.estado = payload.estado;
  } else {
    DATA.proyectos.push({
      id: Date.now(),
      ...payload,
      pct: 0,
      logs: []
    });
  }
  saveData(DATA);
  ['pNombre', 'pDesc', 'pIcono', 'pStack', 'pInicio', 'pMeta'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  if (typeof window.closeModals === 'function') window.closeModals();
  renderProyectos();
}

function deleteProyecto(idx) {
  if (!confirm(`¿Eliminar "${DATA.proyectos[idx].name}"?`)) return;
  DATA.proyectos.splice(idx, 1);
  saveData(DATA);
  renderProyectos();
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

let proyectoLogIndex = -1;

function openProyectoLog(index) {
  proyectoLogIndex = index;
  const input = document.getElementById('proyectoLogIndex');
  if (input) input.value = String(index);
  const logText = document.getElementById('logText');
  const logPct = document.getElementById('logPct');
  if (logText) logText.value = '';
  const proyectos = DATA.proyectos || [];
  if (logPct && proyectos[index]) logPct.value = String(proyectos[index].pct ?? 0);
  const m = document.getElementById('proyectoLogModal');
  if (m) m.classList.add('open');
}

function openEditLog(projIndex, logIndex) {
  const proj = DATA.proyectos && DATA.proyectos[projIndex];
  const logs = proj && Array.isArray(proj.logs) ? proj.logs : [];
  const entry = logs[logIndex];
  if (!entry) return;
  const inputProj = document.getElementById('editLogProjIndex');
  const inputLog = document.getElementById('editLogLogIndex');
  const dateEl = document.getElementById('editLogDate');
  const textEl = document.getElementById('editLogText');
  if (inputProj) inputProj.value = String(projIndex);
  if (inputLog) inputLog.value = String(logIndex);
  if (dateEl) dateEl.value = entry.date || '';
  if (textEl) textEl.value = entry.text || '';
  document.getElementById('editLogModal').classList.add('open');
}
window.openEditLog = openEditLog;

export function saveEditLog() {
  const projIndex = parseInt(document.getElementById('editLogProjIndex')?.value ?? '', 10);
  const logIndex = parseInt(document.getElementById('editLogLogIndex')?.value ?? '', 10);
  const textEl = document.getElementById('editLogText');
  const newText = textEl ? String(textEl.value || '').trim() : '';
  if (newText === '') return;
  if (Number.isNaN(projIndex) || Number.isNaN(logIndex) || !DATA.proyectos || !DATA.proyectos[projIndex]) return;
  const logs = DATA.proyectos[projIndex].logs;
  if (!Array.isArray(logs) || logIndex < 0 || logIndex >= logs.length) return;
  logs[logIndex].text = newText;
  const dateEl = document.getElementById('editLogDate');
  if (dateEl && dateEl.value) logs[logIndex].date = dateEl.value;
  saveData(DATA);
  if (typeof window.closeModals === 'function') window.closeModals();
  renderProyectos();
  if (typeof window.showToast === 'function') window.showToast('✅ Actualización editada');
}
window.saveEditLog = saveEditLog;

/** Llamar desde app.js en DOMContentLoaded para enlazar el botón Guardar avance */
export function bindProyectoLogButton() {
  const modal = document.getElementById('proyectoLogModal');
  if (!modal) return;
  modal.addEventListener('click', function (e) {
    const btn = e.target.id === 'btnGuardarAvance' ? e.target : e.target.closest('#btnGuardarAvance');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    saveProyectoLog();
  });
}

window.openProyectoLog = openProyectoLog;

function doSaveProyectoLog() {
  if (!DATA.proyectos || !Array.isArray(DATA.proyectos)) return;
  const index = proyectoLogIndex >= 0 && proyectoLogIndex < DATA.proyectos.length
    ? proyectoLogIndex
    : parseInt(document.getElementById('proyectoLogIndex')?.value ?? '', 10);
  if (Number.isNaN(index) || index < 0 || index >= DATA.proyectos.length) {
    return;
  }
  const proj = DATA.proyectos[index];
  if (!proj) return;
  const modal = document.getElementById('proyectoLogModal');
  const textEl = modal ? (modal.querySelector('#logText') || modal.querySelector('textarea')) : document.getElementById('logText');
  const pctEl = modal ? (modal.querySelector('#logPct') || modal.querySelector('input[type="number"]')) : document.getElementById('logPct');
  const rawText = textEl ? (textEl.value != null ? String(textEl.value) : (textEl.textContent || '')) : '';
  const text = rawText.trim();
  if (!text) {
    if (typeof window.showToast === 'function') window.showToast('⚠️ Escribe la descripción del avance');
    return;
  }
  const pct = pctEl ? parseInt(pctEl.value, 10) : (proj.pct ?? 0);
  let logs = proj.logs;
  if (!Array.isArray(logs)) {
    logs = (logs && typeof logs === 'object') ? Object.values(logs) : [];
    proj.logs = logs;
  }
  logs.push({
    date: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    text,
    pct: Number.isNaN(pct) ? (proj.pct ?? 0) : pct
  });
  if (!Number.isNaN(pct)) proj.pct = Math.min(100, Math.max(0, pct));
  saveData(DATA);
  if (textEl) textEl.value = '';
  proyectoLogIndex = -1;
  const indexInput = document.getElementById('proyectoLogIndex');
  if (indexInput) indexInput.value = '';
  if (typeof window.closeModals === 'function') window.closeModals();
  renderProyectos();
  if (typeof window.showToast === 'function') window.showToast('✅ Avance registrado');
}

export function saveProyectoLog() {
  setTimeout(doSaveProyectoLog, 0);
}
