"use client";

import { Toast } from "./ui/toast";

export function SuccessToast({
  message,
  onDismiss,
  durationMs = 3000,
}: {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}) {
  return (
    <Toast
      message={message}
      variant="success"
      onDismiss={onDismiss}
      durationMs={durationMs}
    />
  );
}
