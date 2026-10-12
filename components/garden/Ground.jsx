"use client";

// Ground plane baseline = approved prototype.
export default function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#4a6741" roughness={1} />
    </mesh>
  );
}
