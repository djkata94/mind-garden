"use client";

// Client wrapper: next/dynamic with ssr:false is only allowed inside a
// Client Component (Next 16). Server page (app/page.js) renders this.
import dynamic from "next/dynamic";

const GardenCanvas = dynamic(
  () => import("./GardenCanvas.jsx"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "calc(100vh - 100px)",
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#dce8d5",
          color: "#1d3325",
          fontFamily: "sans-serif",
        }}
      >
        Il giardino sta germogliando…
      </div>
    ),
  },
);

export default function GardenLoader() {
  return <GardenCanvas />;
}
