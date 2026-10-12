// /notes — public card list, works without WebGL (spec sections 2, 7).
// M3 fallback for the 3D garden. Detail pages arrive in M5, so cards link
// back to the garden for now.
import Link from "next/link";
import { connection } from "next/server";
import { getNotesList } from "@/lib/notesList.js";

export const metadata = {
  title: "Note — Il mio giardino digitale",
  description: "Tutte le note del giardino in formato elenco",
};

// DB-backed page: render at request time (opts out of static-shell check).
export const instant = false;

const STAGE_LABEL = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

export default async function NotesPage() {
  // Always render at request time (Next 16: no `export const dynamic`).
  await connection();
  let items = null;
  try {
    items = await getNotesList();
  } catch {
    items = null;
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 20px 64px",
        color: "#1d3325",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, margin: "0 0 6px" }}>Note</h1>
      <p style={{ opacity: 0.75, margin: "0 0 24px" }}>
        L&apos;elenco del giardino, leggibile anche senza 3D.{" "}
        <Link
          href="/"
          style={{ color: "#2c5c3d", fontWeight: 700 }}
        >
          Torna al giardino →
        </Link>
      </p>

      {items === null ? (
        <p style={{ lineHeight: 1.6 }}>
          Database non disponibile. Riprova tra poco.
        </p>
      ) : items.length === 0 ? (
        <p style={{ lineHeight: 1.6 }}>Non ci sono ancora note.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((note) => (
            <article
              key={note.id}
              style={{
                background: "#fafcf6",
                border: "1px solid rgba(60, 100, 70, 0.25)",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  {STAGE_LABEL[note.stage] ?? note.stage}
                </span>
                {note.updated_at && (
                  <span style={{ fontSize: 12, opacity: 0.6 }}>
                    {new Date(note.updated_at).toLocaleDateString("it-IT")}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>{note.title}</h2>
              {note.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  {note.tags.map((tag) => (
                    <span
                      key={tag.slug}
                      style={{
                        fontSize: 12,
                        background: "#dce8d5",
                        border: "1px solid rgba(60, 100, 70, 0.3)",
                        borderRadius: 999,
                        padding: "2px 10px",
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>
                {note.excerpt}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
