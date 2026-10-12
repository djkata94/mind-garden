# README-DECISIONS

Choices made when the spec was silent or the material was missing.
The spec (SPEC.md) always wins on conflicts.

## M1

- **DB driver: `postgres` (postgres-js) + `drizzle-orm/postgres-js`.**
  Works with Neon's pooled (pgbouncer) URL; `prepare: false` in
  `lib/db.js` is required for transaction-mode pooling.
  Added `dotenv` so `npm run seed` reads `.env` outside Next.js.
- **`notes.updated_at` is `defaultNow()` only.** Drizzle has no automatic
  `onUpdate` for Postgres; `updated_at` will be set explicitly in the
  PATCH route (M4).
- **Partial unique index `notes(source, source_id) WHERE source_id IS NOT NULL`**
  implemented as `uniqueIndex(...).on(...).where(...)` (verified against the
  installed drizzle-orm 0.36 API). Enforces `/api/seed` idempotency (M6).
- **3D models missing:** `quercia.glb`, `pino.glb`, `ciliegio.glb` were not
  provided, so `public/models/` ships only a `.gitkeep`. Owner must drop the
  three files in before M3. `content/credits.json` has placeholder authors
  (TODO) — real CC-BY attributions required before going public (/credits, M5).
- **Prototype received 2026-10-12:** `/docs/reference-app-test.jsx` is now the
  verbatim copy of the approved `apps.jsx` (header comment only addition).
  Stage mapping for M3: sprout/sapling → growing (pino/ciliegio by variant),
  tree → mature (quercia); target heights from spec (2.2/3.2/5.5), not the
  prototype's 1.8/3.4/5.5. Prototype NOTES data stays mock — M3 reads the DB.
- **Seed positions:** fixed ring coordinates (r 3–12, pairwise distance ≥ 2.0)
  instead of random `placePlant()` output, so the initial garden looks the
  same on every fresh database.
- **Spec file is lowercase (`spec.md`).** Windows FS is case-insensitive;
  left as-is to keep the diff empty.
- **Scaffold:** `create-next-app` (Next 16, App Router, JavaScript, no
  Tailwind, no src-dir). Default starter `app/page.js` kept as placeholder
  until M3.

## M2

- **Single admin via `iron-session` cookie (`mind-garden-session`, 30 days).**
  Spec fixes cookie name only indirectly; `lib/session.js` already set the
  name/TTL, M2 keeps them. `SESSION_SECRET` must be ≥32 chars; `getSession()`
  throws a clear error otherwise so misconfiguration is a 500, never silent.
- **Timing-safe password check** (`crypto.timingSafeEqual` in `lib/auth.js`)
  against `ADMIN_PASSWORD`. Empty passwords never match; missing
  `ADMIN_PASSWORD` is a 500 on login.
- **No `GET /api/auth/session` route.** Spec lists only login/logout; the
  header reads the session in a Server Component (`isAdminSession()`), so no
  extra public endpoint exists. `lib/auth.js:requireAdmin()` is the shared
  guard for write routes (M4) and `/api/seed` (M6).
- **Session reads sit behind `<Suspense>` (Cache Components).** Next 16 has
  `cacheComponents: true`, so `cookies()` outside a boundary breaks the
  prerender build when env is set. `Header` stays static and streams
  `AuthNav` (Accedi/Esci) inside a boundary; `/login` streams `LoginGate`
  (redirect if already admin, else the form). `export const dynamic` no
  longer exists in this Next version — first build failure taught us that.
  Routes return Italian user-facing errors (`Password errata.`),
  code/comments stay English per spec.
- **Header is minimal on purpose.** Title + subtitle + Accedi/Esci only.
  Search, "+" button and tag chips belong to M4. Homepage placeholder stays
  until M3.

- **Real CC-BY credits transcribed from owner file `crediti-modelli.txt`.**
  `content/credits.json` now has real authors/URLs (quercia → Georgeous,
  pino → Andriy Shekh, ciliegio → Jogoss, all CC-BY 4.0). Added an extra
  `titolo` key per entry (work title from Sketchfab) — additive only, the
  spec `{modello, autore, licenza, url}` shape is preserved for M5.
  The loose `crediti-modelli.txt` stays untracked; owner can delete it.

## M3

- **GET /api/notes via `lib/notesList.js`.** Shared helper (API route + /notes
  page) returns the spec shape with markdown-stripped 160-char excerpts
  (`lib/excerpt.js`). Order: `updated_at` desc.
- **Next 16 specifics (verified against installed docs):**
  `dynamic(..., { ssr: false })` is illegal in Server Components, so
  `app/page.js` (server) renders `GardenLoader.jsx` (client) which holds the
  dynamic import. `lib/db.js` is a lazy singleton (`getDb()`) so imports never
  throw without DATABASE_URL. `/notes` uses `await connection()` +
  `export const instant = false` (request-time render, no static shell).
- **Garden follows the prototype 1:1** (lights, fog, Sparkles, Bloom+Vignette,
  OrbitControls limits, dpr, wind, tooltip, preload). Spec heights apply
  (pine 2.2 / cherry 3.2 / oak 5.5). Growing notes with null variant fall back
  to a stable id hash (same rule M4 POST will use when writing).
- **NotePanel ships read-only in M3** (stage, title, tags as plain chips,
  excerpt, date) so the milestone is testable; M4 extends the same file with
  markdown, clickable tags, related and edit/delete. /notes cards link back to
  the garden (detail pages are M5).
- **Verified without DB:** `/api/notes` → 500 JSON italiano, `/notes` → 200
  con banner, `/` → 200. Real garden testing needs DATABASE_URL (owner).

## M4

- **Writes share `lib/noteWrite.js`.** Slug with `-2…` suffix, placement via
  `placePlant()`, variant hash for growing, random seed palette
  (`#FF9DE2/#C9A6FF/#9DE2FF/#A8E6A1/#FFD166` — spec fixes only the default),
  tag normalize/dedupe, `updated_at` set explicitly on PATCH. Slug never
  changes on PATCH.
- **One dynamic segment `[id]`** for GET-by-slug (+UUID fallback, else 404 —
  a non-UUID miss must never 500), PATCH/DELETE-by-id. GET already returns
  full content + related (max 4 by shared tags), so M5 only builds the pages.
- **No session endpoint.** Header search is client state (`GardenContext` in
  root layout); the admin-only "+" renders server-side in AuthNav, and
  `SessionFlag` bridges the session to client state for edit/delete buttons.
- **Filters dim to 0.15, never hide.** Tree materials are cloned per plant so
  the fade can't leak across shared .glb models. Panel tags filter + close;
  related notes select within the loaded list.
- **Tested vs Neon:** guards 401, validation 400, create/slug-collision/
  variant-auto/tags-counts, full+related, patch, delete, 404 — test notes
  removed, DB back to 6.

## M5

- **Full-note logic lives in `lib/noteFull.js`.** GET /api/notes/:slug is now
  a thin wrapper; the /notes/[slug] page reuses it (title, dates, tags,
  markdown, related, source badge, back link). `instant = false` like /notes.
- **/credits is fully static** (JSON import, no DB). Footer in the root layout
  links Note + Crediti on every public page. /notes cards now link to detail
  pages.

## Futuro (non-obiettivi v1, spec section 11 — do not implement)

Mobile optimization, immagini nelle note, stagioni/giorno-notte, audio,
autosave, i18n, analytics, unit test, crescita automatica dello stadio,
drag&drop delle piante, multi-utente. Scalabilità oltre ~60 piante: TODO.
