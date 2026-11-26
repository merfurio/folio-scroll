/* Conteúdo do site: carrega (Firestore → content.json), aplica o tema e renderiza.
   Ordem de prioridade:
   1. ?preview=1  → rascunho do dashboard (localStorage)
   2. Firebase configurado → documento site/content (leitura pública via REST)
   3. content.json (ficheiro estático) */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isImgSrc = (s) => /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(s || '');

function mediaHTML(src, { eager = false, alt = '' } = {}) {
  if (!src) return '';
  return isImgSrc(src)
    ? `<img class="vid is-ready" data-img src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}">`
    : `<video class="vid" data-src="${esc(src)}" muted loop playsinline preload="none"></video>`;
}
/* fotos não passam pelo initVideos: tiram o placeholder quando carregam */
function markImages(root = document) {
  root.querySelectorAll('img[data-img]').forEach((im) => {
    const done = () => (im.closest('[data-label]') || im.parentElement).classList.add('has-video');
    im.complete ? done() : im.addEventListener('load', done, { once: true });
  });
}

function isDark() { return document.documentElement.classList.contains('dark'); }
function applyTheme(c) {
  const t = c.theme || {};
  const r = document.documentElement.style;
  const dark = isDark();
  /* modo escuro = troca fundo e texto das cores escolhidas no dashboard */
  const bg = dark ? t.fg : t.bg, fg = dark ? t.bg : t.fg;
  if (bg) r.setProperty('--bg', bg); else r.removeProperty('--bg');
  if (fg) r.setProperty('--fg', fg); else r.removeProperty('--fg');
  if (t.accent) r.setProperty('--acc', t.accent);
}
function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) { /* sem storage */ }
  document.querySelectorAll('.theme-btn .t-txt').forEach((t) => (t.textContent = dark ? 'Claro' : 'Escuro'));
  applyTheme(window.CONTENT || {});
}

