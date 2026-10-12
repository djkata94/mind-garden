import { Geist, Geist_Mono } from "next/font/google";
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
        </GardenProvider>
      </body>
    </html>
  );
}
