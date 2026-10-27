"use client";

import { useState } from "react";
import TagModal from "./TagModal.jsx";

// Pulsante "Tag" lato client: apre la modale con tutti i tag del giardino.
// Da usare dentro l'Header (server component) accanto alla ricerca.
export default function TagButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 999,
          padding: "4px 14px",
          cursor: "pointer",
          background: "transparent",
          color: "#2c5c3d",
          border: "1px solid rgba(60, 100, 70, 0.5)",
        }}
      >
        Tag
      </button>
      <TagModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
