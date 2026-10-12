// GET /api/notes — public garden list (spec section 4).
import { getNotesList } from "@/lib/notesList.js";

export async function GET() {
  try {
    return Response.json(await getNotesList());
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}
