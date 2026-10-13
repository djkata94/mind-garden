"use client";

// 3D garden (M3 read-only + M4 filters): plants from /api/notes, hover
// tooltip, click selects (full panel). Search + tag filter dim non-matching
// plants to opacity 0.15. Loaded with ssr:false from app/page.js.
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sparkles, useGLTF } from "@react-three/drei";
import Ground from "./Ground.jsx";
import GrassTufts from "./GrassTufts.jsx";
import Backdrop from "./Backdrop.jsx";
import SceneLights from "./SceneLights.jsx";
import Effects from "./Effects.jsx";
import Seed from "./Seed.jsx";
import Tree from "./Tree.jsx";
import GardenErrorBoundary from "./GardenErrorBoundary.jsx";
import NotePanel from "../ui/NotePanel.jsx";
import { useGarden } from "./GardenContext.jsx";

useGLTF.preload("/models/pino.glb");
useGLTF.preload("/models/abete.glb");
useGLTF.preload("/models/ciliegio.glb");
useGLTF.preload("/models/quercia.glb");
useGLTF.preload("/models/mango.glb");
useGLTF.preload("/models/seme.glb");
useGLTF.preload("/models/Clover.glb");
useGLTF.preload("/models/tall_grass.glb");

// Plant mapping (improvement #2): seed → sprout model; growing rotates
// pine/fir/cherry; mature rotates oak/mango. Missing growing variants fall
// back to a stable id hash (same rule as POST).
function resolvePlant(note) {
  if (note.stage === "seed")
    return { kind: "sprout", model: "/models/seme.glb", targetHeight: 0.8 };
  if (note.stage === "mature") {
    return hashId(note.id) % 2 === 0
      ? { kind: "tree", model: "/models/quercia.glb", targetHeight: 5.5 }
      : { kind: "tree", model: "/models/mango.glb", targetHeight: 4.5 };
  }
  const variant = note.variant ?? ["pine", "fir", "cherry"][hashId(note.id) % 3];
  if (variant === "cherry")
    return { kind: "tree", model: "/models/ciliegio.glb", targetHeight: 3.2 };
  if (variant === "fir")
    return { kind: "tree", model: "/models/abete.glb", targetHeight: 2.2 };
  return { kind: "tree", model: "/models/pino.glb", targetHeight: 2.2 };
}

function hashId(id) {
  let h = 0;
  for (const ch of String(id)) h = (h + ch.charCodeAt(0)) % 1024;
  return h;
}

function GardenBanner({ title, children }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#dce8d5",
        color: "#1d3325",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>{title}</h2>
        <div style={{ opacity: 0.8, lineHeight: 1.6 }}>{children}</div>
        <p style={{ margin: "16px 0 0" }}>
          <Link
            href="/notes"
            style={{
              color: "#2c5c3d",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            Sfoglia le note in formato elenco →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function GardenCanvas() {
  const {
    notes,
    setNotes,
    query,
    activeTag,
    selectedId,
    setSelectedId,
    refreshKey,
  } = useGarden();
  const [failed, setFailed] = useState(false);

  // Live updates (improvement #5): sibling apps write straight to the DB,
  // so the list refetches silently — every 30s (tab visible only) and on
  // focus/return. Selection and filters survive (derived from fresh notes).
  const load = useCallback(
    (initial = false) => {
      if (initial) {
        setNotes(null);
        setFailed(false);
      }
      fetch("/api/notes")
        .then((res) => {
          if (!res.ok) throw new Error("notes fetch failed");
          return res.json();
        })
        .then((data) => {
          setNotes(Array.isArray(data) ? data : []);
          setFailed(false);
        })
        .catch(() => {
          if (initial) setFailed(true);
        });
    },
    [setNotes],
  );

  useEffect(() => {
    load(true);
  }, [refreshKey, load]);

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) load();
    };
    const onFocus = () => load();
    const onVisibility = () => {
      if (!document.hidden) load();
    };
    const timer = setInterval(tick, 30000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const selected = notes?.find((n) => n.id === selectedId) ?? null;

  const matches = (note) => {
    const q = query.trim().toLowerCase();
    if (q && !note.title.toLowerCase().includes(q)) return false;
    if (activeTag && !note.tags.some((t) => t.slug === activeTag)) return false;
    return true;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 100px)",
        minHeight: 480,
        overflow: "hidden",
        background: "#dce8d5",
      }}
    >
      <GardenErrorBoundary
        fallback={
          <GardenBanner title="Il giardino 3D non si avvia">
            Il browser non supporta WebGL oppure qualcosa è andato storto nel
            rendering. Le tue note sono al sicuro:
          </GardenBanner>
        }
      >
        {failed ? (
          <GardenBanner title="Giardino non disponibile">
            Non riesco a caricare le note dal database. Riprova tra poco:
          </GardenBanner>
        ) : notes === null ? (
          <GardenBanner title="Il giardino sta germogliando…">
            Caricamento delle piante in corso.
          </GardenBanner>
        ) : notes.length === 0 ? (
          <GardenBanner title="Il giardino è ancora vuoto">
            Non ci sono note da piantare. Torna dopo la semina:
          </GardenBanner>
        ) : (
          <>
            <Canvas
              shadows
              dpr={[1, 1.75]}
              camera={{ position: [0, 4.5, 16], fov: 45 }}
              onPointerMissed={() => setSelectedId(null)}
            >
              <color attach="background" args={["#dce8d5"]} />
              <fog attach="fog" args={["#dce8d5", 14, 44]} />
              <SceneLights />
              <Backdrop />
              <Suspense fallback={null}>
                <Ground />
                <GrassTufts />
                {notes.map((note) => {
                  const plant = resolvePlant(note);
                  const shared = {
                    key: note.id,
                    note,
                    selected: note.id === selectedId,
                    dimmed: !matches(note),
                    onSelect: (n) => setSelectedId(n.id),
                  };
                  return plant.kind === "sprout" ? (
                    <Seed
                      {...shared}
                      model={plant.model}
                      targetHeight={plant.targetHeight}
                    />
                  ) : (
                    <Tree
                      {...shared}
                      model={plant.model}
                      targetHeight={plant.targetHeight}
                    />
                  );
                })}
                <Sparkles
                  count={110}
                  scale={16}
                  size={2.5}
                  speed={0.3}
                  opacity={0.55}
                  color="#ffffff"
                />
              </Suspense>
              <OrbitControls
                target={[0, 2.5, 0]}
                maxPolarAngle={Math.PI / 2.15}
                minDistance={5}
                maxDistance={26}
                enablePan={false}
              />
              <Effects />
            </Canvas>
            {selected && (
              <NotePanel
                note={selected}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}
      </GardenErrorBoundary>
    </div>
  );
}
