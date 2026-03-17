// ═══════════════════════════════════════════════════
// MODULE: PNL
// ═══════════════════════════════════════════════════
import { DATA, saveData } from '../app.js';

export function renderPnlGrid() {
  const c = document.getElementById('pnlGrid');
  if (!c) return;
  c.innerHTML = '';
  DATA.pnlTopics.forEach((topic, i) => {
    const done = DATA.pnlDone.includes(i);
    const current = DATA.pnlCurrent === i;
    const pill = document.createElement('div');
    pill.className = `topic-pill ${done ? 'done' : current ? 'current' : 'pending'}`;
    pill.textContent = `${done ? '✓ ' : current ? '▶ ' : ''}${topic}`;
    pill.onclick = () => togglePnlTopic(i);
    c.appendChild(pill);
  });
  const pct = Math.round(DATA.pnlDone.length / DATA.pnlTopics.length * 100);
  const bar = document.getElementById('pnlProgressBar');
  if (bar) bar.style.width = pct + '%';
  const lbl = document.getElementById('pnlProgressLabel');
  if (lbl) lbl.textContent = `${DATA.pnlDone.length} / ${DATA.pnlTopics.length} módulos completados (${pct}%)`;
}

function togglePnlTopic(i) {
  if (DATA.pnlDone.includes(i)) {
    DATA.pnlDone = DATA.pnlDone.filter(x => x !== i);
    if (DATA.pnlCurrent === i) DATA.pnlCurrent = i - 1;
  } else {
    DATA.pnlDone.push(i);
    DATA.pnlCurrent = Math.max(...DATA.pnlDone) + 1;
  }
  saveData(DATA);
  renderPnlGrid();
}

export function savePnlNote() {
  const sel = document.getElementById('pnlTopicSelect');
  const notes = document.getElementById('pnlNotes');
  if (!sel || !notes) return;
  DATA.pnlNotes[sel.value] = notes.value;
  saveData(DATA);
  import('../sync.js').then(m => m.showToast('📝 Nota guardada'));
}
window.savePnlNote = savePnlNote;
