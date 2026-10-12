"use client";

// Tag chips row under the header (M4): click filters the visible plants,
// the others fade to opacity 0.15 instead of vanishing.
import { useEffect, useState } from "react";
import { useGarden } from "../garden/GardenContext.jsx";

export default function TagFilter() {
  const { activeTag, toggleTag } = useGarden();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]));
  }, []);

  if (tags.length === 0) return null;

  const chip = (isActive) => ({
    fontSize: 13,
    borderRadius: 999,
    padding: "4px 12px",
    cursor: "pointer",
    background: isActive ? "#2f5d3a" : "#fafcf6",
    color: isActive ? "#fff" : "#1d3325",
    border: "1px solid rgba(60, 100, 70, 0.35)",
  });

  return (
    <div
      style={{
        background: "#dce8d5",
        borderBottom: "1px solid #b9cfb0",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "8px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          fontFamily: "sans-serif",
        }}
      >
        <button onClick={() => toggleTag(null)} style={chip(activeTag === null)}>
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
    </div>
  );
}
