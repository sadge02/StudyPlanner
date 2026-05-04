import { z } from "zod";
import { hexColor, nameField, creditsField } from "./shared";

export const createSubjectSchema = z.object({
  name: nameField,
  credits: creditsField,
  color: hexColor,
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
