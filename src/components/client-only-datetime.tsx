"use client";

import { useEffect, useState } from "react";
import { formatLocalDateTime } from "@/lib/format";

export function ClientOnlyDateTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate: this is React's documented escape hatch for content that
    // must differ between server and client render (SSR uses the server's
    // locale/timezone; the client fills in the real value post-mount so the
    // two passes always agree, avoiding a hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(formatLocalDateTime(iso));
  }, [iso]);

  return <span suppressHydrationWarning>{text ?? "…"}</span>;
}
