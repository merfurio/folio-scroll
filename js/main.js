gsap.registerPlugin(ScrollTrigger);

/* ---------- loader + intro ---------- */
function intro() {
  if (ARRIVED) {
    gsap.set('.loader', { display: 'none' });
    const t = gsap.timeline({ delay: 0.25 });
    t.from('.hero__media', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.out' })
      .from('.hero__line>span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.1 }, '-=.8')
      .from('.hero__sub,.hero__scroll,.nav', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, '-=.6')
      .add(() => lenis.start());
    return;
  }
  const counter = { v: 0 };
  const n = document.querySelector('.loader__n');
  const tl = gsap.timeline();
  tl.to(counter, {
    v: 100, duration: 1.4, ease: 'power2.inOut',
    onUpdate: () => (n.textContent = Math.round(counter.v)),
  })
    .to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' })
    .from('.hero__media', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.out' }, '-=.5')
    .from('.hero__line>span', { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: 0.12 }, '-=.9')
    .from('.hero__sub,.hero__scroll,.nav', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, '-=.6')
    .add(() => lenis.start());
}

/* ---------- hero: media expande e título sobe ---------- */
function hero() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', scrub: 0.6, pin: true, anticipatePin: 1 },
  });
  tl.to('.hero__media', { left: 0, right: 0, top: 0, height: '100svh', ease: 'none' }, 0)
    .to('.hero__media-inner', { yPercent: 8, ease: 'none' }, 0)
    .to('.hero__title', { scale: 1.06, transformOrigin: '0% 100%', ease: 'none' }, 0)
    .to('.hero__sub,.hero__scroll', { opacity: 0, ease: 'none' }, 0);
}

/* ---------- trabalho: scroll horizontal ---------- */
function work() {
  const track = document.querySelector('.work__track');
  const bar = document.querySelector('.work__bar span');
  const cur = document.querySelector('.work__cur');
  const cards = [...document.querySelectorAll('.card')];
  const dist = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.work', start: 'top top', end: () => '+=' + dist() * 1.1, pin: '.work__pin', scrub: 0.5,
      invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (s) => {
        gsap.set(bar, { scaleX: s.progress });
        cur.textContent = pad2(Math.min(cards.length, Math.floor(s.progress * cards.length) + 1));
      },
    },
  });
  cards.forEach((c) =>
    gsap.fromTo(c, { scale: 0.9 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: c, containerAnimation: gsap.getTweensOf(track)[0], start: 'left 95%', end: 'left 55%', scrub: true },
    })
  );
}

/* ---------- ethos: pin, contador, índice, reveal por palavra ---------- */
function ethos() {
  const ps = [...document.querySelectorAll('.ethos__p')];
  const items = [...document.querySelectorAll('.ethos__index li')];
  const num = document.querySelector('.ethos__num b');
  const N = ps.length;

  const words = ps.map((p) => new SplitType(p, { types: 'words', wordClass: 'word' }).words);
  gsap.set(ps, { autoAlpha: 0 });
  gsap.set(ps[0], { autoAlpha: 1 });

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  ps.forEach((p, i) => {
    const t = i * 1.6;
    if (i > 0) {
      tl.set(ps[i - 1], { autoAlpha: 0 }, t).set(p, { autoAlpha: 1 }, t);
      tl.fromTo(p, { y: 30 }, { y: 0, duration: 0.3 }, t);
    }
    tl.to(words[i], { opacity: 1, stagger: 0.8 / words[i].length, duration: 0.5 }, t + 0.05);
  });
  tl.to({}, { duration: 0.4 });

  let last = -1;
  const setIdx = (i) => {
    if (i === last) return;
    last = i;
    items.forEach((li, k) => li.classList.toggle('on', k === i));
    gsap.fromTo(num, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    num.textContent = pad2(i + 1);
  };
  setIdx(0);

  ScrollTrigger.create({
    trigger: '.ethos', start: 'top top', end: '+=' + N * 90 + '%', pin: '.ethos__pin', scrub: 0.5, animation: tl, anticipatePin: 1,
    onUpdate: (s) => setIdx(Math.min(N - 1, Math.floor(s.progress * N * 0.9999))),
  });
  items.forEach((li, i) =>
    li.addEventListener('click', () => {
      const st = ScrollTrigger.getAll().find((x) => x.pin && x.pin.classList.contains('ethos__pin'));
      if (!st) return;
      lenis.scrollTo(st.start + (st.end - st.start) * (i / N + 0.01), { duration: 1.4 });
    })
  );
}

/* ---------- marquee ligado ao scroll ---------- */
function marquee() {
  const row = document.querySelector('.marquee__row');
  gsap.to(row, {
    xPercent: -50, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.4 },
  });
}

/* ---------- serviços + contacto ---------- */
function reveals() {
  gsap.from('.services__h', { yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.services__h', start: 'top 85%' } });
  gsap.from('.services__list li', { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: '.services__list', start: 'top 80%' } });
  gsap.from('.contact__big span', { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: '.contact', start: 'top 55%' } });
  gsap.from('.contact__kicker,.contact__foot', { opacity: 0, y: 16, duration: 0.9, stagger: 0.2, scrollTrigger: { trigger: '.contact', start: 'top 55%' } });
}

hero();
work();
ethos();
marquee();
reveals();
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  intro();
  const hashEl = location.hash && document.querySelector(location.hash);
  if (hashEl) {
    // o layout dos pins assenta aos poucos: corrige a posição até estabilizar
    const go = () => lenis.scrollTo(hashEl, { immediate: true, force: true });
    [0, 250, 700, 1500].forEach((ms) => setTimeout(() => {
      if (Math.abs(hashEl.getBoundingClientRect().top) > 2) go();
    }, ms));
  }
});
