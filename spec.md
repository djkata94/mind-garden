# SPEC — "Il mio giardino digitale" (Digital Garden 3D)

Specifica vincolante per OpenCode (modello: Muse Spark 1.3).
Se una istruzione futura contraddice questo documento, questo documento vince.
Se manca qualcosa, scegli la soluzione più semplice coerente con la spec e
annota la scelta in `README-DECISIONS.md`.

## 0. Regole di lavoro (obbligatorie)
- Repo locale con push automatico su GitHub; Vercel deploya dal branch main.
- SOLO patch incrementali: leggi sempre un file prima di modificarlo, non
  riscrivere mai un file intero se non esplicitamente richiesto, diff minimi.
- Dopo ogni modifica al codice: `npm run build` deve passare prima del commit.
- NIENTE unit test: i test li fa il proprietario a mano. Non aggiungere
  librerie di testing.
- Commit piccoli e frequenti, messaggi convenzionali: feat:, fix:, chore:, docs:.
- Codice e commenti in inglese; testi della UI in italiano.
- Procedi SOLO per milestone (M1…M6). Alla fine di ogni milestone: build ok,
  commit, e riassunto di 5 righe al proprietario. Non iniziare il milestone
  successivo senza suo ok.

## 1. Stack
- Next.js App Router, JavaScript (NO TypeScript).
- three, @react-three/fiber, @react-three/drei, @react-three/postprocessing.
- Database: Neon (Postgres, piano free). ORM: drizzle-orm + drizzle-kit.
- Auth: iron-session (single admin, password da env).
- Markdown: react-markdown (rendering sicuro, niente HTML raw).
- Tutto il 3D è client-side: componente giardino caricato con
  `dynamic(() => import(...), { ssr: false })`.

## 2. Struttura repo
/app
  page.jsx                     → giardino 3D (client, dynamic ssr:false)
  login/page.jsx
  notes/page.jsx               → elenco pubblico (fallback senza WebGL)
  notes/[slug]/page.jsx        → pagina pubblica della nota
  credits/page.jsx
  api/…                        → rotte della sezione 4
/components/garden/  GardenCanvas.jsx Tree.jsx Seed.jsx Ground.jsx
                     SceneLights.jsx Effects.jsx
/components/ui/      Header.jsx NotePanel.jsx NoteForm.jsx TagInput.jsx
                     TagFilter.jsx LoginCard.jsx
/lib/                db.js schema.js session.js slugify.js placement.js
/content/credits.json
/public/models/      quercia.glb pino.glb ciliegio.glb
/docs/reference-app-test.jsx   → copia del prototipo approvato, SOLO riferimento
drizzle.config.js  .env.example  README.md  README-DECISIONS.md  SPEC.md

## 3. Database (schema Drizzle, Neon)
notes:
  id         uuid pk default gen_random_uuid()
  slug       text unique not null
  title      text not null
  content    text not null default ''          (markdown)
  stage      text not null default 'seed'      ('seed'|'growing'|'mature')
  variant    text                              ('pine'|'cherry'; null → auto)
  color      text not null default '#FF9DE2'   (usato solo da stage=seed)
  pos_x      real not null
  pos_z      real not null
  rot_y      real not null
  source     text not null default 'garden'    ('garden'|'tracker'|'travelos')
  source_id  text
  created_at timestamptz not null default now()
  updated_at timestamptz not null default now()
  UNIQUE(source, source_id) WHERE source_id IS NOT NULL   (idempotenza seed)
tags:      id uuid pk, name text unique, slug text unique
note_tags: note_id fk cascade, tag_id fk cascade, pk(note_id, tag_id)
Seed iniziale: le 6 note del prototipo (Shinkai, viaggi-anime, Kyoto,
finali aperti, siti personali, tracker libri) con 2-3 tag ciascuna.

## 4. API
GET  /api/notes            pubblico. Lista: id, slug, title, excerpt (primi
                           160 char senza markdown), stage, variant, color,
                           pos_x, pos_z, rot_y, tags[], updated_at.
GET  /api/notes/:slug      pubblico. Nota completa + tags + related (max 4
                           note che condividono ≥1 tag) + source.
POST /api/notes            SOLO sessione. {title, content, tags[], stage}
                           → slug da title (suffisso se collisione), position
                           da lib/placement.js, variant auto se 'growing'
                           (hash id → pine|cherry), color da palette se seed.
PATCH /api/notes/:id       SOLO sessione. Update parziale (title, content,
                           tags, stage, pos_x, pos_z).
DELETE /api/notes/:id      SOLO sessione.
GET  /api/tags             pubblico. [{name, slug, count}] ordinati per count.
POST /api/auth/login       {password} → cookie sessione iron-session 30gg.
POST /api/auth/logout      chiude sessione.
POST /api/seed             SOLO token Bearer = env SEED_TOKEN.
                           Body: {source:'tracker'|'travelos', source_id,
                           title, content?, tags?}. UPSERT su
                           (source, source_id). CORS: Allow-Origin solo dai
                           domini in env ALLOWED_ORIGINS (gestire OPTIONS).
                           Risponde {url:'/notes/slug'}.
Lettura sempre pubblica; scrittura solo sessione; /api/seed solo token.

