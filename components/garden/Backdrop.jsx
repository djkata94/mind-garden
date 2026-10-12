"use client";

// Backdrop (improvement #3, pass 2), all procedural: gradient sky dome with
// sun glow, drifting stylized clouds, and faceted low-poly hills (noise
// displaced, vertex-shaded) that the fog dissolves. No assets, no async.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HILLS = [
  { pos: [-26, -1.4, -14], scale: [20, 4.5, 10], color: "#5d7f55", seed: 1.7 },
  { pos: [24, -1.7, -20], scale: [26, 6, 12], color: "#546f4e", seed: 4.2 },
  { pos: [30, -2, 10], scale: [18, 4, 10], color: "#63855c", seed: 8.9 },
  { pos: [-30, -1.8, 12], scale: [22, 5, 11], color: "#587550", seed: 2.4 },
  { pos: [0, -2.4, -34], scale: [36, 7, 14], color: "#4f6d4a", seed: 6.1 },
];

const CLOUDS = [
  { pos: [-30, 26, -50], scale: [10, 3, 5], speed: 0.14 },
  { pos: [10, 32, -60], scale: [14, 4, 6], speed: 0.1 },
  { pos: [40, 24, -30], scale: [8, 2.5, 4], speed: 0.18 },
  { pos: [-10, 28, 45], scale: [12, 3.5, 5], speed: 0.12 },
  { pos: [35, 30, 30], scale: [9, 3, 4], speed: 0.16 },
];

// Lumpy organic hill: vertex noise + darker crevices, flat shaded.
function makeHillGeometry(seed) {
  const geo = new THREE.IcosahedronGeometry(1, 3);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const base = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const d =
      1 +
      0.22 * Math.sin(3 * n.x + seed) * Math.sin(3 * n.z + seed * 1.7) +
      0.1 * Math.sin(7 * n.y + seed * 2.3) +
      0.06 * Math.sin(13 * n.x * n.z + seed);
    v.copy(n).multiplyScalar(d);
    // Flatten the underside so hills sit in the ground.
    if (v.y < -0.35) v.y = -0.35 - (v.y + 0.35) * 0.2;
    pos.setXYZ(i, v.x, v.y, v.z);
    const shade = 0.82 + 0.28 * (d - 0.78);
    base.setHSL(0.29, 0.25, 0.32 * shade);
    colors[i * 3] = base.r;
    colors[i * 3 + 1] = base.g;
    colors[i * 3 + 2] = base.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 250, 230, 1)");
  g.addColorStop(0.25, "rgba(255, 244, 214, 0.55)");
  g.addColorStop(1, "rgba(255, 244, 214, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Backdrop() {
  const cloudsRef = useRef(null);

  const { skyMat, hillGeos, glowTex } = useMemo(
    () => ({
      skyMat: new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color("#9ec2dd") },
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
      hillGeos: HILLS.map((hill) => makeHillGeometry(hill.seed)),
      glowTex: makeGlowTexture(),
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((cloud, i) => {
      cloud.position.x += CLOUDS[i].speed * delta;
      if (cloud.position.x > 70) cloud.position.x = -70;
    });
  });

  return (
    <>
      <mesh material={skyMat} renderOrder={-10}>
        <sphereGeometry args={[140, 32, 16]} />
      </mesh>

      {/* sun glow toward the directional light */}
      <sprite position={[52, 66, 31]} scale={[34, 34, 1]}>
        <spriteMaterial
          map={glowTex}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.9}
        />
      </sprite>

      <group ref={cloudsRef}>
        {CLOUDS.map((cloud, i) => (
          <group key={i} position={cloud.pos} scale={cloud.scale}>
            <mesh>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.75} fog={false} />
            </mesh>
            <mesh position={[0.9, -0.15, 0.2]} scale={0.7}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#f4f8ee" transparent opacity={0.75} fog={false} />
            </mesh>
            <mesh position={[-0.9, -0.2, -0.1]} scale={0.6}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#eef3e4" transparent opacity={0.75} fog={false} />
            </mesh>
          </group>
        ))}
      </group>

      {HILLS.map((hill, i) => (
        <mesh
          key={i}
          geometry={hillGeos[i]}
          position={hill.pos}
          scale={hill.scale}
        >
          <meshStandardMaterial vertexColors flatShading roughness={1} />
        </mesh>
      ))}
    </>
  );
}
