"use client";

// Camera flight to the searched plant: eases position + orbit target to the
// note, then hands controls back. Driven by GardenContext flyTo {x, z, key}.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGarden } from "./GardenContext.jsx";

export default function FlyRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const { flyTo } = useGarden();
  const goal = useRef(null);

  useEffect(() => {
    if (!flyTo) return;
    goal.current = {
      cam: new THREE.Vector3(flyTo.x + 5.5, 4.2, flyTo.z + 7.5),
      tgt: new THREE.Vector3(flyTo.x, 1.6, flyTo.z),
    };
    if (controls) controls.enabled = false;
  }, [flyTo, controls]);

  useFrame(() => {
    if (!goal.current) return;
    camera.position.lerp(goal.current.cam, 0.08);
    if (controls) {
      controls.target.lerp(goal.current.tgt, 0.12);
      controls.update();
    }
    if (camera.position.distanceTo(goal.current.cam) < 0.15) {
      goal.current = null;
      if (controls) controls.enabled = true;
    }
  });

  return null;
}
