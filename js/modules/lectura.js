// ═══════════════════════════════════════════════════
// MODULE: LECTURA
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function dateMatchesFilter(dateStr, year, month) {
  if (!dateStr || !year) return false;
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  if (y !== year) return false;
  if (month && month >= 1 && month <= 12) return m === month;
  return true;
}

function getFilteredBooks() {
  const filterBy = document.getElementById('bookFilterBy')?.value || 'todos';
  const filterYear = parseInt(document.getElementById('bookFilterYear')?.value, 10);
  const filterMonth = parseInt(document.getElementById('bookFilterMonth')?.value, 10);
  let list = DATA.books || [];
  if (filterBy === 'todos' || !filterYear) return list.map((b, i) => ({ book: b, index: i }));
  if (filterBy === 'iniciados') {
    list = list.filter(b => b.dateStarted && dateMatchesFilter(b.dateStarted, filterYear, filterMonth));
  } else if (filterBy === 'finalizados') {
    list = list.filter(b => b.dateFinished && dateMatchesFilter(b.dateFinished, filterYear, filterMonth));
  }
  return list.map(b => ({ book: b, index: DATA.books.indexOf(b) })).filter(x => x.index >= 0);
}

function ensureBookFilterYears() {
  const sel = document.getElementById('bookFilterYear');
  if (!sel || sel.options.length > 1) return;
  const y = new Date().getFullYear();
  for (let i = y - 2; i <= y + 2; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    sel.appendChild(opt);
  }
}

