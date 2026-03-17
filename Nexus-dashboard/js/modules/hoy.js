// ═══════════════════════════════════════════════════
// MODULE: HOY — Vista diaria
// ═══════════════════════════════════════════════════
import { DATA, saveData, todayKey } from '../app.js';

let selectedWeekDay = '';

export function renderHoy() {
  if (!selectedWeekDay) selectedWeekDay = todayKey();
  renderVacation();
  renderWeek();
  renderTodayTasks();
  renderStatCards();
  renderUpcomingDeadlines();
  renderNextX();
}

function renderVacation() {
  const vs = new Date('2026-03-21'), ve = new Date('2026-04-10'), now = new Date();
  const banner = document.getElementById('vacationBanner');
  if (!banner) return;
  if (now > ve) { banner.style.display = 'none'; return; }
  if (now >= vs) {
    banner.querySelector('.vacation-title').textContent = '🌴 ¡Estás de vacaciones!';
    banner.querySelector('.vacation-countdown').textContent = '🎉';
    return;
  }
  const days = Math.ceil((vs - now) / 864e5);
  const el = document.getElementById('vacCountdown');
  if (el) el.textContent = days;
}

function renderWeek() {
  const strip = document.getElementById('weekStrip');
  if (!strip) return;
  const today = todayKey();
  if (!selectedWeekDay) selectedWeekDay = today;
  strip.innerHTML = '';
  const now = new Date(), dow = now.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(now); mon.setDate(now.getDate() + diff);
  const dn = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const wm = { 1: '🏢 Oficina', 2: '🏢 Oficina', 3: '🏠 Casa', 4: '🏠 Casa', 5: '🏢 Oficina', 6: '', 0: '' };
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isT = dateKey === today;
    const isSelected = dateKey === selectedWeekDay;
    const p = document.createElement('div');
    p.className = 'day-pill' + (isT ? ' today' : '') + (isSelected ? ' selected' : '');
    p.dataset.date = dateKey;
    p.innerHTML = `<div class="day-name">${dn[i]}</div><div class="day-num">${d.getDate()}</div><div class="day-type">${wm[d.getDay()] || ''}</div>`;
    p.onclick = () => {
      selectedWeekDay = dateKey;
      renderWeek();
      renderTodayTasks();
      renderWeekDaySummary();
    };
    strip.appendChild(p);
  }
  const wdm = { 1: '🏢 Hoy: Día de Oficina', 2: '🏢 Hoy: Día de Oficina', 3: '🏠 Hoy: Trabajo en Casa', 4: '🏠 Hoy: Trabajo en Casa', 5: '🏢 Hoy: Día de Oficina', 6: '🌅 Fin de semana', 0: '🌅 Fin de semana' };
  const info = document.getElementById('dayWorkInfo');
  if (info) info.textContent = selectedWeekDay === today ? (wdm[now.getDay()] || '') : '';
  renderWeekDaySummary();
}

