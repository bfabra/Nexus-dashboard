# ARCHITECTURE.md — Mi Espacio Personal Dashboard

## Decisiones de arquitectura

### ¿Por qué Vanilla JS con ES Modules?

**Sin frameworks.** No hay React, Vue ni ningún framework.

**Razón principal**: El dashboard es una herramienta personal que debe funcionar offline, ser fácil de editar sin conocimientos avanzados, y tener cero dependencias de npm para no tener que actualizar nada.

Los ES Modules nativos del navegador (`import`/`export`) nos dan toda la modularidad que necesitamos sin bundle ni build step.

---

### Arquitectura de módulos

```
js/
├── app.js          ← Entry point. Importa todos los módulos. Registra el SW. Expone funciones globales.
├── store.js        ← Único responsable de leer/escribir localStorage. Define la estructura de datos.
├── sync.js         ← Exportar/importar JSON. Copiar/pegar portapapeles. Toast global.
└── modules/
    ├── hoy.js      ← Vista diaria: semana con día seleccionable, vencimientos (tareas, cursos, hilos X). renderHoy() orquesta todo.
    ├── mes.js      ← Calendario + Progreso (Mes) con datos reales (proyectos, lectura, cursos, hilos). viewYear/viewMonth locales.
    ├── proyectos.js← CRUD de proyectos (modal unificado crear/editar), logs de avance (solo push), edición de texto de cada log.
    ├── cursos.js   ← Render de cursos con sliders de progreso.
    ├── lectura.js  ← Libros con fechas inicio/fin, filtro por mes/año (iniciados/finalizados).
    ├── pnl.js      ← Grid de temas + notas por tema.
    ├── xhilos.js   ← Calendario de publicación por mes (Ene–Dic), secciones colapsables + scroll; borradores.
    ├── diario.js   ← CRUD de entradas + mood selector.
    └── series.js   ← Watchlist de series/películas (tipos + origen + estado).
```

**Regla de comunicación**: Los módulos nunca se importan entre sí. Todos leen/escriben a través de `DATA` y `saveData` exportados desde `app.js`.

---

### Flujo de datos

```
localStorage
    │
    ▼
store.js → loadData() → DATA (objeto global en app.js)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         hoy.js          proyectos.js    diario.js ...
         renderHoy()     renderP()       renderD()
              │               │               │
              └───────── saveData(DATA) ───────┘
                              │
                              ▼
                         store.js → localStorage
```

---

### PWA Strategy

**Service Worker**: Cache-first para todos los assets estáticos. Cuando no hay red, sirve desde caché. Cuando hay red, actualiza caché en background.

**Manifest**: `display: standalone` elimina la barra del navegador. `theme_color` colorea la barra de estado del sistema operativo.

**Install prompt**: Capturamos `beforeinstallprompt` para mostrar nuestro propio banner en lugar del browser default, dando control sobre cuándo y cómo aparece.

**Sección Ajustes — Instalar como App**: La UI se genera dinámicamente con `updateInstallUI()` (app.js). Se detecta si la app ya está instalada (`display-mode: standalone` o `navigator.standalone` en iOS); si hay `deferredPrompt` se muestra el botón "Instalar en este dispositivo"; si no (p. ej. Safari), se muestran instrucciones por dispositivo (Android, iPhone, PC) y se indica que en móvil hace falta servir por **HTTPS**. El contenedor `#installPWAWrap` se actualiza al cargar y al abrir el tab Ajustes.

---

### Sync de datos (sin servidor)

**No hay backend.** La sincronización es manual via JSON:

```
Exportar → archivo .json → WhatsApp/Drive/Email → Importar
```

**¿Por qué no IndexedDB?** localStorage es suficiente para los datos actuales (~50KB máximo esperado). La migración a IndexedDB es trivial si el volumen crece.

**¿Por qué no Firebase/Supabase?** Agrega complejidad, costos, y dependencia de red. El uso manual es un feature deliberado: el usuario controla sus datos.

---

### CSS Architecture

**3 archivos con responsabilidades claras:**

- `tokens.css`: Variables CSS. Todo el diseño se basa en estos tokens. Si cambias un token, cambia toda la UI.
- `components.css`: Clases reutilizables (cards, botones, badges, modales...). Sin media queries aquí.
- `layout.css`: Estructura de la app (header, nav, main, grids). Contiene todas las media queries.

**Convención de nombres**: BEM-lite. `.card`, `.card-title`, `.card-title-left`. Sin prefijos de módulo porque todos los componentes son globales.

---

### Patrones de código importantes

#### Render functions
Cada módulo exporta una función `render*()` que re-dibuja completamente su sección del DOM. Es simple y predecible. No hay diff/virtual DOM.

```js
export function renderProyectos() {
  const c = document.getElementById('proyectosList');
  c.innerHTML = ''; // Limpiar
  DATA.proyectos.forEach(p => { /* crear elementos */ });
}
```

#### Event delegation via data attributes
En lugar de `onclick="fn(${i})"`, usamos:
```js
div.querySelector('[data-action="delete"]').onclick = () => deleteProyecto(i);
```
Esto evita problemas con XSS y es más limpio.

#### Modales bottom sheet en mobile
Los modales usan `align-items: flex-end` en mobile, aparecen desde abajo como sheets nativos. En desktop (`>600px`) se centran como modales tradicionales.

---

### Decisiones que NO se tomaron (y por qué)

| No se usó | Por qué |
|-----------|---------|
| React/Vue | Overkill. Sin build step, sin node_modules. |
| TypeScript | Complejidad innecesaria para proyecto personal. |
| IndexedDB | localStorage es suficiente y más simple. |
| Firebase | Sin dependencia de servicios externos. |
| Tailwind | CSS custom es más controlable y legible. |
| Bundler (Vite/Webpack) | ES modules nativos funcionan directamente. |

---

### Cómo extender el proyecto

**Agregar un nuevo módulo:**

1. Crear `js/modules/nuevo.js`
2. Exportar `renderNuevo()`
3. Definir estructura de datos en `store.js → defaultData()`
4. Importar en `app.js` y llamar desde `renderAll()`
5. Agregar tab en `index.html`
6. Agregar panel HTML en `index.html`

**Agregar sync automático (futuro):**
- Opción A: Google Drive API (gratis, OAuth2)
- Opción B: Supabase free tier (PostgreSQL + auth)
- Opción C: GitHub Gist API (simple, gratis)

Cualquiera de estas opciones solo requiere modificar `sync.js`.

---

### Cambios recientes (resumen)

| Área | Decisión / implementación |
|------|---------------------------|
| **PWA** | `updateInstallUI()` + `isPWAStandalone()`; `#installPWAWrap` en Ajustes; instrucciones por dispositivo e indicación HTTPS para instalación en móvil. Service Worker: `CACHE_NAME` `mi-espacio-v3`. |
| **Store** | Migraciones: `xCalendar` enero–diciembre (3 fechas/mes), libros con `dateStarted`/`dateFinished`, normalización de `proyectos[].logs` a array. |
| **Proyectos** | Modal unificado crear/editar; logs solo con `push` (no reemplazar); modal `editLogModal` para editar texto de un avance. |
| **Hoy** | `renderUpcomingDeadlines()` (tareas, cursos, hilos X); franja semana con día seleccionable y resumen del día. |
| **Mes** | `renderMonthProgress()` con datos reales en 4 tarjetas. |
| **Cursos** | Scroll vertical por escuela (`.course-escuela-list`). |
| **CSS** | `appearance: none` estándar junto a `-webkit-appearance: none` en controles. |
