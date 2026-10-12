"use client";

// Bridge server session → client state: rendered by AuthNav only when the
// admin session exists, so client components know edit/delete are allowed.
import { useEffect } from "react";
import { useGarden } from "../garden/GardenContext.jsx";

export default function SessionFlag() {
  const { setIsAdmin } = useGarden();
  useEffect(() => {
    setIsAdmin(true);
  }, [setIsAdmin]);
  return null;
}
