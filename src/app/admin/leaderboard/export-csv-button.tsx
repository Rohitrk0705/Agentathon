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
        aria-label="Export leaderboard as CSV"
        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm text-primary hover:bg-surface-hover hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <svg
          className="h-4 w-4"
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
        {pending ? "Exporting…" : "Export CSV"}
      </button>
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </span>
  );
}
