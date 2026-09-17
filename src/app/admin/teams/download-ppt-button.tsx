"use client";

import { useEffect, useState } from "react";
import { getSignedPptUrl } from "./actions";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={pending}
        aria-label={filename ? `Download ${filename}` : "Download PPT"}
        icon={pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        className="text-xs h-7 px-2.5"
      >
        {pending ? "Signing link…" : "Download PPT"}
      </Button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
