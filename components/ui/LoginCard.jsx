"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginCard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Accesso non riuscito.");
        return;
      }
      setPassword("");
      router.push("/");
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#ffffff",
        border: "1px solid #b9cfb0",
        borderRadius: 12,
        padding: 24,
        maxWidth: 360,
        width: "100%",
      }}
    >
      <label
        htmlFor="password"
        style={{ display: "block", fontWeight: 600, marginBottom: 8 }}
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #9db894",
          marginBottom: 12,
        }}
      />
      {error ? (
        <p role="alert" style={{ color: "#a33", marginBottom: 12 }}>
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "none",
          background: "#2f5d3a",
          color: "#fff",
          fontWeight: 600,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