function renderWeekDaySummary() {
  const el = document.getElementById('weekDaySummary');
  if (!el) return;
  const today = todayKey();
  if (selectedWeekDay === today) {
    el.style.display = 'none';
    return;
  }
  const tasks = (DATA.tasks || []).filter(t => t.date === selectedWeekDay);
  const done = tasks.filter(t => t.done).length;
  const diaryCount = (DATA.diary || []).filter(e => e.date === selectedWeekDay).length;
  const hasX = DATA.xDates && DATA.xDates[selectedWeekDay];
  const hasLog = DATA.dailyLog && DATA.dailyLog[selectedWeekDay];
  const parts = [];
  if (tasks.length) parts.push(`${done}/${tasks.length} tareas`);
  if (diaryCount) parts.push(`${diaryCount} entrada${diaryCount !== 1 ? 's' : ''} diario`);
  if (hasX) parts.push('Hilo X publicado');
  if (hasLog) parts.push('Planner');
  const dateStr = new Date(selectedWeekDay + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  el.innerHTML = `<strong>${dateStr}</strong>${parts.length ? ' · ' + parts.join(' · ') : ' · Sin registros'}`;
  el.style.display = 'block';
}

export function renderStatCards() {
  const activeP = DATA.proyectos.filter(p => p.estado === 'active').length;
  const avgP = DATA.proyectos.length ? Math.round(DATA.proyectos.reduce((a, p) => a + p.pct, 0) / DATA.proyectos.length) : 0;
  setEl('statProjects', `${activeP}<span style="font-size:1rem;color:var(--ink-muted)">/${DATA.proyectos.length}</span>`);
  setStyle('statProjectsBar', `width:${avgP}%`);
  const activC = DATA.courses.filter(c => !c.isTest && c.pct < 100).length;
  const avgC = DATA.courses.filter(c => !c.isTest).length
    ? Math.round(DATA.courses.filter(c => !c.isTest).reduce((a, c) => a + c.pct, 0) / DATA.courses.filter(c => !c.isTest).length) : 0;
  setEl('statCourses', `${activC}<span style="font-size:1rem;color:var(--ink-muted)">/${DATA.courses.filter(c => !c.isTest).length}</span>`);
  setStyle('statCoursesBar', `width:${avgC}%`);
  const done = DATA.pnlDone.length, tot = DATA.pnlTopics.length, pct = Math.round(done / tot * 100);
  setEl('pnlStatVal', `${done}<span style="font-size:1rem;color:var(--ink-muted)">/${tot}</span>`);
  setStyle('pnlStatBar', `width:${pct}%`);
  const booksDone = DATA.books.filter(b => b.done).length;
  setEl('booksRead', booksDone);
  setEl('booksTotalSub', `de ${DATA.booksGoal} libros meta`);
  setStyle('booksProgress', `width:${Math.round(booksDone / DATA.booksGoal * 100)}%`);
}

export function renderTodayTasks() {
  const c = document.getElementById('todayTasks');
  const titleEl = document.getElementById('todayTasksTitle');
  if (!c) return;
  const day = selectedWeekDay || todayKey();
  const isToday = day === todayKey();
  if (titleEl) {
    titleEl.textContent = isToday ? '✅ Tareas de Hoy' : '✅ Tareas del ' + new Date(day + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  }
  const tasks = DATA.tasks.filter(t => t.date === day);
  if (!tasks.length) {
    c.innerHTML = isToday
      ? '<div class="empty-state"><span class="empty-icon">✅</span>Sin tareas para hoy.<br>¡Agrega una!</div>'
      : '<div class="empty-state"><span class="empty-icon">✅</span>Sin tareas ese día.</div>';
    return;
  }
  const cats = { proyecto: 'badge-violet', curso: 'badge-gold', lectura: 'badge-rose', pnl: 'badge-sage', hilo: 'badge-blue', trabajo: 'badge-gold', personal: 'badge-gold' };
  const clab = { proyecto: 'Proyecto', curso: 'Curso', lectura: 'Lectura', pnl: 'PNL', hilo: 'Hilo X', trabajo: 'Trabajo', personal: 'Personal' };
  c.innerHTML = '';
  tasks.forEach(t => {
    const gi = DATA.tasks.indexOf(t);
    const d = document.createElement('div'); d.className = 'task-item';
    d.innerHTML = `<div class="task-check ${t.done ? 'done' : ''}" data-idx="${gi}">${t.done ? '✓' : ''}</div><div class="task-text"><div class="task-name ${t.done ? 'done' : ''}">${t.name}</div><div class="task-meta">${t.prio === 'alta' ? '🔴' : t.prio === 'media' ? '🟡' : '🟢'} ${(t.prio || '').charAt(0).toUpperCase() + (t.prio || '').slice(1)}</div></div><span class="badge ${cats[t.cat] || 'badge-gold'}">${clab[t.cat] || t.cat}</span>`;
    d.querySelector('.task-check').onclick = () => { toggleTask(gi); renderWeekDaySummary(); };
    c.appendChild(d);
  });
}

function toggleTask(i) {
  DATA.tasks[i].done = !DATA.tasks[i].done;
  saveData(DATA);
  renderTodayTasks();
}

export function saveTask() {
  const name = document.getElementById('taskName').value.trim();
  const dateVal = document.getElementById('taskDate').value;
  if (!name) return;
  DATA.tasks.push({
    id: Date.now(),
    name,
    cat: document.getElementById('taskCat').value,
    prio: document.getElementById('taskPrio').value,
    date: dateVal || todayKey(),
    done: false
  });
  saveData(DATA);
  document.getElementById('taskName').value = '';
  closeModals();
  renderTodayTasks();
  renderStatCards();
}

function parseDeadlineDate(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  const meses = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  const match = trimmed.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/i) || trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    if (match[3].length === 4 && match[2].length <= 3) {
      const d = parseInt(match[1], 10), m = meses[match[2].toLowerCase().slice(0, 3)], y = parseInt(match[3], 10);
      if (m !== undefined && !isNaN(d) && !isNaN(y)) return new Date(y, m, d);
    }
    if (match[1].length === 4) return new Date(trimmed);
  }
  return null;
}

