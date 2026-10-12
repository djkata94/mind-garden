// Shared write helpers for /api/notes (spec section 4).
// Used by POST (collection route) and PATCH (item route).
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./db.js";
import { notes, tags, noteTags } from "./schema.js";
import { slugify } from "./slugify.js";
import { placePlant } from "./placement.js";
import { excerptOf } from "./excerpt.js";

export const STAGES = ["seed", "growing", "mature"];

// Palette for seed colors (spec fixes only the default; rotation documented).
export const SEED_PALETTE = [
  "#FF9DE2",
  "#C9A6FF",
  "#9DE2FF",
  "#A8E6A1",
  "#FFD166",
];

export function hashId(id) {
  let h = 0;
  for (const ch of String(id)) h = (h + ch.charCodeAt(0)) % 1024;
  return h;
}

export function variantFor(id) {
  return hashId(id) % 2 === 0 ? "pine" : "cherry";
}

export async function uniqueSlug(base) {
  const db = getDb();
  const clean = slugify(base) || "nota";
  const rows = await db.select({ slug: notes.slug }).from(notes);
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i++;
  return `${clean}-${i}`;
}

// Normalize string tags: trim, drop empties, dedupe by slug.
export function normalizeTags(input) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(input) ? input : []) {
    const name = String(raw || "").trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
  }
  return out;
}

export async function linkTags(noteId, tagList) {
  const db = getDb();
  for (const tag of tagList) {
    await db
      .insert(tags)
      .values({ name: tag.name, slug: tag.slug })
      .onConflictDoNothing({ target: tags.name });
    const rows = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, tag.slug))
      .limit(1);
    await db
      .insert(noteTags)
      .values({ noteId, tagId: rows[0].id })
      .onConflictDoNothing();
  }
}

export async function shapeNote(row) {
  const db = getDb();
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(eq(noteTags.noteId, row.id));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: excerptOf(row.content),
    stage: row.stage,
    variant: row.variant,
    color: row.color,
    pos_x: row.posX,
    pos_z: row.posZ,
    rot_y: row.rotY,
    tags: tagRows,
    updated_at: row.updatedAt,
  };
}

export async function createNote({ title, content, stage, tags: tagInput }) {
  const db = getDb();
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) {
    return { error: { message: "Titolo obbligatorio.", status: 400 } };
  }
  const cleanStage = stage || "seed";
  if (!STAGES.includes(cleanStage)) {
    return { error: { message: "Stadio non valido.", status: 400 } };
  }

  const id = randomUUID();
  const slug = await uniqueSlug(cleanTitle);
  const existing = await db
    .select({ posX: notes.posX, posZ: notes.posZ })
    .from(notes);
  const pos = placePlant(
    existing.map((p) => ({ pos_x: p.posX, pos_z: p.posZ })),
  );

  const [row] = await db
    .insert(notes)
    .values({
      id,
      slug,
      title: cleanTitle,
      content: String(content ?? ""),
      stage: cleanStage,
      variant: cleanStage === "growing" ? variantFor(id) : null,
      color:
        cleanStage === "seed"
          ? SEED_PALETTE[Math.floor(Math.random() * SEED_PALETTE.length)]
          : "#FF9DE2",
      posX: pos.pos_x,
      posZ: pos.pos_z,
      rotY: pos.rot_y,
      source: "garden",
    })
    .returning();

  const tagList = normalizeTags(tagInput);
  await linkTags(id, tagList);
  const shaped = await shapeNote(row);
  return { note: { ...shaped, url: `/notes/${slug}` } };
}
