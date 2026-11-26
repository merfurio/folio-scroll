# Ligar o Firebase (dashboard + upload de ficheiros)

Sem Firebase o site e o dashboard funcionam em **modo local**: o dashboard guarda rascunhos no browser e
exporta um `content.json` para pôr na raiz do site. Com Firebase passa a haver login, **Publicar** com
um clique e upload de vídeos/fotos.

## Como funciona
- O conteúdo todo vive num único documento: Firestore `site/content` (campo `json` com o JSON em texto).
- O site lê esse documento por REST (sem SDK, rápido). Se falhar, usa `content.json`.
- O dashboard (`admin.html`) usa o SDK: **login com Google** e Firestore (publicar). O upload de ficheiros vai para o Cloudinary (não usa o Storage do Firebase, por isso fica tudo no plano Spark).
- **Quem pode editar:** só contas Google cujo email tenha um documento em `admins/<email>` no Firestore
  (os dois emails autorizados: o do Miguel e o da Cristiana). Os emails ficam no Firestore e **não no repo**,
  porque o repo é público. As regras (`firestore.rules`) impõem isto no servidor; o dashboard só
  mostra "sem permissão" por cortesia.
- Porquê Google e não email+palavra-passe: as contas Gmail vêm com o email já verificado e sem palavras-passe
  para gerir. A `apiKey` do Firebase não é segredo; quem protege são as regras.

## Passos
1. https://console.firebase.google.com → criar projeto.
2. **Authentication** → Sign-in method → ativar **Google** (escolher o email de suporte).
   Em Settings → Authorized domains, confirmar que `merfurio.github.io` (e o domínio final) estão na lista.
3. **Firestore Database** → criar (modo produção, região `eur3`/`europe-west`).
4. (Não criar Storage: não é preciso e exigiria o plano Blaze.)
5. Definições do projeto → *Os teus apps* → Web (`</>`) → copiar a config para `firebase-config.js`
   (substituir `window.FIREBASE_CONFIG = null;`).
6. Publicar as regras:
   ```bash
   npm i -g firebase-tools && firebase login && firebase use --add
   firebase deploy --only firestore:rules
   ```
7. **Autorizar os dois emails:** na consola, Firestore → *Iniciar coleção* `admins` → criar um documento por email,
   com o **ID do documento igual ao email** (ex.: `nome@gmail.com`) e um campo qualquer (ex.: `role` = `admin`).
   Fazer para os dois.
8. Abrir `/admin.html`, **Entrar com Google**, editar, **Publicar**. A primeira publicação cria `site/content`.

## Upload de ficheiros (Cloudinary, grátis, sem cartão)
1. Criar conta em https://cloudinary.com (plano Free).
2. Settings → Upload → *Upload presets* → Add: **Signing mode = Unsigned**, folder `site`,
   *Allowed formats* `mp4,webm,jpg,png,webp,avif`, e um limite de tamanho. Anotar o nome do preset.
3. Copiar o *Cloud name* (Dashboard) e o nome do preset para `window.CLOUDINARY` em `firebase-config.js`.
4. No dashboard, o botão **Enviar** passa a funcionar (fotos são otimizadas; vídeos ficam como enviados).
Limites do plano grátis: ~100 MB por vídeo e 10 MB por foto; 25 créditos/mês (armazenamento + largura de banda).
Comprimir os vídeos antes (mp4 H.264, 1080p, sem áudio). O preset *unsigned* não tem segredo: o preset
limita formatos e tamanho para reduzir abuso.

## Hosting
`firebase.json` já tem a config de Hosting (serve a raiz, ignora `docs/`). `firebase deploy --only hosting`.
No Hosting, o `content.json` fica só como cópia de segurança do conteúdo inicial.

## Notas
- Vídeos: mp4 H.264, 1080p, sem áudio. Comprimir antes (ex.: HandBrake) para carregarem depressa.
- `admin.html` é público mas inútil sem uma conta autorizada (em modo Firebase). Está com `noindex`.
- Para adicionar/remover alguém: criar/apagar o documento `admins/<email>`.
