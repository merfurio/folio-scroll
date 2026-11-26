/* Dados dos projetos. Trocar textos e ficheiros aqui.
   media: .mp4/.webm → vídeo com autoplay no scroll; .jpg/.png/.webp → foto. */
const PROJECTS = [
  {
    title: 'Marca X', type: 'Filme institucional', client: 'Marca X', year: '2026', services: 'Realização, imagem, edição', length: '1’30”',
    cover: 'media/p1.mp4',
    text: 'Um filme institucional pensado para mostrar as pessoas por trás da marca. Rodado em dois dias, com equipa leve e luz natural, para manter a espontaneidade de quem aparece em frente à câmara.',
    gallery: ['media/p2.mp4', 'media/showreel.mp4', 'media/p3.mp4'],
  },
  {
    title: 'Casamento A+B', type: 'Foto & vídeo', client: 'A & B', year: '2025', services: 'Fotografia, vídeo, edição', length: '4’00”',
    cover: 'media/p2.mp4',
    text: 'Do preparativo à última dança. Um filme e uma reportagem fotográfica que guardam o ritmo do dia, os detalhes e as pessoas que o tornaram especial.',
    gallery: ['media/p1.mp4', 'media/p4.mp4', 'media/p5.mp4'],
  },
  {
    title: 'Editorial Moda', type: 'Fotografia', client: 'Revista Y', year: '2025', services: 'Fotografia, direção criativa', length: '—',
    cover: 'media/p3.mp4',
    text: 'Editorial de moda com direção de luz e cor própria. Sessão em estúdio e exterior, com tratamento de imagem consistente do primeiro ao último frame.',
    gallery: ['media/p5.mp4', 'media/p2.mp4', 'media/showreel.mp4'],
  },
  {
    title: 'Videoclip', type: 'Realização', client: 'Artista Z', year: '2026', services: 'Realização, edição, color', length: '3’20”',
    cover: 'media/p4.mp4',
    text: 'Videoclip realizado de raiz: conceito, rodagem e pós-produção. A imagem acompanha a música, com cortes e cor a servir a emoção da canção.',
    gallery: ['media/p3.mp4', 'media/p1.mp4', 'media/p5.mp4'],
  },
  {
    title: 'Eventos', type: 'Cobertura', client: 'Vários', year: '2026', services: 'Foto, vídeo, highlights', length: '2’00”',
    cover: 'media/p5.mp4',
    text: 'Cobertura completa de eventos, com entrega rápida de highlights para redes sociais e filme final para arquivo.',
    gallery: ['media/p4.mp4', 'media/showreel.mp4', 'media/p2.mp4'],
  },
];
