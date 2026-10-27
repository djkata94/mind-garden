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
    <>
      {/* Logo di benvenuto sopra il contenitore: il seme che germoglia */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <img
          src="/favicon.png"
          alt="Seme che germoglia"
          width={64}
          height={64}
          style={{
            borderRadius: 14,
            display: "block",
            boxShadow: "0 4px 12px rgba(47, 93, 58, 0.25)",
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1d3325",
            letterSpacing: -0.5,
          }}
        >
          Il mio giardino digitale
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          border: "1px solid #b9cfb0",
          borderRadius: 20,
          padding: 36,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 48px rgba(47, 93, 58, 0.14)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "#5a7a60",
            marginBottom: 26,
            textAlign: "center",
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
            padding: "11px 14px",
            borderRadius: 10,
            border: "1px solid #9db894",
            marginBottom: 18,
            fontSize: 15,
            outline: "none",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
            background: "#fafafa",
          }}
        />
        {error ? (
          <p role="alert" style={{ color: "#c0392b", fontSize: 13, marginBottom: 18 }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 10,
            border: "none",
            background: "#2f5d3a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: pending ? "wait" : "pointer",
            boxShadow: "0 4px 10px rgba(47, 93, 58, 0.3)",
          }}
        >
          {pending ? "Accesso in corso…" : "Accedi"}
        </button>
      </form>
    </>
  );
}
