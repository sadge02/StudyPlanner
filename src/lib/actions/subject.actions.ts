"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import {
  createSubjectSchema,
  updateSubjectSchema,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from "@/schemas";
import { revalidatePath } from "next/cache";

export async function getSubjects(): Promise<ApiResponse<Subject[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return { success: true, data: subjects as Subject[] };
  } catch {
    return { success: false, message: "Failed to fetch subjects" };
  }
}

import { ApiResponse, Subject, SubjectWithRelations } from "@/types";

export type SubjectListItem = Subject & {
  _count: { tasks: number; events: number };
};

export async function createSubject(
  data: CreateSubjectInput,
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
  data: UpdateSubjectInput,
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


export async function getUserSubjects(): Promise<ApiResponse<SubjectListItem[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tasks: true, events: true },
        },
      },
    });

    return { success: true, data: subjects as SubjectListItem[] };
  } catch {
    return { success: false, message: "Failed to load subjects" };
  }
}

export async function getSubjectById(id: string): Promise<ApiResponse<SubjectWithRelations>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { deadline: "asc" } },
        events: { orderBy: { startTime: "asc" } },
        notes: { orderBy: { updatedAt: "desc" } },
        studySessions: { orderBy: { startTime: "desc" } },
      },
    });

    if (!subject || subject.userId !== session.user.id) {
      return { success: false, message: "Subject not found or unauthorized" };
    }

    return {
      success: true,
      data: subject as SubjectWithRelations,
    };
  } catch {
    return { success: false, message: "Failed to load subject" };
  }
}

