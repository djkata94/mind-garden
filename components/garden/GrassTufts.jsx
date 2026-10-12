"use client";

// Real grass (improvements #2+#3): instanced Quaternius Clover + Tall Grass
// clones scattered in the ring. Shared geometries/materials, no shadows
// (perf), fogged like the ground.
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

const CLOVER_COUNT = 90;
const GRASS_COUNT = 90;

function scatter(count, minScale, maxScale) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = 2 + Math.pow(Math.random(), 0.7) * 28;
    const a = Math.random() * Math.PI * 2;
    items.push({
      position: [Math.cos(a) * r, 0, Math.sin(a) * r],
      rotationY: Math.random() * Math.PI * 2,
      scale: minScale + Math.random() * (maxScale - minScale),
    });
  }
  return items;
}

function prepClone(scene) {
  const clone = scene.clone();
  clone.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false;
      obj.receiveShadow = false;
    }
  });
  return clone;
}

export default function GrassTufts() {
  const { scene: clover } = useGLTF("/models/Clover.glb");
  const { scene: tallGrass } = useGLTF("/models/tall_grass.glb");

  const tufts = useMemo(() => {
    const list = [];
    scatter(CLOVER_COUNT, 1.2, 2.4).forEach((t, i) =>
      list.push({ ...t, key: `clover-${i}`, clone: prepClone(clover) }),
    );
    scatter(GRASS_COUNT, 1.2, 2.2).forEach((t, i) =>
      list.push({ ...t, key: `grass-${i}`, clone: prepClone(tallGrass) }),
    );
    return list;
  }, [clover, tallGrass]);

  return (
    <group>
      {tufts.map((t) => (
        <primitive
          key={t.key}
          object={t.clone}
          position={t.position}
          rotation={[0, t.rotationY, 0]}
          scale={t.scale}
        />
      ))}
    </group>
  );
}
