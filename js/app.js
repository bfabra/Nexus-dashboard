// ═══════════════════════════════════════════════════
// APP.JS — Entry point, router, estado compartido
// ═══════════════════════════════════════════════════

import { loadData, saveData as _saveData } from './store.js';
import { exportData, importData, copyDataToClipboard, resetAllData, showToast } from './sync.js';
import { renderHoy, renderTodayTasks, renderStatCards, saveTask } from './modules/hoy.js';
import { renderProyectos, saveProyecto, saveProyectoLog, saveEditLog, bindProyectoLogButton } from './modules/proyectos.js';
import { renderDiary, renderPlannerEmocionalList, saveLog } from './modules/diario.js';
import { renderPnlGrid } from './modules/pnl.js';
import { renderCourses } from './modules/cursos.js';
import { renderBookList, renderBookStats, renderCurrentBook } from './modules/lectura.js';
import { renderXDates, renderXDrafts, saveXDraft } from './modules/xhilos.js';
import { renderMonthPanel, changeMonth } from './modules/mes.js';
import { renderHabits } from './modules/habits.js';
import { renderMedia } from './modules/series.js';

window.renderMedia = renderMedia;

// ── Estado global compartido ─────────────────────
export let DATA = loadData();
export function saveData(d) { _saveData(d); }
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Registro de Service Worker ───────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}

// ── PWA Install prompt ───────────────────────────
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'flex';
  if (typeof window.updateInstallUI === 'function') window.updateInstallUI();
});
window.installPWA = async () => {
  if (!deferredPrompt) {
    const el = document.getElementById('installInstructions');
    if (el) el.style.display = 'block';
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installBanner').style.display = 'none';
    showToast('✅ App instalada correctamente');
  }
  deferredPrompt = null;
  if (typeof window.updateInstallUI === 'function') window.updateInstallUI();
};
window.dismissInstall = () => {
  document.getElementById('installBanner').style.display = 'none';
};

function isPWAStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.includes('android-app://');
}
function updateInstallUI() {
  const wrap = document.getElementById('installPWAWrap');
  if (!wrap) return;
  if (isPWAStandalone()) {
    wrap.innerHTML = '<p style="font-size:var(--text-sm);color:var(--sage);margin:0;"><strong>✅ Ya está instalada.</strong> Estás usando Mi Espacio como app.</p>';
    return;
  }
  const canPrompt = !!deferredPrompt;
  wrap.innerHTML = `
    <p style="font-size:var(--text-sm);color:var(--ink-muted);margin-bottom:var(--space-4);line-height:1.6;">
      ${canPrompt ? 'Tu navegador permite instalar la app. Haz clic en el botón para añadirla a la pantalla de inicio.' : 'En este dispositivo (p. ej. celular o Safari) la instalación se hace desde el menú del navegador. Sigue las instrucciones según tu sistema.'}
    </p>
    <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-3);">
      <button class="btn btn-primary" onclick="installPWA()">${canPrompt ? '📱 Instalar en este dispositivo' : '📱 Ver instrucciones'}</button>
    </div>
    <div id="installInstructions" style="display:${canPrompt ? 'none' : 'block'};padding:var(--space-3);background:var(--cream);border-radius:var(--radius);font-size:var(--text-xs);color:var(--ink-muted);line-height:1.8;">
      <strong style="color:var(--ink);">Instalar en el celular / tablet</strong><br><br>
      <strong>Android (Chrome):</strong> Menú ⋮ (arriba derecha) → "Instalar aplicación" o "Añadir a pantalla de inicio".<br><br>
      <strong>iPhone / iPad (Safari):</strong> Botón Compartir <span style="font-size:1.1em;">⎋</span> abajo → "Añadir a pantalla de inicio" → Añadir.<br><br>
      <strong>PC (Chrome/Edge):</strong> Ícono ⊕ o "Instalar" en la barra de direcciones.
      <p style="margin-top:var(--space-2);margin-bottom:0;font-size:0.7rem;opacity:0.9;">Para que aparezca "Instalar", la página debe abrirse por <strong>HTTPS</strong> (no por archivo local). Prueba con <code>npx serve .</code> en la misma red o sube el proyecto a un hosting.</p>
    </div>
  `;
}
window.updateInstallUI = updateInstallUI;

