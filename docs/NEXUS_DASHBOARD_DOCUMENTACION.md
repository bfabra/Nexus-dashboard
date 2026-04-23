# Nexus-dashboard — Documentación detallada

**Mi Espacio Personal** es una PWA (Progressive Web App) de una sola página para gestión de vida personal: tareas, proyectos, cursos, lectura, diplomado PNL, diario, hilos X y hábitos. Funciona 100% en el cliente, sin backend; la persistencia es **localStorage** y la sincronización entre dispositivos es manual (exportar/importar JSON).

---

## 1. Descripción general

| Aspecto | Detalle |
|--------|---------|
| **Nombre** | Mi Espacio Personal (Nexus-dashboard) |
| **Tipo** | PWA · Vanilla JS · Offline-first |
| **Backend** | No existe; todo en el navegador |
| **Persistencia** | `localStorage` (clave `mep_v4`) |
| **Idioma** | Español (es-CO) |

### Funcionalidades principales

- **Hoy**: Vista diaria con tareas, franja de la semana (día seleccionable para ver resumen y tareas de ese día), vencimientos próximos (tareas, cursos, hilos X), tarjetas de resumen (proyectos, cursos, PNL, lectura), hábitos diarios (checkboxes por día), countdown vacaciones (con contador ajustado a la fecha local).
- **Mes**: Calendario mensual con eventos, diario, planner emocional, hilos X y publicación del día; edición de registro por día; tarjetas de **Progreso (Mes)** con datos reales (proyectos, lectura, cursos, hilos X).
- **Proyectos**: CRUD de proyectos (crear/editar desde modal unificado); logs de avance (registrar avance sin borrar los existentes); edición del texto de cada actualización (corregir tipeos).
- **Cursos**: Lista de cursos agrupada por escuela (Platzi, Santander, etc.), con scroll vertical por escuela; progreso, “+ Nuevo curso”, editar curso (modal).
- **Lectura 2026**: Lista de libros con progreso, “+ Nuevo libro”, editar libro, fechas de inicio/fin por libro, filtro por mes y año (todos / iniciados en / finalizados en).
- **Hilos X**: Calendario por mes (enero–diciembre), 3 fechas por mes editables; secciones por mes colapsables con scroll; borradores; edición de título y temas por fecha.
- **Diario**: Entradas por fecha (texto, mood, tags), selector rápido de estado de ánimo (incluye “😍 Maravilloso”), planner emocional por bloques (preguntas, 500 palabras máx), guardar por bloque.
- **Series 👩🏽‍💻**: Watchlist de series/películas/GL/Kdramas/CDramas con filtros por tipo y estado (No iniciada, En proceso, Visto), campo de origen (Netflix/Telegram/YouTube/Otra) y tarjetas con acciones rápidas (cambiar estado, editar, eliminar).
- **PNL**: Integrado en Cursos; 12 módulos del diplomado, progreso y notas por módulo.
- **Ajustes**: Exportar/importar datos, copiar/pegar portapapeles, borrar todo; **Instalar como App** con detección de estado (ya instalada / botón Instalar / instrucciones por dispositivo e indicación de HTTPS para móvil).

---

## 2. Arquitectura