async function fetchFirestore(cfg) {
  const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/site/content`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error('firestore ' + res.status);
  const doc = await res.json();
  return JSON.parse(doc.fields.json.stringValue);
}

async function loadContent() {
  let c = null;
  if (PREVIEW) {
    try { c = JSON.parse(localStorage.getItem('folio-draft')); } catch (e) { /* sem rascunho */ }
  }
  if (!c && window.FIREBASE_CONFIG) {
    try { c = await fetchFirestore(window.FIREBASE_CONFIG); } catch (e) { console.warn('Firestore indisponível, a usar content.json', e); }
  }
  if (!c) c = await (await fetch('content.json', { cache: 'no-cache' })).json();
  window.CONTENT = c;
  applyTheme(c);
  return c;
}
window.contentReady = loadContent();

/* ---------- nav + SEO (comum às páginas) ---------- */
function renderChrome(c, pageTitle) {
  const s = c.site || {};
  document.title = pageTitle ? `${pageTitle} — ${s.name}` : `${s.name} — ${s.role}`;
  const md = document.querySelector('meta[name="description"]');
  if (md && s.description) md.setAttribute('content', s.description);
  const logo = document.querySelector('.nav__logo');
  if (logo) logo.textContent = (s.name || '').toUpperCase();
  const links = document.querySelector('.nav__links');
  if (links && !links.querySelector('.theme-btn')) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'theme-btn'; b.innerHTML = `<span class="t-txt">${isDark() ? 'Claro' : 'Escuro'}</span><span class="t-ico">◐</span>`;
    b.setAttribute('aria-label', 'Alternar modo claro/escuro');
    b.addEventListener('click', toggleTheme);
    links.appendChild(b);
  }
}

/* ---------- home ---------- */
function renderHome(c) {
  renderChrome(c);
  const s = c.site || {}, h = c.hero || {}, e = c.ethos || {}, sv = c.services || {}, ct = c.contact || {};
  const projects = c.projects || [];
  const socials = (s.socials || []).filter((x) => x.label)
    .map((x) => (x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>` : `<span>${esc(x.label)}</span>`)).join(' · ');

  document.getElementById('top').innerHTML = `
  <section class="hero" id="hero">
    <div class="hero__media" data-label="SHOWREEL"><div class="hero__media-inner">${mediaHTML(h.media, { eager: true, alt: s.name })}</div></div>
    <h1 class="hero__title" aria-label="${esc(h.line1)} ${esc(h.line2)}">
      <span class="hero__line"><span>${esc(h.line1)}</span></span>
      <span class="hero__line"><span>${esc(h.line2)}</span></span>
    </h1>
    <p class="hero__sub">${esc(h.sub)}</p>
    <div class="hero__scroll">SCROLL ↓</div>
  </section>

  <section class="work" id="trabalho">
    <div class="work__pin">
      <div class="work__head"><h2>${esc((c.work || {}).title)}</h2><span class="work__count">[<b class="work__cur">01</b>/${pad2(projects.length)}]</span></div>
      <div class="work__track">${projects.map((p, i) => `
        <a class="card" href="project.html?p=${i + 1}" data-t data-label="PROJETO ${pad2(i + 1)}" style="--h:${(i * 83 + 30) % 360}">${mediaHTML(p.cover, { alt: p.title })}<span class="card__t">${esc(p.title)}<br><i>${esc(p.type)}</i></span></a>`).join('')}
      </div>
      <div class="work__bar"><span></span></div>
    </div>
  </section>

  <section class="ethos" id="sobre">
    <div class="ethos__pin">
      <div class="ethos__top">
        <h2 class="ethos__title">${esc(e.title)}</h2>
        <ul class="ethos__index">${(e.items || []).map((it, i) => `<li data-i="${i}">${esc(it.label)}</li>`).join('')}</ul>
        <span class="ethos__num">[<b>01</b>]</span>
      </div>
      <div class="ethos__stage">${(e.items || []).map((it, i) => `<p class="ethos__p${i ? '' : ' is-active'}">${esc(it.text)}</p>`).join('')}</div>
    </div>
  </section>

  <section class="marquee" aria-hidden="true"><div class="marquee__row"><span>${esc(c.marquee)}</span><span>${esc(c.marquee)}</span></div></section>

  <section class="services" id="servicos">
    <h2 class="services__h">${esc(sv.title)}</h2>
    <ul class="services__list">${(sv.items || []).map((it, i) => `<li><span class="n">${pad2(i + 1)}</span><span class="t">${esc(it.title)}</span><span class="d">${esc(it.desc)}</span></li>`).join('')}</ul>
  </section>

  <section class="contact" id="contacto">
    <p class="contact__kicker">${esc(ct.kicker)}</p>
    <a class="contact__big" href="mailto:${esc(s.email)}"><span>${esc(ct.line1)}</span><span>${esc(ct.line2)}</span></a>
    <div class="contact__foot"><span>${esc(s.email)}</span><span>${socials}</span><span>© ${new Date().getFullYear()} ${esc(s.name)}</span></div>
  </section>`;
  markImages();
  initVideos();
  fitText();
}

/* ---------- ajusta títulos gigantes ao ecrã (textos editáveis podem ser mais compridos) ---------- */
const FIT = [['.hero__title', '.hero__line>span'], ['.contact__big', 'span'], ['.proj-hero__title', 'span'], ['.proj-next__t', null]];
function fitText() {
  FIT.forEach(([sel, kidSel]) => {
    const root = document.querySelector(sel);
    if (!root) return;
    const kids = () => (kidSel ? [...root.querySelectorAll(kidSel)] : [root]);
    root.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(root).fontSize);
    const max = root.clientWidth;
    for (let n = 0; n < 60 && fs > 16 && kids().some((k) => k.scrollWidth > max + 1); n++) {
      fs *= 0.95;
      root.style.fontSize = fs + 'px';
    }
  });
}
let fitT;
window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitText, 150); });
