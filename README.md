# Il mio giardino digitale (mind-garden)

A 3D digital garden (Next.js + react-three-fiber) backed by Neon Postgres.
Notes are plants: seeds, growing trees, mature oaks. UI texts in Italian.

Spec: `spec.md` (binding). Working choices: `README-DECISIONS.md`.

## Setup locale

1. **Crea il progetto Neon** (piano free) e copia la stringa di connessione
   **pooled** (pgbouncer), quella con `pooler` nell'host e `sslmode=require`.
2. **Crea lo schema:**
   ```bash
   cp .env.example .env   # poi compila DATABASE_URL in .env
   npx drizzle-kit push
   ```
3. **Popola il giardino iniziale:**
   ```bash
   npm run seed
   ```
4. **Env locali** (vedi `.env.example`): `DATABASE_URL`, `ADMIN_PASSWORD`,
   `SESSION_SECRET` (≥ 32 caratteri), `SEED_TOKEN`, `ALLOWED_ORIGINS`.
5. **Dev:**
   ```bash
   npm install
   npm run dev
   ```
   Apri [http://localhost:3000](http://localhost:3000).

## Deploy Vercel

- Il deploy segue il branch `main`.
- Imposta le stesse env su Vercel (Project → Settings → Environment Variables):
  `DATABASE_URL` (pooled), `ADMIN_PASSWORD`, `SESSION_SECRET`, `SEED_TOKEN`,
  `ALLOWED_ORIGINS`.
- Nota cold-start free tier: al primo accesso dopo inattività (Neon free che
  si addormenta + serverless function fredda) la pagina può impiegare qualche
  secondo; i caricamenti successivi sono normali.

## Pianta un seme (progetti fratelli via API)

`POST /api/seed` con Bearer token (`SEED_TOKEN`):

```bash
curl -X POST https://tuo-dominio.vercel.app/api/seed \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"tracker","source_id":"libro-123","title":"Norwegian Wood","content":"Appunti di lettura…","tags":["libri"]}'
```

Risponde `{ "url": "/notes/<slug>" }`. Regole:

- `source` solo `tracker` o `travelos`; `source_id` e `title` obbligatori.
- L'upsert su `(source, source_id)` rende l'operazione idempotente: stesso
  `source_id` → stessa nota aggiornata (lo slug resta stabile).
- Le note arrivate da fuori nascono come semi (`stage: 'seed'`) col badge
  della sorgente nel pannello e nella pagina.
- CORS: il browser è ammesso solo dai domini in `ALLOWED_ORIGINS`
  (lista separata da virgole); da server a server basta il token.
- Check: `GET /api/seed?source=…&source_id=…` (stesso Bearer) risponde
  `{ "url": "/notes/<slug>" }` oppure `{ "url": null }` se non piantato.

## Script

- `npm run dev` — sviluppo
- `npm run build` — build produzione (deve passare prima di ogni commit)
- `npm run seed` — inserisce le 6 note iniziali (idempotente)
- `npx drizzle-kit push` (`npm run db:push`) — applica lo schema a Neon

## Stato milestone

- [x] M1 — Scaffold, dipendenze, schema drizzle, seed, credits, docs
- [x] M2 — Auth admin
- [x] M3 — Giardino 3D read-only + fallback /notes
- [x] M4 — CRUD note, pannelli, filtri, ricerca
- [x] M5 — Pagine /notes/[slug] + /credits
- [x] M6 — /api/seed + rifinitura README

