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
- **Prototype missing:** `/docs/reference-app-test.jsx` is a stub describing
  the expected baseline (spec section 6). Owner must paste the approved
  prototype; M3 follows it.
- **Seed positions:** fixed ring coordinates (r 3–12, pairwise distance ≥ 2.0)
  instead of random `placePlant()` output, so the initial garden looks the
  same on every fresh database.
- **Spec file is lowercase (`spec.md`).** Windows FS is case-insensitive;
  left as-is to keep the diff empty.
- **Scaffold:** `create-next-app` (Next 16, App Router, JavaScript, no
  Tailwind, no src-dir). Default starter `app/page.js` kept as placeholder
  until M3.

## Futuro (non-obiettivi v1, spec section 11 — do not implement)

Mobile optimization, immagini nelle note, stagioni/giorno-notte, audio,
autosave, i18n, analytics, unit test, crescita automatica dello stadio,
drag&drop delle piante, multi-utente. Scalabilità oltre ~60 piante: TODO.