export function renderBookList() {
  ensureBookFilterYears();
  const c = document.getElementById('bookList');
  if (!c) return;
  const items = getFilteredBooks();
  c.innerHTML = '';
  items.forEach(({ book: b, index: i }) => {
    const div = document.createElement('div');
    div.className = 'book-item';
    const startLabel = b.dateStarted ? formatDateShort(b.dateStarted) : '';
    const endLabel = b.dateFinished ? formatDateShort(b.dateFinished) : '';
    div.innerHTML = `
      <div class="book-emoji" style="cursor:pointer;" data-idx="${i}">${b.emoji || '📕'}</div>
      <div style="flex:1;">
        <div class="book-title">${escapeHtml(b.title)}</div>
        ${b.author ? `<div class="book-author">${escapeHtml(b.author)}</div>` : ''}
        ${startLabel || endLabel ? `<div class="book-dates" style="font-size:0.7rem;color:var(--ink-muted);margin-top:0.25rem;">${startLabel ? 'Inicio: ' + startLabel : ''}${startLabel && endLabel ? ' · ' : ''}${endLabel ? 'Fin: ' + endLabel : ''}</div>` : ''}
        ${!b.done && b.pct > 0 ? `
        <div class="progress-wrap" style="margin-top:0.3rem;">
          <div class="progress-bar"><div class="progress-fill fill-rose" style="width:${b.pct}%"></div></div>
        </div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        ${b.done ? '<span class="badge badge-sage">✓ Leído</span>' : `<span class="badge badge-rose">${b.pct}%</span>`}
        <input type="range" min="0" max="100" value="${b.pct}" style="width:70px;accent-color:var(--rose);" data-idx="${i}" class="book-range">
        <button type="button" class="btn btn-sm btn-ghost book-edit-btn" data-idx="${i}" title="Editar libro">✏️</button>
      </div>
    `;
    div.querySelector('.book-range').onchange = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      DATA.books[idx].pct = parseInt(e.target.value);
      DATA.books[idx].done = DATA.books[idx].pct >= 100;
      if (DATA.books[idx].done) DATA.books[idx].emoji = '✅';
      saveData(DATA);
      renderBookList();
      renderBookStats();
      renderCurrentBook();
    };
    div.querySelector('.book-emoji').onclick = () => {
      DATA.books[i].done = !DATA.books[i].done;
      DATA.books[i].pct = DATA.books[i].done ? 100 : DATA.books[i].pct;
      DATA.books[i].emoji = DATA.books[i].done ? '✅' : '📕';
      saveData(DATA);
      renderBookList();
      renderBookStats();
      renderCurrentBook();
    };
    div.querySelector('.book-edit-btn').onclick = () => openBookModal(i);
    c.appendChild(div);
  });
  if (!items.length) c.innerHTML = '<div class="empty-state"><span class="empty-icon">📖</span>Ningún libro coincide con el filtro</div>';
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
}

export function openBookModal(index) {
  const editInput = document.getElementById('bookEditIndex');
  const titleEl = document.querySelector('#bookModal h3');
  if (!editInput) return;
  editInput.value = String(index);
  if (titleEl) titleEl.textContent = index >= 0 ? '✏️ Editar libro' : '📖 Nuevo libro';
  const book = index >= 0 && DATA.books[index] ? DATA.books[index] : null;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('bookEmoji', book ? book.emoji || '' : '📕');
  set('bookTitle', book ? book.title || '' : '');
  set('bookAuthor', book ? book.author || '' : '');
  set('bookDateStarted', book && book.dateStarted ? book.dateStarted : '');
  set('bookDateFinished', book && book.dateFinished ? book.dateFinished : '');
  set('bookPct', book ? String(book.pct || 0) : '0');
  const doneEl = document.getElementById('bookDone');
  if (doneEl) doneEl.checked = book ? !!book.done : false;
  if (typeof window.openModal === 'function') window.openModal('bookModal');
}
window.openBookModal = openBookModal;

export function saveBook() {
  const index = parseInt(document.getElementById('bookEditIndex')?.value, 10);
  const emoji = document.getElementById('bookEmoji')?.value?.trim() || '📕';
  const title = document.getElementById('bookTitle')?.value?.trim();
  if (!title) return;
  const author = document.getElementById('bookAuthor')?.value?.trim() || '';
  const dateStarted = document.getElementById('bookDateStarted')?.value?.trim() || '';
  const dateFinished = document.getElementById('bookDateFinished')?.value?.trim() || '';
  const pct = Math.min(100, Math.max(0, parseInt(document.getElementById('bookPct')?.value, 10) || 0));
  const done = document.getElementById('bookDone')?.checked || false;
  if (index >= 0 && index < DATA.books.length) {
    const b = DATA.books[index];
    b.emoji = emoji;
    b.title = title;
    b.author = author;
    b.dateStarted = dateStarted;
    b.dateFinished = dateFinished;
    b.pct = pct;
    b.done = done;
    if (done) b.emoji = '✅';
  } else {
    DATA.books.push({
      id: Date.now(),
      emoji: done ? '✅' : emoji,
      title,
      author,
      dateStarted,
      dateFinished,
      pct,
      done,
    });
  }
  saveData(DATA);
  if (typeof window.closeModals === 'function') window.closeModals();
  renderBookList();
  renderBookStats();
  renderCurrentBook();
  if (typeof window.showToast === 'function') window.showToast('✅ Libro guardado');
}
window.saveBook = saveBook;

export function renderBookStats() {
  const done = DATA.books.filter(b => b.done).length;
  const goal = DATA.booksGoal || 8;
  const pct = Math.round(done / goal * 100);
  const el = document.getElementById('booksRead'); if (el) el.textContent = done;
  const sub = document.getElementById('booksTotalSub'); if (sub) sub.textContent = `de ${goal} libros meta`;
  const bar = document.getElementById('booksProgress'); if (bar) bar.style.width = pct + '%';
}

export function renderCurrentBook() {
  const c = document.getElementById('currentBookCard');
  if (!c) return;
  const current = DATA.books.find(b => !b.done && b.pct > 0) || DATA.books.find(b => !b.done);
  if (!current) { c.innerHTML = '<div style="font-size:0.84rem;color:var(--ink-muted);">¡Meta de lectura completada! 🎉</div>'; return; }
  c.innerHTML = `
    <div style="display:flex;gap:0.75rem;align-items:flex-start;">
      <div style="font-size:2rem;">${current.emoji || '📕'}</div>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:0.9rem;">${escapeHtml(current.title)}</div>
        ${current.author ? `<div style="font-size:0.75rem;color:var(--ink-muted);">${escapeHtml(current.author)}</div>` : ''}
        <div class="progress-wrap" style="margin-top:0.5rem;">
          <div class="progress-label"><span>Progreso</span><span>${current.pct}%</span></div>
          <div class="progress-bar" style="height:8px;"><div class="progress-fill fill-rose" style="width:${current.pct}%"></div></div>
        </div>
      </div>
    </div>
  `;
}

window.renderBookList = renderBookList;
