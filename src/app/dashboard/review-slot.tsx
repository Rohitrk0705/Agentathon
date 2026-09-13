"use client";

import { useActionState, useCallback, useState, type ChangeEvent } from "react";
import { reviewStatus } from "@/lib/deadlines";
import { formatLocalDateTime } from "@/lib/format";
import { SuccessToast } from "@/components/success-toast";
import { uploadPpt, saveLinks, type ReviewActionResult } from "./actions";
import { Countdown } from "./countdown";

const initialState: ReviewActionResult | null = null;

export type ReviewRow = {
  review_number: 1 | 2 | 3;
  title: string;
  upload_deadline: string | null;
};

export type SubmissionRow = {
  ppt_filename: string | null;
  ppt_uploaded_at: string | null;
  github_url: string | null;
  demo_url: string | null;
};

const STATUS_LABEL = {
  not_open: "Not open",
  open: "Open",
  locked: "Locked",
} as const;

const STATUS_VARIANT = {
  not_open: "default",
  open: "success",
  locked: "danger",
} as const;

const MAX_PPT_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pptx", ".ppt", ".pdf"];

function useDismissableSuccess(state: ReviewActionResult | null) {
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);
  return { dismissed, dismiss };
}

export function ReviewSlot({
  teamId,
  review,
  submission,
}: {
  teamId: string;
  review: ReviewRow;
  submission: SubmissionRow | undefined;
}) {
  const status = reviewStatus(review.upload_deadline);
  const disabled = status !== "open";

  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadPpt,
    initialState,
  );
  const [linksState, linksAction, linksPending] = useActionState(
    saveLinks,
    initialState,
  );

  const uploadToast = useDismissableSuccess(uploadState);
  const linksToast = useDismissableSuccess(linksState);

  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState(submission?.github_url ?? "");
  const [demoUrl, setDemoUrl] = useState(submission?.demo_url ?? "");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (!file) {
      setFileError(null);
      return;
    }
    if (file.size > MAX_PPT_SIZE_BYTES) {
      setFileError("File must be 25 MB or smaller.");
      return;
    }
    const name = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setFileError("File must be a .pptx, .ppt, or .pdf.");
      return;
    }
    setFileError(null);
  }

  const badgeVariant = STATUS_VARIANT[status];

  const inputClasses =
    "w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150";

  return (
    <div
      data-team-id={teamId}
      className="rounded-lg border border-border-subtle bg-surface p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-primary">{review.title}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            badgeVariant === "success"
              ? "bg-success/10 text-success"
              : badgeVariant === "danger"
                ? "bg-danger/10 text-danger"
                : "bg-surface-hover text-secondary"
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Deadline + countdown */}
      <div className="mt-1 flex items-center gap-2">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs text-muted">
          {review.upload_deadline
            ? `Deadline: ${formatLocalDateTime(review.upload_deadline)}`
            : "Deadline not set"}
        </p>
        {status === "open" && review.upload_deadline ? (
          <>
            <span className="text-border-strong">·</span>
            <Countdown deadline={review.upload_deadline} />
          </>
        ) : null}
      </div>

      {/* Disabled overlay content */}
      <div className={disabled ? "opacity-60" : ""}>
        {status === "not_open" ? (
          <p className="mt-4 text-sm text-muted">
            This review is not open yet.
          </p>
        ) : null}
        {status === "locked" ? (
          <p className="mt-4 text-sm text-muted">This review is locked.</p>
        ) : null}

        {/* Presentation section */}
        <div className="mt-4 space-y-3">
          <h4 className="text-caption">Presentation</h4>

          {submission?.ppt_filename ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-surface-hover px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-secondary">
                {submission.ppt_filename}
              </span>
              {submission.ppt_uploaded_at ? (
                <span className="text-xs text-muted">
                  uploaded {formatLocalDateTime(submission.ppt_uploaded_at)}
                </span>
              ) : null}
            </div>
          ) : !disabled ? (
            <p className="text-sm text-muted">No file uploaded yet.</p>
          ) : null}

          {!disabled ? (
            <form
              action={uploadAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (fileError || !selectedFile) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="review_number" value={review.review_number} />

              {/* Dropzone-style file input */}
              <label className="block cursor-pointer rounded-md border-2 border-dashed border-border-subtle py-6 text-center hover:border-accent hover:bg-accent/5 transition-colors duration-150">
                <input
                  type="file"
                  name="file"
                  accept=".pptx,.ppt,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <svg
                  className="mx-auto h-8 w-8 text-muted mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <span className="text-sm text-secondary">
                  {selectedFile ? selectedFile.name : "Choose a file or drag & drop"}
                </span>
                <span className="block text-xs text-muted mt-1">
                  .pptx, .ppt or .pdf, up to 25 MB
                </span>
              </label>

              {fileError ? (
                <p role="alert" className="text-sm text-danger">{fileError}</p>
              ) : null}
              {uploadState && "error" in uploadState ? (
                <p role="alert" className="text-sm text-danger">{uploadState.error}</p>
              ) : null}
              {!uploadPending &&
              !uploadToast.dismissed &&
              uploadState &&
              "ok" in uploadState &&
              uploadState.ok ? (
                <SuccessToast message="Uploaded." onDismiss={uploadToast.dismiss} />
              ) : null}

              <button
                type="submit"
                disabled={uploadPending || !!fileError || !selectedFile}
                className="rounded-md bg-accent text-accent-text px-4 py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {uploadPending
                  ? "Uploading…"
                  : submission?.ppt_filename
                    ? "Replace"
                    : "Upload PPT"}
              </button>
            </form>
          ) : null}
        </div>

        {/* Links section */}
        <div className="mt-6 space-y-3">
          <h4 className="text-caption">Links</h4>
          <form action={linksAction} className="space-y-3">
            <input type="hidden" name="review_number" value={review.review_number} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`github_url_${review.review_number}`}
                  className="block text-xs text-muted mb-1"
                >
                  GitHub URL
                </label>
                <input
                  id={`github_url_${review.review_number}`}
                  name="github_url"
                  type="text"
                  disabled={disabled}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor={`demo_url_${review.review_number}`}
                  className="block text-xs text-muted mb-1"
                >
                  Demo URL
                </label>
                <input
                  id={`demo_url_${review.review_number}`}
                  name="demo_url"
                  type="text"
                  disabled={disabled}
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {linksState && "error" in linksState ? (
              <p role="alert" className="text-sm text-danger">{linksState.error}</p>
            ) : null}
            {!linksPending &&
            !linksToast.dismissed &&
            linksState &&
            "ok" in linksState &&
            linksState.ok ? (
              <SuccessToast message="Saved." onDismiss={linksToast.dismiss} />
            ) : null}

            {!disabled ? (
              <button
                type="submit"
                disabled={linksPending}
                className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm text-primary hover:bg-surface-hover hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {linksPending ? "Saving…" : "Save links"}
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