## 5. Auth
Admin singolo: password in env ADMIN_PASSWORD (confronto timing-safe).
iron-session con env SESSION_SECRET; cookie httpOnly, secure in production.
/login: form minimale; ok → redirect '/'. Header mostra "Esci" se in sessione.

## 6. Scena 3D — baseline visiva = prototipo approvato (/docs/reference-app-test.jsx)
- Background e fog '#dce8d5'; hemisphereLight + directionalLight calda con
  shadow-camera ±20; Environment preset 'forest' DENTRO Suspense con
  fallback: se il caricamento fallisce, rendere comunque con le sole luci.
- Sparkles (polline), EffectComposer con Bloom + Vignette, OrbitControls
  (target [0,2.5,0], minDistance 5, maxDistance 26, no pan, polar limitato).
- Mapping stadi:
  seed    → sfera luminosa procedurale + anello a terra (note.color), pulse.
  growing → pino.glb (variant pine, altezza target 2.2) oppure
            ciliegio.glb (variant cherry, altezza target 3.2).
  mature  → quercia.glb (altezza target 5.5).
- Normalizzazione modello: Box3 → base a y=0, centrato in x/z, scala da
  altezza target; traverse() con castShadow+receiveShadow su ogni mesh.
- Hover: tooltip Html col titolo, scala 1.05, cursor pointer.
- Click pianta: apre NotePanel (destra): stadio, titolo, tags cliccabili,
  contenuto markdown, note correlate, badge source se ≠ 'garden',
  bottoni Modifica/Elimina solo con sessione.
- Vento: rotazione z sinusoidale ±0.012 rad.
- Performance: dpr [1,1.75]; useGLTF.preload sui 3 modelli; ok fino a ~60
  piante (oltre: TODO, non implementare).
- ErrorBoundary attorno al Canvas: in caso di errore o WebGL assente,
  banner gentile + link a /notes. Mai schermo bianco.

## 7. UI 2D
- Header: titolo, sottotitolo, ricerca per titolo (filtro client-side),
  bottone "+" (solo sessione), login/logout.
- "+" → NoteForm (pannello/modale): title obbligatorio; content textarea
  markdown con toggle anteprima; TagInput con autocomplete da /api/tags,
  Enter crea tag nuovo (slugify minuscolo); select stadio (default seed).
  Salvataggio → POST → la pianta appare subito nel giardino.
- TagFilter: chip tags sotto l'header; click filtra le piante visibili
  (le altre sfumano a opacity 0.15, non spariscono di colpo).
- /notes: elenco card (titolo, stadio, tags, data, excerpt) → link pagina.
- /notes/[slug]: pagina server-rendered: titolo, date, tags, markdown,
  correlate, badge source, "torna al giardino".
- /credits: legge /content/credits.json → card {modello, autore, licenza,
  url}. OBBLIGATORIA (licenze CC-BY). Link nel footer delle pagine pubbliche.
- Stile: hardcoded (inline/CSS module) coerente col prototipo: palette
  chiara #dce8d5 / testo #1d3325 / accenti verdi. Niente design system.

## 8. placement.js (posizione nuove piante)
Input: posizioni esistenti. Output: {pos_x, pos_z, rot_y}.
Algoritmo: anello r∈[3,12], angolo random; accetta se distanza ≥2.0 da tutte;
max 60 tentativi, poi espandi r di +2 e ripeti; rot_y random 0..2π.

## 9. Env (.env.example) + README
DATABASE_URL=        # Neon, stringa POOLED (pgbouncer) con sslmode=require
ADMIN_PASSWORD=
SESSION_SECRET=      # ≥32 caratteri
SEED_TOKEN=          # token per /api/seed
ALLOWED_ORIGINS=     # lista domini separati da virgola
README: creazione progetto Neon → stringa pooled → `npx drizzle-kit push` →
`npm run seed` → env locali → dev; sezione "Deploy Vercel": stesse env su
Vercel + nota sul cold-start free tier; sezione "Pianta un seme": esempio
curl/fetch con Bearer token per i progetti fratelli.

## 10. Milestone (fermarsi alla fine di ognuno)
M1 Scaffold Next + dipendenze + schema drizzle + .env.example + README +
   seed script + copia modelli in /public/models + credits.json +
   /docs/reference-app-test.jsx. Build ok.
M2 Auth (login/logout/sessione) + guardie sessione sulle scritture.
M3 Giardino 3D read-only da /api/notes (componenti separati), ErrorBoundary
   e /notes fallback.
M4 Creazione/modifica/eliminazione note + TagInput + NotePanel + TagFilter
   + ricerca.
M5 Pagine pubbliche /notes/[slug] + /credits + note correlate.
M6 /api/seed (token, CORS, idempotenza, badge source) + rifinitura README.

## 11. NON-obiettivi espliciti di v1 (non implementare, non proporre)
Mobile optimization (non rompere, non ottimizzare), immagini nelle note,
stagioni/giorno-notte, audio, autosave, i18n, analytics, unit test,
crescita automatica dello stadio, drag&drop delle piante, multi-utente.
(Sono TODO documentati in README-DECISIONS.md, sezione "Futuro".)

## 12. Definition of done v1
Build ok; giardino popolato da DB; login funzionante; CRUD note con tag;
filtri e ricerca ok; /notes e /notes/[slug] ok senza WebGL; /api/seed
idempotente con token; /credits online; README completo; env example.