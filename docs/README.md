# Mi Espacio Personal — Dashboard PWA

## Descripción
Dashboard personal progresivo (PWA) para gestión de vida personal: proyectos, lectura, cursos, PNL, diario y hilos X. Funciona offline y es instalable en móvil y escritorio.

## Arquitectura del Proyecto

```
mi-espacio/
├── index.html              # App shell principal
├── manifest.json           # PWA manifest (instalación)
├── service-worker.js       # Cache offline + sync
├── css/
│   ├── tokens.css          # Design tokens (colores, tipografía, espaciado)
│   ├── components.css      # Componentes reutilizables
│   └── layout.css          # Layout, grid, responsivo
├── js/
│   ├── app.js              # Entry point + router de tabs
│   ├── store.js            # Estado global + persistencia
│   ├── sync.js             # Exportar/importar JSON (sync entre dispositivos)
│   └── modules/
│       ├── hoy.js          # Vista: Hoy
│       ├── mes.js          # Vista: Mes + Calendario
│       ├── proyectos.js    # Vista: Proyectos
│       ├── cursos.js       # Vista: Cursos
│       ├── lectura.js      # Vista: Lectura
│       ├── pnl.js          # Vista: PNL / Diplomado
│       ├── xhilos.js       # Vista: Hilos X
│       └── diario.js       # Vista: Diario
├── icons/
│   └── icon.svg            # Ícono base PWA
└── docs/
    ├── README.md           # Este archivo
    └── ARCHITECTURE.md     # Decisiones de arquitectura
```

## Instalación / Uso

1. **Local**: Abrir `index.html` directamente en el navegador
2. **Servidor local**: `npx serve .` o `python -m http.server`
3. **Instalar en móvil**: Visitar la URL en Chrome/Safari → "Agregar a pantalla de inicio"
4. **Sync entre dispositivos**: Usar **Exportar datos** → copiar JSON → **Importar datos** en otro dispositivo

## Sync de Datos

El dashboard usa `localStorage` como base de datos primaria. Para sincronizar entre dispositivos:

1. En el dispositivo A: **Ajustes → Exportar datos** → descarga `backup-FECHA.json`
2. Transferir el archivo (WhatsApp, email, Drive, etc.)
3. En el dispositivo B: **Ajustes → Importar datos** → seleccionar el archivo

> **Nota**: Se puede automatizar vía Google Drive si en el futuro se quiere sync automático.

## Módulos

| Módulo | Descripción | Datos |
|--------|-------------|-------|
| Hoy | Vista diaria con stats, tareas y semana | `tasks`, `stats` |
| Mes | Calendario + resumen mensual | `tasks`, `diary`, `xDates` |
| Proyectos | Seguimiento de proyectos personales | `proyectos` |
| Cursos | Progreso de cursos y certificaciones | `courses` |
| Lectura | Lista de libros 2026, progreso | `books`, `booksGoal` |
| PNL | Diplomado: temas, notas, progreso | `pnlDone`, `pnlTopics` |
| Hilos X | Calendario de publicación + borradores | `xDates`, `xDrafts` |
| Diario | Registro diario con mood y etiquetas | `diary` |
| Series | Watchlist de series/películas (tipo, estado, origen) | `media` |

## Estructura de Datos

```json
{
  "tasks": [{ "id": 1, "name": "...", "cat": "proyecto", "prio": "alta", "date": "2026-03-04", "done": false }],
  "diary": [{ "id": 1, "date": "2026-03-04", "text": "...", "mood": "😊", "tags": ["reflexion"] }],
  "xDrafts": [{ "id": 1, "title": "...", "content": "...", "targetDate": "2026-03-07" }],
  "xDates": { "2026-03-07": true },
  "pnlDone": [0,1,2,3,4,5,6],
  "pnlCurrent": 7,
  "pnlNotes": { "0": "notas del tema..." },
  "pnlTopics": ["Introducción PNL", "..."],
  "courses": [{ "id": 1, "icon": "🇬🇧", "name": "...", "platform": "...", "deadline": "31 Dic 2026", "pct": 0 }],
  "books": [{ "id": 1, "emoji": "📕", "title": "...", "author": "...", "pct": 0, "done": false }],
  "media": [{ "id": 1, "icon": "🎬", "title": "...", "type": "series", "status": "no_iniciada", "source": "netflix", "notes": "" }],
  "booksGoal": 8,
  "proyectos": [{ "id": 1, "icon": "💻", "name": "...", "desc": "...", "stack": "...", "estado": "active", "pct": 0, "logs": [] }]
}
```

## PWA Features

- ✅ Instalable en Android/iOS/Desktop
- ✅ Funciona 100% offline (Service Worker cache)
- ✅ Ícono en pantalla de inicio
- ✅ Splash screen
- ✅ Sin barra del navegador al instalar

## Tecnologías

- **Vanilla JS ES6+** — Sin dependencias, cero frameworks
- **CSS Custom Properties** — Design tokens para theming consistente
- **Service Worker** — Cache-first strategy para offline
- **Web App Manifest** — Instalación PWA nativa
- **localStorage** — Persistencia local inmediata

## Guía de Contribución / Extensión

Para agregar un nuevo módulo:
1. Crear `js/modules/nuevo.js` con funciones `render()` e `init()`
2. Agregar tab en `index.html`
3. Importar en `app.js`
4. Definir estructura de datos en `store.js → defaultData()`
