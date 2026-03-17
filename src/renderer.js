// renderer.js — JupyLite

// ══════════════════════════════════════════════════════════
// ICON — load via IPC so it works in both dev and packaged
// ══════════════════════════════════════════════════════════
(async function loadIcon() {
  try {
    const dataUri = await window.electronAPI.getAppIcon();
    if (!dataUri) return;
    // Inject into all img tags that reference the icon
    document.querySelectorAll('img[src*="JupyLite"]').forEach(img => {
      img.src = dataUri;
    });
    // Store globally for dynamically created elements
    window._appIconUri = dataUri;
  } catch(e) {}
})();

// ══════════════════════════════════════════════════════════
// SIDEBAR RESIZE
// ══════════════════════════════════════════════════════════
const sidebar  = document.getElementById('sidebar');
const resizer  = document.getElementById('resizer');
let resizing = false, resizeStartX = 0, resizeStartW = 0;

const savedW = parseInt(localStorage.getItem('jl-sw') || '0');
if (savedW >= 140 && savedW <= 480) sidebar.style.width = savedW + 'px';

resizer.addEventListener('mousedown', e => {
  resizing = true; resizeStartX = e.clientX; resizeStartW = sidebar.offsetWidth;
  resizer.classList.add('drag');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if (!resizing) return;
  sidebar.style.width = Math.min(480, Math.max(140, resizeStartW + e.clientX - resizeStartX)) + 'px';
});
document.addEventListener('mouseup', () => {
  if (!resizing) return;
  resizing = false;
  resizer.classList.remove('drag');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  localStorage.setItem('jl-sw', sidebar.offsetWidth);
});

// ══════════════════════════════════════════════════════════
// FONT SETTINGS
// ══════════════════════════════════════════════════════════
const DF = { af:'DM Sans', cf:'JetBrains Mono', as:14, cs:13, us:13 };
let FS = {
  af: localStorage.getItem('jl-af') || DF.af,
  cf: localStorage.getItem('jl-cf') || DF.cf,
  as: parseInt(localStorage.getItem('jl-as')) || DF.as,
  cs: parseInt(localStorage.getItem('jl-cs')) || DF.cs,
  us: parseInt(localStorage.getItem('jl-us')) || DF.us
};

function applyFS() {
  const r = document.documentElement.style;
  r.setProperty('--afs', FS.as + 'px');
  r.setProperty('--cfs', FS.cs + 'px');
  r.setProperty('--ufs', FS.us + 'px');
  r.setProperty('--aff', `'${FS.af}',system-ui,sans-serif`);
  r.setProperty('--cff', `'${FS.cf}','Courier New',monospace`);
}
function saveFS() {
  localStorage.setItem('jl-af', FS.af); localStorage.setItem('jl-cf', FS.cf);
  localStorage.setItem('jl-as', FS.as); localStorage.setItem('jl-cs', FS.cs);
  localStorage.setItem('jl-us', FS.us);
}
applyFS();

// Font modal
const fontBackdrop = document.getElementById('font-backdrop');

async function openFontModal() {
  const fonts = await window.electronAPI.getFonts();
  fill('sel-app-fam', fonts, FS.af);
  fill('sel-code-fam', fonts, FS.cf);
  document.getElementById('val-app').textContent  = FS.as;
  document.getElementById('val-code').textContent = FS.cs;
  document.getElementById('val-ui').textContent   = FS.us;
  updatePrev();
  fontBackdrop.style.display = 'flex';
}

function fill(id, fonts, sel) {
  const el = document.getElementById(id); el.innerHTML = '';
  fonts.forEach(f => { const o = document.createElement('option'); o.value = o.textContent = f; if (f===sel) o.selected=true; el.appendChild(o); });
}
function updatePrev() {
  document.getElementById('prev-app').style.fontFamily  = `'${document.getElementById('sel-app-fam').value}',system-ui`;
  document.getElementById('prev-code').style.fontFamily = `'${document.getElementById('sel-code-fam').value}',monospace`;
}
document.getElementById('sel-app-fam').addEventListener('change',  updatePrev);
document.getElementById('sel-code-fam').addEventListener('change', updatePrev);

