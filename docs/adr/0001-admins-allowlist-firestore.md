# 0001 — Allowlist de admins em Firestore
Estado: aceite (2026-11-26)

## Contexto
Repo público (GitHub Pages). O dashboard publica no Firestore. Só 2 pessoas podem editar.

## Decisão
Login Google; autorização = existir doc `admins/<email>` (ID = email) e `email_verified`. Regras: `isAdmin()`; `site/*` leitura pública, escrita admin; `admins/{email}` só `get` do próprio.

## Consequências
- Emails não aparecem no código nem nas regras
- Adicionar/remover editor = criar/apagar doc na consola, sem deploy
- Sem lista de admins pela API (sem `list`)
