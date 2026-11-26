/* código partilhado por todas as páginas: scroll suave, vídeo, transições */
gsap.registerPlugin(ScrollTrigger);

history.scrollRestoration = 'manual';
/* pré-visualização do dashboard: iframe com name=folio-preview (ou ?preview=1) */
const PREVIEW = window.name === 'folio-preview' || new URLSearchParams(location.search).get('preview') === '1';
const pad2 = (n) => String(n).padStart(2, '0');

/* ---------- scroll suave (Lenis) ligado ao ScrollTrigger ---------- */
const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

/* ---------- transição de página (cortina) ---------- */
const curtain = document.querySelector('.curtain');
const ARRIVED = sessionStorage.getItem('tr') === '1';
sessionStorage.removeItem('tr');

function revealPage() {
  return gsap.to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut', delay: 0.1 });
}
function leavePage(url) {
  lenis.stop();
  gsap.fromTo(curtain, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power4.inOut',
    onComplete: () => { sessionStorage.setItem('tr', '1'); location.href = url; },
  });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-t]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  leavePage(a.href);
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) { gsap.set(curtain, { clipPath: 'inset(100% 0 0 0)' }); lenis.start(); }
});
if (ARRIVED) revealPage();

/* ---------- âncoras na mesma página ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : document.querySelector(id);
    if (el === null) return;
    e.preventDefault();
    lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  });
});

/* ---------- vídeo: carrega ao aproximar, toca ao entrar no ecrã, pausa ao sair ---------- */
const ALL_VIDS = [];
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const playVid = (v) => { if (!REDUCE_MOTION) v.play().catch(() => {}); };
const loadVid = (v) => {
  if (v.src || !v.dataset.src) return;
  v.src = v.dataset.src;
  v.addEventListener('loadeddata', () => {
    v.classList.add('is-ready');
    (v.closest('[data-label]') || v.parentElement).classList.add('has-video');
  }, { once: true });
  v.load();
};
const nearObs = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { loadVid(e.target); nearObs.unobserve(e.target); }
}), { rootMargin: '100% 100% 100% 100%' });
const seenObs = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { loadVid(e.target); playVid(e.target); } else e.target.pause();
}), { threshold: 0.25 });

function initVideos(root = document) {
  root.querySelectorAll('video.vid').forEach((v) => {
    if (ALL_VIDS.includes(v)) return;
    ALL_VIDS.push(v);
    nearObs.observe(v);
    seenObs.observe(v);
  });
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) ALL_VIDS.forEach((v) => v.pause());
  else ALL_VIDS.forEach((v) => {
    const r = v.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) playVid(v);
  });
});
