import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: "participant" | "admin";
  full_name: string | null;
};

export type UserAndProfile = {
  user: NonNullable<
    Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]
  >;
  profile: Profile;
} | null;

export const getUserAndProfile = cache(async (): Promise<UserAndProfile> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { user, profile: profile as Profile };
});

export async function requireUser() {
  const result = await getUserAndProfile();
  if (!result) redirect("/login");
  return result;
}

export async function requireAdmin() {
  const result = await getUserAndProfile();
  if (!result) redirect("/login");
  if (result.profile.role !== "admin") redirect("/dashboard");
  return result;
}
