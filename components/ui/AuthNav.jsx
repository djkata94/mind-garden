import Link from "next/link";
import { isAdminSession } from "@/lib/session.js";
import LogoutButton from "./LogoutButton.jsx";
import AddNoteButton from "./AddNoteButton.jsx";
import SessionFlag from "./SessionFlag.jsx";

export default async function AuthNav() {
  const isAdmin = await isAdminSession();

  if (isAdmin) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SessionFlag />
        <AddNoteButton />
        <LogoutButton />
      </div>
    );
  }
  return (
    <Link
      href="/login"
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        background: "#2f5d3a",
        color: "#fff",
      }}
    >
      Accedi
    </Link>
  );
}
