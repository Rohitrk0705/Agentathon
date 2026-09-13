export function isReviewOpen(deadline: string | null): boolean {
  return deadline !== null && new Date(deadline) > new Date();
}

export function reviewStatus(
  deadline: string | null,
): "not_open" | "open" | "locked" {
  if (deadline === null) return "not_open";
  return new Date(deadline) > new Date() ? "open" : "locked";
}
