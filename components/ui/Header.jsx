import Link from "next/link";
import { Suspense } from "react";
import AuthNav from "./AuthNav.jsx";
import SearchBox from "./SearchBox.jsx";

export default function Header() {
  return (
    <header
      style={{
        background: "#dce8d5",
        color: "#1d3325",
        borderBottom: "1px solid #b9cfb0",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <Link
            href="/"
            style={{ fontSize: 20, fontWeight: 700, color: "#1d3325" }}
          >
            Il mio giardino digitale
          </Link>
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            Coltiva le tue note come piante
          </p>
        </div>
        <nav
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <SearchBox />
          <Suspense fallback={<span style={{ fontSize: 14 }}>…</span>}>
            <AuthNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
