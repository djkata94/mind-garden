// Single-admin session helpers (iron-session). Auth routes land in M2.
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "",
  cookieName: "mind-garden-session",
  // 30 days, per spec.
  ttl: 60 * 60 * 24 * 30,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}