// ── Auth / Login simple ────────────────────────────
const AUTH_SESSION_KEY = 'mep_auth_session_v1';

function getSettings() {
  if (!DATA.settings || typeof DATA.settings !== 'object') {
    DATA.settings = { authEnabled: false, authUser: '', authHash: '', authHint: '', rememberSession: false };
  }
  return DATA.settings;
}

function simpleHash(str) {
  try {
    return btoa(unescape(encodeURIComponent(String(str)))).split('').reverse().join('');
  } catch (e) {
    return String(str);
  }
}

function isAuthEnabled() {
  const s = getSettings();
  return !!s.authEnabled && !!s.authHash && !!s.authUser;
}

function updateAuthStatusText() {
  const el = document.getElementById('authStatusText');
  if (!el) return;
  const s = getSettings();
  if (s.authEnabled && s.authHash && s.authUser) {
    const extra = s.rememberSession ? ' Sesión se puede mantener hasta 12 horas.' : ' Se pedirá al abrir o refrescar la app.';
    el.textContent = `Estado: protegido. Usuario "${s.authUser}" con clave.${extra}`;
  } else {
    el.textContent = 'Estado: sin clave. Cualquiera que abra esta URL en este dispositivo verá tu tablero.';
  }
}

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setSession(user) {
  const now = Date.now();
  const ttlMs = 12 * 60 * 60 * 1000; // 12 horas
  const payload = { user, until: now + ttlMs };
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore
  }
}

function clearSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    // ignore
  }
}

function isSessionValid() {
  const s = getSettings();
  if (!s.rememberSession) return false;
  const sess = getSession();
  if (!sess || !sess.user || !sess.until) return false;
  if (sess.user !== s.authUser) return false;
  return Date.now() < sess.until;
}

window.saveAuthSettings = function saveAuthSettings() {
  const user = (document.getElementById('authUser')?.value || '').trim();
  const pass1 = document.getElementById('authNewPassword')?.value || '';
  const pass2 = document.getElementById('authNewPassword2')?.value || '';
  const hint = (document.getElementById('authHint')?.value || '').trim();
  const remember = !!document.getElementById('authRemember')?.checked;
  if (!user) {
    if (window.showToast) showToast('⚠️ Escribe un usuario');
    return;
  }
  if (!pass1 || !pass2) {
    if (window.showToast) showToast('⚠️ Escribe y repite el PIN');
    return;
  }
  if (pass1 !== pass2) {
    if (window.showToast) showToast('⚠️ Los PIN no coinciden');
    return;
  }
  if (!/^\d{4}$/.test(pass1)) {
    if (window.showToast) showToast('⚠️ El PIN debe tener exactamente 4 dígitos numéricos');
    return;
  }
  const s = getSettings();
  s.authEnabled = true;
  s.authUser = user;
  s.authHash = simpleHash(pass1);
  s.authHint = hint;
  s.rememberSession = remember;
  saveData(DATA);
  updateAuthStatusText();
  if (window.showToast) showToast('✅ Clave guardada');
};

window.disableAuth = function disableAuth() {
  const s = getSettings();
  s.authEnabled = false;
  s.authUser = '';
  s.authHash = '';
  s.authHint = '';
  s.rememberSession = false;
  saveData(DATA);
  clearSession();
  updateAuthStatusText();
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
  if (window.showToast) showToast('🔓 Clave desactivada');
};

function showAuthOverlayIfNeeded() {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  const hintEl = document.getElementById('authHintText');
  const s = getSettings();
  if (isAuthEnabled()) {
    if (isSessionValid()) {
      overlay.style.display = 'none';
      if (hintEl) hintEl.textContent = '';
      return;
    }
    overlay.style.display = 'flex';
    if (hintEl) {
      hintEl.textContent = s.authHint ? `Pista: ${s.authHint}` : '';
    }
  } else {
    overlay.style.display = 'none';
    if (hintEl) hintEl.textContent = '';
  }
}

