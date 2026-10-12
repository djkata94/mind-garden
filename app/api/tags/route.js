// GET /api/tags — public [{name, slug, count}] by count desc (spec section 4).
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db.js";
import { tags, noteTags } from "@/lib/schema.js";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        name: tags.name,
        slug: tags.slug,
        count: count(noteTags.noteId),
      })
      .from(tags)
      .leftJoin(noteTags, eq(noteTags.tagId, tags.id))
      .groupBy(tags.id, tags.name, tags.slug)
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
