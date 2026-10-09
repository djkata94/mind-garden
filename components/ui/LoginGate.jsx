import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/session.js";
import LoginCard from "./LoginCard.jsx";

export default async function LoginGate() {
  if (await isAdminSession()) {
    redirect("/");
  }
  return <LoginCard />;
}