document.querySelectorAll('.fm-sz').forEach(b => {
  b.addEventListener('click', () => {
    const t = b.dataset.t, d = parseInt(b.dataset.d);
    const k = t==='app'?'as':t==='code'?'cs':'us';
    FS[k] = Math.min(32, Math.max(8, FS[k]+d));
    document.getElementById(`val-${t}`).textContent = FS[k];
  });
});
document.querySelectorAll('.fm-rst').forEach(b => {
  b.addEventListener('click', () => {
    const t = b.dataset.t, k = t==='app'?'as':t==='code'?'cs':'us', dv = t==='app'?DF.as:t==='code'?DF.cs:DF.us;
    FS[k] = dv; document.getElementById(`val-${t}`).textContent = dv;
  });
});
document.getElementById('fm-x').addEventListener('click', () => fontBackdrop.style.display='none');
fontBackdrop.addEventListener('click', e => { if (e.target===fontBackdrop) fontBackdrop.style.display='none'; });
document.getElementById('fm-reset-all').addEventListener('click', () => {
  FS = {...DF}; // reset all
  document.getElementById('sel-app-fam').value = DF.af;
  document.getElementById('sel-code-fam').value = DF.cf;
  document.getElementById('val-app').textContent  = DF.as;
  document.getElementById('val-code').textContent = DF.cs;
  document.getElementById('val-ui').textContent   = DF.us;
  updatePrev(); applyFS(); saveFS();
});
document.getElementById('fm-apply').addEventListener('click', () => {
  FS.af = document.getElementById('sel-app-fam').value;
  FS.cf = document.getElementById('sel-code-fam').value;
  applyFS(); saveFS();
  fontBackdrop.style.display = 'none';
});

window.electronAPI.onOpenFontSettings(() => openFontModal());
window.electronAPI.onAppFont(d  => { FS.as = d===0?DF.as:Math.min(32,Math.max(8,FS.as+d)); applyFS(); saveFS(); });
window.electronAPI.onCodeFont(d => { FS.cs = d===0?DF.cs:Math.min(32,Math.max(8,FS.cs+d)); applyFS(); saveFS(); });
window.electronAPI.onUiFont(d   => { FS.us = d===0?DF.us:Math.min(28,Math.max(8,FS.us+d)); applyFS(); saveFS(); });

// ══════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════
const HLJS = {
  'rose-pine':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
  'dark':     'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
  'light':    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
};
function setTheme(t) {
  document.body.className = 'theme-' + t;
  document.getElementById('hljs-theme').href = HLJS[t] || HLJS['rose-pine'];
  document.querySelectorAll('.tb').forEach(b => b.classList.toggle('active', b.dataset.theme===t));
  localStorage.setItem('jl-theme', t);
}
document.querySelectorAll('.tb').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
window.electronAPI.onSetTheme(t => setTheme(t));
setTheme(localStorage.getItem('jl-theme') || 'rose-pine');

// ══════════════════════════════════════════════════════════
// ZOOM — Ctrl+scroll
// ══════════════════════════════════════════════════════════
document.addEventListener('wheel', async e => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const z = await window.electronAPI.getZoom();
  window.electronAPI.setZoom(Math.min(Math.max(z + (e.deltaY<0?0.1:-0.1), 0.3), 3));
}, { passive: false });

// ══════════════════════════════════════════════════════════
// FIND IN NOTEBOOK
// ══════════════════════════════════════════════════════════
const findbar = document.getElementById('findbar');
const findinp = document.getElementById('find-inp');
const findcnt = document.getElementById('find-cnt');
let hits = [], hidx = -1;

function openFind() {
  findbar.style.display = 'flex';
  findinp.focus(); findinp.select();
  if (findinp.value.trim()) doFind(findinp.value);
}
function closeFind() {
  findbar.style.display = 'none';
  clearMarks(); hits = []; hidx = -1; findcnt.textContent = '';
}
function doFind(q) {
  clearMarks(); hits = []; hidx = -1;
  q = q.trim();
  if (!q) { findcnt.textContent = ''; return; }

  const page = document.querySelector('.page.on');
  if (!page) { findcnt.textContent = 'No notebook open'; return; }

  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

  // Walk all text nodes, skip only script/style/existing marks
  const SKIP = new Set(['SCRIPT','STYLE','MARK','INPUT','TEXTAREA']);
  const tNodes = [];
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue && node.nodeValue.trim()) tNodes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP.has(node.tagName)) return;
      node.childNodes.forEach(walk);
    }
  };
  walk(page);

  // Snapshot to avoid live-collection issues
  tNodes.forEach(tn => {
    const txt = tn.nodeValue;
    re.lastIndex = 0;
    if (!re.test(txt)) return;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = re.exec(txt)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const mark = document.createElement('mark');
      mark.className = 'hit'; mark.textContent = m[0];
      frag.appendChild(mark); hits.push(mark);
      last = m.index + m[0].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
  });

  if (hits.length) { hidx = 0; activateHit(); }
  showCount();
}

