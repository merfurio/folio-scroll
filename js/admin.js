/* Dashboard: edita content.json (textos, cores, vídeos, imagens, projetos).
   Modo local (sem Firebase): rascunho no browser + exportar content.json.
   Modo Firebase: login Google e publicar no Firestore. Upload de ficheiros: Cloudinary. */

const DRAFT_KEY = 'folio-draft';
const FB = window.FIREBASE_CONFIG;
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach((c) => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
  return n;
};
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => {
  const ks = p.split('.'); const last = ks.pop();
  ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v;
};
const isImg = (s) => /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(s || '');

let toastT;
function toast(msg, err = false) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toastT); toastT = setTimeout(() => (t.className = 'toast'), 2600);
}

/* ---------- esquema do editor ---------- */
const F = {
  text: (path, label, extra = {}) => ({ type: 'text', path, label, ...extra }),
  area: (path, label, extra = {}) => ({ type: 'area', path, label, ...extra }),
  color: (path, label, extra = {}) => ({ type: 'color', path, label, ...extra }),
  media: (path, label, extra = {}) => ({ type: 'media', path, label, ...extra }),
};
const SECTIONS = [
  { id: 'geral', label: 'Geral', fields: [
    F.text('site.name', 'Nome'),
    F.text('site.role', 'Profissão (título da página)'),
    F.area('site.description', 'Descrição (Google / partilhas)'),
    F.text('site.email', 'Email de contacto'),
    { type: 'list', path: 'site.socials', label: 'Redes sociais', itemLabel: (i) => i.label || 'Rede', add: { label: '', url: '' }, fields: [F.text('label', 'Nome'), F.text('url', 'Link (https://…)')] },
  ] },
  { id: 'cores', label: 'Cores', fields: [
    F.color('theme.bg', 'Fundo'),
    F.color('theme.fg', 'Texto e blocos escuros'),
    F.color('theme.accent', 'Cor de destaque', { hint: 'Faixa do marquee, barra de progresso e hover do contacto.' }),
  ] },
  { id: 'hero', label: 'Início', fields: [
    F.text('hero.line1', 'Título — linha 1'),
    F.text('hero.line2', 'Título — linha 2'),
    F.area('hero.sub', 'Frase por baixo do título'),
    F.media('hero.media', 'Showreel (vídeo ou foto)'),
  ] },
  { id: 'projetos', label: 'Projetos', fields: [
    F.text('work.title', 'Título da secção'),
    { type: 'list', path: 'projects', label: 'Projetos', itemLabel: (i) => i.title || 'Projeto', collapsed: true,
      add: { title: 'Novo projeto', type: '', client: '', year: String(new Date().getFullYear()), services: '', length: '', cover: '', text: '', gallery: [] },
      fields: [
        F.text('title', 'Título'), F.text('type', 'Tipo (ex: Filme institucional)'),
        F.text('client', 'Cliente'), F.text('year', 'Ano'), F.text('services', 'Serviços'), F.text('length', 'Duração'),
        F.media('cover', 'Capa (vídeo ou foto)'), F.area('text', 'Descrição'),
        { type: 'medialist', path: 'gallery', label: 'Galeria (vídeos e fotos)' },
      ] },
  ] },
  { id: 'sobre', label: 'Sobre', fields: [
    F.text('ethos.title', 'Título da secção'),
    { type: 'list', path: 'ethos.items', label: 'Textos (passam um a um com o scroll)', itemLabel: (i) => i.label || 'Texto', add: { label: '', text: '' },
      fields: [F.text('label', 'Nome no índice'), F.area('text', 'Texto')] },
  ] },
  { id: 'servicos', label: 'Serviços', fields: [
    F.text('services.title', 'Título da secção'),
    F.text('marquee', 'Faixa em movimento', { hint: 'Texto que repete na faixa colorida.' }),
    { type: 'list', path: 'services.items', label: 'Serviços', itemLabel: (i) => i.title || 'Serviço', add: { title: '', desc: '' },
      fields: [F.text('title', 'Nome'), F.text('desc', 'Descrição curta')] },
  ] },
  { id: 'contacto', label: 'Contacto', fields: [
    F.text('contact.kicker', 'Pergunta'), F.text('contact.line1', 'Texto grande — linha 1'), F.text('contact.line2', 'Texto grande — linha 2'),
  ] },
];

/* ---------- estado ---------- */
let content = null;
let published = null;
let section = SECTIONS[0].id;
let fb = null; // { user, publish, google, logout, isAdmin }
let dirty = false;

