"use client";

import { useState } from "react";
import { exportLeaderboardCsv } from "./actions";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportCsvButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const result = await exportLeaderboardCsv();

    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={pending}
        loading={pending}
        icon={<Download className="h-4 w-4" />}
        aria-label="Export leaderboard as CSV"
      >
        {pending ? "Generating CSV…" : "Export Leaderboard CSV"}
      </Button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
