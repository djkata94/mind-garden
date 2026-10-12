// /credits — mandatory CC-BY attributions for the 3D models (spec 2, 7).
// Static page from content/credits.json. Linked in the footer.
import Link from "next/link";
import credits from "@/content/credits.json";

export const metadata = {
  title: "Crediti — Il mio giardino digitale",
  description: "Attribuzioni dei modelli 3D del giardino",
};

export default function CreditsPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 20px 64px",
        color: "#1d3325",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ margin: "0 0 16px" }}>
        <Link href="/" style={{ color: "#2c5c3d", fontWeight: 700 }}>
          ← Torna al giardino
        </Link>
      </p>

      <h1 style={{ fontSize: 28, margin: "0 0 6px" }}>Crediti</h1>
      <p style={{ opacity: 0.75, margin: "0 0 24px", lineHeight: 1.6 }}>
        Gli alberi del giardino sono modelli 3D condivisi dai loro autori.
        Grazie!
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {credits.map((entry) => (
          <article
            key={entry.modello}
            style={{
              background: "#fafcf6",
              border: "1px solid rgba(60, 100, 70, 0.25)",
              borderRadius: 16,
              padding: 18,
            }}
          >
            <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>
              {entry.titolo ?? entry.modello}
            </h2>
            <p style={{ margin: "0 0 4px", fontSize: 14 }}>
              File: <code>{entry.modello}</code>
            </p>
            <p style={{ margin: "0 0 4px", fontSize: 14 }}>
              Autore: {entry.autore} · Licenza: {entry.licenza}
            </p>
            {entry.url && (
              <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2c5c3d", fontWeight: 700 }}
                >
                  Pagina del modello →
                </a>
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
