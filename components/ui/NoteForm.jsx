"use client";

// Create/edit panel-modal: required title, markdown textarea with preview
// toggle, TagInput. The stage is automatic (improvement #4): the form shows
// what the note will become as you type. Save → POST/PATCH, the plant
// appears in the garden right away via context refresh.
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useGarden } from "../garden/GardenContext.jsx";
import { stageFor } from "@/lib/stage.js";
import TagInput from "./TagInput.jsx";

const STAGE_HINT = {
  seed: "Seme",
  growing: "In crescita",
  mature: "Matura",
};

const fieldStyle = {
  width: "100%",
  fontSize: 14,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #b9cfb0",
  background: "#fff",
  color: "#1d3325",
  boxSizing: "border-box",
  fontFamily: "sans-serif",
};

export default function NoteForm() {
  const { form, closeForm, refresh, setSelectedId } = useGarden();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = form?.mode === "edit";

  useEffect(() => {
    setError(null);
    setPreview(false);
    if (!form) return;
    if (form.mode === "new") {
      setTitle("");
      setContent("");
      setTags([]);
      return;
    }
    // Edit: load the full note (list items carry no markdown content).
    setFetching(true);
    fetch(`/api/notes/${encodeURIComponent(form.slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json();
      })
      .then((data) => {
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setTags(Array.isArray(data.tags) ? data.tags : []);
      })
      .catch(() => setError("Non riesco a caricare la nota."))
      .finally(() => setFetching(false));
  }, [form]);

  if (!form) return null;

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        content,
        tags: tags.map((t) => t.name),
      };
      const url =
        isEdit && form.id
          ? `/api/notes/${encodeURIComponent(form.id)}`
          : "/api/notes";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Salvataggio non riuscito.");
      refresh();
      if (data.id) setSelectedId(data.id);
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifica nota" : "Nuova nota"}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeForm();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 35, 25, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 560,
          maxWidth: "100%",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          background: "#fafcf6",
          borderRadius: 20,
          padding: 24,
          color: "#1d3325",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>
          {isEdit ? "Modifica nota" : "Pianta una nuova nota"}
        </h2>

        {fetching ? (
          <p>Caricamento…</p>
        ) : (
          <>
            <label
              style={{ display: "block", fontSize: 13, marginBottom: 12 }}
            >
              Titolo *
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                style={{ ...fieldStyle, marginTop: 4 }}
              />
            </label>

            <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 12px" }}>
              Diventerà: <strong>{STAGE_HINT[stageFor(content)]}</strong>{" "}
              ({content.length} caratteri)
            </p>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 13 }}>Contenuto (markdown)</span>
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  style={{
                    fontSize: 13,
                    background: "transparent",
                    border: "1px solid #b9cfb0",
                    borderRadius: 8,
                    padding: "2px 10px",
                    cursor: "pointer",
                    color: "#2c5c3d",
                  }}
                >
                  {preview ? "Modifica" : "Anteprima"}
                </button>
              </div>
              {preview ? (
                <div
                  style={{
                    ...fieldStyle,
                    minHeight: 140,
                    background: "#fff",
                  }}
                >
                  {content.trim() ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <span style={{ opacity: 0.5 }}>Niente da mostrare.</span>
                  )}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <span
                style={{ display: "block", fontSize: 13, marginBottom: 4 }}
              >
                Tag
              </span>
              <TagInput value={tags} onChange={setTags} />
            </div>

            {error && (
              <p style={{ color: "#a83232", fontSize: 14, margin: "0 0 12px" }}>
                {error}
              </p>
            )}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #b9cfb0",
                  background: "transparent",
                  color: "#1d3325",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2f5d3a",
                  color: "#fff",
                  cursor: loading ? "wait" : "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {loading ? "Salvataggio…" : "Salva"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
