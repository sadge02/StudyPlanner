import { z } from "zod";
import { titleField, descriptionField, priorityEnum, cuidOrEmpty } from "./shared";

export const taskStatusEnum = z
  .enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"])
  .default("TODO");

const taskStatusEnumNoDefault = z.enum([
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "BLOCKED",
]);

const priorityEnumNoDefault = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: titleField,
  description: descriptionField,
  priority: priorityEnum,
  status: taskStatusEnum,
  deadline: z.coerce.date().optional().nullable(),
  subjectId: cuidOrEmpty,
  projectId: cuidOrEmpty,
  parentId: cuidOrEmpty,
});

export type CreateTaskFormInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: titleField.optional(),
  description: descriptionField,
  priority: priorityEnumNoDefault.optional(),
  status: taskStatusEnumNoDefault.optional(),
  deadline: z.coerce.date().optional().nullable(),
  subjectId: cuidOrEmpty,
  projectId: cuidOrEmpty,
  parentId: cuidOrEmpty,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
