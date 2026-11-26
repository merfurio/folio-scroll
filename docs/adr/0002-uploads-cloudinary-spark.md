# 0002 — Uploads só via Cloudinary, plano Spark
Estado: aceite (2026-11-26)

## Contexto
Firebase Storage exige Blaze (cartão). O resto do portfolio da utilizadora está em Spark.

## Decisão
Upload direto do browser ao Cloudinary (unsigned preset `crisfolio`, pasta `site`); o URL fica no `content.json`/Firestore. Sem Storage, sem Blaze.

## Consequências
- Limites grátis: ~100 MB por vídeo, ~10 MB por foto
- Preset unsigned é público: qualquer pessoa com cloud+preset pode carregar. Mitigar com limites de tamanho/formato no preset
- Ficheiros apagados do site continuam no Cloudinary (limpar à mão)
