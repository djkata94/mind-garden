"use client";

// Tree plant (stages 'growing' | 'mature'): normalized .glb model.
// Behavior baseline = approved prototype: Box3 normalization (base at y=0,
// centered, target height), shadows on every mesh, wind sway, hover scale,
// title tooltip. Props: note, model (.glb path), targetHeight (meters).
// dimmed fades filtered-out plants to opacity 0.15 (M4): materials are cloned
// per plant so the fade never leaks to other trees sharing the model.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Tree({ note, model, targetHeight, selected, dimmed, onSelect }) {
  const group = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(model);

  const { clone, baseScale, labelY } = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = Array.isArray(obj.material)
          ? obj.material.map((m) => m.clone())
          : obj.material.clone();
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    const baseScale = targetHeight / Math.max(size.y, 0.001);
    return { clone, baseScale, labelY: targetHeight + 0.6 };
  }, [scene, targetHeight]);

  useEffect(() => {
    clone.traverse((obj) => {
      if (!obj.isMesh) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        mat.transparent = true;
        mat.opacity = dimmed ? 0.15 : 1;
      }
    });
  }, [clone, dimmed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.z = Math.sin(t * 0.5 + note.pos_x) * 0.012;
    const target = (hovered || selected ? 1.05 : 1) * baseScale;
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, 0.1);
    group.current.scale.setScalar(s);
  });

  return (
    <group
      ref={group}
      position={[note.pos_x, 0, note.pos_z]}
      rotation={[0, note.rot_y, 0]}
      scale={baseScale}
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
      <primitive object={clone} />

      {hovered && (
        <Html
          center
          distanceFactor={10}
          position={[0, labelY, 0]}
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
            {note.title}
          </div>
        </Html>
      )}
    </group>
  );
}
