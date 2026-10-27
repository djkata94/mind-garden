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
        borderRadius: 24,
        padding: 40,
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 24px 60px rgba(47, 93, 58, 0.16)",
      }}
    >
      {/* Logo di benvenuto sopra il contenitore: semino che germoglia */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <img
          src="/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          style={{ display: "block", filter: "drop-shadow(0 4px 8px rgba(47, 93, 58, 0.2))" }}
        />
      </div>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#1d3325",
          textAlign: "center",
          marginBottom: 8,
          letterSpacing: -0.5,
        }}
      >
        Il mio giardino digitale
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#5a7a60",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Accedi all&#8217;area riservata per gestire le tue note.
      </p>

      <label
        htmlFor="password"
        style={{
          display: "block",
          fontWeight: 700,
          fontSize: 14,
          color: "#1d3325",
          marginBottom: 8,
        }}
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
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #9db894",
          marginBottom: 24,
          fontSize: 15,
          outline: "none",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
          background: "#f7faf7",
        }}
      />
      {error ? (
        <p role="alert" style={{ color: "#c0392b", fontSize: 13, marginBottom: 22, textAlign: "center" }}>
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: "#2f5d3a",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          cursor: pending ? "wait" : "pointer",
          boxShadow: "0 6px 14px rgba(47, 93, 58, 0.35)",
        }}
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
