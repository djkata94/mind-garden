"use client";

// Scattered 3D grass tufts (improvement #3, pass 2): two crossed instanced
// planes with a canvas blade texture, tinted per instance. Cheap (2 draw
// calls), no shadows, fogged like the ground.
import { useMemo } from "react";
import * as THREE from "three";

const COUNT = 650;
const RING_MIN = 2.5;
const RING_MAX = 30;

function makeBladeTexture() {
  const w = 128;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  const greens = ["#3c6034", "#4e7a42", "#5d8a4c", "#6f9a58", "#2f4c2b"];
  for (let i = 0; i < 14; i++) {
    const x0 = 14 + Math.random() * (w - 28);
    const bend = (Math.random() - 0.5) * 44;
    const bh = 52 + Math.random() * 68;
    ctx.strokeStyle = greens[i % greens.length];
    ctx.lineWidth = 4 + Math.random() * 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, h);
    ctx.quadraticCurveTo(x0 + bend * 0.3, h - bh * 0.6, x0 + bend, h - bh);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildTufts(map, rotationOffset) {
  const geo = new THREE.PlaneGeometry(0.9, 0.65);
  geo.translate(0, 0.32, 0);
  const mat = new THREE.MeshLambertMaterial({
    map,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = RING_MIN + Math.pow(Math.random(), 0.7) * (RING_MAX - RING_MIN);
    const a = Math.random() * Math.PI * 2;
    dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    dummy.rotation.set(0, Math.random() * Math.PI + rotationOffset, 0);
    const s = 0.6 + Math.random() * 0.8;
    dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    tint.setHSL(0.29 + Math.random() * 0.04, 0.32, 0.32 + Math.random() * 0.14);
    mesh.setColorAt(i, tint);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

export default function GrassTufts() {
  const meshes = useMemo(() => {
    const map = makeBladeTexture();
    return [buildTufts(map, 0), buildTufts(map, Math.PI / 2)];
  }, []);

  return (
    <group>
      {meshes.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  );
}