function renderUpcomingDeadlines() {
  const c = document.getElementById('upcomingDeadlines');
  if (!c) return;
  const today = todayKey();
  const items = [];
  (DATA.courses || []).forEach(co => {
    if (co.deadline && co.pct < 100 && !co.done) {
      const date = parseDeadlineDate(co.deadline);
      items.push({
        type: 'course',
        icon: co.icon || '📚',
        name: co.name,
        deadline: co.deadline,
        date: date || new Date(9999, 0, 1),
        urgent: !!co.isTest
      });
    }
  });
  const xCalendar = DATA.xCalendar || [];
  const xDates = DATA.xDates || {};
  xCalendar.forEach(ent => {
    if (ent.key >= today && !xDates[ent.key]) {
      items.push({
        type: 'x',
        icon: '✍️',
        name: ent.label || 'Hilo X',
        deadline: ent.key,
        date: new Date(ent.key + 'T12:00:00'),
        urgent: false
      });
    }
  });
  items.sort((a, b) => a.date - b.date);
  if (!items.length) { c.innerHTML = '<div style="font-size:0.82rem;color:var(--ink-muted);">Sin vencimientos próximos 🎉</div>'; return; }
  c.innerHTML = '';
  items.slice(0, 6).forEach(it => {
    const dateLabel = it.type === 'x' ? new Date(it.deadline + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : it.deadline;
    const typeBadge = it.type === 'x' ? '<span class="badge badge-blue">Hilo X</span>' : (it.urgent ? '<span class="badge badge-urgent">Urgente</span>' : '<span class="badge badge-gold">Curso</span>');
    const d = document.createElement('div'); d.className = 'task-item';
    d.innerHTML = `<div style="font-size:1.1rem">${it.icon}</div><div class="task-text"><div class="task-name">${it.name}</div><div class="task-meta">📅 ${dateLabel}</div></div>${typeBadge}`;
    c.appendChild(d);
  });
}

function renderNextX() {
  const c = document.getElementById('nextXDate');
  if (!c) return;
  const xDates = getXDates();
  const today = todayKey();
  const next = xDates.find(d => d.key >= today && !DATA.xDates[d.key]);
  if (!next) { c.innerHTML = '<span style="color:var(--ink-muted);font-size:0.84rem;">Sin hilos pendientes 🎉</span>'; return; }
  const daysLeft = Math.ceil((new Date(next.key) - new Date()) / 864e5);
  const dateStr = new Date(next.key + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' });
  c.innerHTML = `<div style="font-family:var(--font-serif);font-size:1.5rem;font-weight:700;color:var(--gold);">${dateStr}</div><div style="font-size:0.84rem;margin-top:4px;color:var(--ink-light);">${next.label}</div><div style="font-size:0.78rem;color:var(--ink-muted);margin-top:4px;">En ${daysLeft} día${daysLeft !== 1 ? 's' : ''}</div>`;
}

function getXDates() {
  return (DATA.xCalendar && DATA.xCalendar.length) ? DATA.xCalendar : [];
}
window.getXDates = getXDates;

// ── Helpers ──────────────────────────────────────
function setEl(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function setStyle(id, style) { const el = document.getElementById(id); if (el) el.style.cssText = style; }