El sistema se organiza en capas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRESENTACIÓN   index.html (app shell, tabs, paneles, modales)               │
│                 css/tokens.css | components.css | layout.css                 │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORQUESTACIÓN  app.js — Entry, router de tabs, renderAll(), DATA, saveData  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESTADO        store.js — loadData(), saveData(), defaultData(), migraciones │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  MÓDULOS       js/modules/*.js — Hoy, Mes, Proyectos, Cursos, Lectura,      │
│                PNL, Hilos X, Diario, Hábitos                                 │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYNC          sync.js — exportData, importData, resetAllData, showToast     │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  PWA           manifest.json + service-worker.js (cache-first, instalable)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regla de oro:** Solo `store.js` escribe en `localStorage`. Los módulos solo leen/escriben el objeto **DATA** y llaman a **saveData(DATA)** expuestos desde `app.js`. Los módulos no se importan entre sí.

Documentación de arquitectura ampliada: **docs/BIG_PICTURE_ARCHITECTURE.md**.

---

## 3. Estructura del proyecto

```
Nexus-dashboard/
├── index.html              # App shell: header, nav, paneles, modales
├── manifest.json            # PWA: name, start_url, icons, theme_color
├── service-worker.js       # Cache-first, lista ASSETS, offline
├── NEXUS_DASHBOARD_DOCUMENTACION.md   # Este archivo
├── css/
│   ├── tokens.css          # Variables :root (colores, tipografía, espaciado)
│   ├── components.css      # Cards, botones, badges, modales, toasts
│   └── layout.css          # Header, nav, main, grids, media queries
├── js/
│   ├── app.js              # Entry, DATA, saveData, switchTab, modales, renderAll
│   ├── store.js            # loadData, saveData, defaultData, migrateData
│   ├── sync.js             # exportData, importData, resetAllData, showToast
│   └── modules/
│       ├── hoy.js          # Vista Hoy: tareas, stats, semana, hábitos
│       ├── mes.js          # Vista Mes: calendario, detalle día, planner/hilos
│       ├── proyectos.js    # CRUD proyectos + logs
│       ├── cursos.js       # Cursos por escuela, modal curso, PNL dentro del panel
│       ├── lectura.js      # Libros, modal libro, filtro mes/año
│       ├── pnl.js          # Grid 12 módulos, notas, progreso
│       ├── xhilos.js       # Calendario X, borradores, edición publicación
│       ├── diario.js       # Diario, planner emocional, modal log
│       └── habits.js       # Tabla hábitos 14 días, ánimo, notas
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md
    └── BIG_PICTURE_ARCHITECTURE.md
```

---

## 4. Stack tecnológico

| Área | Tecnología |
|------|------------|
| Lenguaje | JavaScript ES6+ (módulos nativos, `import`/`export`) |
| UI | HTML5 + CSS3 (Custom Properties, sin preprocesador) |
| Estado | Objeto global `DATA` en memoria + `localStorage` |
| PWA | Web App Manifest + Service Worker (cache-first) |
| Build | Ninguno (sin bundler, sin npm obligatorio) |
| Backend | No existe |

---

## 5. Estado global y persistencia

### 5.1 Clave y versión

- **Clave localStorage:** `mep_v4`
- **Versión del esquema:** `DATA._version` (actualmente `4`). Se usa en `loadData()` para aplicar migraciones.

### 5.2 Flujo de datos

1. **Carga:** `app.js` ejecuta `DATA = loadData()` (desde `store.js`). Si hay datos en `localStorage`, se parsean y se aplican migraciones si `_version` es menor.
2. **Mutaciones:** Cualquier módulo que cambie datos hace `DATA.xxx = ...` y luego `saveData(DATA)`.
3. **Guardado:** `saveData(data)` en `store.js` hace `localStorage.setItem(STORE_KEY, JSON.stringify(data))` y actualiza `data._updatedAt`.

### 5.3 Migraciones (store.js)

- De `_version < 4` a `4`: se preservan listas conocidas (tasks, diary, xDrafts, xDates, xCalendar, habitDefinitions, habitEntries, dailyLog, pnl*, courses, books, booksGoal, proyectos) y se rellenan valores por defecto para el resto.
- Adicionalmente en `loadData()`:
  - Se marcan publicadas las fechas `2026-02-28` y `2026-03-01` en `xDates`.
  - Si no existe `xCalendar` o está vacío, se inicializa con `defaultXCalendar()` (enero–diciembre, 3 fechas por mes; migración amplía datos existentes si hace falta).
  - Si no existen `habitDefinitions` / `habitEntries` / `dailyLog`, se inicializan.
  - Cursos: si tienen `platform` pero no `escuela`, se copia `platform` a `escuela`.
  - Libros: se asegura que cada libro tenga `dateStarted` y `dateFinished` (string, por defecto `''`).
  - Proyectos: se normaliza `proyectos[].logs` a array si no lo es (para no perder avances al guardar).

---

## 6. Estructura de datos (DATA)

Definida en `store.js → defaultData()`. Resumen de cada entidad:

### 6.1 tasks (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| name | string | Texto de la tarea |
| cat | string | Categoría (ej. proyecto, curso, personal) |
| prio | string | Prioridad (ej. alta, media, baja) |
| date | string | Fecha `YYYY-MM-DD` |
| done | boolean | Completada o no |

### 6.2 diary (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| date | string | `YYYY-MM-DD` |
| text | string | Contenido de la entrada |
| mood | string | Emoji estado de ánimo |
| tags | string[] | Etiquetas (ej. reflexion, trabajo) |

### 6.3 dailyLog (Object)

Clave: fecha `YYYY-MM-DD`. Valor: objeto con una propiedad por pregunta del planner emocional (cada una un string, máx 500 palabras). Se guarda por bloque.

### 6.4 xDrafts (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| title | string | Título del borrador |
| content | string | Cuerpo del hilo |
| targetDate | string | `YYYY-MM-DD` objetivo |

### 6.5 xDates (Object)

Clave: `YYYY-MM-DD`. Valor: `true` si esa fecha tiene publicación (programada o ya publicada).

### 6.6 xCalendar (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| day | number | Día del mes (1–31) |
| key | string | `YYYY-MM-DD` |
| label | string | Título de la publicación |
| topics | string | Temas (texto libre) |

Calendario editable: se puede editar título y temas por cada entrada.

### 6.7 pnlDone, pnlCurrent, pnlNotes, pnlTopics

- **pnlDone:** Array de índices de módulos completados (0–11).
- **pnlCurrent:** Índice del módulo actual (number).
- **pnlNotes:** Objeto `{ "0": "texto", "1": "texto", ... }` por módulo.
- **pnlTopics:** Array de 12 strings (nombres de los módulos del diplomado).

### 6.8 courses (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| icon | string | Emoji (ej. 🤖, 🇬🇧) |
| name | string | Nombre del curso |
| escuela | string | Plataforma (Platzi, Santander Open Academy, etc.) |
| deadline | string | Fecha límite (texto libre) |
| pct | number | Progreso 0–100 |
| isTest | boolean | Opcional; si es prueba/curso de prueba |
| done | boolean | Opcional; completado |

### 6.9 books (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| emoji | string | Emoji (ej. 📕, ✅) |
| title | string | Título del libro |
| author | string | Autor |
| pct | number | Progreso 0–100 |
| done | boolean | Leído o no |
| dateStarted | string | Fecha inicio `YYYY-MM-DD` (puede ser '') |
| dateFinished | string | Fecha fin `YYYY-MM-DD` (puede ser '') |

- **booksGoal:** number. Meta de libros (ej. 8).

### 6.10 habitDefinitions (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador (ej. ejercicio, escribir) |
| name | string | Nombre mostrado |
| icon | string | Emoji |

Lista por defecto: Ejercicio, Escribir, Agua (2L), Meditación, Lectura, Dormir 8H, Divertirme, Organizar el día, Agradecimientos, Social.

### 6.11 habitEntries (Object)

Clave: `YYYY-MM-DD`. Valor: objeto con claves = `habitId` y valor = `true` si está marcado. Opcionalmente ánimo y notas para ese día.

### 6.12 proyectos (Array)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único |
| icon | string | Emoji |
| name | string | Nombre del proyecto |
| desc | string | Descripción |
| stack | string | Stack tecnológico / tipo |
| inicio | string | Fecha o texto de inicio |
| meta | string | Meta (ej. MVP primer semestre 2026) |
| estado | string | active, pausado, etc. |
| pct | number | Progreso 0–100 |
| logs | Array | `{ date, text, pct }` por log de avance |

### 6.13 Metadatos

- **\_version:** number. Versión del esquema para migraciones.
- **\_updatedAt:** string. ISO timestamp de la última actualización.

### 6.14 media (Array)

Lista de series/películas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | number | Identificador único (`Date.now()`) |
| icon | string | Emoji opcional (🎬, 🍿, bandera, etc.) |
| title | string | Título de la serie/película |
| type | string | `series`, `peliculas`, `gl`, `kdramas`, `cdramas` |
| status | string | `no_iniciada`, `en_proceso`, `visto` |
| source | string | `netflix`, `telegram`, `youtube`, `otra` |
| notes | string | Notas libres (temporada, episodio, etc.) |
| createdAt | number | Timestamp ms creación |
| updatedAt | number | Timestamp ms última actualización |

---

## 7. Módulos de vista (js/modules)

Cada módulo exporta funciones de render y, en su caso, de guardado. No hay dependencias entre módulos; todos usan `DATA` y `saveData` desde `app.js`.

### 7.1 hoy.js

- **renderHoy():** Franja de la semana (día seleccionable para ver resumen y tareas de ese día), countdown vacaciones, info del día laboral.
- **renderUpcomingDeadlines():** Vencimientos próximos: tareas con fecha, cursos (deadline parseado), próximos hilos X, ordenados.
- **renderTodayTasks():** Lista de tareas del día con checkbox y categoría.
- **renderStatCards():** Tarjetas de resumen (proyectos, cursos, PNL, lectura) con barras de progreso.
- **saveTask():** Crear/actualizar tarea (llamado desde modal de tarea).
- También se renderiza la sección de hábitos (tabla 14 días) coordinando con `habits.js`.

### 7.2 mes.js

- **renderMonthPanel():** Calendario del mes actual, celdas con indicadores (diario, tareas, hilos X); **renderMonthProgress()** rellena las cuatro tarjetas de Progreso (Mes) con datos reales: proyectos, lectura, cursos, hilos X.
- **changeMonth(offset):** Cambiar mes (prev/next).
- Al hacer clic en un día: detalle del día (tareas, diario, planner, hilos X) y opción “Editar registro del día” que abre el planner/modal correspondiente.
- Muestra título y temas de la publicación X del día cuando existe en `xCalendar`.

### 7.3 proyectos.js

- **renderProyectos():** Lista de proyectos con estado, progreso, botón Editar (✏️) y "Registrar Avance".
- Modal unificado de proyecto: crear/editar según `proyectoEditIndex` (≥ 0 editar, -1 nuevo). **saveProyecto()** guarda desde ese modal.
- **saveProyectoLog()** → **doSaveProyectoLog():** Añade un log al array `proyectos[index].logs` (solo `push`; no reemplaza logs existentes). Solo muestra "✅ Avance registrado" cuando el guardado es exitoso. Lista de "Últimas actualizaciones" con todos los avances (scroll).
- **openEditLog(projIndex, logIndex)** / **saveEditLog():** Editar el texto de una actualización existente (modal `#editLogModal`). Botón ✏️ en cada fila de log.
- Modales: `#proyectoModal`, `#proyectoLogModal`, `#editLogModal`.

### 7.4 cursos.js

- **renderCourses():** Agrupa cursos por `escuela`; cada escuela tiene su contenedor con scroll vertical (`.course-escuela-list`). Muestra progreso y botón Editar por curso.
- **openCourseModal(index):** index ≥ 0 editar, -1 nuevo. Campos: icono, nombre, escuela, deadline, pct, isTest, done.
- **saveCourse():** Actualizar o crear curso en `DATA.courses` y re-renderizar.
- Dentro del mismo panel se renderiza el bloque PNL (grid 12 módulos, notas) vía **renderPnlGrid()** importado de `pnl.js`.

### 7.5 lectura.js

- **renderBookList():** Lista de libros (filtrada si hay filtro activo) con emoji, título, autor, fechas inicio/fin, progreso, botón Editar (✏️).
- **renderBookStats():** Resumen leídos / meta y barra de progreso.
- **renderCurrentBook():** Tarjeta “Libro actual” (primer no terminado con progreso o primer no terminado).
- **openBookModal(index):** index ≥ 0 editar, -1 nuevo libro. Campos: emoji, título, autor, fecha inicio, fecha finalizó, progreso, Leído.
- **saveBook():** Crear o actualizar libro y re-renderizar lista, stats y libro actual.
- **getFilteredBooks():** Filtra por “Todos”, “Iniciados en (mes/año)” o “Finalizados en (mes/año)” usando `bookFilterBy`, `bookFilterYear`, `bookFilterMonth`.
- Selectores de año (rellenados en `ensureBookFilterYears()`) y mes en el panel.

### 7.6 pnl.js

- **renderPnlGrid():** Barra de progreso (X/12) y grid de los 12 módulos con estado (completado/actual) y notas.
- Notas por módulo guardadas en `DATA.pnlNotes`. Selector de tema y textarea en el panel Cursos.

### 7.7 xhilos.js

- **renderXDates():** Calendario de publicaciones por mes (enero–diciembre); secciones por mes colapsables (expandir/colapsar); scroll vertical en `.x-month-days`. Fechas y temas desde `xCalendar`; marca publicadas con `xDates[key]`.
- **renderXDrafts():** Lista de borradores con edición y fecha objetivo.
- **saveXDraft():** Guardar borrador desde modal.
- Edición de una publicación del calendario: modal para editar título y temas de la entrada en `xCalendar` para esa fecha.

### 7.8 diario.js

- **renderDiary():** Lista de entradas del diario (por fecha, mood, tags).
- **renderPlannerEmocionalList():** Lista de entradas del planner emocional (por fecha); al hacer clic en una fecha se abre el planner para ese día.
- **saveLog():** Guardar entrada del diario (modal `#logModal`).
- Planner emocional: preguntas en bloques colapsables, una línea por pregunta (máx 500 palabras), guardar por bloque; datos en `DATA.dailyLog[fecha]`.
- Botón “+ Diario” en header abre modal de nueva entrada; “Planner emocional” abre `#plannerModal` para el día seleccionado.
- En la vista Mes, al elegir “Editar registro del día” se puede abrir el planner para esa fecha.

### 7.9 series.js

- **renderMedia():** Watchlist de series/películas/GL/Kdramas/CDramas. Filtros por tipo (`mediaFilterType`) y estado (`mediaFilterStatus`). Tarjetas tipo curso con icono, título, tipo, origen (Netflix/Telegram/YouTube/Otra), notas y acciones rápidas (cambiar estado, editar, eliminar).
- **openMediaModal() / saveMedia():** Modal para crear/editar item con campos: icono, tipo, estado (No iniciada / En proceso / Visto), origen y notas.

### 7.10 habits.js

- **renderHabits():** Tabla de hábitos: filas = días (14 días), columnas = cada hábito de `habitDefinitions`; celdas con checkbox. Opcionalmente ánimo y notas por día.
- Datos en `DATA.habitEntries[date]` y definiciones en `DATA.habitDefinitions`.
- Tooltips en cabecera y celdas con el nombre del hábito.

---

## 8. Interfaz de usuario

### 8.1 Navegación (tabs)

- **switchTab(id, btn):** En `app.js`. Oculta todos los paneles, muestra `#panel-{id}` y marca el tab activo.
- Tabs: Hoy, Mes, Proyectos, Cursos, Lectura, Hilos X, Diario, Ajustes.
- Al cambiar a `mes` se llama `renderMonthPanel()`; a `hoy`, `renderHoy()` y `renderHabits()`; a `diario`, `renderPlannerEmocionalList()`; a `cursos`, `renderPnlGrid()`; a `ajustes`, `updateInstallUI()` para actualizar la sección "Instalar como App".

### 8.2 Paneles

| ID | Contenido principal |
|----|----------------------|
| panel-hoy | Semana, stats, tareas de hoy, hábitos diarios |
| panel-mes | Calendario, detalle del día, eventos y edición |
| panel-proyectos | Lista proyectos, + Nuevo proyecto, logs |
| panel-cursos | Cursos por escuela, + Nuevo curso, bloque PNL |
| panel-series | Series/Películas (watchlist), filtros por tipo/estado, + Agregar |
| panel-lectura | Lista lectura 2026, filtros, + Nuevo libro, libro actual |
| panel-xhilos | Calendario publicaciones X, borradores |
| panel-diario | Diario, planner emocional |
| panel-ajustes | Exportar/Importar, copiar/pegar, borrar todo, PWA |

### 8.3 Modales

| ID | Uso |
|----|-----|
| taskModal | Nueva/editar tarea |
| logModal | Nueva/editar entrada diario |
| plannerModal | Planner emocional (bloques por pregunta) |
| courseModal | Nuevo/editar curso |
| bookModal | Nuevo/editar libro |
| proyectoModal | Nuevo/editar proyecto |
| proyectoLogModal | Añadir log de avance a proyecto |
| editLogModal | Editar texto de una actualización (log) existente de un proyecto |
| xDraftModal | Nuevo/editar borrador hilo X |
| xEntryEditModal | Editar título y temas de una fecha del calendario X |

- Apertura: `openModal(id)` — añade clase `open` al overlay.
- Cierre: `closeModals()` — quita `open` de todos los overlays. Clic en el overlay también cierra.

### 8.4 Responsive y PWA móvil (Mobile First)

- **Enfoque:** Mobile First. Breakpoints: 360px, 393px (Xiaomi 15), 480px, 768px, 1024px.
- **Viewport:** `width=device-width, initial-scale=1.0, viewport-fit=cover` para safe areas en notch/isla.
- **Navegación móvil:** Por debajo de 768px se ocultan los tabs superiores y se muestra una **barra inferior** (bottom nav) con: Hoy, Mes, Proyectos, Cursos y **Más**. "Más" abre un **drawer** con Lectura, Hilos X, Diario y Ajustes. A partir de 768px se usan los tabs superiores y la bottom nav se oculta.
- **Safe areas:** `env(safe-area-inset-*)` aplicado en header, main, bottom nav, drawer y modales para dispositivos con notch o barra de gestos.
- **Toques:** Área mínima táctil 44px (`--touch-min`). Botones, enlaces del drawer y controles de formulario respetan ese mínimo. `-webkit-tap-highlight-color: transparent` donde procede.
- **Formularios:** Inputs y selects al 100% de ancho, `min-height: 44px`, `font-size: 16px` en móvil para evitar zoom al enfocar en iOS.
- **Tabla de hábitos:** En &lt; 480px la tabla se muestra como **tarjetas** (una por fecha) usando `data-label` en cada celda. En pantallas mayores, scroll horizontal táctil controlado (sin scroll en body).
- **Grids:** En móvil una columna; a 393px las stat cards en 2 columnas; a 768px grid principal 2fr+1fr y 4 columnas para estadísticas donde aplique.
- **Sin scroll horizontal:** `overflow-x: hidden` en `html`, `body` e `#app`; contenedores flex/grid con `min-width: 0` donde hace falta.

### 8.5 Acciones globales (window)

- saveTask, saveLog, saveProyecto, saveProyectoLog, saveXDraft, saveBook (y openBookModal, openCourseModal, etc. según módulo).
- exportData, importData, resetAllData, showToast.
- openModal, closeModals, openTaskModal, changeMonth.
- installPWA, dismissInstall, updateInstallUI (banner de instalación y sección Ajustes).
- openDrawer, closeDrawer (drawer "Más" en móvil).

---

## 9. PWA

### 9.1 manifest.json

- **name / short_name:** Mi Espacio Personal / Mi Espacio.
- **start_url:** `./index.html`
- **display:** standalone
- **theme_color / background_color:** Coherencia con la app.
- **icons:** 192x192 y 512x512 (maskable).
- **categories:** productivity, lifestyle.
- **lang:** es-CO.

### 9.2 Service Worker (service-worker.js)

- **Estrategia:** Cache-first para GET.
- **CACHE_NAME:** `mi-espacio-v6` (se incrementa cuando se tocan assets clave como CSS/JS para forzar actualización en PWA).
- **ASSETS:** index.html, manifest, CSS, JS (app, store, sync, todos los módulos), opcionalmente fuentes Google.
- **install:** Cachea los assets (excluyendo URLs externas si se desea), `skipWaiting()`.
- **activate:** Borra caches antiguos, `clients.claim()`.
- **fetch:** Si es GET, primero busca en cache; si falla, fetch y guarda en cache; si es document y no hay red, puede devolver index.html para modo offline.

Para ver cambios tras actualizar código suele ser necesario recarga forzada (Ctrl+Shift+R) o desregistrar el Service Worker.

### 9.3 Instalación

- El navegador puede mostrar el banner “Instalar como app” (beforeinstallprompt). “Instalar” llama a `installPWA()`.
- En móvil: “Agregar a pantalla de inicio” desde el menú del navegador.

- **updateInstallUI()** (app.js): Rellena `#installPWAWrap` en Ajustes según estado: si ya instalada (standalone) muestra "✅ Ya está instalada"; si hay `deferredPrompt`, botón "Instalar en este dispositivo"; si no (p. ej. iOS), "Ver instrucciones" con pasos Android/iPhone/PC y nota de que en móvil hace falta **HTTPS**. Se invoca al cargar y al abrir el tab Ajustes.

---

## 10. Sincronización entre dispositivos

- **Exportar:** Ajustes → Exportar datos. Descarga un JSON con todo `DATA` (nombre tipo `mi-espacio-backup-YYYY-MM-DD.json`).
- **Importar:** Ajustes → Importar datos. Selecciona archivo JSON; se valida que existan `tasks`, `diary`, `proyectos`; se hace `saveData(parsed)` y `renderAll()`.
- **Copiar / Pegar:** Copia el JSON al portapapeles o pega desde portapapeles y reemplaza datos (con validación básica).
- **Borrar todo:** Confirmación doble; `localStorage.clear()` y recarga de `DATA` + `renderAll()`.

Implementación en **js/sync.js**. No hay sincronización automática con servidor.

---

## 11. Cómo extender el proyecto

- **Nuevo módulo de vista:** Crear `js/modules/nuevo.js` con funciones `render*()` (y opcionalmente `init`). En `store.js` añadir en `defaultData()` las estructuras necesarias. En `app.js`: importar, llamar al render en `renderAll()` y, si aplica, en `switchTab()`; exponer en `window` los handlers que abran modales o guarden. En `index.html`: nuevo tab y panel `#panel-nuevo`.
- **Nuevo modal:** Añadir en `index.html` un `div.modal-overlay` con `id` único; abrirlo con `openModal('id')` y cerrar con `closeModals()`.
- **Migración de datos:** Subir `_version` en `defaultData()` y en `loadData()` añadir la lógica que transforme datos antiguos y rellene campos nuevos (como con `dateStarted`/`dateFinished` en libros).
- **Nuevo asset para offline:** Añadir la ruta en el array `ASSETS` de `service-worker.js` y actualizar `CACHE_NAME` si quieres forzar actualización de cache.

---

## 12. Instalación y uso local

1. **Abrir directamente:** Abrir `index.html` en el navegador (algunas funciones con módulos ES pueden requerir servidor).
2. **Servidor local:** Por ejemplo `npx serve .` o `python -m http.server` en la raíz del proyecto.
3. **PWA:** Tras cargar la app, usar “Instalar” desde el banner o “Agregar a pantalla de inicio” en el navegador.
4. **Ver cambios tras editar código:** Recarga forzada (Ctrl+Shift+R) o en DevTools → Application → Service Workers → Unregister.

---

## 13. Referencias a otros documentos

- **docs/README.md** — Descripción breve, árbol del proyecto, instalación, sync, módulos y estructura de datos resumida.
- **docs/ARCHITECTURE.md** — Decisiones de arquitectura y convenciones.
- **docs/BIG_PICTURE_ARCHITECTURE.md** — Diagramas de capas, flujo de datos, PWA, C4 y extensión del sistema.

---

## 14. Cambios realizados (resumen)

| Área | Cambio |
|------|--------|
| **Lectura 2026** | Libros con `dateStarted` / `dateFinished`; migración en store; modal libro con fechas; filtro por mes/año (todos / iniciados en / finalizados en); `getFilteredBooks()`, `ensureBookFilterYears()`. |
| **Hilos X** | `xCalendar` enero–diciembre, 3 fechas por mes; `defaultXCalendar()` y migración en store; secciones por mes colapsables; scroll en `.x-month-days`; textos Ene–Dic en index. |
| **Cursos** | Scroll vertical por escuela (`.course-escuela-list` en components.css). |
| **Mes – Progreso** | `renderMonthProgress()` con datos reales en las 4 tarjetas: proyectos, lectura, cursos, hilos X. |
| **Hoy** | `renderUpcomingDeadlines()`: tareas, cursos (deadline parseado), próximos hilos X; franja semana con día seleccionable (`selectedWeekDay`) y resumen del día; CSS `.day-pill.selected`. |
| **Proyectos** | Modal unificado crear/editar (`proyectoEditIndex`); botón Editar ✏️ en cada tarjeta. |
| **Registrar Avance** | Guardado correcto: solo `push` a `logs` (no reemplazar); normalización de `proyectos[].logs` en store; "✅ Avance registrado" solo al éxito; lista completa de avances con scroll. |
| **Editar actualización** | Modal `editLogModal`; `openEditLog(projIndex, logIndex)`, `saveEditLog()`; botón ✏️ en cada fila de log; `window.saveEditLog` en app.js. |
| **PWA / Instalar** | `updateInstallUI()`, `isPWAStandalone()`; `#installPWAWrap` en Ajustes; detección ya instalada / botón Instalar / instrucciones Android–iOS–PC y nota HTTPS; llamada a `updateInstallUI()` en carga y al abrir tab Ajustes. |
| **Service Worker** | `CACHE_NAME`: `mi-espacio-v6` y ajuste de estrategia network-first para documentos (para ver cambios nuevos en deploys) y stale-while-revalidate para estáticos. |
| **CSS** | `appearance: none` (estándar) junto a `-webkit-appearance: none` en inputs/select; ajustes responsive para tarjetas de cursos/libros/hilos/series. |
| **Series** | Nuevo módulo `series.js`, estructura `DATA.media`, panel de Series con filtros, campo de origen y modales tipo Cursos. |

---

*Documentación generada para el proyecto Nexus-dashboard (Mi Espacio Personal). Última actualización: marzo 2026.*
