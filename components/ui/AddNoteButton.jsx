"use client";

// "+" button in the Header, admin only (rendered by AuthNav). Opens the
// blank NoteForm.
import { useGarden } from "../garden/GardenContext.jsx";

export default function AddNoteButton() {
  const { openNew } = useGarden();

  return (
    <button
      onClick={openNew}
      aria-label="Nuova nota"
      title="Pianta una nuova nota"
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        background: "#2f5d3a",
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      +
    </button>
  );
}
