"use client";

import { ReviewSlot, type ReviewRow, type SubmissionRow } from "./review-slot";

export function ReviewSlots({
  teamId,
  reviews,
  submissions,
}: {
  teamId: string;
  reviews: ReviewRow[];
  submissions: Record<number, SubmissionRow | undefined>;
}) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewSlot
          key={review.review_number}
          teamId={teamId}
          review={review}
          submission={submissions[review.review_number]}
        />
      ))}
    </div>
  );
}
