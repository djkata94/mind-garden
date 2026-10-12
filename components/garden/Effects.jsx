"use client";

// Post-processing baseline = approved prototype.
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.4} luminanceThreshold={1} mipmapBlur />
      <Vignette offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
