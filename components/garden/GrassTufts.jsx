"use client";

// Real grass (improvements #2+#3): Quaternius Clover + Tall Grass clones
// scattered densely and small. Shared geometries/materials, muted tint,
// no shadows (perf), fogged like the ground.
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const CLOVER_COUNT = 200;
const GRASS_COUNT = 320;

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

// Mute the neon Quaternius greens once (materials are shared across clones,
// so per-clone tinting would compound to black).
function muteScene(scene) {
  if (scene.userData.muted) return;
  scene.userData.muted = true;
  const mute = new THREE.Color("#b9c9a8");
  scene.traverse((obj) => {
    if (obj.isMesh) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        if (mat.color) mat.color.multiply(mute);
      }
    }
  });
}

export default function GrassTufts() {
  const { scene: clover } = useGLTF("/models/Clover.glb");
  const { scene: tallGrass } = useGLTF("/models/tall_grass.glb");

  const tufts = useMemo(() => {
    muteScene(clover);
    muteScene(tallGrass);
    const list = [];
    scatter(CLOVER_COUNT, 0.5, 0.9).forEach((t, i) =>
      list.push({ ...t, key: `clover-${i}`, clone: prepClone(clover) }),
    );
    scatter(GRASS_COUNT, 0.25, 0.45).forEach((t, i) =>
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
