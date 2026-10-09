"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Logout is idempotent; ignore network errors here.
    } finally {
      setPending(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid #2f5d3a",
        background: "transparent",
        color: "#1d3325",
        cursor: pending ? "wait" : "pointer",
      }}
    >
      {pending ? "Uscita…" : "Esci"}
    </button>
  );
}