async function loadPublished() {
  if (FB) {
    try {
      const r = await fetch(`https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents/site/content`, { cache: 'no-cache' });
      if (r.ok) return JSON.parse((await r.json()).fields.json.stringValue);
    } catch (e) { /* cai para content.json */ }
  }
  return (await fetch('content.json', { cache: 'no-cache' })).json();
}

/* ---------- controlos ---------- */
function onChange() {
  dirty = true;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); } catch (e) { toast('Rascunho demasiado grande para guardar', true); }
  updateState();
  schedulePreview();
}

function fieldEl(spec, obj, rerender) {
  const base = spec.path;
  const get = () => getPath(obj, base);
  const set = (v) => { setPath(obj, base, v); onChange(); };
  const hint = spec.hint ? el('small', {}, spec.hint) : null;

  if (spec.type === 'text') {
    return el('label', { class: 'f' }, el('span', {}, spec.label), el('input', { type: 'text', value: get() ?? '', oninput: (e) => set(e.target.value) }), hint);
  }
  if (spec.type === 'area') {
    const ta = el('textarea', { oninput: (e) => set(e.target.value) }); ta.value = get() ?? '';
    return el('label', { class: 'f' }, el('span', {}, spec.label), ta, hint);
  }
  if (spec.type === 'color') {
    const val = get() || '#000000';
    const pick = el('input', { type: 'color', value: val });
    const txt = el('input', { type: 'text', value: val });
    pick.addEventListener('input', () => { txt.value = pick.value; set(pick.value); });
    txt.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(txt.value)) { pick.value = txt.value; set(txt.value); } });
    return el('div', { class: 'f' }, el('span', {}, spec.label), el('div', { class: 'color' }, pick, txt), hint);
  }
  if (spec.type === 'media') return mediaEl(spec.label, get(), set, hint);
  if (spec.type === 'medialist') {
    const arr = get() || (setPath(obj, base, []), get());
    const wrap = el('div', { class: 'f' }, el('span', {}, spec.label));
    arr.forEach((src, i) => {
      const row = el('div', { class: 'item' });
      const body = mediaEl(`Ficheiro ${i + 1}`, src, (v) => { arr[i] = v; onChange(); });
      const ctl = el('div', { style: 'display:flex;gap:6px;padding:0 14px 12px' },
        el('button', { class: 'icon', title: 'Subir', onclick: () => { if (i) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; onChange(); rerender(); } } }, '↑'),
        el('button', { class: 'icon', title: 'Descer', onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; onChange(); rerender(); } } }, '↓'),
        el('button', { class: 'icon danger', title: 'Remover', onclick: () => { arr.splice(i, 1); onChange(); rerender(); } }, '×'));
      row.append(el('div', { class: 'item__body' }, body), ctl);
      wrap.append(row);
    });
    wrap.append(el('button', { class: 'add', onclick: () => { arr.push(''); onChange(); rerender(); } }, '+ Adicionar à galeria'));
    return wrap;
  }
  if (spec.type === 'list') {
    const arr = get() || (setPath(obj, base, []), get());
    const wrap = el('div', { class: 'f' }, el('span', {}, spec.label));
    arr.forEach((it, i) => {
      const item = el('div', { class: 'item' + (spec.collapsed ? ' closed' : '') });
      const title = el('b', {}, spec.itemLabel(it));
      const head = el('div', { class: 'item__head', onclick: (e) => { if (!e.target.closest('.icon')) item.classList.toggle('closed'); } },
        el('span', { class: 'n' }, String(i + 1).padStart(2, '0')), title,
        el('button', { class: 'icon', title: 'Subir', onclick: () => { if (i) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; onChange(); rerender(); } } }, '↑'),
        el('button', { class: 'icon', title: 'Descer', onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; onChange(); rerender(); } } }, '↓'),
        el('button', { class: 'icon danger', title: 'Remover', onclick: () => { if (confirm('Remover este item?')) { arr.splice(i, 1); onChange(); rerender(); } } }, '×'));
      const body = el('div', { class: 'item__body' });
      spec.fields.forEach((f) => {
        const sub = fieldEl(f, it, rerender);
        sub.addEventListener('input', () => { title.textContent = spec.itemLabel(it); });
        body.append(sub);
      });
      item.append(head, body);
      wrap.append(item);
    });
    wrap.append(el('button', { class: 'add', onclick: () => { arr.push(structuredClone(spec.add)); onChange(); rerender(); } }, '+ Adicionar'));
    return wrap;
  }
  return el('div');
}

