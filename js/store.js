// ═══════════════════════════════════════════════════
// STORE — Estado global + persistencia localStorage
// ═══════════════════════════════════════════════════

const STORE_KEY = 'mep_v4';

function defaultHabitDefinitions() {
  return [
    { id: 'ejercicio', name: 'Ejercicio', icon: '🏋🏽‍♀️' },
    { id: 'escribir', name: 'Escribir', icon: '✍🏽' },
    { id: 'agua', name: 'Agua (2L)', icon: '💧' },
    { id: 'meditacion', name: 'Meditación', icon: '💬' },
    { id: 'lectura', name: 'Lectura', icon: '📖' },
    { id: 'dormir', name: 'Dormir 8H', icon: '🛏️' },
    { id: 'divertirme', name: 'Divertirme', icon: '🎮' },
    { id: 'organizar', name: 'Organizar el día', icon: '⏱️' },
    { id: 'agradecimientos', name: 'Agradecimientos', icon: '🎁' },
    { id: 'social', name: 'Social', icon: '👥' },
  ];
}

function defaultXCalendar() {
  // Calendario anual: días 1, 15 y último del mes (Ene–Dic 2026). Temas narrativos/emocionales por fecha.
  return [
    { day: 1, key: '2026-01-01', label: '✨ Comenzar de nuevo', topics: 'Año nuevo, intención, narrativa de inicio' },
    { day: 15, key: '2026-01-15', label: '🧠 Propósitos y memoria', topics: 'Reflexión, metas, recuerdos' },
    { day: 31, key: '2026-01-31', label: '❤️ Cerrar ciclos con amor', topics: 'Cierre, gratitud, amor propio' },
    { day: 1, key: '2026-02-01', label: '🌿 Febrero y el invierno interior', topics: 'Introspección, quietud' },
    { day: 15, key: '2026-02-15', label: '✨ Luz en los días cortos', topics: 'Esperanza, pequeños rituales' },
    { day: 28, key: '2026-02-28', label: 'Volar para entender', topics: 'Liberación, perspectiva' },
    { day: 1, key: '2026-03-01', label: '🌿 Susurrar luz al alma', topics: 'Naturaleza, sanación' },
    { day: 15, key: '2026-03-15', label: '🌿 Tristeza sin razón', topics: 'Emociones, aceptación' },
    { day: 31, key: '2026-03-31', label: '❤️ Amor o refugio', topics: 'Amor, refugio emocional' },
    { day: 1, key: '2026-04-01', label: '🧠 Cambio y aceptación', topics: 'Transformación, PNL' },
    { day: 15, key: '2026-04-15', label: '✨ Silencio y amor propio', topics: 'Autocuidado, calma' },
    { day: 30, key: '2026-04-30', label: '❤️ Miedo al amor', topics: 'Vulnerabilidad, apertura' },
    { day: 1, key: '2026-05-01', label: '🌿 Magia lunar y sanación', topics: 'Ciclos, intuición' },
    { day: 15, key: '2026-05-15', label: '🧠 Cambio de consciencia', topics: 'Crecimiento, mente' },
    { day: 31, key: '2026-05-31', label: '❤️ Refugio y repetición', topics: 'Patrones, seguridad' },
    { day: 1, key: '2026-06-01', label: '✨ Conexión silenciosa', topics: 'Comunicación sin palabras' },
    { day: 15, key: '2026-06-15', label: '🌿 Susurrar luz al alma', topics: 'Naturaleza, alma' },
    { day: 30, key: '2026-06-30', label: '🧠 Elegirnos a nosotras', topics: 'Autoelegir, prioridades' },
    { day: 1, key: '2026-07-01', label: '❤️ Risa compartida y magia', topics: 'Alegría, vínculo' },
    { day: 15, key: '2026-07-15', label: '🌿 Luz y sombra humana', topics: 'Dualidad, integración' },
    { day: 31, key: '2026-07-31', label: '🧠 Destino inmutable', topics: 'Fatalidad, creencias' },
    { day: 1, key: '2026-08-01', label: '❤️ Sustitución y refugio emocional', topics: 'Sustitución, apego' },
    { day: 15, key: '2026-08-15', label: '✨ Narración estilo fanfic', topics: 'Ficción, fantasía' },
    { day: 31, key: '2026-08-31', label: '✨ Apostar por el mañana', topics: 'Futuro, esperanza' },
    { day: 1, key: '2026-09-01', label: '🌿 Septiembre: vuelta al cuerpo', topics: 'Cuerpo, sensación' },
    { day: 15, key: '2026-09-15', label: '🧠 Narrativa del perdón', topics: 'Perdón, liberación' },
    { day: 30, key: '2026-09-30', label: '❤️ Amor que no ocupa lugar', topics: 'Amor incondicional' },
    { day: 1, key: '2026-10-01', label: '✨ Octubre y las hojas que caen', topics: 'Soltar, otoño' },
    { day: 15, key: '2026-10-15', label: '🌿 Raíces y pertenencia', topics: 'Origen, identidad' },
    { day: 31, key: '2026-10-31', label: '🧠 Miedos que narramos', topics: 'Miedo, historia' },
    { day: 1, key: '2026-11-01', label: '❤️ Gratitud en primera persona', topics: 'Gratitud, relato' },
    { day: 15, key: '2026-11-15', label: '✨ Pequeños rituales de luz', topics: 'Ritual, consuelo' },
    { day: 30, key: '2026-11-30', label: '🌿 Cerrar noviembre en paz', topics: 'Paz, cierre' },
    { day: 1, key: '2026-12-01', label: '🧠 Diciembre: lo que guardamos', topics: 'Memoria, tesoros' },
    { day: 15, key: '2026-12-15', label: '❤️ Navidad interior', topics: 'Interioridad, fiesta' },
    { day: 31, key: '2026-12-31', label: '✨ Última página del año', topics: 'Cierre de año, narrativa' },
  ];
}

