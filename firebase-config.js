/* Configuração do Firebase (Web App). Fica null até criares o projeto.
   Ver docs/FIREBASE.md. Esta config é pública por desenho: a segurança
   está nas regras do Firestore (firestore.rules). */
window.FIREBASE_CONFIG = null;
/* Exemplo:
window.FIREBASE_CONFIG = {
  apiKey: "...", authDomain: "...", projectId: "...",
  messagingSenderId: "...", appId: "..."
};
*/

/* Upload de vídeos/fotos pelo dashboard (Cloudinary, plano grátis, sem cartão).
   Ver docs/FIREBASE.md → "Upload de ficheiros". Preencher cloudName e uploadPreset (unsigned). */
window.CLOUDINARY = null;
/* Exemplo: window.CLOUDINARY = { cloudName: "o-teu-cloud", uploadPreset: "site_unsigned" }; */
