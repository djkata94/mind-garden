// /notes/[slug] — public server-rendered note page (spec sections 2, 7):
// title, dates, tags, markdown, related, source badge, back to the garden.
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import ReactMarkdown from "react-markdown";
import { getNoteFull } from "@/lib/noteFull.js";

// DB-backed page: render at request time (no static shell).
export const instant = false;

const STAGE_LABEL = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

const SOURCE_LABEL = {
  tracker: "dal tracker",
  travelos: "da Travel OS",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const note = await getNoteFull(slug);
    if (!note) return { title: "Nota non trovata" };
    return {
      title: `${note.title} — Il mio giardino digitale`,
      description: note.title,
    };
  } catch {
    return { title: "Note — Il mio giardino digitale" };
  }
}

export default async function NotePage({ params }) {
  const { slug } = await params;
  await connection();

  let note = null;
  try {
    note = await getNoteFull(slug);
  } catch {
    note = null;
  }
  if (!note) notFound();

  const created = note.created_at
    ? new Date(note.created_at).toLocaleDateString("it-IT")
    : null;
  const updated = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString("it-IT")
    : null;

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
      <p style={{ margin: "0 0 16px" }}>
        <Link
          href="/"
          style={{ color: "#2c5c3d", fontWeight: 700 }}
        >
          ← Torna al giardino
        </Link>
      </p>

      <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 6px" }}>
        {STAGE_LABEL[note.stage] ?? note.stage}
        {note.source && note.source !== "garden" && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 12,
              background: "#fff3d6",
              border: "1px solid rgba(150, 110, 30, 0.4)",
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {SOURCE_LABEL[note.source] ?? `da ${note.source}`}
          </span>
        )}
      </p>

      <h1 style={{ fontSize: 32, margin: "0 0 8px", lineHeight: 1.2 }}>
        {note.title}
      </h1>

      <p style={{ fontSize: 13, opacity: 0.6, margin: "0 0 16px" }}>
        {created && <>Creata il {created}</>}
        {created && updated && created !== updated && <> · </>}
        {updated && created !== updated && <>aggiornata il {updated}</>}
      </p>

      {note.tags.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}
        >
          {note.tags.map((tag) => (
            <span
              key={tag.slug}
              style={{
                fontSize: 13,
                background: "#dce8d5",
                border: "1px solid rgba(60, 100, 70, 0.3)",
                borderRadius: 999,
                padding: "2px 12px",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div style={{ lineHeight: 1.7 }}>
        <ReactMarkdown>{note.content || ""}</ReactMarkdown>
      </div>

      {note.related.length > 0 && (
        <div
          style={{
            marginTop: 32,
            borderTop: "1px solid #b9cfb0",
            paddingTop: 16,
          }}
        >
          <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Note correlate</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
            {note.related.map((rel) => (
              <li key={rel.id}>
                <Link
                  href={`/notes/${rel.slug}`}
                  style={{ color: "#2c5c3d", fontWeight: 700 }}
                >
                  {rel.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
