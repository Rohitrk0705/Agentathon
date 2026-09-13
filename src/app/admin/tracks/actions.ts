"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  trackSchema,
  trackUpdateSchema,
  trackDeleteSchema,
} from "@/lib/validation";

export type TrackActionResult = { ok: true } | { error: string };

export async function createTrack(
  _prev: TrackActionResult | null,
  formData: FormData,
): Promise<TrackActionResult> {
  await requireAdmin();

  const parsed = trackSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "Title is required and must be 200 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tracks").insert({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
  });

  if (error) {
    return { error: "Could not create track. Please try again." };
  }

  revalidatePath("/admin/tracks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTrack(
  _prev: TrackActionResult | null,
  formData: FormData,
): Promise<TrackActionResult> {
  await requireAdmin();

  const parsed = trackUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "Title is required and must be 200 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tracks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: "Could not update track. Please try again." };
  }

  revalidatePath("/admin/tracks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTrack(
  _prev: TrackActionResult | null,
  formData: FormData,
): Promise<TrackActionResult> {
  await requireAdmin();

  const parsed = trackDeleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return { error: "Invalid track." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tracks")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return { error: "Could not delete track. Please try again." };
  }

  revalidatePath("/admin/tracks");
  revalidatePath("/dashboard");
  return { ok: true };
}
