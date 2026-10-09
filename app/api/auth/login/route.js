// POST /api/auth/login — single admin login (spec section 4).
import { getSession } from "@/lib/session.js";
import { passwordsEqual } from "@/lib/auth.js";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!body || typeof body.password !== "string" || body.password.length === 0) {
    return Response.json({ error: "Password mancante." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { error: "Login non configurato (ADMIN_PASSWORD mancante)." },
      { status: 500 },
    );
  }

  if (!passwordsEqual(body.password, process.env.ADMIN_PASSWORD)) {
    return Response.json({ error: "Password errata." }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  return Response.json({ ok: true });
}
