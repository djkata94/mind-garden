"use client";

// Search results dropdown under the Header search: matching notes, click
// flies the camera to the plant and opens it.
import { useState } from "react";
import { useGarden } from "../garden/GardenContext.jsx";

const STAGE_LABEL = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

export default function SearchBox() {
  const { notes, query, setQuery, setSelectedId, flyToNote } = useGarden();
  const [focused, setFocused] = useState(false);

  const q = query.trim().toLowerCase();
  const results =
    q && Array.isArray(notes)
      ? notes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 7)
      : [];
  const showList = focused && q.length > 0;

  function select(note) {
    setSelectedId(note.id);
    flyToNote(note);
    setQuery("");
    setFocused(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
          if (e.key === "Enter" && results.length > 0) select(results[0]);
        }}
        placeholder="Cerca per titolo…"
        aria-label="Cerca note per titolo"
        style={{
          fontSize: 14,
          padding: "8px 32px 8px 12px",
          borderRadius: 8,
          border: "1px solid #b9cfb0",
          background: "#fafcf6",
          color: "#1d3325",
          width: 200,
          maxWidth: "40vw",
        }}
      />
      {query ? (
        <button
          onClick={() => setQuery("")}
          aria-label="Azzera ricerca"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "#2c5c3d",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✕
        </button>
      ) : null}
      {showList ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            width: 260,
            maxWidth: "70vw",
            background: "#fafcf6",
            border: "1px solid #b9cfb0",
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 40,
            fontFamily: "sans-serif",
            boxShadow: "0 12px 32px rgba(20, 35, 25, 0.18)",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: "10px 14px", fontSize: 13, opacity: 0.7 }}>
              Nessuna nota trovata.
            </div>
          ) : (
            results.map((note) => (
              <button
                key={note.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(note);
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  fontSize: 13,
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #e3ecdd",
                  cursor: "pointer",
                  color: "#1d3325",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {note.title}
                </span>
                <span style={{ fontSize: 11, opacity: 0.6, flexShrink: 0 }}>
                  {STAGE_LABEL[note.stage] ?? note.stage}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
