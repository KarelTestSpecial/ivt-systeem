const TABLES = [
  {
    id: 'gunst',
    label: 'Gunstregeling',
    desc: 'Na ≥24 maanden inactiviteit: 3 volle gunst-kalenderjaren. Arbeidsinkomen tot €27.060/jaar is 100% vrijgesteld → de IVT blijft volledig (daarboven breekt de gunst).',
    file: 'data/ivt_schema_gunst.tsv'
  },
  {
    id: 'standaard',
    label: 'Standaardregeling',
    desc: 'Vanaf maand 25. Afbouw op netto belastbaar arbeidsinkomen/jaar (50% / 75% / 100% schijven).',
    file: 'data/ivt_schema_standaard.tsv'
  },
  {
    id: 'tijdlijn-met',
    label: 'Tijdlijn (met gunst)',
    desc: 'Overzicht J−2 tot J+3: 3 gunstjaren (J0–J+2) + het eerste N−2-afrekenjaar (J+3). Toont waar de "double whammy" kan toeslaan.',
    file: 'data/ivt_tijdlijn_met_gunst.tsv'
  },
  {
    id: 'tijdlijn-zonder',
    label: 'Tijdlijn (zonder gunst)',
    desc: 'Overzicht J−2 tot J+2 zonder gunstregeling. Toont de pure N−2-werking.',
    file: 'data/ivt_tijdlijn_zonder_gunst.tsv'
  }
];

let currentData = [];
let currentHeader = [];

function parseTSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.length > 0);
  return lines.map(l => l.split('\t'));
}

function renderTable(rows) {
  if (!rows.length) return '<p class="muted">Geen data.</p>';
  const [header, ...body] = rows;
  currentHeader = header;
  const thead = '<thead><tr>' + header.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead>';
  const tbody = '<tbody>' + body.map((r, i) => {
    const cells = header.map((_, ci) => {
      const v = (r[ci] ?? '').trim();
      const isNum = /^[\d<>=€.,\- ]+$/.test(v) && v.length > 0;
      return `<td class="${isNum ? 'cell-num' : ''}">${escapeHtml(v)}</td>`;
    }).join('');
    return `<tr data-raw="${escapeHtml(r.join(' ').toLowerCase())}">${cells}</tr>`;
  }).join('') + '</tbody>';
  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function loadTable(idx) {
  const t = TABLES[idx];
  const area = document.getElementById('table-area');
  area.innerHTML = '<p class="muted">Laden…</p>';
  try {
    const res = await fetch(t.file, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const rows = parseTSV(text);
    currentData = rows;
    area.innerHTML = `
      <p class="muted">${escapeHtml(t.desc)}</p>
      ${renderTable(rows)}
    `;
    updateRowCount();
    document.getElementById('filter').value = '';
  } catch (e) {
    area.innerHTML = `<p>Kon <code>${escapeHtml(t.file)}</code> niet laden: ${escapeHtml(e.message)}. Als je dit bestand lokaal opent via file://, gebruik dan een server (bijv. <code>python3 -m http.server</code>) of bekijk het via GitHub Pages.</p>`;
  }
}

function updateRowCount() {
  const total = currentData.length > 0 ? currentData.length - 1 : 0;
  const visible = document.querySelectorAll('#table-area tbody tr:not(.hidden)').length;
  document.getElementById('rowcount').textContent = `${visible} / ${total} rijen`;
}

function applyFilter(q) {
  const needle = q.trim().toLowerCase();
  const rows = document.querySelectorAll('#table-area tbody tr');
  rows.forEach(tr => {
    const raw = tr.getAttribute('data-raw') || '';
    tr.classList.toggle('hidden', needle && !raw.includes(needle));
  });
  updateRowCount();
}

function buildTabs() {
  const nav = document.getElementById('tabs');
  nav.innerHTML = TABLES.map((t, i) =>
    `<button class="tab-btn${i === 0 ? ' active' : ''}" data-idx="${i}">${escapeHtml(t.label)}</button>`
  ).join('');
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTable(parseInt(btn.dataset.idx, 10));
  });
}

document.getElementById('filter').addEventListener('input', e => applyFilter(e.target.value));

buildTabs();
loadTable(0);