function mediaEl(label, value, set, hint) {
  const thumb = el('div', { class: 'media__thumb' });
  const paintThumb = (src) => {
    thumb.replaceChildren();
    if (!src) return;
    thumb.append(isImg(src) ? el('img', { src }) : el('video', { src, muted: true, playsinline: true, preload: 'metadata' }));
  };
  paintThumb(value);
  const input = el('input', { type: 'text', value: value ?? '', placeholder: 'media/ficheiro.mp4 ou https://…',
    oninput: (e) => { set(e.target.value); paintThumb(e.target.value); } });
  const prog = el('div', { class: 'media__prog', hidden: true }, el('i'));
  const file = el('input', { type: 'file', accept: 'video/mp4,video/webm,image/*', hidden: true });
  const btn = el('button', { class: 'btn btn--sm', type: 'button', onclick: () => {
    if (!CLD) return toast('Upload não configurado (Cloudinary). Em alternativa copia o ficheiro para media/ e escreve o caminho.', true);
    if (!canUpload()) return toast('Entra primeiro para carregar ficheiros', true);
    file.click();
  } }, 'Carregar');
  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    try {
      prog.hidden = false;
      const url = await upload(f, (p) => (prog.firstChild.style.width = p + '%'));
      input.value = url; set(url); paintThumb(url); toast('Ficheiro carregado');
    } catch (e) { console.error(e); toast('Falha ao carregar: ' + (e.code || e.message), true); }
    prog.hidden = true; prog.firstChild.style.width = '0'; file.value = '';
  });
  return el('div', { class: 'f' }, el('span', {}, label),
    el('div', { class: 'media' }, thumb, el('div', { class: 'media__body' }, el('div', { class: 'media__row' }, input, btn, file), prog)), hint);
}

/* ---------- render ---------- */
function renderSide() {
  const side = $('#side'); side.replaceChildren();
  SECTIONS.forEach((s) => side.append(el('button', { class: s.id === section ? 'on' : '', onclick: () => { section = s.id; renderSide(); renderEditor(); } }, s.label)));
}
function renderEditor() {
  const ed = $('#editor'); const top = ed.scrollTop;
  const s = SECTIONS.find((x) => x.id === section);
  ed.replaceChildren(el('h2', {}, s.label), ...s.fields.map((f) => fieldEl(f, content, renderEditor)));
  ed.scrollTop = top;
}
function updateState() {
  $('#state').textContent = dirty ? 'Alterações por publicar' : 'Tudo publicado';
}

/* ---------- pré-visualização ---------- */
let pvT;
function pvUrl() {
  const v = $('#pvPage').value;
  return v === 'home' ? 'index.html?preview=1' : `project.html?p=${v}&preview=1`;
}
function fillPvPages() {
  const sel = $('#pvPage'); const cur = sel.value || 'home'; sel.replaceChildren(el('option', { value: 'home' }, 'Página inicial'));
  (content.projects || []).forEach((p, i) => sel.append(el('option', { value: String(i + 1) }, `Projeto ${i + 1} — ${p.title || ''}`)));
  sel.value = [...sel.options].some((o) => o.value === cur) ? cur : 'home';
}
function schedulePreview() { clearTimeout(pvT); pvT = setTimeout(reloadPreview, 700); }
function reloadPreview() {
  const f = $('#pv');
  try { sessionStorage.setItem('folio-prev-y', String(f.contentWindow.scrollY || 0)); } catch (e) { /* ainda sem página */ }
  fillPvPages();
  const url = pvUrl();
  if (f.getAttribute('src') === url) f.contentWindow.location.reload(); else f.src = url;
}

/* ---------- upload (Cloudinary, sem Storage do Firebase) ---------- */
const CLD = window.CLOUDINARY;
const canUpload = () => !!CLD && (!FB || !!fb?.user);
function upload(file, onProg) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLD.uploadPreset);
    fd.append('folder', 'site');
    const x = new XMLHttpRequest();
    x.open('POST', `https://api.cloudinary.com/v1_1/${CLD.cloudName}/auto/upload`);
    x.upload.onprogress = (e) => e.lengthComputable && onProg(Math.round((e.loaded / e.total) * 100));
    x.onload = () => {
      let r = {}; try { r = JSON.parse(x.responseText); } catch (e) { /* resposta inválida */ }
      if (x.status !== 200 || !r.secure_url) return reject(new Error(r.error?.message || 'HTTP ' + x.status));
      // fotos: otimiza e limita a largura; vídeos ficam como enviados
      resolve(r.resource_type === 'image' ? r.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_2400,c_limit/') : r.secure_url);
    };
    x.onerror = () => reject(new Error('sem ligação'));
    x.send(fd);
  });
}

