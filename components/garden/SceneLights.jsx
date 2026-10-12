"use client";

// Lights baseline = approved prototype: warm sun with wide shadow camera,
// hemisphere sky light, ambient fill. Environment 'forest' loads inside its
// own Suspense + boundary: if it fails, the garden still renders on lights.
import { Suspense } from "react";
import { Environment } from "@react-three/drei";
import GardenErrorBoundary from "./GardenErrorBoundary.jsx";

function SafeEnvironment() {
  return (
    <GardenErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <Environment preset="forest" />
      </Suspense>
    </GardenErrorBoundary>
  );
}

export default function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e8f4e0", "#3a4a33", 0.7]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={2.2}
        color="#fff2d9"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={60}
      />
      <SafeEnvironment />
    </>
  );
}
