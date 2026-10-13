// /api/notes/[id] — admin writes by id; public read by slug (spec section 4).
// Single dynamic segment: GET resolves the slug (M5 pages use it), PATCH and
// DELETE resolve the id and require the admin session.
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db.js";
import { notes, noteTags } from "@/lib/schema.js";
import { requireAdmin } from "@/lib/auth.js";
import { getNoteFull } from "@/lib/noteFull.js";
import { corsHeaders } from "@/lib/cors.js";
import {
  stageFor,
  variantFor,
  normalizeTags,
  linkTags,
  shapeNote,
} from "@/lib/noteWrite.js";

export async function GET(request, { params }) {
  const { id: slug } = await params;
  const headers = corsHeaders(request);
  try {
    // Non-UUID misses are plain 404s, never database errors (500).
    const full = await getNoteFull(slug);
    if (!full)
      return Response.json(
        { error: "Nota non trovata." },
        { status: 404, headers },
      );
    return Response.json(full, { headers });
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500, headers },
    );
  }
}

async function findById(id) {
  const db = getDb();
  const rows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function PATCH(request, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;  let body = {};
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
    if (body.content !== undefined) {
      patch.content = String(body.content ?? "");
      // Automatic growth (improvement #4): content drives the stage.
      patch.stage = stageFor(patch.content);
      if (patch.stage === "growing" && !row.variant) {
        patch.variant = variantFor(id);
      }
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