/* ---------- Firebase ---------- */
async function initFirebase() {
  const [{ initializeApp }, A, S] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = initializeApp(FB);
  const auth = A.getAuth(app), db = S.getFirestore(app);
  fb = {
    user: null,
    async publish(json) { await S.setDoc(S.doc(db, 'site', 'content'), { json: JSON.stringify(json), updatedAt: S.serverTimestamp() }); },
    google: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()),
    logout: () => A.signOut(auth),
    // só quem tem o documento admins/<email> pode editar (as regras também o impõem)
    async isAdmin(u) {
      if (!u?.email || !u.emailVerified) return false;
      try { return (await S.getDoc(S.doc(db, 'admins', u.email))).exists(); } catch (e) { return false; }
    },
  };
  return new Promise((resolve) => {
    A.onAuthStateChanged(auth, async (u) => {
      const ok = u ? await fb.isAdmin(u) : false;
      fb.user = ok ? u : null;
      $('#login').hidden = ok;
      $('#btnLogout').hidden = !ok;
      $('#btnGoogle').hidden = !!u && !ok;
      $('#btnLoginOut').hidden = !(u && !ok);
      $('#loginMsg').textContent = u && !ok
        ? `A conta ${u.email} não tem permissão para editar este site.`
        : 'Entra com a tua conta Google para editar o site.';
      setBadge();
      resolve();
    });
  });
}
function setBadge() {
  const b = $('#badge');
  if (!FB) { b.textContent = 'Modo local'; b.className = 'badge local'; $('#btnPublish').textContent = 'Descarregar content.json'; return; }
  b.textContent = fb?.user ? `Firebase · ${fb.user.email}` : 'Firebase · sem sessão';
  b.className = 'badge ' + (fb?.user ? 'ok' : '');
  $('#btnPublish').textContent = 'Publicar';
}

/* ---------- ações ---------- */
function download(name, text) {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });
  document.body.append(a); a.click(); a.remove();
}
async function publish() {
  if (!FB) { download('content.json', JSON.stringify(content, null, 2)); dirty = false; updateState(); return toast('content.json descarregado. Substitui o ficheiro na raiz do site.'); }
  if (!fb?.user) return toast('Entra primeiro', true);
  const b = $('#btnPublish'); b.disabled = true; b.textContent = 'A publicar…';
  try { await fb.publish(content); published = structuredClone(content); dirty = false; localStorage.removeItem(DRAFT_KEY); updateState(); toast('Publicado. O site já mostra as alterações.'); }
  catch (e) { console.error(e); toast('Falha ao publicar: ' + (e.code || e.message), true); }
  b.disabled = false; setBadge();
}

async function main() {
  published = await loadPublished();
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) { /* ignora */ }
  content = draft || structuredClone(published);
  dirty = !!draft;

  $('#btnPublish').addEventListener('click', publish);
  $('#btnExport').addEventListener('click', () => download('content.json', JSON.stringify(content, null, 2)));
  $('#btnReset').addEventListener('click', () => {
    if (!confirm('Descartar todas as alterações por publicar?')) return;
    localStorage.removeItem(DRAFT_KEY); content = structuredClone(published); dirty = false;
    renderEditor(); updateState(); reloadPreview(); toast('Rascunho descartado');
  });
  $('#btnImport').addEventListener('click', () => $('#fileImport').click());
  $('#fileImport').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); if (!j.site || !j.projects) throw new Error('formato inválido'); content = j; onChange(); renderEditor(); toast('Importado'); }
    catch (err) { toast('Ficheiro inválido: ' + err.message, true); }
    e.target.value = '';
  });
  $('#btnLogout').addEventListener('click', () => fb.logout());
  $('#btnGoogle').addEventListener('click', async () => {
    $('#loginErr').textContent = '';
    try { await fb.google(); }
    catch (err) { if (err.code !== 'auth/popup-closed-by-user') $('#loginErr').textContent = 'Não foi possível entrar: ' + (err.code || err.message); }
  });
  $('#btnLoginOut').addEventListener('click', () => fb.logout());
  $('#pvPage').addEventListener('change', reloadPreview);
  $('#pvReload').addEventListener('click', reloadPreview);
  document.querySelectorAll('[data-dev]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-dev]').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#previewPane').classList.toggle('mobile', b.dataset.dev === 'mobile');
  }));
  window.addEventListener('beforeunload', (e) => { if (dirty && FB) { e.preventDefault(); e.returnValue = ''; } });

  renderSide(); renderEditor(); updateState(); setBadge(); fillPvPages();
  $('#pv').src = pvUrl();
  if (FB) { $('#login').hidden = false; initFirebase().catch((e) => { console.error(e); toast('Não foi possível ligar ao Firebase', true); }); }
}
main();
