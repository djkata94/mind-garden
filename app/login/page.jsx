import { Suspense } from "react";
import LoginGate from "@/components/ui/LoginGate.jsx";

export const metadata = {
  title: "Accedi — Il mio giardino digitale",
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        background: "#dce8d5",
        color: "#1d3325",
      }}
    >
      <h1 style={{ fontSize: 24 }}>Accedi al giardino</h1>
      <p style={{ fontSize: 14, opacity: 0.8 }}>
        Area riservata all&apos;amministratore.
      </p>
      <Suspense
        fallback={<p style={{ fontSize: 14 }}>Caricamento…</p>}
      >
        <LoginGate />
      </Suspense>
    </main>
  );
}
