"use client";

// Title search in the Header: client-side filter of the garden plants (M4).
import { useGarden } from "../garden/GardenContext.jsx";

export default function SearchBox() {
  const { query, setQuery } = useGarden();

  return (
    <div style={{ position: "relative" }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
      {query && (
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
      )}
    </div>
  );
}