window.lockNow = function lockNow() {
  if (!isAuthEnabled()) {
    if (window.showToast) showToast('⚠️ Primero configura usuario y clave en Ajustes');
    return;
  }
  const overlay = document.getElementById('authOverlay');
  const hintEl = document.getElementById('authHintText');
  const s = getSettings();
  clearSession();
  if (overlay) overlay.style.display = 'flex';
  if (hintEl) hintEl.textContent = s.authHint ? `Pista: ${s.authHint}` : '';
  const userInput = document.getElementById('authLoginUser');
  const passInput = document.getElementById('authPasswordInput');
  if (userInput) userInput.value = '';
  if (passInput) passInput.value = '';
  if (userInput) userInput.focus();
};

window.submitLogin = function submitLogin() {
  const userInput = document.getElementById('authLoginUser');
  const input = document.getElementById('authPasswordInput');
  if (!input || !userInput) return;
  const user = (userInput.value || '').trim();
  const value = input.value || '';
  const s = getSettings();
  if (!isAuthEnabled()) {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'none';
    return;
  }
  const ok = user === s.authUser && /^\d{4}$/.test(value) && simpleHash(value) === s.authHash;
  if (!ok) {
    if (window.showToast) showToast('❌ Usuario o PIN incorrectos');
    if (!user) userInput.focus();
    else input.focus();
    input.value = '';
    input.focus();
    return;
  }
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
  input.value = '';
  userInput.value = '';
  const s2 = getSettings();
  if (s2.rememberSession) {
    setSession(s2.authUser);
  } else {
    clearSession();
  }
  if (window.showToast) showToast('✅ Bienvenida de nuevo');
};

function getOriginContext() {
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isLanIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const mode = isLocalhost ? 'localhost' : (isLanIp ? 'lan-ip' : 'otro');
  return { host, mode, origin: window.location.origin };
}

function renderOriginSyncNotice() {
  const el = document.getElementById('originSyncNotice');
  if (!el) return;
  const ctx = getOriginContext();
  const lanHint = 'http://192.168.x.x:3000';
  const envLabel = ctx.mode === 'localhost'
    ? 'Estás en LOCALHOST'
    : (ctx.mode === 'lan-ip' ? 'Estás en IP de red local' : 'Estás en otro origen');
  const envIcon = ctx.mode === 'localhost' ? '💻' : (ctx.mode === 'lan-ip' ? '📱' : '🌐');
  const tip = ctx.mode === 'localhost'
    ? `Los datos guardados aquí NO se comparten con la URL del celular (${lanHint}). Si quieres que sean iguales, exporta aquí e importa en la URL IP.`
    : `Los datos de esta URL no se comparten con localhost. Usa exportar/importar para mantener ambos iguales.`;

  el.innerHTML = `
    <div class="origin-sync-env">${envIcon} ${envLabel}</div>
    <div class="origin-sync-tip"><strong>Origen actual:</strong> <code>${ctx.origin}</code><br>${tip}</div>
    <div class="origin-sync-actions">
      <button class="btn btn-primary btn-sm" onclick="exportData()">⬇️ Exportar desde este origen</button>
      <button class="btn btn-ghost btn-sm" onclick="importData()">⬆️ Importar backup aquí</button>
      <button class="btn btn-ghost btn-sm" onclick="copyDataToClipboard()">📋 Copiar JSON</button>
    </div>
  `;
}
window.renderOriginSyncNotice = renderOriginSyncNotice;

