export type ReviewNumber = 1 | 2 | 3;

/**
 * Per-review score ceiling. Review 2 is the mid-point deep-dive and carries
 * 50 points; Reviews 1 and 3 carry 10 each, for a 70-point total.
 *
 * Mirrors the submissions_score_range_ck constraint in the database -- the
 * constraint is the source of truth, this is the client/server-side echo of it.
 */
export function maxScoreFor(reviewNumber: ReviewNumber): 10 | 50 {
  return reviewNumber === 2 ? 50 : 10;
}

/** Sum of every review's ceiling: 10 + 50 + 10. */
export const MAX_TOTAL_SCORE = 70;
