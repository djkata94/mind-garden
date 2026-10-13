"use client";

// Dense instanced lawn: Clover + Tall Grass + Low Poly Grass as one
// InstancedMesh each; multi-part `grass` merged (fallback: capped clones).
// Muted once, per-instance tint, no shadows, fogged. ~2400 tufts, ~4 draws.
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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

function collectParts(scene) {
  scene.updateMatrixWorld(true);
  const parts = [];
  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    parts.push({
      geometry: obj.geometry.clone().applyMatrix4(obj.matrixWorld),
      material: Array.isArray(obj.material) ? obj.material[0] : obj.material,
    });
  });
  return parts;
}

function attrKey(geo) {
  return (
    Object.keys(geo.attributes).sort().join(",") + (geo.index ? "|i" : "")
  );
}

function scatterItems(count, minS, maxS) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = 2 + Math.pow(Math.random(), 0.6) * 28;
    const a = Math.random() * Math.PI * 2;
    items.push({
      position: [Math.cos(a) * r, 0, Math.sin(a) * r],
      rotationY: Math.random() * Math.PI * 2,
      scale: minS + Math.random() * (maxS - minS),
    });
  }
  return items;
}

function buildInstanced(geometry, material, items) {
  const mesh = new THREE.InstancedMesh(geometry, material, items.length);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  items.forEach((t, i) => {
    dummy.position.set(...t.position);
    dummy.rotation.set(0, t.rotationY, 0);
    dummy.scale.setScalar(t.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    tint.setHSL(0.29 + Math.random() * 0.04, 0.35, 0.42 + Math.random() * 0.14);
    mesh.setColorAt(i, tint);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  return mesh;
}

export default function GrassTufts() {
  const { scene: clover } = useGLTF("/models/Clover.glb");
  const { scene: tallGrass } = useGLTF("/models/tall_grass.glb");
  const { scene: lowGrass } = useGLTF("/models/low_poly_grass.glb");
  const { scene: grass } = useGLTF("/models/grass.glb");

  const { instanced, clones } = useMemo(() => {
    const cfgs = [
      { scene: clover, count: 500, minS: 0.8, maxS: 1.5 },
      { scene: tallGrass, count: 700, minS: 0.5, maxS: 0.9 },
      { scene: lowGrass, count: 700, minS: 0.7, maxS: 1.3 },
      { scene: grass, count: 500, minS: 0.8, maxS: 1.4 },
    ];
    const instanced = [];
    const clones = [];
    cfgs.forEach((cfg, ci) => {
      muteScene(cfg.scene);
      const items = scatterItems(cfg.count, cfg.minS, cfg.maxS);
      const parts = collectParts(cfg.scene);
      let merged = null;
      let materials = null;
      if (
        parts.length > 0 &&
        new Set(parts.map((p) => attrKey(p.geometry))).size === 1
      ) {
        const geos = parts.map((p) => p.geometry);
        materials =
          geos.length === 1 ? parts[0].material : parts.map((p) => p.material);
        try {
          merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, true);
        } catch {
          merged = null;
        }
      }
      if (merged) {
        instanced.push(buildInstanced(merged, materials, items));
      } else {
        // Fallback: plain clones, capped (draw calls).
        items.slice(0, 60).forEach((t, i) => {
          const clone = cfg.scene.clone();
          clone.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = false;
              o.receiveShadow = false;
            }
          });
          clones.push({ ...t, key: `fb-${ci}-${i}`, clone });
        });
      }
    });
    return { instanced, clones };
  }, [clover, tallGrass, lowGrass, grass]);

  return (
    <group>
      {instanced.map((mesh, i) => (
        <primitive key={`inst-${i}`} object={mesh} />
      ))}
      {clones.map((c) => (
        <primitive
          key={c.key}
          object={c.clone}
          position={c.position}
          rotation={[0, c.rotationY, 0]}
          scale={c.scale}
        />
      ))}
    </group>
  );
}