function activateHit() {
  hits.forEach((h, i) => h.classList.toggle('cur', i===hidx));
  if (hits[hidx]) hits[hidx].scrollIntoView({ behavior:'smooth', block:'center' });
  showCount();
}
function showCount() {
  findcnt.textContent = hits.length ? `${hidx+1} / ${hits.length}` : 'No results';
}
function clearMarks() {
  // Replace each mark with its text content
  document.querySelectorAll('mark.hit').forEach(m => {
    if (!m.parentNode) return;
    m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
  });
  // Normalize to merge adjacent text nodes
  document.querySelectorAll('.page').forEach(p => { try { p.normalize(); } catch(e){} });
}

findinp.addEventListener('input', () => doFind(findinp.value));
findinp.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); if (!hits.length) return; hidx = e.shiftKey ? (hidx-1+hits.length)%hits.length : (hidx+1)%hits.length; activateHit(); }
  if (e.key === 'Escape') closeFind();
});
document.getElementById('find-next').addEventListener('click', () => { if (hits.length) { hidx=(hidx+1)%hits.length; activateHit(); } });
document.getElementById('find-prev').addEventListener('click', () => { if (hits.length) { hidx=(hidx-1+hits.length)%hits.length; activateHit(); } });
document.getElementById('find-x').addEventListener('click', closeFind);

window.electronAPI.onToggleFind(() => { findbar.style.display === 'none' ? openFind() : closeFind(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='f') { e.preventDefault(); openFind(); }
  if (e.key==='Escape' && findbar.style.display!=='none') closeFind();
});

// ══════════════════════════════════════════════════════════
// FILE OPEN BUTTONS
// ══════════════════════════════════════════════════════════
document.getElementById('open-btn').addEventListener('click',    () => window.electronAPI.openFileDialog());
document.getElementById('welcome-open').addEventListener('click',() => window.electronAPI.openFileDialog());
document.getElementById('tab-add').addEventListener('click',     () => window.electronAPI.openFileDialog());

// ══════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════
let tabs = [], activeId = null, tabCtr = 0;

window.electronAPI.onNotebookLoaded(({notebook,filePath,fileName}) => openTab(notebook,filePath,fileName));
window.electronAPI.onCloseTab(() => { if (activeId!==null) closeTab(activeId); });

function openTab(nb, fp, fn) {
  const ex = tabs.find(t => t.fp===fp);
  if (ex) { activate(ex.id); return; }
  const id = ++tabCtr;
  tabs.push({id, fn, fp, toc:[]});

  // Tab element
  const tabEl = document.createElement('div');
  tabEl.className = 'tab'; tabEl.dataset.id = id;
  const title = document.createElement('span'); title.className = 'tab-title'; title.textContent = fn.replace(/\.ipynb$/,''); title.title = fn;
  const x = document.createElement('button'); x.className = 'tab-x'; x.textContent = '×';
  x.addEventListener('click', e => { e.stopPropagation(); closeTab(id); });
  tabEl.appendChild(title); tabEl.appendChild(x);
  tabEl.addEventListener('click', () => activate(id));
  document.getElementById('tablist').appendChild(tabEl);

  // Page element
  const page = document.createElement('div');
  page.className = 'page'; page.id = 'pg' + id;
  document.getElementById('content').appendChild(page);

  renderNotebook(nb, fn, page, id);

  document.getElementById('tabbar').style.display = 'flex';
  document.getElementById('welcome').style.display = 'none';
  activate(id);
}

