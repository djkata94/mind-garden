// /api/notes/[id] — admin writes by id; public read by slug (spec section 4).
// Single dynamic segment: GET resolves the slug (M5 pages use it), PATCH and
// DELETE resolve the id and require the admin session.
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db.js";
import { notes, tags, noteTags } from "@/lib/schema.js";
import { requireAdmin } from "@/lib/auth.js";
import {
  STAGES,
  normalizeTags,
  linkTags,
  shapeNote,
} from "@/lib/noteWrite.js";

async function findBySlug(slug) {
  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

async function findById(id) {
  const db = getDb();
  const rows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return rows[0] ?? null;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

export async function GET(_request, { params }) {
  const { id: slug } = await params;
  try {
    // id fallback only for UUID-shaped params: anything else is a plain
    // slug miss (404), never a database error (500).
    const row =
      (await findBySlug(slug)) ??
      (isUuid(slug) ? await findById(slug) : null);
    if (!row)
      return Response.json({ error: "Nota non trovata." }, { status: 404 });
    const db = getDb();
    const tagRows = await db
      .select({ name: tags.name, slug: tags.slug })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(noteTags.noteId, row.id));

    const related = await relatedNotes(row.id, tagRows.map((t) => t.slug));
    return Response.json({
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
      related,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    });
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}

async function relatedNotes(noteId, slugs, max = 4) {
  if (slugs.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select({
      noteId: noteTags.noteId,
      slug: tags.slug,
    })
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

export async function PATCH(request, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  try {
    const row = await findById(id);
    if (!row)
      return Response.json({ error: "Nota non trovata." }, { status: 404 });

    const patch = { updatedAt: new Date() };
    if (body.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title)
        return Response.json(
          { error: "Titolo obbligatorio." },
          { status: 400 },
        );
      patch.title = title;
    }
    if (body.content !== undefined) patch.content = String(body.content ?? "");
    if (body.stage !== undefined) {
      if (!STAGES.includes(body.stage))
        return Response.json(
          { error: "Stadio non valido." },
          { status: 400 },
        );
      patch.stage = body.stage;
    }
    if (body.pos_x !== undefined) patch.posX = Number(body.pos_x);
    if (body.pos_z !== undefined) patch.posZ = Number(body.pos_z);

    const db = getDb();
    const [updated] = await db
      .update(notes)
      .set(patch)
      .where(eq(notes.id, id))
      .returning();

    if (body.tags !== undefined) {
      await db.delete(noteTags).where(eq(noteTags.noteId, id));
      await linkTags(id, normalizeTags(body.tags));
    }
    return Response.json(await shapeNote(updated));
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  try {
    const row = await findById(id);
    if (!row)
      return Response.json({ error: "Nota non trovata." }, { status: 404 });
    const db = getDb();
    await db.delete(notes).where(eq(notes.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}
