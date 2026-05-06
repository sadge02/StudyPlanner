"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/schemas";
import { ApiResponse, Task } from "@/types";
import { revalidatePath } from "next/cache";
import { checkProjectAccess } from "../utils/access";

export async function getProjectTasks(
  projectId: string,
): Promise<ApiResponse<Task[]>> {
  try {
    // TODO: uncomment
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, message: "Unauthorized" };
    // }

    // const hasAccess = await checkProjectAccess(session.user.id, projectId);
    // if (!hasAccess) {
    //   return {
    //     success: false,
    //     message: "Unauthorized: You are not a member of this project",
    //   };
    // }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { deadline: "asc" },
    });
    console.log("Fetched tasks for project", projectId, tasks);
    return { success: true, data: tasks as unknown as Task[] };
  } catch {
    return { success: false, message: "Failed to fetch project tasks" };
  }
}

export async function createTask(
  data: CreateTaskInput,
): Promise<ApiResponse<Task>> {
  try {
    // TODO: uncomment
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, message: "Unauthorized" };
    // }

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
        // TODO: uncomment: userId: session.user.id,
        userId: "cmouj5xrh0000bspzc84ez2m8",
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
  data: UpdateTaskInput,
): Promise<ApiResponse<Task>> {
  try {
    // TODO: uncomment
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, message: "Unauthorized" };
    // }

    const validatedData = updateTaskSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    // TODO: uncomment if (!existingTask || existingTask.userId !== session.user.id) {
    if (!existingTask || existingTask.userId !== "cmouj5xrh0000bspzc84ez2m8") {
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
    // TODO: uncomment
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, message: "Unauthorized" };
    // }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    // TODO: uncomment if (!existingTask || existingTask.userId !== session.user.id) {
    if (!existingTask || existingTask.userId !== "cmouj5xrh0000bspzc84ez2m8") {
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
