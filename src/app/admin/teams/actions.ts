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
    team_id: formData.get("team_id"),
    review_number: formData.get("review_number"),
    score: formData.get("score"),
    remarks: formData.get("remarks"),
  });

  if (!parsed.success) {
    return { error: "Score must be between 0 and 10." };
  }

  const { team_id, review_number, remarks } = parsed.data;
  const score = parsed.data.score === null ? null : Math.round(parsed.data.score * 10) / 10;

  const supabase = await createClient();

  // Nothing to save: don't create an empty submission row for a team that
  // never uploaded. If a row already exists, fall through so the admin can
  // clear a previously saved score/remarks.
  if (score === null && remarks === null) {
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("team_id", team_id)
      .eq("review_number", review_number)
      .maybeSingle();

    if (!existing) {
      return { ok: true };
    }
  }

  // Keyed on the unique (team_id, review_number) index, so a conflict resolves
  // to an update of only these columns -- participant-owned columns (ppt_path,
  // ppt_filename, ppt_uploaded_at, github_url, demo_url) are never touched, and
  // on insert they stay null until the team uploads.
  const { error: upsertError } = await supabase.from("submissions").upsert(
    {
      team_id,
      review_number,
      score,
      remarks,
      scored_at: score === null ? null : new Date().toISOString(),
    },
    { onConflict: "team_id,review_number" },
  );

  if (upsertError) {
    return { error: "Could not save the score. Please try again." };
  }

  revalidatePath("/admin/teams");
  revalidatePath("/admin/leaderboard");
  return { ok: true };
}
