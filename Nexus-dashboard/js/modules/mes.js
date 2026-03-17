// ═══════════════════════════════════════════════════
// MODULE: MES — Vista mensual y calendario
// ═══════════════════════════════════════════════════
import { DATA } from '../app.js';

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

export function renderMonthPanel() {
  renderMonthNav();
  renderMonthStats();
  renderCalendar();
  renderMonthTasks();
  renderMonthDiaryView();
  renderMonthProgress();
}

function renderMonthNav() {
  const title = document.getElementById('monthNavTitle');
  const sub = document.getElementById('monthNavSub');
  const date = new Date(viewYear, viewMonth, 1);
  if (title) title.textContent = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  if (sub) {
    const tasksThisMonth = DATA.tasks.filter(t => t.date && t.date.startsWith(mKey())).length;
    const done = DATA.tasks.filter(t => t.date && t.date.startsWith(mKey()) && t.done).length;
    sub.textContent = `${done}/${tasksThisMonth} tareas completadas`;
  }
}

function mKey() { return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`; }

function renderMonthStats() {
  const c = document.getElementById('monthStatCards');
  if (!c) return;
  const mk = mKey();
  const tasks = DATA.tasks.filter(t => t.date && t.date.startsWith(mk));
  const diaryEntries = DATA.diary.filter(e => e.date.startsWith(mk));
  const xDone = Object.entries(DATA.xDates).filter(([k, v]) => k.startsWith(mk) && v).length;
  const xTotal = (window.getXDates ? window.getXDates() : []).filter(d => d.key.startsWith(mk)).length;
  const pct = tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0;
  c.innerHTML = `
    <div class="stat-card gold">
      <div class="stat-label">Tareas</div>
      <div class="stat-value">${tasks.filter(t => t.done).length}<span style="font-size:1rem;color:var(--ink-muted)">/${tasks.length}</span></div>
      <div class="stat-sub">${pct}% completadas</div>
    </div>
    <div class="stat-card sage">
      <div class="stat-label">Diario</div>
      <div class="stat-value">${diaryEntries.length}</div>
      <div class="stat-sub">entradas este mes</div>
    </div>
    <div class="stat-card rose">
      <div class="stat-label">Hilos X</div>
      <div class="stat-value">${xDone}<span style="font-size:1rem;color:var(--ink-muted)">/${xTotal}</span></div>
      <div class="stat-sub">publicados</div>
    </div>
    <div class="stat-card violet">
      <div class="stat-label">Libros</div>
      <div class="stat-value">${DATA.books.filter(b => b.done).length}<span style="font-size:1rem;color:var(--ink-muted)">/${DATA.booksGoal}</span></div>
      <div class="stat-sub">meta anual</div>
    </div>
  `;
}

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  days.forEach(d => { const h = document.createElement('div'); h.className = 'cal-header'; h.textContent = d; grid.appendChild(h); });
  const first = new Date(viewYear, viewMonth, 1);
  const last = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  for (let i = 0; i < startDow; i++) {
    const prev = new Date(viewYear, viewMonth, 1 - (startDow - i));
    const cell = document.createElement('div'); cell.className = 'cal-cell other-month';
    cell.innerHTML = `<div class="cal-day-num">${prev.getDate()}</div>`;
    grid.appendChild(cell);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const dk = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = (new Date(viewYear, viewMonth, d).getDay() + 6) % 7;
    const hasDiary = DATA.diary.some(e => e.date === dk);
    const hasTasks = DATA.tasks.some(t => t.date === dk);
    const hasX = DATA.xDates[dk];
    const hasDailyLog = hasDailyLogContent(dk);
    const isWeekend = dow >= 5;
    const isToday = dk === todayStr;
    let cls = 'cal-cell';
    if (isToday) cls += ' today';
    else if (isWeekend) cls += ' weekend';
    if (hasDiary || hasTasks || hasX || hasDailyLog) cls += ' has-content';
    const cell = document.createElement('div'); cell.className = cls;
    cell.onclick = () => openDayDetail(dk, d);
    let dots = '';
    if (hasDiary) dots += `<div class="cal-dot cal-dot-diary"></div>`;
    if (hasTasks) dots += `<div class="cal-dot cal-dot-task"></div>`;
    if (hasX) dots += `<div class="cal-dot cal-dot-x"></div>`;
    if (hasDailyLog) dots += `<div class="cal-dot cal-dot-dailylog" title="Registro Mañana/Noche"></div>`;
    const wlab = { 1: '🏢', 2: '🏢', 3: '🏠', 4: '🏠', 5: '🏢' }[dow] || '';
    cell.innerHTML = `<div class="cal-day-num">${d}</div><div class="cal-dots">${dots}</div>${wlab ? `<div class="cal-cell-label">${wlab}</div>` : ''}`;
    grid.appendChild(cell);
  }
  const tail = (startDow + last.getDate()) % 7;
  const fill = tail === 0 ? 0 : 7 - tail;
  for (let i = 1; i <= fill; i++) {
    const cell = document.createElement('div'); cell.className = 'cal-cell other-month';
    cell.innerHTML = `<div class="cal-day-num">${i}</div>`;
    grid.appendChild(cell);
  }
}

function hasDailyLogContent(dateKey) {
  const raw = DATA.dailyLog && DATA.dailyLog[dateKey];
  if (!raw) return false;
  const str = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : '').trim();
  return !!(str(raw.morningFeel) || str(raw.morningBodyNeeds) || str(raw.intermedio) || str(raw.nightDidForMyself) || str(raw.nightLearned));
}

function getDailyLogForDate(dateKey) {
  const raw = DATA.dailyLog && DATA.dailyLog[dateKey];
  if (!raw) return null;
  const str = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? (v.filter(Boolean).join(' ')) : '').trim();
  return {
    morningFeel: str(raw.morningFeel),
    morningBodyNeeds: str(raw.morningBodyNeeds),
    intermedio: str(raw.intermedio),
    nightDidForMyself: str(raw.nightDidForMyself),
    nightLearned: str(raw.nightLearned),
  };
}

function openDayDetail(dk, dayNum) {
  const panel = document.getElementById('dayDetailPanel');
  const titleEl = document.getElementById('dayDetailTitle');
  const content = document.getElementById('dayDetailContent');
  if (!panel) return;
  const dt = new Date(dk + 'T12:00:00');
  titleEl.textContent = dt.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dayDiary = DATA.diary.filter(e => e.date === dk);
  const dayTasks = DATA.tasks.filter(t => t.date === dk);
  const xDone = DATA.xDates[dk];
  const dayLog = getDailyLogForDate(dk);
  let html = '';
  if (dayTasks.length) {
    html += `<div style="margin-bottom:0.85rem;"><div style="font-size:0.73rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:0.4rem;">✅ Tareas</div>`;
    dayTasks.forEach(t => { html += `<div class="month-task-row"><div class="month-task-check ${t.done ? 'done' : ''}"></div><span style="${t.done ? 'text-decoration:line-through;color:var(--ink-muted);' : ''}">${t.name}</span></div>`; });
    html += `</div>`;
  }
  if (dayDiary.length) {
    html += `<div style="margin-bottom:0.85rem;"><div style="font-size:0.73rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:0.4rem;">📓 Diario</div>`;
    dayDiary.forEach(e => { html += `<div style="background:var(--cream);border-radius:8px;padding:0.6rem;margin-bottom:0.4rem;font-size:0.81rem;line-height:1.55;">${e.mood ? `<span style="font-size:0.71rem;margin-bottom:0.3rem;display:block;color:var(--ink-muted);">${e.mood}</span>` : ''}${e.text}</div>`; });
    html += `</div>`;
  }
  if (xDone) {
    const xEntries = window.getXDates ? window.getXDates() : [];
    const entry = xEntries.find(e => e.key === dk);
    const xTitle = entry && entry.label ? entry.label : 'Hilo X publicado';
    const topics = entry && entry.topics ? entry.topics : '';
    html += `<div style="background:var(--rose-light);border-radius:8px;padding:0.6rem;font-size:0.81rem;color:var(--rose);font-weight:600;">✍️ Hilo X publicado</div>`;
    html += `<div style="margin-top:0.35rem;font-size:0.87rem;color:var(--ink);font-weight:600;">${xTitle}</div>`;
    if (topics) html += `<div style="margin-top:0.25rem;font-size:0.78rem;color:var(--ink-muted);line-height:1.4;">${topics}</div>`;
  }
  if (dayLog && (dayLog.morningFeel || dayLog.morningBodyNeeds || dayLog.intermedio || dayLog.nightDidForMyself || dayLog.nightLearned)) {
    html += `<div style="margin-bottom:0.85rem;"><div style="font-size:0.73rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:0.4rem;">🧠 Planner emocional</div>`;
    if (dayLog.morningFeel || dayLog.morningBodyNeeds) {
      html += `<div style="background:var(--gold-pale);border-radius:8px;padding:0.5rem;margin-bottom:0.35rem;font-size:0.8rem;"><strong>🌅 Mañana</strong>${dayLog.morningFeel ? `<div style="margin-top:0.25rem;">${escapeHtmlShort(dayLog.morningFeel)}</div>` : ''}${dayLog.morningBodyNeeds ? `<div style="margin-top:0.25rem;">${escapeHtmlShort(dayLog.morningBodyNeeds)}</div>` : ''}</div>`;
    }
    if (dayLog.intermedio) {
      html += `<div style="background:var(--cream);border-radius:8px;padding:0.5rem;margin-bottom:0.35rem;font-size:0.8rem;"><strong>🌿 Durante el día</strong><div style="margin-top:0.25rem;">${escapeHtmlShort(dayLog.intermedio)}</div></div>`;
    }
    if (dayLog.nightDidForMyself || dayLog.nightLearned) {
      html += `<div style="background:var(--violet-light);border-radius:8px;padding:0.5rem;margin-bottom:0.35rem;font-size:0.8rem;"><strong>🌙 Noche</strong>${dayLog.nightDidForMyself ? `<div style="margin-top:0.25rem;">${escapeHtmlShort(dayLog.nightDidForMyself)}</div>` : ''}${dayLog.nightLearned ? `<div style="margin-top:0.25rem;">${escapeHtmlShort(dayLog.nightLearned)}</div>` : ''}</div>`;
    }
    html += `<button type="button" class="btn btn-sm" style="margin-top:0.35rem;" onclick="window.openDiarioForDate && openDiarioForDate('${dk}'); window.closeDayDetail && closeDayDetail();">Editar registro del día</button>`;
  }
  if (!html) html = `<div class="empty-state" style="padding:1rem;"><span class="empty-icon">📭</span>Sin registros para este día</div>`;
  content.innerHTML = html;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function escapeHtmlShort(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
window.closeDayDetail = () => document.getElementById('dayDetailPanel')?.classList.remove('open');

export function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderMonthPanel();
}
window.changeMonth = changeMonth;

function renderMonthTasks() {
  const mk = mKey();
  const mTasks = DATA.tasks.filter(t => t.date && t.date.startsWith(mk));
  const cats = { proyecto: 'badge-violet', curso: 'badge-gold', lectura: 'badge-rose', pnl: 'badge-sage', hilo: 'badge-blue', trabajo: 'badge-gold', personal: 'badge-gold' };
  const clab = { proyecto: 'Proyecto', curso: 'Curso', lectura: 'Lectura', pnl: 'PNL', hilo: 'Hilo X', trabajo: 'Trabajo', personal: 'Personal' };
  function rl(arr, cid) {
    const c = document.getElementById(cid); if (!c) return;
    if (!arr.length) { c.innerHTML = '<div class="empty-state" style="padding:1rem;"><span class="empty-icon">📭</span>Ninguna</div>'; return; }
    c.innerHTML = '';
    arr.forEach(t => {
      const d = document.createElement('div'); d.className = 'month-task-row';
      d.innerHTML = `<div class="month-task-check ${t.done ? 'done' : ''}"></div><div style="flex:1;"><div style="font-size:0.81rem;${t.done ? 'text-decoration:line-through;color:var(--ink-muted);' : ''}">${t.name}</div><div class="month-task-date">${t.date}</div></div><span class="badge ${cats[t.cat] || 'badge-gold'}">${clab[t.cat] || t.cat}</span>`;
      c.appendChild(d);
    });
  }
  rl(mTasks.filter(t => t.done), 'monthTasksDone');
  rl(mTasks.filter(t => !t.done), 'monthTasksPending');
}

function renderMonthDiaryView() {
  const mk = mKey();
  const entries = DATA.diary.filter(e => e.date.startsWith(mk));
  const c = document.getElementById('monthDiaryEntries');
  if (c) {
    if (!entries.length) { c.innerHTML = '<div class="empty-state"><span class="empty-icon">📓</span>Sin entradas este mes</div>'; }
    else {
      c.innerHTML = '';
      entries.forEach(e => {
        const d = document.createElement('div'); d.className = 'log-entry';
        d.innerHTML = `<div class="log-date">${e.date}${e.mood ? ' · ' + e.mood : ''}</div><div class="log-text">${e.text}</div>${e.tags && e.tags.length ? `<div class="log-tags">${e.tags.map(t => `<span class="badge badge-sage">${t}</span>`).join('')}</div>` : ''}`;
        c.appendChild(d);
      });
    }
  }
  const mc = document.getElementById('monthMoodChart');
  if (mc) {
    const moods = entries.filter(e => e.mood).map(e => e.mood);
    const counts = moods.reduce((a, m) => { a[m] = (a[m] || 0) + 1; return a; }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = sorted[0] ? sorted[0][1] : 1;
    if (!sorted.length) { mc.innerHTML = '<div style="font-size:0.81rem;color:var(--ink-muted);">Sin registros de estado de ánimo</div>'; }
    else {
      mc.innerHTML = '';
      sorted.forEach(([mood, count]) => {
        const d = document.createElement('div'); d.className = 'mood-bar';
        d.innerHTML = `<span class="mood-bar-label">${mood}</span><div class="mood-bar-fill" style="width:${Math.round(count / max * 120)}px;"></div><span class="mood-bar-count">${count}x</span>`;
        mc.appendChild(d);
      });
    }
  }
}

function renderMonthProgress() {
  const statusLabel = { active: '🟢 En desarrollo', planning: '🟣 Planificación', paused: '🟡 Pausado', done: '✅ Completado' };
  const statusClass = { active: 'status-active', planning: 'status-planning', paused: 'status-paused', done: 'status-done' };

  // 💻 Proyectos
  const pp = document.getElementById('monthProyectosProg');
  if (pp) {
    if (!DATA.proyectos || !DATA.proyectos.length) {
      pp.innerHTML = '<div style="font-size:0.81rem;color:var(--ink-muted);">Sin proyectos</div>';
    } else {
      const active = DATA.proyectos.filter(p => p.estado !== 'done');
      const avgPct = DATA.proyectos.length
        ? Math.round(DATA.proyectos.reduce((s, p) => s + (p.pct || 0), 0) / DATA.proyectos.length)
        : 0;
      pp.innerHTML = `<div style="font-size:0.78rem;color:var(--ink-muted);margin-bottom:0.6rem;">${DATA.proyectos.length} proyecto(s) · promedio ${avgPct}%</div>`;
      DATA.proyectos.forEach(p => {
        pp.innerHTML += `<div style="margin-bottom:0.75rem;"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;"><span>${p.icon || '💻'}</span><strong style="font-size:0.83rem;">${escapeHtmlShort(p.name)}</strong><span class="project-status-badge ${statusClass[p.estado] || 'status-active'}" style="font-size:0.65rem;">${statusLabel[p.estado] || p.estado}</span></div><div class="progress-wrap"><div class="progress-bar"><div class="progress-fill fill-violet" style="width:${p.pct}%"></div></div><div style="font-size:0.72rem;color:var(--ink-muted);margin-top:2px;">${p.pct}%</div></div></div>`;
      });
    }
  }

  // 📖 Lectura
  const lp = document.getElementById('monthLecturaProg');
  if (lp) {
    const books = DATA.books || [];
    const goal = DATA.booksGoal || 0;
    const read = books.filter(b => b.done).length;
    const pct = goal ? Math.min(100, Math.round((read / goal) * 100)) : 0;
    lp.innerHTML = `<div class="progress-wrap" style="margin-bottom:0.75rem;"><div class="progress-label"><span>Meta anual</span><span>${read}/${goal} libros</span></div><div class="progress-bar" style="height:10px;"><div class="progress-fill fill-rose" style="width:${pct}%"></div></div></div>`;
    const inProgress = books.filter(b => !b.done && (b.pct || 0) > 0);
    if (inProgress.length) {
      lp.innerHTML += `<div style="font-size:0.73rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-top:0.5rem;margin-bottom:0.35rem;">En lectura</div>`;
      inProgress.forEach(b => {
        lp.innerHTML += `<div style="margin-bottom:0.5rem;"><div style="font-size:0.82rem;font-weight:600;">${b.emoji || '📕'} ${escapeHtmlShort(b.title)}</div><div class="progress-wrap" style="margin-top:0.2rem;"><div class="progress-bar" style="height:6px;"><div class="progress-fill fill-rose" style="width:${b.pct}%"></div></div><span style="font-size:0.72rem;color:var(--ink-muted);">${b.pct}%</span></div></div>`;
      });
    }
    if (!books.length) lp.innerHTML = '<div style="font-size:0.81rem;color:var(--ink-muted);">Sin libros en la lista</div>';
  }

  // 📚 Cursos
  const cp = document.getElementById('monthCursosProg');
  if (cp) {
    const courses = (DATA.courses || []).filter(c => !c.isTest);
    const done = courses.filter(c => c.pct >= 100 || c.done).length;
    const avgPct = courses.length
      ? Math.round(courses.reduce((s, c) => s + (c.pct || 0), 0) / courses.length)
      : 0;
    if (!courses.length) {
      cp.innerHTML = '<div style="font-size:0.81rem;color:var(--ink-muted);">Sin cursos</div>';
    } else {
      cp.innerHTML = `<div style="font-size:0.78rem;color:var(--ink-muted);margin-bottom:0.6rem;">${courses.length} curso(s) · ${done} completado(s) · promedio ${avgPct}%</div>`;
      courses.forEach(c => {
        const name = (c.name || '').slice(0, 35) + (c.name && c.name.length > 35 ? '…' : '');
        cp.innerHTML += `<div style="margin-bottom:0.6rem;"><div style="font-size:0.82rem;font-weight:600;">${c.icon || '📚'} ${escapeHtmlShort(name)}</div><div class="progress-wrap" style="margin-top:0.2rem;"><div class="progress-bar" style="height:6px;"><div class="progress-fill fill-violet" style="width:${c.pct}%"></div></div><span style="font-size:0.72rem;color:var(--ink-muted);">${c.pct}%</span></div></div>`;
      });
    }
  }

  // ✍️ Hilos X
  const hp = document.getElementById('monthHilosProg');
  if (hp) {
    const xCalendar = DATA.xCalendar || [];
    const xDates = DATA.xDates || {};
    const total = xCalendar.length;
    const published = xCalendar.filter(e => xDates[e.key]).length;
    const pct = total ? Math.round((published / total) * 100) : 0;
    hp.innerHTML = `<div class="progress-wrap" style="margin-bottom:0.75rem;"><div class="progress-label"><span>Calendario anual</span><span>${published}/${total} publicados</span></div><div class="progress-bar" style="height:10px;"><div class="progress-fill fill-gold" style="width:${pct}%"></div></div></div>`;
    const mk = mKey();
    const thisMonth = xCalendar.filter(e => e.key.startsWith(mk));
    const thisMonthDone = thisMonth.filter(e => xDates[e.key]).length;
    if (thisMonth.length) {
      hp.innerHTML += `<div style="font-size:0.73rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-top:0.5rem;margin-bottom:0.35rem;">Este mes</div><div style="font-size:0.82rem;">${thisMonthDone}/${thisMonth.length} publicados</div>`;
    }
    if (!total) hp.innerHTML = '<div style="font-size:0.81rem;color:var(--ink-muted);">Sin fechas en el calendario</div>';
  }
}

export function switchMonthTab(id, btn) {
  document.querySelectorAll('[id^="mtab-"]').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.mh-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('mtab-' + id);
  if (tab) tab.style.display = 'block';
  if (btn) btn.classList.add('active');
}
window.switchMonthTab = switchMonthTab;
