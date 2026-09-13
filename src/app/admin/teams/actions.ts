"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { scoreSubmissionSchema } from "@/lib/validation";

export type SignedUrlResult = { ok: true; url: string } | { error: string };
export type ScoreActionResult = { ok: true } | { error: string };

const submissionIdSchema = z.string().uuid();

export async function getSignedPptUrl(
  submissionId: string,
): Promise<SignedUrlResult> {
  await requireAdmin();

  const parsed = submissionIdSchema.safeParse(submissionId);
  if (!parsed.success) {
    return { error: "Invalid submission." };
  }

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("ppt_path")
    .eq("id", parsed.data)
    .single();

  if (!submission?.ppt_path) {
    return { error: "Submission not found or no PPT uploaded." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("submissions")
    .createSignedUrl(submission.ppt_path, 300);

  if (signError || !signed) {
    return { error: "Could not generate download link." };
  }

  return { ok: true, url: signed.signedUrl };
}

export async function scoreSubmission(
  _prev: ScoreActionResult | null,
  formData: FormData,
): Promise<ScoreActionResult> {
  await requireAdmin();

  const parsed = scoreSubmissionSchema.safeParse({
    submission_id: formData.get("submission_id"),
    score: formData.get("score"),
    remarks: formData.get("remarks"),
  });

  if (!parsed.success) {
    return { error: "Score must be between 0 and 10." };
  }

  const { submission_id, remarks } = parsed.data;
  const score = parsed.data.score === null ? null : Math.round(parsed.data.score * 10) / 10;

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id")
    .eq("id", submission_id)
    .single();

  if (!submission) {
    return { error: "Submission not found." };
  }

  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      score,
      remarks,
      scored_at: score !== null ? new Date().toISOString() : null,
    })
    .eq("id", submission_id);

  if (updateError) {
    return { error: "Could not save the score. Please try again." };
  }

  revalidatePath("/admin/teams");
  revalidatePath("/admin/leaderboard");
  return { ok: true };
}
