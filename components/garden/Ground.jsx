"use client";

// Grass carpet (improvement #3): canvas-generated grass texture (base +
// blotches + blade speckles) on a disc that fades into the fog at the rim,
// so no hard plane edge is ever visible.
import { useMemo } from "react";
import * as THREE from "three";

const RADIUS = 34;

function makeGrassMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#4e7046";
  ctx.fillRect(0, 0, size, size);

  const blotch = ["#45663e", "#587c4b", "#5f8751", "#3f5f3a"];
  for (let i = 0; i < 42; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 30 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `${blotch[i % blotch.length]}55`);
    g.addColorStop(1, `${blotch[i % blotch.length]}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  }

  const speck = ["#3a5a34", "#668a55", "#74985f", "#2f4c2b", "#8aa873"];
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = speck[(Math.random() * speck.length) | 0];
    ctx.globalAlpha = 0.25 + Math.random() * 0.5;
    ctx.fillRect(
      Math.random() * size,
      Math.random() * size,
      1 + Math.random() * 2,
      2 + Math.random() * 4,
    );
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Opaque center → transparent rim (mapped once across the whole disc).
function makeRimAlpha() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.3,
    size / 2, size / 2, size * 0.5,
  );
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function Ground() {
  const { map, alphaMap } = useMemo(
    () => ({ map: makeGrassMap(), alphaMap: makeRimAlpha() }),
    [],
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[RADIUS, 72]} />
      <meshStandardMaterial
        map={map}
        alphaMap={alphaMap}
        transparent
        roughness={1}
      />
    </mesh>
  );
}
