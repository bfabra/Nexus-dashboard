// ═══════════════════════════════════════════════════
// MODULE: CURSOS
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

function getEscuela(course) {
  return course.escuela || course.platform || 'Otros';
}

export function renderCourses() {
  const c = document.getElementById('coursesList');
  if (!c) return;
  const courses = DATA.courses || [];
  const byEscuela = {};
  courses.forEach((co, idx) => {
    const esc = getEscuela(co);
    if (!byEscuela[esc]) byEscuela[esc] = [];
    byEscuela[esc].push({ course: co, index: idx });
  });
  const escuelasOrder = [...new Set(courses.map(co => getEscuela(co)))];
  c.innerHTML = '';
  escuelasOrder.forEach(escuela => {
    const items = byEscuela[escuela] || [];
    const section = document.createElement('div');
    section.className = 'course-escuela-section';
    const title = document.createElement('div');
    title.className = 'course-escuela-title';
    title.textContent = escuela;
    section.appendChild(title);
    const listWrap = document.createElement('div');
    listWrap.className = 'course-escuela-list';
    items.forEach(({ course: co, index }) => {
      if (co.isTest) return;
      const div = document.createElement('div');
      div.className = 'course-item';
      div.innerHTML = `
        <div class="course-icon">${co.icon || '📚'}</div>
        <div class="course-info" style="flex:1;">
          <div class="course-name">${escapeHtml(co.name)}</div>
          <div class="course-deadline">${co.deadline ? '📅 ' + co.deadline : ''}</div>
          <div class="progress-wrap" style="margin-top:0.4rem;">
            <div class="progress-bar"><div class="progress-fill fill-violet" style="width:${co.pct}%"></div></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--ink-muted);">${co.pct}%</span>
          <input type="range" min="0" max="100" value="${co.pct}" style="width:80px;accent-color:var(--gold);" data-id="${co.id}" class="course-range">
          <button type="button" class="btn btn-sm btn-ghost course-edit-btn" data-index="${index}" title="Editar curso">✏️</button>
        </div>
      `;
      div.querySelector('.course-range').onchange = (e) => {
        const course = DATA.courses[index];
        if (course) { course.pct = parseInt(e.target.value); saveData(DATA); renderCourses(); }
      };
      div.querySelector('.course-edit-btn').onclick = () => openCourseModal(index);
      listWrap.appendChild(div);
    });
    section.appendChild(listWrap);
    c.appendChild(section);
  });

  const test = DATA.courses.find(c => c.isTest);
  const tc = document.getElementById('testBecaCard');
  if (tc && test) {
    const testIdx = DATA.courses.findIndex(c => c.isTest);
    tc.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <div style="font-size:1.6rem;">${test.icon}</div>
        <div style="flex:1;min-width:140px;">
          <div style="font-weight:700;font-size:0.9rem;">${escapeHtml(test.name)}</div>
          <div style="font-size:0.75rem;color:var(--ink-muted);">${getEscuela(test)} · 📅 ${test.deadline || '—'}</div>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-sm btn-ghost" onclick="window.openCourseModal && openCourseModal(${testIdx})" title="Editar">✏️</button>
          <button class="btn ${test.done ? 'btn-ghost' : 'btn-gold'} btn-sm" id="testBecaBtn">
            ${test.done ? '✅ Completado' : '⚠️ Marcar como hecho'}
          </button>
        </div>
      </div>
    `;
    tc.querySelector('#testBecaBtn').onclick = () => {
      test.done = !test.done;
      saveData(DATA);
      renderCourses();
    };
  }
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function openCourseModal(index) {
  const editInput = document.getElementById('courseEditIndex');
  const titleEl = document.querySelector('#courseModal h3');
  if (!editInput) return;
  editInput.value = String(index);
  if (titleEl) titleEl.textContent = index >= 0 ? '✏️ Editar curso' : '📚 Nuevo curso';
  const course = index >= 0 && DATA.courses[index] ? DATA.courses[index] : null;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
  set('courseIcon', course ? course.icon || '' : '📚');
  set('courseName', course ? course.name || '' : '');
  set('courseEscuela', course ? (course.escuela || course.platform || '') : '');
  set('courseDeadline', course ? (course.deadline || '') : '');
  set('coursePct', course ? String(course.pct || 0) : '0');
  setCheck('courseIsTest', course ? !!course.isTest : false);
  setCheck('courseDone', course ? !!course.done : false);
  const doneWrap = document.getElementById('courseDoneWrap');
  if (doneWrap) doneWrap.style.display = course && course.isTest ? 'block' : 'none';
  const isTestEl = document.getElementById('courseIsTest');
  if (isTestEl) isTestEl.onchange = () => { if (doneWrap) doneWrap.style.display = isTestEl.checked ? 'block' : 'none'; };
  if (typeof window.openModal === 'function') window.openModal('courseModal');
}
window.openCourseModal = openCourseModal;

export function saveCourse() {
  const index = parseInt(document.getElementById('courseEditIndex')?.value, 10);
  const icon = document.getElementById('courseIcon')?.value?.trim() || '📚';
  const name = document.getElementById('courseName')?.value?.trim();
  if (!name) return;
  const escuela = document.getElementById('courseEscuela')?.value?.trim() || 'Otros';
  const deadline = document.getElementById('courseDeadline')?.value?.trim() || '';
  const pct = Math.min(100, Math.max(0, parseInt(document.getElementById('coursePct')?.value, 10) || 0));
  const isTest = document.getElementById('courseIsTest')?.checked || false;
  const done = document.getElementById('courseDone')?.checked || false;
  if (index >= 0 && index < DATA.courses.length) {
    const c = DATA.courses[index];
    c.icon = icon;
    c.name = name;
    c.escuela = escuela;
    c.deadline = deadline;
    c.pct = pct;
    c.isTest = isTest;
    c.done = done;
  } else {
    DATA.courses.push({
      id: Date.now(),
      icon,
      name,
      escuela,
      deadline,
      pct,
      isTest,
      done: isTest ? done : false,
    });
  }
  saveData(DATA);
  if (typeof window.closeModals === 'function') window.closeModals();
  renderCourses();
  if (typeof window.showToast === 'function') window.showToast('✅ Curso guardado');
}
window.saveCourse = saveCourse;