function activate(id) {
  activeId = id;
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', +el.dataset.id===id));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id==='pg'+id));
  const tab = tabs.find(t=>t.id===id); if (tab) buildTOC(tab.toc);
  document.querySelector(`.tab[data-id="${id}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
  closeFind();
}

function closeTab(id) {
  const idx = tabs.findIndex(t=>t.id===id); if (idx===-1) return;
  tabs.splice(idx,1);
  document.querySelector(`.tab[data-id="${id}"]`)?.remove();
  document.getElementById('pg'+id)?.remove();
  if (!tabs.length) {
    document.getElementById('tabbar').style.display = 'none';
    document.getElementById('welcome').style.display = 'flex';
    activeId = null; buildTOC([]);
  } else activate(tabs[Math.min(idx,tabs.length-1)].id);
}

// ══════════════════════════════════════════════════════════
// RENDER NOTEBOOK
// ══════════════════════════════════════════════════════════
function renderNotebook(nb, fn, page, tabId) {
  const kernel = nb?.metadata?.kernelspec?.display_name || nb?.metadata?.kernelspec?.name || nb?.metadata?.language_info?.name || 'Notebook';
  const cells  = nb.cells || nb.worksheets?.[0]?.cells || [];

  const hdr = document.createElement('div'); hdr.className = 'nb-hdr';
  hdr.innerHTML = `<div><span class="nb-title">${esc(fn.replace(/\.ipynb$/,''))}</span><span class="nb-badge">${esc(kernel)}</span></div><span class="nb-stat">${cells.length} cells</span>`;
  page.appendChild(hdr);

  const wrap = document.createElement('div'); wrap.className = 'cells'; page.appendChild(wrap);
  const toc = []; let ci = 0;

  cells.forEach((cell, i) => {
    wrap.appendChild(renderCell(cell, i, ci));
    if (cell.cell_type==='code') ci++;
    if (cell.cell_type==='markdown') {
      src(cell).split('\n').forEach(line => {
        const m = line.match(/^(#{1,3})\s+(.*)/);
        if (m) toc.push({level:m[1].length, text:m[2].replace(/[*_`#]/g,''), cid:'c'+i});
      });
    }
  });

  const tab = tabs.find(t=>t.id===tabId); if (tab) tab.toc = toc;
  try { renderMathInElement(page, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false}); } catch(e){}
}

function renderCell(cell, i, ci) {
  if (cell.cell_type==='code')     return mkCodeCell(cell, i, ci);
  if (cell.cell_type==='markdown') return mkMdCell(cell, i);
  return mkRawCell(cell, i);
}
function src(c) { return Array.isArray(c.source) ? c.source.join('') : (c.source||''); }

function mkCodeCell(cell, i, ci) {
  const w = mk('div','cell'); w.id = 'c'+i;
  const s = src(cell), ec = cell.execution_count!=null?`[${cell.execution_count}]`:'[ ]';
  const lang = cell?.metadata?.vscode?.languageId || cell?.metadata?.language || 'python';

  const ir = mk('div','irow');
  const lbl = mk('div','lbl'); lbl.textContent = `In ${ec}:`;
  const ib = mk('div','ibody');
  const cb = mk('div','cblock');
  const pre = mk('pre'); const code = mk('code'); code.className = 'language-'+lang; code.textContent = s;
  pre.appendChild(code); hljs.highlightElement(code);
  const cp = mk('button','cp'); cp.textContent = 'copy';
  cp.onclick = () => navigator.clipboard.writeText(s).then(()=>{cp.textContent='copied!';cp.classList.add('ok');setTimeout(()=>{cp.textContent='copy';cp.classList.remove('ok');},2000);});
  cb.appendChild(pre); cb.appendChild(cp); ib.appendChild(cb); ir.appendChild(lbl); ir.appendChild(ib); w.appendChild(ir);

  (cell.outputs||[]).forEach(out => {
    const html = renderOut(out); if (!html) return;
    const or = mk('div','orow');
    const ol = mk('div','lbl out'); ol.textContent = out.output_type==='execute_result'?`Out ${ec}:`:'';
    const ob = mk('div','obody'); ob.innerHTML = html;
    or.appendChild(ol); or.appendChild(ob); w.appendChild(or);
  });
  return w;
}

