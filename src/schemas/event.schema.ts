import { z } from "zod";
import { descriptionField, titleField, cuidOrEmpty } from "./shared";

const eventBase = z.object({
  title: titleField,
  description: descriptionField,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional().nullable(),
  subjectId: cuidOrEmpty,
});

export const createEventSchema = eventBase
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((d) => !d.isRecurring || !!d.recurrenceRule, {
    message: "Recurring events require a recurrence rule",
    path: ["recurrenceRule"],
  });

export const updateEventSchema = eventBase
  .partial()
  .refine(
    (d) => !d.startTime || !d.endTime || d.endTime > d.startTime,
    { message: "End time must be after start time", path: ["endTime"] },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
