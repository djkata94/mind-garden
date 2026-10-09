// Initial garden seed: the 6 prototype notes (spec section 3).
// Usage: npm run seed  (requires DATABASE_URL, tables already pushed)
// Idempotent: re-running skips existing slugs/names/links.
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { notes, tags, noteTags } from "../lib/schema.js";
import { slugify } from "../lib/slugify.js";

const SEED_NOTES = [
  {
    title: "Makoto Shinkai e la nostalgia della luce",
    stage: "growing",
    variant: "cherry",
    tags: ["cinema", "anime", "estetica"],
    pos_x: 4.0,
    pos_z: 2.5,
    rot_y: 0.7,
    content: [
      "I film di **Makoto Shinkai** (*Your Name*, *Suzume*, *5 cm al secondo*)",
      "usano la luce come un linguaggio: treni, cieli e pioggia raccontano",
      "la distanza tra le persone.",
      "",
      "Da rivedere con attenzione ai fondali: ogni inquadratura",
      "potrebbe stare in una galleria d'arte.",
    ].join("\n"),
  },
  {
    title: "Viaggi anime: i luoghi reali dei film",
    stage: "seed",
    variant: null,
    tags: ["viaggi", "anime", "giappone"],
    pos_x: -3.5,
    pos_z: 4.5,
    rot_y: 2.1,
    content: [
      "Il *seichi junrei* (pellegrinaggio sacro) porta i fan nei luoghi reali",
      "che hanno ispirato gli anime: Hida per *Your Name*, Chichibu per *Anohana*.",
      "",
      "- Verificare periodi e trasporti locali",
      "- Rispettare i residenti: sono quartieri veri, non set",
    ].join("\n"),
  },
  {
    title: "Kyoto in autunno",
    stage: "mature",
    variant: null,
    tags: ["viaggi", "giappone", "fotografia"],
    pos_x: -5.0,
    pos_z: -3.0,
    rot_y: 4.0,
    content: [
      "A novembre **Kyoto** si accende: gli aceri di Eikando e Tofukuji",
      "richiedono arrivi presto la mattina per evitare la folla.",
      "",
      "Appunti fotografici: treppiede leggero, obiettivo luminoso,",
      "pazienza con la pioggia — il momiji bagnato è il più bello.",
    ].join("\n"),
  },
  {
    title: "Finali aperti: perché funzionano",
    stage: "growing",
    variant: "pine",
    tags: ["cinema", "scrittura"],
    pos_x: 3.0,
    pos_z: -4.5,
    rot_y: 5.3,
    content: [
      "Un finale aperto funziona quando la domanda rimasta è **più interessante**",
      "di qualsiasi risposta: *Inception*, *I soprano*, *5 cm al secondo*.",
      "",
      "Regola pratica: chiudere l'arco emotivo, lasciare aperto quello narrativo.",
    ].join("\n"),
  },
  {
    title: "Siti personali: piccoli giardini web",
    stage: "seed",
    variant: null,
    tags: ["web", "scrittura", "indie"],
    pos_x: 7.5,
    pos_z: 0.5,
    rot_y: 1.4,
    content: [
      "Il web indipendente torna a fiorire: blog statici, *digital garden*,",
      "newsletter scritte a mano.",
      "",
      "Meglio poche pagine curate che un feed infinito. Questo giardino",
      "è il mio tentativo.",
    ].join("\n"),
  },
  {
    title: "Tracker libri: cosa sto leggendo",
    stage: "mature",
    variant: null,
    tags: ["libri", "tracker"],
    pos_x: 0.5,
    pos_z: 7.0,
    rot_y: 3.2,
    content: [
      "Registro le letture in corso: romanzi giapponesi, saggi sul cinema,",
      "manuali di giardinaggio digitale.",
      "",
      "Prossimi titoli: *Norwegian Wood*, *Le città invisibili*,",
      "un saggio su Ozu.",
    ].join("\n"),
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (see .env.example).");
  }
  const client = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
  });
  const db = drizzle(client);

  for (const seed of SEED_NOTES) {
    const slug = slugify(seed.title);
    await db
      .insert(notes)
      .values({
        slug,
        title: seed.title,
        content: seed.content,
        stage: seed.stage,
        variant: seed.variant,
        posX: seed.pos_x,
        posZ: seed.pos_z,
        rotY: seed.rot_y,
        source: "garden",
      })
      .onConflictDoNothing({ target: notes.slug });

    // Re-fetch the note id by slug (works whether just inserted or pre-existing).
    const rows = await db
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.slug, slug))
      .limit(1);
    if (rows.length === 0) throw new Error(`Seed note missing: ${slug}`);
    const noteId = rows[0].id;

    for (const name of seed.tags) {
      await db
        .insert(tags)
        .values({ name, slug: slugify(name) })
        .onConflictDoNothing({ target: tags.name });
      const tagRows = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, name))
        .limit(1);
      await db
        .insert(noteTags)
        .values({ noteId, tagId: tagRows[0].id })
        .onConflictDoNothing();
    }
    console.log(`seeded: ${slug}`);
  }

  await client.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
