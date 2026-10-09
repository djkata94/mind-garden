// Auth helpers for the single-admin garden (spec sections 4-5).
// Used by /api/auth/* now and by write guards in M4/M6.
import { timingSafeEqual } from "node:crypto";
import { getSession } from "./session.js";

export function passwordsEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  const leftBuf = Buffer.from(left, "utf8");
  const rightBuf = Buffer.from(right, "utf8");
  if (leftBuf.length !== rightBuf.length || leftBuf.length === 0) {
    return false;
  }
  return timingSafeEqual(leftBuf, rightBuf);
}

export async function isAuthenticated() {
  try {
    const session = await getSession();
    return Boolean(session.isAdmin);
  } catch {
    return false;
  }
}

// Returns { session } when admin, otherwise { unauthorized: Response }.
export async function requireAdmin() {
  const session = await getSession();
  if (session.isAdmin) {
    return { session };
  }
  return {
    unauthorized: Response.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
