"use client";

// Backdrop: gradient sky dome with sun glow, drifting stylized clouds, and
// real grassland_hill clones on the horizon (normalized to ~24m wide so any
// authoring scale works). No async loads beyond the .glb itself.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const HILL_SPOTS = [
  { pos: [-30, -0.6, -16], rotY: 0.5, mul: 1.0 },
  { pos: [28, -0.8, -24], rotY: 2.1, mul: 1.2 },
  { pos: [36, -1.0, 12], rotY: 4.0, mul: 0.9 },
  { pos: [-34, -0.8, 14], rotY: 1.2, mul: 1.1 },
  { pos: [0, -1.2, -40], rotY: 3.0, mul: 1.5 },
];

const CLOUDS = [
  { pos: [-30, 26, -50], scale: [10, 3, 5], speed: 0.14 },
  { pos: [10, 32, -60], scale: [14, 4, 6], speed: 0.1 },
  { pos: [40, 24, -30], scale: [8, 2.5, 4], speed: 0.18 },
  { pos: [-10, 28, 45], scale: [12, 3.5, 5], speed: 0.12 },
  { pos: [35, 30, 30], scale: [9, 3, 4], speed: 0.16 },
];

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
  const { scene: hill } = useGLTF("/models/grassland_hill.glb");

  const { skyMat, glowTex, hillClones } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(hill);
    const size = box.getSize(new THREE.Vector3());
    const unit = 24 / Math.max(size.x, size.z, 0.001);
    const hillClones = HILL_SPOTS.map((spot, i) => {
      const clone = hill.clone();
      clone.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = false;
          obj.receiveShadow = false;
        }
      });
      return { ...spot, key: `hill-${i}`, clone, scale: unit * spot.mul };
    });
    return {
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
      glowTex: makeGlowTexture(),
      hillClones,
    };
  }, [hill]);

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

      {hillClones.map((h) => (
        <primitive
          key={h.key}
          object={h.clone}
          position={h.pos}
          rotation={[0, h.rotY, 0]}
          scale={h.scale}
        />
      ))}
    </>
  );
}