export function defaultData() {
  return {
    tasks: [],
    diary: [],
    xDrafts: [],
    xDates: { '2026-02-28': true, '2026-03-01': true },
    xCalendar: defaultXCalendar(),
    pnlDone: [],
    pnlCurrent: 0,
    pnlNotes: {},
    pnlTopics: [
      'Módulo 1: Introducción a la programación neurolingüística',
      'Módulo 2: Cerebro triádico y sistemas representacionales',
      'Módulo 3: Técnicas de Calibración y Rapport',
      'Módulo 4: Coaching e inteligencia relacional',
      'Módulo 5: Reconexión con el niño interior',
      'Módulo 6: Reprogramación mental desde la creatividad',
      'Módulo 7: Anclajes',
      'Módulo 8: Inteligencia emocional',
      'Módulo 9: Descodificación biológica de las enfermedades',
      'Módulo 10: PNL y Prosperidad económica',
      'Módulo 11: Inteligencia Espiritual',
      'Módulo 12: Entrenamiento en gerencia de vida'
    ],
    courses: [
      { id: 1, icon: '🤖', name: 'IA con Claude', escuela: 'Platzi', deadline: '', pct: 0 },
      { id: 2, icon: '✅', name: 'Curso de Claude AI', escuela: 'Platzi', deadline: '', pct: 100 },
      { id: 3, icon: '💻', name: 'Curso de Claude Code', escuela: 'Platzi', deadline: '', pct: 27 },
      { id: 4, icon: '⚙️', name: 'Curso de Automatizaciones con n8n', escuela: 'Platzi', deadline: '', pct: 0 },
      { id: 5, icon: '🇬🇧', name: 'Business English', escuela: 'Santander Open Academy', deadline: '31 Dic 2026', pct: 0 },
      { id: 6, icon: '💬', name: 'Comunicación Efectiva', escuela: 'Santander Open Academy', deadline: '31 Dic 2026', pct: 0 },
      { id: 99, icon: '🏆', name: 'Test Inglés · BECA', escuela: 'Santander Open Academy', deadline: '24 Mar 2026', pct: 0, isTest: true, done: false },
    ],
    books: [
      { id: 1, emoji: '✅', title: 'El arte de manifestar', author: 'Carolyn Boyes', pct: 100, done: true, dateStarted: '', dateFinished: '' },
      { id: 2, emoji: '✨', title: 'El plan de tu alma', author: 'Robert Schwartz', pct: 95, done: false, dateStarted: '', dateFinished: '' },
      { id: 3, emoji: '📕', title: 'Este dolor no es mío', author: 'Mark Wolynn', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 4, emoji: '🌿', title: 'El arte de escuchar el cuerpo', author: 'Lise Bourbeau', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 5, emoji: '🌊', title: 'El reflejo de nuestras emociones', author: '', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 6, emoji: '🔥', title: 'Deja de ser tú', author: 'Joe Dispenza', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 7, emoji: '🧠', title: 'Las 3 preguntas', author: 'Jorge Bucay', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 8, emoji: '💰', title: 'Piense y hágase rico', author: 'Napoleon Hill', pct: 0, done: false, dateStarted: '', dateFinished: '' },
      { id: 9, emoji: '⚠️', title: 'La medicina patas arriba: ¿y Si Hamer Tuviera Razón?', author: 'Giorgio M. Mambretti', pct: 0, done: false, dateStarted: '', dateFinished: '' },
    ],
    booksGoal: 8,
    habitDefinitions: defaultHabitDefinitions(),
    habitEntries: {},
    dailyLog: {},
    proyectos: [
      {
        id: 1, icon: '💪', name: 'Vigoroso',
        desc: 'Aplicación web para gestión de gimnasio. Control de membresías, rutinas, pagos y seguimiento de clientes.',
        stack: 'Web App', inicio: 'Feb 2026', meta: 'MVP primer semestre 2026',
        estado: 'active', pct: 15,
        logs: [
          { date: '2026-02-01', text: 'Inicio del proyecto. Definición de arquitectura y módulos principales.', pct: 5 },
          { date: '2026-02-15', text: 'Avance en módulo de membresías y panel de administración.', pct: 15 }
        ]
      }
    ],
    media: [],
    settings: {
      authEnabled: false,
      authUser: '',
      authHash: '',
      authHint: '',
      rememberSession: false
    },
    _version: 4,
    _updatedAt: new Date().toISOString()
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrar datos de versión anterior si existe
      if (parsed._version && parsed._version < 4) {
        return migrateData(parsed);
      }
      // Marcar como publicadas las dos primeras publicaciones en X (28 feb y 1 mar)
      if (parsed.xDates && typeof parsed.xDates === 'object') {
        parsed.xDates['2026-02-28'] = true;
        parsed.xDates['2026-03-01'] = true;
      }
      // Asegurar calendario X editable (Ene–Dic 2026): rellenar faltantes desde default
      const defaultCal = defaultXCalendar();
      if (!parsed.xCalendar || !Array.isArray(parsed.xCalendar) || parsed.xCalendar.length === 0) {
        parsed.xCalendar = defaultCal.slice();
      } else {
        const existingKeys = new Set(parsed.xCalendar.map(e => e.key));
        defaultCal.forEach(def => {
          if (!existingKeys.has(def.key)) {
            parsed.xCalendar.push({ ...def });
            existingKeys.add(def.key);
          }
        });
        parsed.xCalendar.sort((a, b) => (a.key || '').localeCompare(b.key || ''));
      }
      // Asegurar hábitos diarios
      if (!parsed.habitDefinitions || !Array.isArray(parsed.habitDefinitions) || parsed.habitDefinitions.length === 0) {
        parsed.habitDefinitions = defaultHabitDefinitions();
      }
      if (!parsed.habitEntries || typeof parsed.habitEntries !== 'object') {
        parsed.habitEntries = {};
      }
      if (!parsed.dailyLog || typeof parsed.dailyLog !== 'object') {
        parsed.dailyLog = {};
      }
      // Ajustes generales
      if (!parsed.settings || typeof parsed.settings !== 'object') {
        parsed.settings = { authEnabled: false, authUser: '', authHash: '', authHint: '', rememberSession: false };
      } else {
        if (parsed.settings.authEnabled === undefined) parsed.settings.authEnabled = false;
        if (parsed.settings.authUser === undefined) parsed.settings.authUser = '';
        if (parsed.settings.authHash === undefined) parsed.settings.authHash = '';
        if (parsed.settings.authHint === undefined) parsed.settings.authHint = '';
        if (parsed.settings.rememberSession === undefined) parsed.settings.rememberSession = false;
      }
      // Migrar cursos: si tienen platform pero no escuela, usar platform como escuela
      if (Array.isArray(parsed.courses)) {
        parsed.courses.forEach(c => {
          if (c && !c.escuela && c.platform) c.escuela = c.platform;
        });
      }
      // Libros: asegurar dateStarted y dateFinished
      if (Array.isArray(parsed.books)) {
        parsed.books.forEach(b => {
          if (b && b.dateStarted === undefined) b.dateStarted = '';
          if (b && b.dateFinished === undefined) b.dateFinished = '';
        });
      }
      // Proyectos: asegurar que logs sea siempre un array (evitar que se pierdan al guardar avance)
      if (Array.isArray(parsed.proyectos)) {
        parsed.proyectos.forEach(proy => {
          if (proy && !Array.isArray(proy.logs)) {
            proy.logs = (proy.logs && typeof proy.logs === 'object') ? Object.values(proy.logs) : [];
          }
        });
      }
      // Series / Películas: asegurar lista
      if (!parsed.media || !Array.isArray(parsed.media)) {
        parsed.media = [];
      } else {
        parsed.media.forEach(it => {
          if (it && !it.source) it.source = 'netflix';
          if (it && !it.status) it.status = 'no_iniciada';
          if (it && !it.type) it.type = 'series';
        });
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Store: error loading data', e);
  }
  return defaultData();
}

function migrateData(old) {
  const fresh = defaultData();
  // Preservar datos del usuario
  const keys = ['tasks', 'diary', 'xDrafts', 'xDates', 'xCalendar', 'habitDefinitions', 'habitEntries', 'dailyLog', 'pnlDone', 'pnlCurrent',
                 'pnlNotes', 'pnlTopics', 'courses', 'books', 'booksGoal', 'proyectos', 'media', 'settings'];
  keys.forEach(k => { if (old[k] !== undefined) fresh[k] = old[k]; });
  fresh._version = 4;
  return fresh;
}

export function saveData(data) {
  try {
    data._updatedAt = new Date().toISOString();
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Store: error saving data', e);
  }
}

// ── Helpers de fecha ──────────────────────────────
export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function todayKey() { return dateKey(new Date()); }
export function monthKey(y, m) { return `${y}-${String(m + 1).padStart(2, '0')}`; }
