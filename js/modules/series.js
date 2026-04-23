// ═══════════════════════════════════════════════════
// MODULE: SERIES / PELÍCULAS — Watchlist
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

const TYPES = [
  { id: 'series', label: 'Series' },
  { id: 'peliculas', label: 'Películas' },
  { id: 'gl', label: 'GL' },
  { id: 'kdramas', label: 'Kdramas' },
  { id: 'cdramas', label: 'CDramas' },
];

const SOURCES = [
  { id: 'netflix', label: 'Netflix', icon: '🎬' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'otra', label: 'Otra', icon: '🔎' },
];

let filterType = 'all';
let filterStatus = 'all'; // all | no_iniciada | en_proceso | visto

function ensureMedia() {
  if (!Array.isArray(DATA.media)) DATA.media = [];
}

function typeLabel(id) {
  const t = TYPES.find(x => x.id === id);
  return t ? t.label : id;
}

function statusBadge(status) {
  if (status === 'visto') return { cls: 'badge-sage', text: '✅ Visto' };
  if (status === 'no_iniciada') return { cls: 'badge-ink', text: '⏺ No iniciada' };
  return { cls: 'badge-gold', text: '⏳ En proceso' };
}

function sourceLabel(id) {
  const s = SOURCES.find(x => x.id === id);
  return s ? s.label : (id || '—');
}

export function renderMedia() {
  ensureMedia();
  const list = document.getElementById('mediaList');
  if (!list) return;

  const typeSel = document.getElementById('mediaFilterType');
  const statusSel = document.getElementById('mediaFilterStatus');
  if (typeSel) filterType = typeSel.value || 'all';
  if (statusSel) filterStatus = statusSel.value || 'all';

  const items = (DATA.media || []).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const filtered = items.filter(it => {
    if (filterType !== 'all' && it.type !== filterType) return false;
    if (filterStatus !== 'all' && it.status !== filterStatus) return false;
    return true;
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><span class="empty-icon">🎬</span>Sin items aún.<br>Agrega tu primera serie/película.</div>';
    return;
  }

  list.innerHTML = '';
  // Agrupar por tipo para secciones
  const byType = new Map();
  filtered.forEach(it => {
    const key = it.type || 'series';
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key).push(it);
  });

  const typeOrder = filterType !== 'all'
    ? [filterType]
    : TYPES.map(t => t.id).filter(id => byType.has(id));

  typeOrder.forEach(tid => {
    const itemsOfType = byType.get(tid);
    if (!itemsOfType || !itemsOfType.length) return;

    const header = document.createElement('div');
    header.className = 'media-type-header';
    header.textContent = typeLabel(tid);
    list.appendChild(header);

    const group = document.createElement('div');
    group.className = 'media-type-group';
    list.appendChild(group);

    itemsOfType.forEach(it => {
      const row = document.createElement('div');
      row.className = 'media-item';
      const badge = statusBadge(it.status);
      const src = sourceLabel(it.source);
      row.innerHTML = `
        <div class="media-icon">${it.icon || '🎬'}</div>
        <div class="media-info">
          <div class="media-title">${escapeHtml(it.title || '')}</div>
          <div class="media-meta">${typeLabel(it.type)} · <span class="media-source">${escapeHtml(src)}</span>${it.notes ? ' · ' + escapeHtml(it.notes) : ''}</div>
        </div>
        <div class="media-actions">
          <span class="badge ${badge.cls}">${badge.text}</span>
          <button type="button" class="btn btn-sm btn-ghost" data-action="toggle" data-id="${it.id}" title="Cambiar estado">↺</button>
          <button type="button" class="btn btn-sm btn-ghost" data-action="edit" data-id="${it.id}" title="Editar">✏️</button>
          <button type="button" class="btn btn-sm btn-ghost" data-action="del" data-id="${it.id}" title="Eliminar">✕</button>
        </div>
      `;
      group.appendChild(row);
    });
  });

  list.querySelectorAll('[data-action="toggle"]').forEach(btn => {
    btn.onclick = () => toggleMediaStatus(btn.dataset.id);
  });
  list.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.onclick = () => openMediaModal(btn.dataset.id);
  });
  list.querySelectorAll('[data-action="del"]').forEach(btn => {
    btn.onclick = () => deleteMedia(btn.dataset.id);
  });
}

