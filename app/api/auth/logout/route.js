// POST /api/auth/logout — closes the admin session (spec section 4).
import { getSession } from "@/lib/session.js";

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    await session.save();
  } catch {
    // Missing/invalid session is still a successful logout.
  }
  return Response.json({ ok: true });
}
