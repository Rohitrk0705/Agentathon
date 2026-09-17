"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Simple accessible focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first?.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Auto-focus first input or close button
      const timer = setTimeout(() => {
        const firstInput = dialogRef.current?.querySelector<HTMLElement>(
          "input, textarea, select, button:not([aria-label='Close'])",
        );
        firstInput?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative w-full max-w-lg rounded-xl border border-border-strong bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150 ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:text-primary hover:bg-surface-hover transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-6">
          <h3 id="dialog-title" className="text-lg font-semibold text-primary tracking-tight">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-secondary leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