function renderOut(out) {
  const t = out.output_type;
  if (t==='stream') { const cls=out.name==='stderr'?'err':''; const tx=Array.isArray(out.text)?out.text.join(''):(out.text||''); return `<div class="out-blk ${cls}">${esc(tx)}</div>`; }
  if (t==='error')  { const tb=Array.isArray(out.traceback)?out.traceback.join('\n'):(out.traceback||''); return `<div class="out-blk err">${esc(noAnsi(tb))}</div>`; }
  if (t==='display_data'||t==='execute_result') {
    const d=out.data||{};
    if (d['image/png'])       return `<div class="out-blk rich"><img src="data:image/png;base64,${d['image/png']}" alt=""/></div>`;
    if (d['image/jpeg'])      return `<div class="out-blk rich"><img src="data:image/jpeg;base64,${d['image/jpeg']}" alt=""/></div>`;
    if (d['image/svg+xml'])   { const s=Array.isArray(d['image/svg+xml'])?d['image/svg+xml'].join(''):d['image/svg+xml']; return `<div class="out-blk rich">${s}</div>`; }
    if (d['text/html'])       { const h=Array.isArray(d['text/html'])?d['text/html'].join(''):d['text/html']; return `<div class="out-blk rich">${noScript(h)}</div>`; }
    if (d['text/latex'])      { const l=Array.isArray(d['text/latex'])?d['text/latex'].join(''):d['text/latex']; return `<div class="out-blk rich">${esc(l)}</div>`; }
    if (d['text/plain'])      { const p=Array.isArray(d['text/plain'])?d['text/plain'].join(''):d['text/plain']; return `<div class="out-blk">${esc(p)}</div>`; }
  }
  return '';
}

function mkMdCell(cell, i) {
  const w = mk('div','cell cell-md'); w.id = 'c'+i;
  const row = mk('div','irow');
  const lbl = mk('div','lbl md');
  const ib = mk('div','ibody');
  const mdiv = mk('div','md'); mdiv.innerHTML = marked.parse(src(cell));
  mdiv.querySelectorAll('pre code').forEach(el=>hljs.highlightElement(el));
  mdiv.querySelectorAll('a[href^="http"]').forEach(a=>{ a.addEventListener('click',e=>{e.preventDefault();window.electronAPI.openExternal(a.href);}); });
  ib.appendChild(mdiv); row.appendChild(lbl); row.appendChild(ib); w.appendChild(row);
  return w;
}

function mkRawCell(cell, i) {
  const w = mk('div','cell cell-raw'); w.id = 'c'+i;
  const row = mk('div','irow');
  const lbl = mk('div','lbl');
  const ib = mk('div','ibody');
  const cb = mk('div','cblock');
  const pre = mk('pre'); const code = mk('code'); code.textContent = src(cell);
  pre.appendChild(code); cb.appendChild(pre); ib.appendChild(cb); row.appendChild(lbl); row.appendChild(ib); w.appendChild(row);
  return w;
}

// ══════════════════════════════════════════════════════════
// TOC
// ══════════════════════════════════════════════════════════
function buildTOC(toc) {
  const nav = document.getElementById('toc'); nav.innerHTML = '';
  if (!toc||!toc.length) { nav.innerHTML='<p class="toc-empty">No headings found</p>'; return; }
  const sec = mk('div','toc-sec'); sec.textContent='Contents'; nav.appendChild(sec);
  toc.forEach(item => {
    const b = mk('button','toc-btn h'+item.level); b.textContent=b.title=item.text;
    b.addEventListener('click', () => {
      document.querySelector('.page.on')?.querySelector('#'+item.cid)?.scrollIntoView({behavior:'smooth',block:'start'});
      nav.querySelectorAll('.toc-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    });
    nav.appendChild(b);
  });
}

// ══════════════════════════════════════════════════════════
// DRAG & DROP
// ══════════════════════════════════════════════════════════
document.addEventListener('dragover',  e => { e.preventDefault(); document.body.classList.add('drop'); });
document.addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('drop'); });
document.addEventListener('drop', async e => {
  e.preventDefault(); document.body.classList.remove('drop');
  for (const f of Array.from(e.dataTransfer.files).filter(f=>f.name.endsWith('.ipynb'))) {
    try { openTab(JSON.parse(await f.text()), f.path||f.name, f.name); } catch { alert('Could not parse: '+f.name); }
  }
});

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
function mk(tag, cls) { const el=document.createElement(tag); if(cls) el.className=cls; return el; }
function esc(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function noScript(h){ return h.replace(/<script[\s\S]*?<\/script>/gi,''); }
function noAnsi(s)  { return s.replace(/\x1B\[[0-9;]*[mGKHF]/g,''); }

// ══════════════════════════════════════════════════════════
// SIGNAL MAIN — renderer is fully ready to receive notebooks
// Must be LAST so all listeners above are registered first
// ══════════════════════════════════════════════════════════
window.electronAPI.rendererReady();
