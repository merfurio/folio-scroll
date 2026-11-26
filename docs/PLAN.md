# folio-scroll

Site de Cristiana Fernandes (crisvisualmedia.pt), videógrafa e fotógrafa com scroll interativo (referência: accordion.net.au/about-us).
Stack: HTML/CSS/JS puro + GSAP/ScrollTrigger + Lenis + SplitType (CDN). Sem build.

## Estado
- [x] Loader, hero (media expande, título em blend), trabalho (scroll horizontal), ethos (pin + contador + índice + reveal por palavra), marquee, serviços, contacto
- [x] Vídeo com autoplay no scroll (lazy load, play ao entrar, pausa ao sair, muted+loop+playsinline). Clips de teste em media/
- [ ] Trocar clips de teste por vídeos reais (H.264 mp4, ≤1080p, ~3–8 MB cada, sem áudio) + fotos
- [ ] Textos, nome, contactos reais
- [x] Páginas de projeto (project.html?p=N, dados em content.json) + transição de cortina entre páginas (sem Barba)
- [ ] Email e redes reais (hoje ola@exemplo.pt)
- [x] Mobile afinado (375px): nav compacta, hero, cartões verticais, ethos, contacto, páginas de projeto. Falta testar em telemóvel real + tablet
- [x] Deploy provisório no GitHub Pages: https://merfurio.github.io/folio-scroll/ (repo público). Backup; produção é o Firebase Hosting

## Correr
python3 -m http.server 5188  →  http://localhost:5188

## Conteúdo editável + dashboard
- [x] Todo o conteúdo em `content.json` (site, tema/cores, hero, projetos, sobre, serviços, contacto); o site renderiza a partir dele (`js/content.js`)
- [x] Dashboard `admin.html` (modo local: rascunho + exportar content.json; pré-visualização ao vivo desktop/telemóvel)
- [x] Projeto Firebase `crisfolio-site` (conta miguelmdesignio, Spark), app web criada, config em `firebase-config.js`, Hosting no ar: https://crisfolio-site.web.app
- [x] Firebase: login Google, Firestore, regras deployadas, docs `admins/<email>` (Miguel + Cristiana). Login e publicar testados
- [x] Cloudinary unsigned (`window.CLOUDINARY`), upload testado; botão "Carregar"
- [x] Modo escuro (site + dashboard), botão ◐
- [x] Dashboard instalável (PWA, scope `/admin`)
- [x] Domínio https://crisvisualmedia.pt (admin: https://crisvisualmedia.pt/admin), `www` redireciona; domínios autorizados no Auth
- [ ] Testar PWA em telemóvel/tablet reais (login Google na app instalada; iOS pode precisar de redirect)
- [ ] Limites de tamanho/formato no preset Cloudinary; apagar PNG de teste `r9ljeza9yvz7wecdk0rf`
- [ ] Substituir ícone: C caligráfico dourado sobre verde-petróleo #232e30 (trocar se houver logo final)

## Deploy (Firebase Hosting)
```
firebase deploy --only hosting --project crisfolio-site --account miguelmdesignio@gmail.com
```
Atenção: `firebase.json` ignora `.git`, `docs`, `*.rules`. Se mudares a lista, confirma que `/.git/config` dá 404 depois do deploy.
