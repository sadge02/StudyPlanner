import { z } from "zod";
import { titleField, descriptionField, priorityEnum, cuidOrEmpty } from "./shared";

export const createTaskSchema = z.object({
  title: titleField,
  description: descriptionField,
  priority: priorityEnum,
  deadline: z.coerce.date().optional().nullable(),
  subjectId: cuidOrEmpty,
  projectId: cuidOrEmpty,
  parentId: cuidOrEmpty,
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
