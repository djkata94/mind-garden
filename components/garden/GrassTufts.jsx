"use client";

// Dense small grass tufts (improvement #3, pass 3): thousands of small
// crossed instanced planes with thin bright blades. Cheap (2 draw calls),
// no shadows, fogged like the ground.
import { useMemo } from "react";
import * as THREE from "three";

const COUNT = 2600;
const RING_MIN = 2;
const RING_MAX = 32;

function makeBladeTexture() {
  const w = 128;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  const greens = ["#5d8f4c", "#6fa055", "#7fae60", "#8abb6a", "#4e7a3e"];
  for (let i = 0; i < 26; i++) {
    const x0 = 8 + Math.random() * (w - 16);
    const bend = (Math.random() - 0.5) * 30;
    const bh = 60 + Math.random() * 60;
    ctx.strokeStyle = greens[i % greens.length];
    ctx.lineWidth = 2 + Math.random() * 2;
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
  const geo = new THREE.PlaneGeometry(0.45, 0.32);
  geo.translate(0, 0.16, 0);
  const mat = new THREE.MeshLambertMaterial({
    map,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = RING_MIN + Math.pow(Math.random(), 0.6) * (RING_MAX - RING_MIN);
    const a = Math.random() * Math.PI * 2;
    dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    dummy.rotation.set(0, Math.random() * Math.PI + rotationOffset, 0);
    const s = 0.5 + Math.random() * 0.6;
    dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    tint.setHSL(0.29 + Math.random() * 0.04, 0.35, 0.42 + Math.random() * 0.14);
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
