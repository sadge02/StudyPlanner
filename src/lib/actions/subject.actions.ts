"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import { ApiResponse, Subject } from "@/types";
import { revalidatePath } from "next/cache";

const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  credits: z
    .number()
    .nonnegative("Credits must be non-negative")
    .optional()
    .nullable(),
  color: z.string().optional().nullable(),
});

const updateSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  credits: z
    .number()
    .nonnegative("Credits must be non-negative")
    .optional()
    .nullable(),
  color: z.string().optional().nullable(),
});

export async function createSubject(
  data: z.infer<typeof createSubjectSchema>,
): Promise<ApiResponse<Subject>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = createSubjectSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const subject = await prisma.subject.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/subjects");
    return { success: true, data: subject as Subject };
  } catch {
    return { success: false, message: "Failed to create subject" };
  }
}

export async function updateSubject(
  id: string,
  data: z.infer<typeof updateSubjectSchema>,
): Promise<ApiResponse<Subject>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = updateSubjectSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const existingSubject = await prisma.subject.findUnique({ where: { id } });
    if (!existingSubject || existingSubject.userId !== session.user.id) {
      return { success: false, message: "Subject not found or unauthorized" };
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath("/dashboard/subjects");
    return { success: true, data: subject as Subject };
  } catch {
    return { success: false, message: "Failed to update subject" };
  }
}

export async function deleteSubject(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const existingSubject = await prisma.subject.findUnique({ where: { id } });
    if (!existingSubject || existingSubject.userId !== session.user.id) {
      return { success: false, message: "Subject not found or unauthorized" };
    }

    await prisma.$transaction([
      prisma.event.deleteMany({ where: { subjectId: id } }),
      prisma.task.deleteMany({ where: { subjectId: id } }),
      prisma.subject.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/subjects");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete subject" };
  }
}
