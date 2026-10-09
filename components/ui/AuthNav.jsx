import Link from "next/link";
import { isAdminSession } from "@/lib/session.js";
import LogoutButton from "./LogoutButton.jsx";

export default async function AuthNav() {
  const isAdmin = await isAdminSession();

  if (isAdmin) {
    return <LogoutButton />;
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
