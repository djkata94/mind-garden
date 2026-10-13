"use client";

// Shared client state for the garden page (M4): notes list, title search,
// active tag filter, selection, note form and admin flag. Provided at the root
// layout so the Header search works on the same state as the canvas.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const GardenContext = createContext(null);

export function GardenProvider({ children }) {
  const [notes, setNotes] = useState(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null); // null | { mode: "new" } | { mode: "edit", id, slug }
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [flyTo, setFlyTo] = useState(null); // null | { x, z, key }

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const openNew = useCallback(() => setForm({ mode: "new" }), []);
  const openEdit = useCallback(
    (note) => setForm({ mode: "edit", id: note.id, slug: note.slug }),
    [],
  );
  const closeForm = useCallback(() => setForm(null), []);
  const toggleTag = useCallback(
    (slug) => setActiveTag((cur) => (cur === slug ? null : slug)),
    [],
  );
  const flyToNote = useCallback((note) => {
    if (!note) return;
    setFlyTo({ x: note.pos_x, z: note.pos_z, key: Date.now() });
  }, []);

  const value = useMemo(
    () => ({
      notes,
      setNotes,
      query,
      setQuery,
      activeTag,
      setActiveTag,
      toggleTag,
      selectedId,
      setSelectedId,
      form,
      openNew,
      openEdit,
      closeForm,
      refreshKey,
      refresh,
      isAdmin,
      setIsAdmin,
      flyTo,
      flyToNote,
    }),
    [
      notes,
      query,
      activeTag,
      selectedId,
      form,
      refreshKey,
      isAdmin,
      flyTo,
      refresh,
      openNew,
      openEdit,
      closeForm,
      toggleTag,
      flyToNote,
    ],
  );

  return (
    <GardenContext.Provider value={value}>{children}</GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden outside GardenProvider");
  return ctx;
}
