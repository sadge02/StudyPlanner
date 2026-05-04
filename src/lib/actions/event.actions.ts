"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import { ApiResponse, Event } from "@/types";
import { revalidatePath } from "next/cache";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
});

const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
});

export async function createEvent(
  data: z.infer<typeof createEventSchema>,
): Promise<ApiResponse<Event>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = createEventSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    if (validatedData.data.startTime >= validatedData.data.endTime) {
      return { success: false, message: "Start time must be before end time" };
    }

    const event = await prisma.event.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/calendar");
    return { success: true, data: event as unknown as Event };
  } catch {
    return { success: false, message: "Failed to create event" };
  }
}

export async function updateEvent(
  id: string,
  data: z.infer<typeof updateEventSchema>,
): Promise<ApiResponse<Event>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = updateEventSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent || existingEvent.userId !== session.user.id) {
      return { success: false, message: "Event not found or unauthorized" };
    }

    // Time validation if both provided
    const checkStart = validatedData.data.startTime ?? existingEvent.startTime;
    const checkEnd = validatedData.data.endTime ?? existingEvent.endTime;
    if (checkStart >= checkEnd) {
      return { success: false, message: "Start time must be before end time" };
    }

    const event = await prisma.event.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath("/dashboard/calendar");
    return { success: true, data: event as unknown as Event };
  } catch {
    return { success: false, message: "Failed to update event" };
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent || existingEvent.userId !== session.user.id) {
      return { success: false, message: "Event not found or unauthorized" };
    }

    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete event" };
  }
}
