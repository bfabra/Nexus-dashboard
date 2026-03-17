// ═══════════════════════════════════════════════════
// SYNC — Exportar / Importar datos entre dispositivos
// ═══════════════════════════════════════════════════

import { loadData, saveData } from './store.js';

/** Exporta los datos como archivo JSON descargable */
export function exportData() {
  const data = loadData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `mi-espacio-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Backup exportado correctamente');
}

/** Abre el selector de archivo para importar */
export function importData(onSuccess) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Validación básica
      if (!parsed.tasks || !parsed.diary || !parsed.proyectos) {
        throw new Error('Archivo inválido: no parece un backup de Mi Espacio');
      }
      saveData(parsed);
      showToast('✅ Datos importados correctamente');
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast('❌ Error al importar: ' + err.message);
    }
  };
  input.click();
}

/** Copia los datos al portapapeles como JSON */
export function copyDataToClipboard() {
  const data = loadData();
  const json = JSON.stringify(data);
  navigator.clipboard.writeText(json).then(() => {
    showToast('📋 Datos copiados al portapapeles');
  }).catch(() => {
    showToast('❌ No se pudo copiar. Intenta exportar como archivo.');
  });
}

/** Pega datos desde portapapeles */
export async function pasteDataFromClipboard(onSuccess) {
  try {
    const text = await navigator.clipboard.readText();
    const parsed = JSON.parse(text);
    if (!parsed.tasks || !parsed.diary) throw new Error('Contenido inválido');
    saveData(parsed);
    showToast('✅ Datos importados desde portapapeles');
    if (onSuccess) onSuccess();
  } catch (err) {
    showToast('❌ Error: ' + err.message);
  }
}

/** Borra TODOS los datos (con confirmación) */
export function resetAllData(onSuccess) {
  if (!confirm('⚠️ ¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) return;
  if (!confirm('¿Estás seguro? Se perderán todos tus registros, tareas y diario.')) return;
  localStorage.clear();
  showToast('🗑️ Datos eliminados');
  if (onSuccess) onSuccess();
}

/** Toast global */
export function showToast(msg, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
