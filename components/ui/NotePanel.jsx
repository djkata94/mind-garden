"use client";

// Full panel for the selected plant (M4): stage, title, clickable tags
// (filter the garden), markdown content, related notes, source badge and
// admin-only edit/delete. Full content loads from GET /api/notes/:slug.
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useGarden } from "../garden/GardenContext.jsx";

const STAGE_LABEL = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

const SOURCE_LABEL = {
  tracker: "dal tracker",
  travelos: "da Travel OS",
};

export default function NotePanel({ note, onClose }) {
  const { notes, setSelectedId, toggleTag, isAdmin, openEdit, refresh } =
    useGarden();
  const [full, setFull] = useState(null);
  const [failed, setFailed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFull(null);
    setFailed(false);
    setError(null);
    fetch(`/api/notes/${encodeURIComponent(note.slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("note fetch failed");
        return res.json();
      })
      .then(setFull)
      .catch(() => setFailed(true));
  }, [note.slug]);

  const updated = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString("it-IT")
    : null;

  function openRelated(id) {
    if (notes?.some((n) => n.id === id)) setSelectedId(id);
  }

  async function onDelete() {
    if (
      !window.confirm(`Eliminare la nota "${note.title}" dal giardino?`)
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(note.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Eliminazione non riuscita.");
      onClose();
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const buttonStyle = {
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <aside
      style={{
        position: "absolute",
        top: 24,
        right: 24,
        width: 340,
        maxWidth: "calc(100vw - 48px)",
        maxHeight: "calc(100% - 48px)",
        overflow: "auto",
        background: "rgba(250, 252, 246, 0.92)",
        border: "1px solid rgba(60, 100, 70, 0.25)",
        borderRadius: 20,
        padding: 20,
        color: "#1d3325",
        backdropFilter: "blur(12px)",
        zIndex: 20,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <span style={{ opacity: 0.7, textTransform: "capitalize" }}>
          {STAGE_LABEL[note.stage] ?? note.stage}
        </span>
        <button
          onClick={onClose}
          aria-label="Chiudi pannello"
          style={{
            background: "transparent",
            border: "none",
            color: "#2c5c3d",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <h2 style={{ margin: "0 0 10px", fontSize: 26, lineHeight: 1.2 }}>
        {note.title}
      </h2>

      {note.tags?.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
        >
          {note.tags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => {
                toggleTag(tag.slug);
                onClose();
              }}
              title={`Filtra per ${tag.name}`}
              style={{
                fontSize: 12,
                background: "#dce8d5",
                border: "1px solid rgba(60, 100, 70, 0.3)",
                borderRadius: 999,
                padding: "2px 10px",
                cursor: "pointer",
                color: "#1d3325",
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {failed ? (
        <p style={{ opacity: 0.7 }}>Non riesco a caricare la nota.</p>
      ) : !full ? (
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      ) : (
        <>
          <div style={{ lineHeight: 1.6, opacity: 0.9 }}>
            <ReactMarkdown>{full.content || ""}</ReactMarkdown>
          </div>

          {full.related?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h3 style={{ fontSize: 14, margin: "0 0 6px", opacity: 0.7 }}>
                Note correlate
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                {full.related.map((rel) => (
                  <li key={rel.id}>
                    <button
                      onClick={() => openRelated(rel.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        color: "#2c5c3d",
                        cursor: "pointer",
                        fontSize: 14,
                        textDecoration: "underline",
                        textAlign: "left",
                      }}
                    >
                      {rel.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        {full?.source && full.source !== "garden" && (
          <span
            style={{
              fontSize: 12,
              background: "#fff3d6",
              border: "1px solid rgba(150, 110, 30, 0.4)",
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {SOURCE_LABEL[full.source] ?? `da ${full.source}`}
          </span>
        )}
        {updated && (
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Aggiornata il {updated}
          </span>
        )}
      </div>

      {isAdmin && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => openEdit(note)}
            style={{
              ...buttonStyle,
              border: "1px solid #b9cfb0",
              background: "transparent",
              color: "#1d3325",
            }}
          >
            Modifica
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              ...buttonStyle,
              border: "1px solid #d8a0a0",
              background: "transparent",
              color: "#a83232",
              cursor: deleting ? "wait" : "pointer",
            }}
          >
            {deleting ? "Elimino…" : "Elimina"}
          </button>
        </div>
      )}
      {error && (
        <p style={{ color: "#a83232", fontSize: 14, margin: "8px 0 0" }}>
          {error}
        </p>
      )}
    </aside>
  );
}
