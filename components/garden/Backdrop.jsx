"use client";

// Fake backdrop (improvement #3), all procedural: gradient sky dome
// (horizon matches the fog color) + soft hill silhouettes that the fog
// fades with distance. No assets, no async loads.
import { useMemo } from "react";
import * as THREE from "three";

const HILLS = [
  { pos: [-26, -1.2, -14], scale: [20, 4.5, 10], color: "#6d8f63" },
  { pos: [24, -1.5, -20], scale: [26, 6, 12], color: "#66845e" },
  { pos: [30, -1.8, 10], scale: [18, 4, 10], color: "#71936a" },
  { pos: [-30, -1.6, 12], scale: [22, 5, 11], color: "#67855f" },
  { pos: [0, -2.2, -34], scale: [36, 7, 14], color: "#5f7f5a" },
];

export default function Backdrop() {
  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color("#aecadb") },
          bottom: { value: new THREE.Color("#dce8d5") },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          uniform vec3 top;
          uniform vec3 bottom;
          void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            vec3 col = mix(bottom, top, smoothstep(0.5, 0.95, h));
            col = mix(col, bottom * 0.96, 1.0 - smoothstep(0.2, 0.5, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );

  return (
    <>
      <mesh material={skyMat} renderOrder={-10}>
        <sphereGeometry args={[140, 32, 16]} />
      </mesh>
      {HILLS.map((hill, i) => (
        <mesh
          key={i}
          position={hill.pos}
          scale={hill.scale}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={hill.color} roughness={1} />
        </mesh>
      ))}
    </>
  );
}
