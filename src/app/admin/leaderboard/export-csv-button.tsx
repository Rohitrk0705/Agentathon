"use client";

import { useState } from "react";
import { exportLeaderboardCsv } from "./actions";

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
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Exporting…" : "Export CSV"}
      </button>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </span>
  );
}
