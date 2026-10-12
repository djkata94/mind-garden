"use client";

// Seed plant (stage 'seed'): glowing procedural sphere + ground ring.
// Behavior baseline = approved prototype (float, pulse, tooltip, pointer).
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export default function Seed({ note, selected, onSelect }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 0.4 + Math.sin(t * 1.4 + note.pos_x) * 0.07;
    const pulse = 1 + Math.sin(t * 2.2 + note.pos_z) * 0.06;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group
      position={[note.pos_x, 0, note.pos_z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(note);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.42, 0.58, 40]} />
        <meshBasicMaterial
          color={note.color}
          transparent
          opacity={hovered || selected ? 0.75 : 0.35}
        />
      </mesh>

      <mesh ref={ref} castShadow position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[0.28, 2]} />
        <meshStandardMaterial
          color={note.color}
          emissive={note.color}
          emissiveIntensity={hovered || selected ? 2 : 1.1}
          roughness={0.3}
        />
      </mesh>

      {hovered && (
        <Html
          center
          distanceFactor={10}
          position={[0, 1.1, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(20, 35, 25, 0.85)",
              border: "1px solid rgba(180, 255, 200, 0.3)",
              color: "#EAF9EF",
              padding: "6px 10px",
              borderRadius: 12,
              whiteSpace: "nowrap",
              fontFamily: "sans-serif",
              fontSize: 12,
            }}
          >
            🌱 {note.title}
          </div>
        </Html>
      )}
    </group>
  );
}
