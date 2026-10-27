// GET /api/tags — public [{name, slug, count}] by count desc (spec section 4).
// Solo tag con almeno una nota: quelli rimasti a zero vengono cancellati qui,
// alla prima lettura, oltre che dopo ogni scrittura di note.
import { count, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db.js";
import { tags, noteTags } from "@/lib/schema.js";
import { pruneOrphanTags } from "@/lib/noteWrite.js";

export async function GET() {
  try {
    const db = getDb();
    // La pulizia non deve mai impedire di mostrare l'elenco: se fallisce,
    // il filtro sul conteggio qui sotto nasconde comunque i tag vuoti.
    await pruneOrphanTags().catch(() => {});
    const rows = await db
      .select({
        name: tags.name,
        slug: tags.slug,
        count: count(noteTags.noteId),
      })
      .from(tags)
      .leftJoin(noteTags, eq(noteTags.tagId, tags.id))
      .groupBy(tags.id, tags.name, tags.slug)
      .having(gt(count(noteTags.noteId), 0))
      .orderBy(desc(count(noteTags.noteId)));
    return Response.json(
      rows.map((r) => ({ name: r.name, slug: r.slug, count: Number(r.count) })),
    );
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}
