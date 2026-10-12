"use client";

// Tag filter behind a toggle button (improvement #1): the chips row stays
// hidden until requested. Click filters the visible plants, the others fade
// to opacity 0.15 instead of vanishing.
import { useEffect, useState } from "react";
import { useGarden } from "../garden/GardenContext.jsx";

export default function TagFilter() {
  const { activeTag, toggleTag, setActiveTag } = useGarden();
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]));
  }, []);

  if (tags.length === 0) return null;

  const active = tags.find((t) => t.slug === activeTag) ?? null;

  const chip = (isActive) => ({
    fontSize: 13,
    borderRadius: 999,
    padding: "4px 12px",
    cursor: "pointer",
    background: isActive ? "#2f5d3a" : "#fafcf6",
    color: isActive ? "#fff" : "#1d3325",
    border: "1px solid rgba(60, 100, 70, 0.35)",
  });

  const barStyle = {
    maxWidth: 960,
    margin: "0 auto",
    padding: "8px 20px",
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    fontFamily: "sans-serif",
  };

  return (
    <div
      style={{
        background: "#dce8d5",
        borderBottom: "1px solid #b9cfb0",
      }}
    >
      <div style={barStyle}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 999,
            padding: "4px 14px",
            cursor: "pointer",
            background: active ? "#2f5d3a" : "transparent",
            color: active ? "#fff" : "#2c5c3d",
            border: "1px solid rgba(60, 100, 70, 0.5)",
          }}
        >
          {open ? "▾" : "▸"} Tag{active ? `: ${active.name}` : ""}
        </button>
        {active && (
          <button
            onClick={() => setActiveTag(null)}
            aria-label="Rimuovi filtro tag"
            style={{
              fontSize: 13,
              background: "transparent",
              border: "none",
              color: "#2c5c3d",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <div style={{ ...barStyle, paddingTop: 0 }}>
          <button
            onClick={() => toggleTag(null)}
            style={chip(activeTag === null)}
          >
            Tutte
          </button>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => toggleTag(tag.slug)}
              aria-pressed={activeTag === tag.slug}
              style={chip(activeTag === tag.slug)}
            >
              {tag.name} · {tag.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
