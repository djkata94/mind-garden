// Home: 3D garden, client-side only (spec section 1).
import Link from "next/link";
import GardenLoader from "@/components/garden/GardenLoader.jsx";
import TagFilter from "@/components/ui/TagFilter.jsx";
import NoteForm from "@/components/ui/NoteForm.jsx";

export default function Home() {
  return (
    <main>
      <TagFilter />
      <GardenLoader />
      <NoteForm />
      <noscript>
        <div style={{ padding: 24, textAlign: "center" }}>
          Il giardino 3D richiede JavaScript.{" "}
          <Link href="/notes">Sfoglia le note in formato elenco</Link>.
        </div>
      </noscript>
    </main>
  );
}
