"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import { ApiResponse, Task } from "@/types";
import { revalidatePath } from "next/cache";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  deadline: z.date().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  deadline: z.date().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export async function createTask(
  data: z.infer<typeof createTaskSchema>,
): Promise<ApiResponse<Task>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = createTaskSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData.data,
        status: "TODO",
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/kanban");
    return { success: true, data: task as unknown as Task };
  } catch {
    return { success: false, message: "Failed to create task" };
  }
}

export async function updateTask(
  id: string,
  data: z.infer<typeof updateTaskSchema>,
): Promise<ApiResponse<Task>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = updateTaskSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.user.id) {
      return { success: false, message: "Task not found or unauthorized" };
    }

    const task = await prisma.task.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/kanban");
    return { success: true, data: task as unknown as Task };
  } catch {
    return { success: false, message: "Failed to update task" };
  }
}

export async function deleteTask(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.user.id) {
      return { success: false, message: "Task not found or unauthorized" };
    }

    // Since tasks can have subtasks, clean them up
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { parentId: id } }),
      prisma.task.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete task" };
  }
}
