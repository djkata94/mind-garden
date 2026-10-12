// Server-only: full public note with tags + related (spec section 4).
// Shared by GET /api/notes/:slug and the /notes/[slug] page (M5).
import { eq, inArray } from "drizzle-orm";
import { getDb } from "./db.js";
import { notes, tags, noteTags } from "./schema.js";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

export async function getNoteFull(slugOrId) {
  const db = getDb();
  const bySlug = await db
    .select()
    .from(notes)
    .where(eq(notes.slug, slugOrId))
    .limit(1);
  let row = bySlug[0] ?? null;
  if (!row && isUuid(slugOrId)) {
    const byId = await db
      .select()
      .from(notes)
      .where(eq(notes.id, slugOrId))
      .limit(1);
    row = byId[0] ?? null;
  }
  if (!row) return null;

  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(eq(noteTags.noteId, row.id));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    stage: row.stage,
    variant: row.variant,
    color: row.color,
    pos_x: row.posX,
    pos_z: row.posZ,
    rot_y: row.rotY,
    source: row.source,
    tags: tagRows,
    related: await relatedNotes(row.id, tagRows.map((t) => t.slug)),
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function relatedNotes(noteId, slugs, max = 4) {
  if (slugs.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select({ noteId: noteTags.noteId, slug: tags.slug })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id));
  const shared = new Map();
  for (const row of rows) {
    if (row.noteId === noteId) continue;
    if (!slugs.includes(row.slug)) continue;
    shared.set(row.noteId, (shared.get(row.noteId) ?? 0) + 1);
  }
  const ranked = [...shared.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id]) => id);
  if (ranked.length === 0) return [];
  const found = await db
    .select({ id: notes.id, slug: notes.slug, title: notes.title })
    .from(notes)
    .where(inArray(notes.id, ranked));
  const order = new Map(ranked.map((id, i) => [id, i]));
  return found.sort((a, b) => order.get(a.id) - order.get(b.id));
}
