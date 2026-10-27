import { Suspense } from "react";
import LoginGate from "@/components/ui/LoginGate.jsx";

export const metadata = {
  title: "Accedi — Il mio giardino digitale",
  description: "Area riservata all'amministratore del giardino digitale.",
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 32,
        background: "#e8f2e4",
        color: "#1d3325",
        backgroundImage:
          "radial-gradient(circle at 50% -10%, #d4e8cb 0%, #e8f2e4 60%)",
      }}
    >
      <h1
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#1d3325",
          margin: 0,
          letterSpacing: -0.5,
        }}
      >
        Accedi al giardino
      </h1>
      <p style={{ fontSize: 15, color: "#4a7358", margin: 0 }}>
        Area riservata all&#8217;amministratore.
      </p>
      <Suspense
        fallback={
          <p style={{ fontSize: 14, color: "#4a7358" }}>Caricamento…</p>
        }
      >
        <LoginGate />
      </Suspense>
    </main>
  );
}
