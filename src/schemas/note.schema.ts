import { z } from "zod";
import { titleField, cuidOrEmpty, urlOrEmpty, noteContentField } from "./shared";

export const createNoteSchema = z.object({
  title: titleField,
  content: noteContentField,
  fileUrl: urlOrEmpty,
  subjectId: cuidOrEmpty,
  projectId: cuidOrEmpty,
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
