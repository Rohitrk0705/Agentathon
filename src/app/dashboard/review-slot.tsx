"use client";

import { useActionState, useCallback, useState, type ChangeEvent } from "react";
import { reviewStatus } from "@/lib/deadlines";
import { formatLocalDateTime } from "@/lib/format";
import { SuccessToast } from "@/components/success-toast";
import { uploadPpt, saveLinks, type ReviewActionResult } from "./actions";

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

const STATUS_CLASS = {
  not_open: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  locked: "bg-red-100 text-red-700",
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

  return (
    <div
      data-team-id={teamId}
      className="rounded-md border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{review.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {review.upload_deadline
          ? `Deadline: ${formatLocalDateTime(review.upload_deadline)}`
          : "Deadline not set"}
      </p>

      {status === "not_open" ? (
        <p className="mt-3 text-sm text-gray-500">
          This review is not open yet.
        </p>
      ) : null}
      {status === "locked" ? (
        <p className="mt-3 text-sm text-gray-500">This review is locked.</p>
      ) : null}

      <div className="mt-3 space-y-2">
        <h4 className="text-xs font-medium uppercase text-gray-500">
          Presentation
        </h4>

        {submission?.ppt_filename ? (
          <p className="text-sm text-gray-700">
            Current file: <span className="font-medium">{submission.ppt_filename}</span>
            {submission.ppt_uploaded_at
              ? ` — uploaded ${formatLocalDateTime(submission.ppt_uploaded_at)}`
              : null}
          </p>
        ) : !disabled ? (
          <p className="text-sm text-gray-500">No file uploaded yet.</p>
        ) : null}

        {!disabled ? (
          <form
            action={uploadAction}
            className="space-y-2"
            onSubmit={(e) => {
              if (fileError || !selectedFile) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="review_number" value={review.review_number} />
            <input
              type="file"
              name="file"
              accept=".pptx,.ppt,.pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700"
            />
            <p className="text-xs text-gray-500">.pptx, .ppt or .pdf, up to 25 MB.</p>

            {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}
            {uploadState && "error" in uploadState ? (
              <p className="text-sm text-red-600">{uploadState.error}</p>
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
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
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

      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-medium uppercase text-gray-500">Links</h4>
        <form action={linksAction} className="space-y-2">
          <input type="hidden" name="review_number" value={review.review_number} />

          <div>
            <label
              htmlFor={`github_url_${review.review_number}`}
              className="block text-xs text-gray-600"
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor={`demo_url_${review.review_number}`}
              className="block text-xs text-gray-600"
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {linksState && "error" in linksState ? (
            <p className="text-sm text-red-600">{linksState.error}</p>
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
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {linksPending ? "Saving…" : "Save links"}
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
