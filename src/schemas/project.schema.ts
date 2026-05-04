import { z } from "zod";
import { nameField, descriptionField } from "./shared";


export const createProjectSchema = z.object({
  name: nameField,
  description: descriptionField,
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;