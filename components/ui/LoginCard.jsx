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
        borderRadius: 16,
        padding: 32,
        maxWidth: 400,
        width: "100%",
        boxShadow: "0 12px 32px rgba(47, 93, 58, 0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <img
          src="/favicon.png"
          alt="Logo"
          width={34}
          height={34}
          style={{ borderRadius: 7, display: "block" }}
        />
        <span
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#1d3325",
            letterSpacing: -0.5,
          }}
        >
          Il mio giardino digitale
        </span>
      </div>
      <p
        style={{
          fontSize: 14,
          color: "#5a7a60",
          marginBottom: 24,
        }}
      >
        Accedi all&#8217;area riservata per gestire le tue note.
      </p>
      <label
        htmlFor="password"
        style={{
          display: "block",
          fontWeight: 600,
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
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #9db894",
          marginBottom: 14,
          fontSize: 14,
          outline: "none",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
        }}
      />
      {error ? (
        <p role="alert" style={{ color: "#a33", fontSize: 13, marginBottom: 14 }}>
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
          fontSize: 15,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
