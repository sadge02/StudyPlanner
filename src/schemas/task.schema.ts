import { z } from "zod";
import {
  titleField,
  descriptionField,
  priorityEnum,
  cuidOrEmpty,
} from "./shared";

export const createTaskFormSchema = z.object({
  title: titleField,
  description: descriptionField,
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  deadline: z.string().optional().nullable(),
  subjectId: z.string().optional(),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
});

export type CreateTaskFormInput = z.infer<typeof createTaskFormSchema>;

export const updateTaskSchema = createTaskFormSchema.partial().extend({
  status: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskFormSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
