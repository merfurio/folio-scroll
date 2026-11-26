# folio-scroll

Site de Cristiana Fernandes, videógrafa e fotógrafa com scroll interativo (referência: accordion.net.au/about-us).
Stack: HTML/CSS/JS puro + GSAP/ScrollTrigger + Lenis + SplitType (CDN). Sem build.

## Estado
- [x] Loader, hero (media expande, título em blend), trabalho (scroll horizontal), ethos (pin + contador + índice + reveal por palavra), marquee, serviços, contacto
- [x] Vídeo com autoplay no scroll (lazy load, play ao entrar, pausa ao sair, muted+loop+playsinline). Clips de teste em media/
- [ ] Trocar clips de teste por vídeos reais (H.264 mp4, ≤1080p, ~3–8 MB cada, sem áudio) + fotos
- [ ] Textos, nome, contactos reais
- [x] Páginas de projeto (project.html?p=N, dados em js/projects.js) + transição de cortina entre páginas (sem Barba)
- [ ] Email e redes reais (hoje ola@exemplo.pt)
- [x] Mobile afinado (375px): nav compacta, hero, cartões verticais, ethos, contacto, páginas de projeto. Falta testar em telemóvel real + tablet
- [ ] Deploy

## Correr
python3 -m http.server 5188  →  http://localhost:5188
