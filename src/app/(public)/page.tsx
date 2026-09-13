import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function LandingPage() {
  const result = await getUserAndProfile();

  if (!result) redirect("/login");
  redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
}
