"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import {
  createEventSchema,
  updateEventSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/schemas";
import { ApiResponse, Event, EventWithSubject } from "@/types";
import { revalidatePath } from "next/cache";

export async function getEvents(): Promise<ApiResponse<EventWithSubject[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
            credits: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: events as EventWithSubject[] };
  } catch {
    return { success: false, message: "Failed to fetch events" };
  }
}

export async function getNextEvent(): Promise<
  ApiResponse<EventWithSubject | null>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }
    const now = new Date();

    const event = await prisma.event.findFirst({
      where: {
        userId: session.user.id,
        startTime: { gte: now },
      },
      orderBy: { startTime: "asc" },
      include: { subject: true },
    });

    return { success: true, data: event as unknown as EventWithSubject | null };
  } catch {
    return { success: false, message: "Failed to fetch next event" };
  }
}

export async function createEvent(
  data: CreateEventInput,
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
  data: UpdateEventInput,
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

    // Cross-check time against existing record (schema can't see DB state)
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
