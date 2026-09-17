"use client";

import { useActionState, useCallback, useState, type ChangeEvent } from "react";
import { reviewStatus } from "@/lib/deadlines";
import { SuccessToast } from "@/components/success-toast";
import { ClientOnlyDateTime } from "@/components/client-only-datetime";
import { uploadPpt, saveLinks, type ReviewActionResult } from "./actions";
import { Countdown } from "@/components/ui/countdown";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import {
  FileText,
  UploadCloud,
  Globe,
  Lock,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

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
  const isLocked = status === "locked";
  const isOpen = status === "open";
  const isNotOpen = status === "not_open";

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

  // Determine primary badge status
  let displayStatus: "open" | "locked" | "not_open" | "submitted" = status;
  if (submission?.ppt_filename && !isLocked) {
    displayStatus = "submitted";
  }

  return (
    <div
      data-team-id={teamId}
      className={`rounded-2xl border bg-surface transition-all duration-200 shadow-md ${
        isLocked
          ? "border-border-subtle/80 bg-surface/50 opacity-95"
          : isOpen
            ? "border-border hover:border-border-strong"
            : "border-border-subtle bg-surface/40"
      }`}
    >
      {/* Review Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 md:p-6 border-b border-border-subtle/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent">
              Checkpoint {review.review_number}
            </span>
          </div>
          <h3 className="text-lg font-bold text-primary tracking-tight">
            {review.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill status={displayStatus} />
          {isOpen && review.upload_deadline ? (
            <Countdown deadline={review.upload_deadline} />
          ) : null}
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* Deadline Notice Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-elevated/60 px-4 py-2.5 border border-border-subtle text-xs">
          <div className="flex items-center gap-2 text-secondary">
            <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>Submission Deadline:</span>
            {review.upload_deadline ? (
              <span className="font-mono text-primary font-medium">
                <ClientOnlyDateTime iso={review.upload_deadline} />
              </span>
            ) : (
              <span className="text-muted italic">Not announced yet</span>
            )}
          </div>

          {isLocked ? (
            <div className="flex items-center gap-1.5 text-danger font-medium text-[11px]">
              <Lock className="h-3 w-3" />
              <span>Submissions Locked</span>
            </div>
          ) : isNotOpen ? (
            <span className="text-muted text-[11px]">Submissions not open yet</span>
          ) : (
            <span className="text-success text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Upload window active
            </span>
          )}
        </div>

        {/* Locked State Banner */}
        {isLocked ? (
          <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/5 p-4 text-danger text-xs">
            <Lock className="h-4 w-4 shrink-0" />
            <p>
              The deadline for this checkpoint has passed. Submissions and links are now locked for judging.
            </p>
          </div>
        ) : null}

        {/* Current Submission Display & Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] mb-0">Presentation Deck</Label>
            {submission?.ppt_uploaded_at ? (
              <span className="text-[11px] text-muted">
                Uploaded <ClientOnlyDateTime iso={submission.ppt_uploaded_at} />
              </span>
            ) : null}
          </div>

          {submission?.ppt_filename ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-muted/20 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-accent/30 text-accent shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium text-primary truncate max-w-xs sm:max-w-md">
                    {submission.ppt_filename}
                  </p>
                  <p className="text-[11px] text-accent">File stored & verified</p>
                </div>
              </div>
            </div>
          ) : !isLocked && !isNotOpen ? (
            <p className="text-xs text-muted">No presentation uploaded yet.</p>
          ) : null}

          {/* Upload Dropzone Form (Only if Open) */}
          {!isLocked && isOpen ? (
            <form
              action={uploadAction}
              className="space-y-3 pt-1"
              onSubmit={(e) => {
                if (fileError || !selectedFile) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="review_number" value={review.review_number} />

              <label className="group flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-border-subtle bg-surface-elevated/30 py-7 px-4 text-center hover:border-accent hover:bg-accent-muted/10 transition-all duration-150">
                <input
                  type="file"
                  name="file"
                  accept=".pptx,.ppt,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border-subtle text-muted group-hover:text-accent group-hover:border-accent/40 transition-colors mb-2.5">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {selectedFile ? selectedFile.name : "Select presentation file or drag & drop"}
                </span>
                <span className="mt-1 text-[11px] text-muted">
                  Supports .pptx, .ppt, or .pdf (up to 25 MB)
                </span>
              </label>

              {fileError ? <FieldError>{fileError}</FieldError> : null}
              {uploadState && "error" in uploadState ? (
                <FieldError>{uploadState.error}</FieldError>
              ) : null}
              {!uploadPending &&
              !uploadToast.dismissed &&
              uploadState &&
              "ok" in uploadState &&
              uploadState.ok ? (
                <SuccessToast message="Presentation uploaded successfully." onDismiss={uploadToast.dismiss} />
              ) : null}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={uploadPending}
                  disabled={uploadPending || !!fileError || !selectedFile}
                >
                  {uploadPending
                    ? "Uploading…"
                    : submission?.ppt_filename
                      ? "Replace Deck"
                      : "Upload Deck"}
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        {/* Links Section */}
        <div className="space-y-3 pt-2 border-t border-border-subtle/60">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] mb-0">Project Repository & Live Demo</Label>
            {/* Clickable link chips */}
            <div className="flex items-center gap-2">
              {submission?.github_url ? (
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-info hover:text-info/80 border border-border-subtle transition-colors"
                >
                  <GithubIcon className="h-3 w-3" />
                  <span>GitHub</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ) : null}

              {submission?.demo_url ? (
                <a
                  href={submission.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-accent hover:text-accent/80 border border-border-subtle transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  <span>Demo</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ) : null}
            </div>
          </div>

          <form action={linksAction} className="space-y-3">
            <input type="hidden" name="review_number" value={review.review_number} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`github_url_${review.review_number}`} className="text-[11px]">
                  GitHub URL
                </Label>
                <Input
                  id={`github_url_${review.review_number}`}
                  name="github_url"
                  type="url"
                  disabled={isLocked || isNotOpen}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  icon={<GithubIcon className="h-4 w-4" />}
                />
              </div>

              <div>
                <Label htmlFor={`demo_url_${review.review_number}`} className="text-[11px]">
                  Live Demo URL
                </Label>
                <Input
                  id={`demo_url_${review.review_number}`}
                  name="demo_url"
                  type="url"
                  disabled={isLocked || isNotOpen}
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://agent-demo.vercel.app"
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
            </div>

            {linksState && "error" in linksState ? (
              <FieldError>{linksState.error}</FieldError>
            ) : null}
            {!linksPending &&
            !linksToast.dismissed &&
            linksState &&
            "ok" in linksState &&
            linksState.ok ? (
              <SuccessToast message="Links updated successfully." onDismiss={linksToast.dismiss} />
            ) : null}

            {!isLocked && isOpen ? (
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={linksPending}
                  disabled={linksPending}
                >
                  {linksPending ? "Saving…" : "Save Links"}
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
