import { z } from "zod";

export const titleField = z.string().min(1, "Title is required").max(100);
export const nameField = z.string().min(1, "Name is required").max(100);
export const descriptionField = z.string().max(5000).optional().nullable();
export const creditsField = z.coerce
  .number()
  .int()
  .min(0)
  .max(65)
  .optional()
  .nullable();
export const noteContentField = z.string().max(100_000).optional().nullable();

export const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #RRGGBB")
  .optional()
  .nullable();

export const cuidOrEmpty = z
  .union([z.cuid(), z.literal("")])
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM");

export const urlOrEmpty = z
  .union([z.url(), z.literal("")])
  .transform((v) => (v === "" ? undefined : v))
  .optional();
