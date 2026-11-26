/* página de projeto: lê ?p=N, preenche e anima */
const idx = Math.min(PROJECTS.length, Math.max(1, parseInt(new URLSearchParams(location.search).get('p'), 10) || 1)) - 1;
const P = PROJECTS[idx];
const NEXT = PROJECTS[(idx + 1) % PROJECTS.length];

document.title = `${P.title} — Cristiana Fernandes`;
document.querySelector('.proj-hero__type').textContent = `${pad2(idx + 1)} / ${pad2(PROJECTS.length)} — ${P.type}`;
document.querySelector('.proj-hero__title span').textContent = P.title.toUpperCase();
document.getElementById('mClient').textContent = P.client;
document.getElementById('mYear').textContent = P.year;
document.getElementById('mServices').textContent = P.services;
document.getElementById('mLength').textContent = P.length;
document.getElementById('projText').textContent = P.text;
const nx = document.getElementById('projNext');
nx.href = `project.html?p=${((idx + 1) % PROJECTS.length) + 1}`;
nx.querySelector('.proj-next__t').textContent = NEXT.title.toUpperCase();

const isImg = (s) => /\.(jpe?g|png|webp|avif|gif)$/i.test(s);
const mediaHTML = (s, first) =>
  isImg(s)
    ? `<img class="vid is-ready" src="${s}" alt="${P.title}" loading="${first ? 'eager' : 'lazy'}">`
    : `<video class="vid" data-src="${s}" muted loop playsinline preload="none"></video>`;

const cover = document.getElementById('projCover');
cover.dataset.label = 'CAPA';
cover.innerHTML = `<div class="proj-hero__media-inner">${mediaHTML(P.cover, true)}</div>`;

const gal = document.getElementById('projGallery');
const shapes = ['wide', 'half', 'half'];
gal.innerHTML = P.gallery
  .map((s, i) => `<figure class="g g--${shapes[i] || 'wide'}" data-label="${pad2(i + 1)}" style="--h:${(idx * 60 + i * 90) % 360}"><div class="g__in">${mediaHTML(s)}</div></figure>`)
  .join('');
initVideos();

/* entrada */
const tl = gsap.timeline({ delay: ARRIVED ? 0.5 : 0.1 });
tl.from('.proj-hero__type', { opacity: 0, y: 12, duration: 0.7 })
  .from('.proj-hero__title span', { yPercent: 110, duration: 1.2, ease: 'power4.out' }, '-=.4')
  .from('.proj-hero__media', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.out' }, '-=.8')
  .from('.nav', { opacity: 0, duration: 0.6 }, '-=.6')
  .add(() => lenis.start());

/* capa: parallax + escala ao scroll */
gsap.fromTo('.proj-hero__media-inner', { yPercent: -6, scale: 1.12 }, {
  yPercent: 6, scale: 1, ease: 'none',
  scrollTrigger: { trigger: '.proj-hero__media', start: 'top bottom', end: 'bottom top', scrub: true },
});
gsap.to('.proj-hero__media', {
  width: '100%', ease: 'none',
  scrollTrigger: { trigger: '.proj-hero__media', start: 'top 90%', end: 'top 20%', scrub: true },
});

/* meta */
gsap.from('.proj-meta dl', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.proj-meta', start: 'top 85%' } });

/* texto: palavras acendem com o scroll */
const words = new SplitType('#projText', { types: 'words', wordClass: 'word' }).words;
gsap.set(words, { opacity: 0.12 });
gsap.to(words, {
  opacity: 1, stagger: 0.1, ease: 'none',
  scrollTrigger: { trigger: '.proj-text', start: 'top 80%', end: 'bottom 45%', scrub: 0.5 },
});

/* galeria: revela com clip + parallax interior */
gsap.utils.toArray('.g').forEach((g) => {
  gsap.from(g, { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: g, start: 'top 85%' } });
  gsap.fromTo(g.querySelector('.g__in'), { yPercent: -8, scale: 1.15 }, {
    yPercent: 8, scale: 1.05, ease: 'none',
    scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});

/* próximo projeto */
gsap.from('.proj-next__t', { yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.proj-next', start: 'top 75%' } });

window.addEventListener('load', () => ScrollTrigger.refresh());