function openMediaModal(idOrNull) {
  ensureMedia();
  const id = idOrNull ? String(idOrNull) : '';
  const idx = id ? DATA.media.findIndex(m => String(m.id) === id) : -1;
  const isEdit = idx >= 0;
  const item = isEdit ? DATA.media[idx] : null;

  const modal = document.getElementById('mediaModal');
  if (!modal) return;

  const editId = document.getElementById('mediaEditId');
  const icon = document.getElementById('mediaIcon');
  const title = document.getElementById('mediaTitle');
  const type = document.getElementById('mediaType');
  const status = document.getElementById('mediaStatus');
  const source = document.getElementById('mediaSource');
  const notes = document.getElementById('mediaNotes');

  if (editId) editId.value = isEdit ? String(item.id) : '';
  if (icon) icon.value = isEdit ? (item.icon || '') : '';
  if (title) title.value = isEdit ? (item.title || '') : '';
  if (type) type.value = isEdit ? (item.type || 'series') : '';
  if (status) status.value = isEdit ? (item.status || 'no_iniciada') : '';
  if (source) source.value = isEdit ? (item.source || 'netflix') : '';
  if (notes) notes.value = isEdit ? (item.notes || '') : '';

  modal.classList.add('open');
}

function saveMediaFromModal() {
  ensureMedia();
  const id = document.getElementById('mediaEditId')?.value || '';
  const icon = (document.getElementById('mediaIcon')?.value || '').trim();
  const title = (document.getElementById('mediaTitle')?.value || '').trim();
  const type = document.getElementById('mediaType')?.value || '';
  const rawStatus = document.getElementById('mediaStatus')?.value || '';
  const status = rawStatus || 'no_iniciada';
  const source = document.getElementById('mediaSource')?.value || '';
  const notes = (document.getElementById('mediaNotes')?.value || '').trim();

  if (!title) {
    if (window.showToast) window.showToast('⚠️ Escribe el título');
    return;
  }
  if (!type) {
    if (window.showToast) window.showToast('⚠️ Selecciona el tipo');
    return;
  }
  if (!source) {
    if (window.showToast) window.showToast('⚠️ Selecciona el origen');
    return;
  }

  const now = Date.now();
  if (id) {
    const idx = DATA.media.findIndex(m => String(m.id) === String(id));
    if (idx >= 0) {
      DATA.media[idx] = { ...DATA.media[idx], icon, title, type, status, source, notes, updatedAt: now };
    }
  } else {
    DATA.media.push({ id: now, icon, title, type, status, source, notes, createdAt: now, updatedAt: now });
  }

  saveData(DATA);
  if (window.closeModals) window.closeModals();
  renderMedia();
  if (window.updateDataStats) window.updateDataStats();
  if (window.showToast) window.showToast('✅ Guardado');
}

function toggleMediaStatus(id) {
  ensureMedia();
  const idx = DATA.media.findIndex(m => String(m.id) === String(id));
  if (idx < 0) return;
  DATA.media[idx].status = DATA.media[idx].status === 'visto' ? 'en_proceso' : 'visto';
  DATA.media[idx].updatedAt = Date.now();
  saveData(DATA);
  renderMedia();
}

function deleteMedia(id) {
  ensureMedia();
  const idx = DATA.media.findIndex(m => String(m.id) === String(id));
  if (idx < 0) return;
  if (!confirm('¿Eliminar este item?')) return;
  DATA.media.splice(idx, 1);
  saveData(DATA);
  renderMedia();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Exponer actions globales (modales)
window.openMediaModal = () => openMediaModal('');
window.saveMedia = () => saveMediaFromModal();
