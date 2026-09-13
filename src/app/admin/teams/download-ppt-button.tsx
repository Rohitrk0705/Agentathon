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
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Preparing…" : "Download PPT"}
      </button>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </span>
  );
}
