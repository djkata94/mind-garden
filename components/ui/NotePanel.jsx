"use client";

// Read-only panel for the selected plant (M3). M4 extends it with full
// markdown, clickable tags, related notes and edit/delete buttons.
const STAGE_LABEL = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

export default function NotePanel({ note, onClose }) {
  const updated = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString("it-IT")
    : null;

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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

      <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>{note.excerpt}</p>

      {updated && (
        <p style={{ margin: "12px 0 0", fontSize: 12, opacity: 0.6 }}>
          Aggiornata il {updated}
        </p>
      )}
    </aside>
  );
}
