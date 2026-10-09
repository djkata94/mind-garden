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
  if (!sessionOptions.password || sessionOptions.password.length < 32) {
    throw new Error("SESSION_SECRET is not set (at least 32 characters).");
  }
  // Session shape: { isAdmin?: boolean }.
  return getIronSession(await cookies(), sessionOptions);
}

export async function isAdminSession() {
  try {
    const session = await getSession();
    return Boolean(session.isAdmin);
  } catch {
    return false;
  }
}
