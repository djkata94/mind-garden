"use client";

// Tag input with autocomplete from /api/tags (M4). Enter adds the first
// match or creates a new lowercase-slug tag. Props: value [{name, slug}],
// onChange(list).
import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/slugify.js";

export default function TagInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAllTags(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const selected = new Set(value.map((t) => t.slug));
  const suggestions = input.trim()
    ? allTags
        .filter(
          (t) =>
            !selected.has(t.slug) &&
            t.name.toLowerCase().includes(input.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function add(name) {
    const clean = String(name || "").trim();
    if (!clean) return;
    const slug = slugify(clean);
    if (!slug || selected.has(slug)) {
      setInput("");
      setOpen(false);
      return;
    }
    onChange([...value, { name: clean, slug }]);
    setInput("");
    setOpen(false);
  }

  function remove(slug) {
    onChange(value.filter((t) => t.slug !== slug));
  }

  const inputStyle = {
    width: "100%",
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #b9cfb0",
    background: "#fff",
    color: "#1d3325",
    boxSizing: "border-box",
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      {value.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {value.map((tag) => (
            <span
              key={tag.slug}
              style={{
                fontSize: 13,
                background: "#dce8d5",
                border: "1px solid rgba(60, 100, 70, 0.3)",
                borderRadius: 999,
                padding: "2px 6px 2px 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => remove(tag.slug)}
                aria-label={`Rimuovi tag ${tag.name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#2c5c3d",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(suggestions.length > 0 ? suggestions[0].name : input);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Aggiungi tag e premi Invio…"
        aria-label="Aggiungi tag"
        style={inputStyle}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: 4,
            background: "#fff",
            border: "1px solid #b9cfb0",
            borderRadius: 8,
            overflow: "hidden",
            zIndex: 30,
          }}
        >
          {suggestions.map((tag) => (
            <button
              type="button"
              key={tag.slug}
              onClick={() => add(tag.name)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                fontSize: 14,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#1d3325",
              }}
            >
              {tag.name} · {tag.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
