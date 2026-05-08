"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/schemas";
import {
  ApiResponse,
  Task,
  TaskCompletionItem,
  TaskCompletionStats,
  TaskStatus,
  TaskWithSubject,
} from "@/types";
import { revalidatePath } from "next/cache";
import { checkProjectAccess } from "../utils/access";

export async function getTaskCompletionStats(): Promise<
  ApiResponse<TaskCompletionStats>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [totalTasks, completedTasks, taskItems] = await prisma.$transaction([
      prisma.task.count({ where: { userId: session.user.id } }),
      prisma.task.count({
        where: {
          userId: session.user.id,
          status: "DONE",
        },
      }),
      prisma.task.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
        },
        orderBy: [{ status: "asc" }, { deadline: "asc" }, { title: "asc" }],
      }),
    ]);
    const completionItems = taskItems.map((task) => ({
      ...task,
      status: task.status as TaskStatus,
    })) satisfies TaskCompletionItem[];
    const completedTaskItems = completionItems.filter(
      (task) => task.status === "DONE",
    );
    const incompleteTaskItems = completionItems.filter(
      (task) => task.status !== "DONE",
    );

    return {
      success: true,
      data: {
        totalTasks,
        completedTasks,
        incompleteTasks: totalTasks - completedTasks,
        completionRate: totalTasks
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0,
        completedTaskItems,
        incompleteTaskItems,
      },
    };
  } catch {
    return { success: false, message: "Failed to fetch task completion stats" };
  }
}

export async function getCalendarTasks(): Promise<
  ApiResponse<TaskWithSubject[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        deadline: { not: null },
      },
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
      orderBy: { deadline: "asc" },
    });

    return { success: true, data: tasks as TaskWithSubject[] };
  } catch {
    return { success: false, message: "Failed to fetch task deadlines" };
  }
}

export async function getProjectTasks(projectId: string): Promise<ApiResponse<Task[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const hasAccess = await checkProjectAccess(session.user.id, projectId);
    if (!hasAccess) {
      return { success: false, message: "Unauthorized: You are not a member of this project" };
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { deadline: "asc" },
    });

    return { success: true, data: tasks as unknown as Task[] };
  } catch {
    return { success: false, message: "Failed to fetch project tasks" };
  }
}

export async function createTask(
  data: CreateTaskInput,
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
  data: UpdateTaskInput,
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
    if (!existingTask) {
      return { success: false, message: "Task not found or unauthorized" };
    }

    const hasProjectAccess =
      existingTask.projectId &&
      (await checkProjectAccess(session.user.id, existingTask.projectId));

    if (existingTask.userId !== session.user.id && !hasProjectAccess) {
      return { success: false, message: "Task not found or unauthorized" };
    }

    const task = await prisma.task.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/kanban");
    revalidatePath("/dashboard/projects");
    if (existingTask.projectId) {
      revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    }
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
