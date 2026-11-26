# Ligar o Firebase (dashboard + upload de ficheiros)

Sem Firebase o site e o dashboard funcionam em **modo local**: o dashboard guarda rascunhos no browser e
exporta um `content.json` para pôr na raiz do site. Com Firebase passa a haver login, **Publicar** com
um clique e upload de vídeos/fotos.

## Como funciona
- O conteúdo todo vive num único documento: Firestore `site/content` (campo `json` com o JSON em texto).
- O site lê esse documento por REST (sem SDK, rápido). Se falhar, usa `content.json`.
- O dashboard (`admin.html`) usa o SDK: Auth (email + palavra-passe), Firestore (publicar), Storage (upload).
- Segurança: leitura pública, escrita só para o email na lista das regras (`firestore.rules`, `storage.rules`).
  A `apiKey` do Firebase não é segredo; quem protege são as regras.

## Passos
1. https://console.firebase.google.com → criar projeto.
2. **Authentication** → Sign-in method → ativar *Email/palavra-passe*. Em Users, criar o utilizador da Cristiana
   (ou teu) e **marcar o email como verificado** (menu ⋮ do utilizador, ou fazer o fluxo de verificação).
3. **Firestore Database** → criar (modo produção, região `eur3`/`europe-west`).
4. **Storage** → começar (no plano Blaze; o gratuito Spark já não o inclui em projetos novos).
5. Definições do projeto → *Os teus apps* → Web (`</>`) → copiar a config para `firebase-config.js`
   (substituir `window.FIREBASE_CONFIG = null;`).
6. Em `firestore.rules` e `storage.rules` trocar `TROCAR@EMAIL.COM` pelo email do utilizador e publicar:
   ```bash
   npm i -g firebase-tools && firebase login && firebase use --add
   firebase deploy --only firestore:rules,storage
   ```
7. Abrir `/admin.html`, entrar, editar, **Publicar**. Primeira vez: publicar cria o documento `site/content`.
8. CORS do Storage (só se os vídeos não tocarem): não é preciso para `<video>`/`<img>`.

## Hosting
`firebase.json` já tem a config de Hosting (serve a raiz, ignora `docs/`). `firebase deploy --only hosting`.
No Hosting, o `content.json` fica só como cópia de segurança do conteúdo inicial.

## Notas
- Upload limitado a 200 MB e só imagem/vídeo (regras do Storage).
- Vídeos: mp4 H.264, 1080p, sem áudio. Comprimir antes (ex.: HandBrake) para carregarem depressa.
- `admin.html` é público mas inútil sem login (em modo Firebase). Está com `noindex`.
