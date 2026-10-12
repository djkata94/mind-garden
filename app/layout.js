import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/ui/Header.jsx";
import { GardenProvider } from "@/components/garden/GardenContext.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Il mio giardino digitale",
  description: "Coltiva le tue note come piante",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <GardenProvider>
          <Header />
          {children}
          <footer
            style={{
              borderTop: "1px solid #b9cfb0",
              background: "#dce8d5",
              color: "#1d3325",
            }}
          >
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto",
                padding: "12px 20px",
                display: "flex",
                gap: 16,
                fontSize: 13,
                fontFamily: "sans-serif",
              }}
            >
              <Link href="/notes" style={{ color: "#2c5c3d" }}>
                Note
              </Link>
              <Link href="/credits" style={{ color: "#2c5c3d" }}>
                Crediti modelli 3D
              </Link>
            </div>
          </footer>
        </GardenProvider>
      </body>
    </html>
  );
}
