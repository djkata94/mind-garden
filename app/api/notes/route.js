// GET /api/notes — public garden list (spec section 4).
// POST /api/notes — admin only: create a note (spec section 4).
import { getNotesList } from "@/lib/notesList.js";
import { requireAdmin } from "@/lib/auth.js";
import { createNote } from "@/lib/noteWrite.js";

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

export async function POST(request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;
  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  try {
    const { error, note } = await createNote(body);
    if (error)
      return Response.json({ error: error.message }, { status: error.status });
    return Response.json(note, { status: 201 });
  } catch {
    return Response.json(
      { error: "Database non disponibile." },
      { status: 500 },
    );
  }
}
