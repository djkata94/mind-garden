// POST /api/seed — ingest from sibling projects (spec section 4).
// Bearer token auth (SEED_TOKEN), CORS restricted to ALLOWED_ORIGINS,
// upsert on (source, source_id) so retries never duplicate. Answers
// { url: '/notes/slug' }.
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db.js";
import { notes, noteTags } from "@/lib/schema.js";
import { passwordsEqual } from "@/lib/auth.js";
import {
  SEED_PALETTE,
  stageFor,
  variantFor,
  uniqueSlug,
  normalizeTags,
  linkTags,
} from "@/lib/noteWrite.js";
import { placePlant } from "@/lib/placement.js";

const SOURCES = ["tracker", "travelos"];

function allowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  const headers = { Vary: "Origin" };
  if (origin && allowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function POST(request) {
  const headers = corsHeaders(request);

  if (!process.env.SEED_TOKEN) {
    return Response.json(
      { error: "Ingest non configurato (SEED_TOKEN mancante)." },
      { status: 500, headers },
    );
  }
  const token = bearerToken(request);
  if (!token || !passwordsEqual(token, process.env.SEED_TOKEN)) {
    return Response.json({ error: "Non autorizzato." }, { status: 401, headers });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Richiesta non valida." },
      { status: 400, headers },
    );
  }

  const source = String(body.source || "");
  const sourceId = String(body.source_id || "").trim();
  const title = String(body.title || "").trim();
  if (!SOURCES.includes(source)) {
    return Response.json(
      { error: "Source non valido (tracker|travelos)." },
      { status: 400, headers },
    );
  }
  if (!sourceId) {
    return Response.json(
      { error: "source_id obbligatorio." },
      { status: 400, headers },
    );
  }
  if (!title) {
    return Response.json({ error: "Titolo obbligatorio." }, { status: 400, headers });
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.source, source), eq(notes.sourceId, sourceId)))
      .limit(1);

    const tagList = normalizeTags(body.tags);
    const cleanContent = String(body.content ?? "");
    // Automatic growth (improvement #4): content drives the stage.
    const autoStage = stageFor(cleanContent);
    let slug;

    if (existing.length > 0) {
      // Idempotent retry: refresh mutable fields, keep the stable slug.
      const row = existing[0];
      slug = row.slug;
      await db
        .update(notes)
        .set({
          title,
          content: cleanContent,
          stage: autoStage,
          variant:
            autoStage === "growing" && !row.variant
              ? variantFor(row.id)
              : row.variant,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, row.id));
      await db.delete(noteTags).where(eq(noteTags.noteId, row.id));
      await linkTags(row.id, tagList);
    } else {
      slug = await uniqueSlug(title);
      const placed = await db
        .select({ posX: notes.posX, posZ: notes.posZ })
        .from(notes);
      const pos = placePlant(
        placed.map((p) => ({ pos_x: p.posX, pos_z: p.posZ })),
      );
      const id = randomUUID();
      const [row] = await db
        .insert(notes)
        .values({
          id,
          slug,
          title,
          content: cleanContent,
          stage: autoStage,
          variant: autoStage === "growing" ? variantFor(id) : null,
          color:
            SEED_PALETTE[Math.floor(Math.random() * SEED_PALETTE.length)],
          posX: pos.pos_x,
          posZ: pos.pos_z,
          rotY: pos.rot_y,
          source,
          sourceId,
        })
        .returning();
      await linkTags(row.id, tagList);
    }

    return Response.json({ url: `/notes/${slug}` }, { headers });
  } catch (err) {
    // Unique (source, source_id) race: a concurrent identical ingest won.
    if (String(err?.code) === "23505") {
      const db = getDb();
      const rows = await db
        .select({ slug: notes.slug })
        .from(notes)
        .where(and(eq(notes.source, source), eq(notes.sourceId, sourceId)))
        .limit(1);
      if (rows.length > 0)
        return Response.json({ url: `/notes/${rows[0].slug}` }, { headers });
    }
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500, headers },
    );
  }
}
