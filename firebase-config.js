/* Configuração do Firebase (Web App). Fica null até criares o projeto.
   Ver docs/FIREBASE.md. Esta config é pública por desenho: a segurança
   está nas regras do Firestore (firestore.rules). */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBcZ1qiSzaBE57guvAy4F0teKgjk1N4GFk",
  authDomain: "crisfolio-site.firebaseapp.com",
  projectId: "crisfolio-site",
  messagingSenderId: "512668746397",
  appId: "1:512668746397:web:bcd94b4f6bac4f995aca74"
};
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
