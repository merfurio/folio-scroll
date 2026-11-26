# Retro 2026-11-26 — Firebase, dashboard, Cloudinary, dark, PWA, domínio

## Feito
- Firebase `crisfolio-site` (Spark): Hosting, Auth Google, Firestore (Bélgica/Europa, segundo o utilizador; região é permanente), regras deployadas (`firestore.rules`, `firebase.json`, `.firebaserc`)
- Allowlist `admins/<email>` no Firestore (2 docs). Login + publicar testados pelo utilizador; site lê `site/content` por REST
- Cloudinary unsigned (`firebase-config.js`: cloud `o5tclchv`, preset `crisfolio`, pasta `site`). Upload testado pelo utilizador, showreel já no Cloudinary
- Botão "Enviar" → "Carregar" (`js/admin.js`, `docs/FIREBASE.md`)
- Modo escuro do site: troca bg/fg do tema, botão ◐ no nav (`js/content.js`, `css/style.css`, `index.html`, `project.html`)
- Modo escuro do dashboard + ◐ (também no login) (`css/admin.css`, `admin.html`)
- Dashboard instalável (PWA): `admin.webmanifest`, `admin-sw.js` (rede primeiro), `icons/`
- Domínio `crisvisualmedia.pt` ligado ao Hosting; `/admin` via rewrite (`firebase.json`); `www` redireciona 301

## Decisões e porquê
- Allowlist em Firestore (não emails nas regras): emails fora do repo público → ADR 0001
- Só Cloudinary, sem Storage/Blaze: manter plano Spark sem cartão → ADR 0002
- Dark = trocar `--bg`/`--fg` (não 2.ª paleta): acompanha qualquer cor do dashboard
- SW com rede primeiro e scope só `/admin`: nunca servir JS velho; site público não fica instalável
- `/admin` por rewrite (não `cleanUrls`): evita redirect para fora do scope da PWA

## Problemas / armadilhas
- 1.º deploy expôs `/.git/config`; corrigido com `**/.git/**` no ignore, verificado 404
- Firestore API devolveu 403 logo após criar; passou a 200 sozinho (propagação)
- Cloudinary `Unknown API key` = cloud name errado; o UUID no ecrã era o PID do preset, não o cloud name
- DNS: A antigo da Amen (81.88.57.70) ao lado do A do Firebase bloqueia SSL; `www` apontava ao alojamento antigo
- CLI Firebase: usar sempre `--account miguelmdesignio@gmail.com` (default é a conta gogym); hook de privacidade bloqueia esse comando no Claude, deploy corre no terminal do utilizador
- Browser embutido não regista service workers em localhost; só validado em produção

## Próximo passo
1. Trocar clips de teste por vídeos/fotos reais (Projetos → Capa/Galeria)
2. Email e redes reais (hoje `ola@exemplo.pt`); textos finais
3. Testar em telemóvel e tablet reais: login Google na PWA (iOS pode falhar com popup → passar a redirect), instalar a app
