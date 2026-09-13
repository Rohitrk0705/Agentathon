"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { registrationToggleSchema, reviewDeadlineSchema } from "@/lib/validation";

export type SettingsActionResult = { ok: true } | { error: string };

export async function setRegistrationOpen(
  _prev: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await requireAdmin();

  const parsed = registrationToggleSchema.safeParse({
    open: formData.get("open"),
  });

  if (!parsed.success) {
    return { error: "Invalid value." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ registration_open: parsed.data.open })
    .eq("id", 1);

  if (error) {
    return { error: "Could not update registration status. Please try again." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setReviewDeadline(
  _prev: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await requireAdmin();

  const parsed = reviewDeadlineSchema.safeParse({
    review_number: formData.get("review_number"),
    upload_deadline: formData.get("upload_deadline"),
  });

  if (!parsed.success) {
    return { error: "Invalid deadline." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ upload_deadline: parsed.data.upload_deadline })
    .eq("review_number", parsed.data.review_number);

  if (error) {
    return { error: "Could not update deadline. Please try again." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
