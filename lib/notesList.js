// Server-only: shaped public notes list (spec section 4, GET /api/notes).
// Shared by the API route and the /notes fallback page.
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db.js";
import { notes, tags, noteTags } from "./schema.js";
import { excerptOf } from "./excerpt.js";

export async function getNotesList() {
  const db = getDb();
  const all = await db.select().from(notes).orderBy(desc(notes.updatedAt));
  const tagRows = await db
    .select({
      noteId: noteTags.noteId,
      name: tags.name,
      slug: tags.slug,
    })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id));

  const byNote = new Map();
  for (const row of tagRows) {
    if (!byNote.has(row.noteId)) byNote.set(row.noteId, []);
    byNote.get(row.noteId).push({ name: row.name, slug: row.slug });
  }

  return all.map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: excerptOf(n.content),
    stage: n.stage,
    variant: n.variant,
    color: n.color,
    pos_x: n.posX,
    pos_z: n.posZ,
    rot_y: n.rotY,
    tags: byNote.get(n.id) ?? [],
    updated_at: n.updatedAt,
  }));
}
