"use client";

// Grass carpet (improvement #3, pass 2): layered canvas texture — mottled
// base, clover dots, directional blade strokes with light/shadow pairs and
// fine grain — on a disc fading into the fog at the rim.
import { useMemo } from "react";
import * as THREE from "three";

const RADIUS = 34;

function makeGrassMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#4a6b42";
  ctx.fillRect(0, 0, size, size);

  // Large soft mottling (light and shade patches).
  const blotch = ["#40603a", "#557a48", "#5d874e", "#38552f", "#648c53"];
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 24 + Math.random() * 110;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `${blotch[i % blotch.length]}66`);
    g.addColorStop(1, `${blotch[i % blotch.length]}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  }

  // Clover-like darker dots.
  ctx.fillStyle = "#33512d";
  for (let i = 0; i < 500; i++) {
    ctx.globalAlpha = 0.2 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.5, 0, 7);
    ctx.fill();
  }

  // Blade strokes: short near-vertical dashes, dark base + light tip.
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 5;
    const tilt = ((Math.random() - 0.5) * Math.PI) / 3;
    const dark = Math.random() < 0.6;
    ctx.strokeStyle = dark ? "#2f4c2b" : "#7fa36a";
    ctx.globalAlpha = dark ? 0.3 + Math.random() * 0.4 : 0.25 + Math.random() * 0.35;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(tilt) * len, y - Math.cos(tilt) * len);
    ctx.stroke();
  }

  // Fine grain.
  ctx.fillStyle = "#243d22";
  for (let i = 0; i < 4000; i++) {
    ctx.globalAlpha = 0.08 + Math.random() * 0.15;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
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
