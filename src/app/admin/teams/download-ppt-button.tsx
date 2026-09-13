"use client";

import { useEffect, useState } from "react";
import { getSignedPptUrl } from "./actions";

export function DownloadPptButton({
  submissionId,
  filename,
}: {
  submissionId: string;
  filename: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  async function handleClick() {
    setPending(true);
    setError(null);

    const result = await getSignedPptUrl(submissionId);

    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={filename ? `Download ${filename}` : "Download PPT"}
        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-transparent px-3 py-1.5 text-xs text-primary hover:bg-surface-hover hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <svg
          className="h-3.5 w-3.5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        {pending ? "Preparing…" : "Download"}
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
