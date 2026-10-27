"use client";

import { useEffect, useState } from "react";
import { useGarden } from "../garden/GardenContext.jsx";

// Pulsante "Tag" lato client: apre una modale con tutti i tag del giardino.
// Contiene sia il pulsante che la modale per evitare confini client/server annidati.
export default function TagButton() {
  const { activeTag, toggleTag } = useGarden();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/tags")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]));
  }, [open]);

  const active = tags.find((t) => t.slug === activeTag) ?? null;

  const chip = (isActive) => ({
    fontSize: 13,
    borderRadius: 999,
    padding: "6px 14px",
    cursor: "pointer",
    background: isActive ? "#2f5d3a" : "#fafcf6",
    color: isActive ? "#fff" : "#1d3325",
    border: "1px solid rgba(60, 100, 70, 0.35)",
    textAlign: "left",
    width: "100%",
    paddingLeft: 14,
  });

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
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tag"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 35, 25, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              minWidth: 300,
              maxWidth: 440,
              boxShadow: "0 20px 50px rgba(20, 35, 25, 0.25)",
              fontFamily: "sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, color: "#1d3325" }}>Tag</h2>
              <button
                onClick={() => {
                  toggleTag(null);
                  setOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#2c5c3d",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Azzera
              </button>
            </div>
            <div style={{ maxHeight: 300, overflowY: auto }}>
              {tags.length === 0 ? (
                <p style={{ fontSize: 13, opacity: 0.7, textAlign: "center" }}>
                  Nessun tag disponibile.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => {
                      toggleTag(null);
                      setOpen(false);
                    }}
                    style={{
                      ...chip(activeTag === null),
                    }}
                  >
                    Tutte le note
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag.slug}
                      onClick={() => {
                        toggleTag(tag.slug);
                        setOpen(false);
                      }}
                      aria-pressed={activeTag === tag.slug}
                      style={{
                        ...chip(activeTag === tag.slug),
                      }}
                    >
                      {tag.name}
                      <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400 }}>
                        {tag.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
