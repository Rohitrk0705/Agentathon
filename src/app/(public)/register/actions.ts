"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validation";

export type RegisterActionResult = { ok: true } | { error: string };

export type RegisterTrack = { id: string; title: string };

// RLS on `app_settings`/`tracks` only allows reads for authenticated sessions,
// but this data must be visible to signed-out visitors on /login and
// /register. The service-role admin client is confined to this file (and
// lib/supabase/admin.ts) per the project's non-negotiables, so these two
// read-only helpers live here rather than adding a third file that imports it.
export async function getRegistrationOpen(): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("registration_open")
    .eq("id", 1)
    .single();

  return data?.registration_open ?? false;
}

export async function getRegisterPageData(): Promise<{
  registrationOpen: boolean;
  tracks: RegisterTrack[];
}> {
  const admin = createAdminClient();

  const [{ data: settings }, { data: tracks }] = await Promise.all([
    admin.from("app_settings").select("registration_open").eq("id", 1).single(),
    admin.from("tracks").select("id, title").order("title", { ascending: true }),
  ]);

  return {
    registrationOpen: settings?.registration_open ?? false,
    tracks: tracks ?? [],
  };
}

export async function registerTeam(
  _prev: RegisterActionResult | null,
  formData: FormData,
): Promise<RegisterActionResult> {
  const memberNames = formData
    .getAll("member_names")
    .filter((v): v is string => typeof v === "string" && v.trim() !== "");

  const parsed = registerSchema.safeParse({
    team_name: formData.get("team_name"),
    track_id: formData.get("track_id"),
    member_count: formData.get("member_count"),
    member_names: memberNames,
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Please check the form and try again." };
  }

  const {
    team_name,
    track_id,
    member_count,
    member_names,
    contact_email,
    contact_phone,
    password,
  } = parsed.data;

  const admin = createAdminClient();

  const { data: settings } = await admin
    .from("app_settings")
    .select("registration_open")
    .eq("id", 1)
    .single();

  if (!settings?.registration_open) {
    return { error: "Registration is closed." };
  }

  const { data: track } = await admin
    .from("tracks")
    .select("id")
    .eq("id", track_id)
    .single();

  if (!track) {
    return { error: "Selected track no longer exists." };
  }

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email: contact_email,
    password,
    email_confirm: true,
  });

  if (createUserError || !created?.user) {
    const code = (createUserError as { code?: string } | null)?.code;
    const message = createUserError?.message?.toLowerCase() ?? "";
    if (
      code === "email_exists" ||
      code === "user_already_exists" ||
      message.includes("already registered")
    ) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Could not create your account. Please try again." };
  }

  const userId = created.user.id;

  const { data: team, error: teamError } = await admin
    .from("teams")
    .insert({
      owner_id: userId,
      team_name,
      track_id,
      member_count,
      contact_email,
      contact_phone,
    })
    .select("id")
    .single();

  if (teamError || !team) {
    await admin.auth.admin.deleteUser(userId);
    if (teamError?.code === "23505") {
      return { error: "That team name is taken." };
    }
    return { error: "Could not create your team. Please try again." };
  }

  const { error: membersError } = await admin
    .from("team_members")
    .insert(member_names.map((name) => ({ team_id: team.id, name })));

  if (membersError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: "Could not save team members. Please try again." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: contact_email,
    password,
  });

  if (signInError) {
    return {
      error: "Account created, but sign-in failed. Please log in manually.",
    };
  }

  redirect("/dashboard");
}
