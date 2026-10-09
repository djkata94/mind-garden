// Drizzle schema for mind-garden (Neon Postgres).
// Spec: SPEC.md section 3.
import {
  pgTable,
  uuid,
  text,
  real,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    stage: text("stage").notNull().default("seed"), // 'seed' | 'growing' | 'mature'
    variant: text("variant"), // 'pine' | 'cherry' | null (auto)
    color: text("color").notNull().default("#FF9DE2"), // used only by stage='seed'
    posX: real("pos_x").notNull(),
    posZ: real("pos_z").notNull(),
    rotY: real("rot_y").notNull(),
    source: text("source").notNull().default("garden"), // 'garden' | 'tracker' | 'travelos'
    sourceId: text("source_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Idempotency for /api/seed upserts: unique only when source_id is set.
    uniqueIndex("notes_source_source_id_unique")
      .on(t.source, t.sourceId)
      .where(sql`${t.sourceId} is not null`),
  ],
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const noteTags = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.noteId, t.tagId] })],
);
