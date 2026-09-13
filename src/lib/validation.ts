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