// ── Init ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Fecha en header
  const dateEl = document.getElementById('headerDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Init PNL select
  const pnlSel = document.getElementById('pnlTopicSelect');
  if (pnlSel) {
    DATA.pnlTopics.forEach((t, i) => {
      const opt = document.createElement('option'); opt.value = i; opt.textContent = t;
      pnlSel.appendChild(opt);
    });
    pnlSel.addEventListener('change', () => {
      const notes = document.getElementById('pnlNotes');
      if (notes) notes.value = DATA.pnlNotes[pnlSel.value] || '';
    });
  }

  renderAll();
  bindProyectoLogButton();
  if (typeof window.updateInstallUI === 'function') window.updateInstallUI();
  if (typeof window.renderOriginSyncNotice === 'function') window.renderOriginSyncNotice();
  showAuthOverlayIfNeeded();
  updateAuthStatusText();
});

function renderAll() {
  renderHoy();
  renderProyectos();
  renderDiary();
  renderPlannerEmocionalList();
  renderPnlGrid();
  renderCourses();
  renderBookList();
  renderBookStats();
  renderCurrentBook();
  renderXDates();
  renderXDrafts();
  renderMonthPanel();
  renderHabits();
  renderMedia();
}

// ── Router de tabs ────────────────────────────────
window.switchTab = function(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  const topTab = document.querySelector('.tab[data-tab="' + id + '"]');
  if (topTab) topTab.classList.add('active');
  const bottomItem = document.querySelector('.bottom-nav .nav-item[data-tab="' + id + '"]');
  if (bottomItem) bottomItem.classList.add('active');
  else if (['lectura', 'xhilos', 'diario', 'ajustes'].indexOf(id) !== -1) {
    const more = document.querySelector('.bottom-nav .nav-item-more');
    if (more) more.classList.add('active');
  }
  if (id === 'mes') renderMonthPanel();
  if (id === 'hoy') { renderHoy(); renderHabits(); }
  if (id === 'diario') renderPlannerEmocionalList();
  if (id === 'cursos') renderPnlGrid();
  if (id === 'series') renderMedia();
  if (id === 'ajustes') {
    if (typeof window.updateInstallUI === 'function') window.updateInstallUI();
    if (typeof window.renderOriginSyncNotice === 'function') window.renderOriginSyncNotice();
  }
};

// ── Drawer "Más" (móvil) ─────────────────────────
window.openDrawer = function() {
  document.getElementById('drawerOverlay')?.classList.add('open');
  document.getElementById('drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeDrawer = function() {
  document.getElementById('drawerOverlay')?.classList.remove('open');
  document.getElementById('drawer')?.classList.remove('open');
  document.body.style.overflow = '';
};

// ── Modales ───────────────────────────────────────
window.openModal = (id) => document.getElementById(id)?.classList.add('open');
window.openTaskModal = () => {
  const modal = document.getElementById('taskModal');
  if (!modal) return;
  const idxInput = document.getElementById('taskEditIndex');
  const titleEl = document.getElementById('taskModalTitle');
  const name = document.getElementById('taskName');
  const cat = document.getElementById('taskCat');
  const prio = document.getElementById('taskPrio');
  const date = document.getElementById('taskDate');
  if (idxInput) idxInput.value = '';
  if (titleEl) titleEl.textContent = '✅ Nueva Tarea';
  if (name) name.value = '';
  if (cat) cat.value = 'proyecto';
  if (prio) prio.value = 'media';
  if (date) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    date.value = `${y}-${m}-${d}`;
  }
  modal.classList.add('open');
};
window.closeModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) window.closeModals(); });

// ── Acciones globales ─────────────────────────────
window.saveTask = saveTask;
window.saveLog = saveLog;
window.saveProyecto = saveProyecto;
window.saveProyectoLog = saveProyectoLog;
window.saveEditLog = saveEditLog;
window.saveXDraft = saveXDraft;
window.exportData = exportData;
window.copyDataToClipboard = copyDataToClipboard;
window.importData = () => importData(() => { DATA = loadData(); renderAll(); });
window.resetAllData = () => resetAllData(() => { DATA = loadData(); renderAll(); });
window.showToast = showToast;
window.changeMonth = changeMonth;
