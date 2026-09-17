"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isReviewOpen } from "@/lib/deadlines";
import {
  pptUploadSchema,
  reviewSubmissionSchema,
  validatePptFile,
} from "@/lib/validation";

export type ReviewActionResult = { ok: true } | { error: string };

function sanitizeFilename(filename: string): string {
  const collapsed = filename.trim().replace(/\s+/g, "_");
  const sanitized = collapsed.replace(/[^a-zA-Z0-9._-]/g, "");
  return sanitized || "file";
}

async function getOwnTeam(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return team;
}

export async function uploadPpt(
  _prev: ReviewActionResult | null,
  formData: FormData,
): Promise<ReviewActionResult> {
  const { user } = await requireUser();

  const parsed = pptUploadSchema.safeParse({
    review_number: formData.get("review_number"),
  });

  if (!parsed.success) {
    return { error: "Invalid review." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Please select a file to upload." };
  }

  const fileCheck = validatePptFile(file);
  if ("error" in fileCheck) {
    return fileCheck;
  }

  const supabase = await createClient();

  const team = await getOwnTeam(supabase, user.id);
  if (!team) {
    return { error: "No team found." };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("upload_deadline")
    .eq("review_number", parsed.data.review_number)
    .single();

  if (!review || !isReviewOpen(review.upload_deadline)) {
    return { error: "This review is not open for uploads." };
  }

  const sanitizedFilename = sanitizeFilename(file.name);
  const path = `teams/${team.id}/review-${parsed.data.review_number}/${sanitizedFilename}`;

  const { error: uploadError } = await supabase.storage
    .from("submissions")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (uploadError) {
    console.error("Upload failed:", uploadError);
    return { error: "Could not upload the file. Please try again." };
  }

  const { error: upsertError } = await supabase.from("submissions").upsert(
    {
      team_id: team.id,
      review_number: parsed.data.review_number,
      ppt_path: path,
      ppt_filename: file.name,
      ppt_uploaded_at: new Date().toISOString(),
    },
    { onConflict: "team_id,review_number" },
  );

  if (upsertError) {
    console.error("Submission save failed:", upsertError);
    return { error: "Could not save the submission. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveLinks(
  _prev: ReviewActionResult | null,
  formData: FormData,
): Promise<ReviewActionResult> {
  const { user } = await requireUser();

  const parsed = reviewSubmissionSchema.safeParse({
    review_number: formData.get("review_number"),
    github_url: formData.get("github_url"),
    demo_url: formData.get("demo_url"),
  });

  if (!parsed.success) {
    return { error: "Please enter valid http(s) URLs." };
  }

  const supabase = await createClient();

  const team = await getOwnTeam(supabase, user.id);
  if (!team) {
    return { error: "No team found." };
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("upload_deadline")
    .eq("review_number", parsed.data.review_number)
    .single();

  if (!review || !isReviewOpen(review.upload_deadline)) {
    return { error: "This review is not open for uploads." };
  }

  const { error: upsertError } = await supabase.from("submissions").upsert(
    {
      team_id: team.id,
      review_number: parsed.data.review_number,
      github_url: parsed.data.github_url ?? null,
      demo_url: parsed.data.demo_url ?? null,
    },
    { onConflict: "team_id,review_number" },
  );

  if (upsertError) {
    return { error: "Could not save links. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
