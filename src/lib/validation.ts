import { z } from "zod";

const optionalDescription = z.preprocess(
  (val) => (typeof val !== "string" || val.trim() === "" ? undefined : val),
  z.string().trim().max(2000).optional(),
);

export const trackSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalDescription,
});

export const trackUpdateSchema = trackSchema.extend({
  id: z.string().uuid(),
});

export const trackDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const registrationToggleSchema = z.object({
  open: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const reviewDeadlineSchema = z.object({
  review_number: z.coerce.number().int().min(1).max(3),
  upload_deadline: z
    .union([z.string().datetime(), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

const memberNameSchema = z.string().trim().min(1).max(80);

export const registerSchema = z
  .object({
    team_name: z.string().trim().min(2).max(80),
    track_id: z.string().uuid(),
    member_count: z.coerce.number().int().min(1).max(10),
    member_names: z.array(memberNameSchema),
    contact_email: z.string().trim().email(),
    contact_phone: z
      .string()
      .trim()
      .min(7)
      .max(20)
      .regex(/^[0-9+\-\s]+$/, "Only digits, spaces, + and - are allowed."),
    password: z.string().min(8),
  })
  .superRefine((data, ctx) => {
    if (data.member_names.length !== data.member_count) {
      ctx.addIssue({
        code: "custom",
        message: "Number of member names must match the member count.",
        path: ["member_names"],
      });
    }
  });

const optionalUrl = z.preprocess(
  (val) => (typeof val !== "string" || val.trim() === "" ? undefined : val),
  z.string().trim().url().startsWith("http").optional(),
);

export const reviewSubmissionSchema = z.object({
  review_number: z.coerce.number().int().min(1).max(3),
  github_url: optionalUrl,
  demo_url: optionalUrl,
});

export const pptUploadSchema = z.object({
  review_number: z.coerce.number().int().min(1).max(3),
});

const PPT_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/pdf",
];

const PPT_EXTENSIONS = [".pptx", ".ppt", ".pdf"];

const MAX_PPT_SIZE_BYTES = 25 * 1024 * 1024;

export function validatePptFile(file: File): { ok: true } | { error: string } {
  if (!file || file.size <= 0) {
    return { error: "Please select a file to upload." };
  }

  if (file.size > MAX_PPT_SIZE_BYTES) {
    return { error: "File must be 25 MB or smaller." };
  }

  const name = file.name.toLowerCase();
  const hasValidExtension = PPT_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMimeType = PPT_MIME_TYPES.includes(file.type);

  if (!hasValidMimeType && !hasValidExtension) {
    return { error: "File must be a .pptx, .ppt, or .pdf." };
  }

  return { ok: true };
}
