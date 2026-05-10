"use server";

import { revalidatePath } from "next/cache";

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
  StudyTimerTaskOption,
  TaskWithSubject,
} from "@/types";

export type TaskDetail = TaskWithSubject & {
  subTasks: Array<Task & { subTasks: Task[] }>;
};

const MAX_TASK_DEPTH = 3;

async function getTaskDepth(taskId: string): Promise<number> {
  let depth = 1;
  let currentId: string | null = taskId;
  const seen = new Set<string>();
  while (currentId) {
    if (seen.has(currentId)) return Number.POSITIVE_INFINITY;
    seen.add(currentId);
    if (depth > MAX_TASK_DEPTH) return depth;
    const t: { parentId: string | null } | null = await prisma.task.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!t?.parentId) return depth;
    currentId = t.parentId;
    depth++;
  }
  return depth;
}

function revalidateTaskPaths() {
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/subjects");
}
import { checkProjectAccess } from "../utils/access";

export async function getTodaysTasks(): Promise<ApiResponse<Task[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        deadline: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { deadline: "asc" },
    });

    return { success: true, data: tasks as unknown as Task[] };
  } catch {
    return { success: false, message: "Failed to fetch today's tasks" };
  }
}

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

export async function getStudyTimerTasks(): Promise<
  ApiResponse<StudyTimerTaskOption[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        status: true,
      },
      orderBy: [{ status: "asc" }, { title: "asc" }],
    });

    return {
      success: true,
      data: tasks.map((task) => ({
        ...task,
        status: task.status as TaskStatus,
      })),
    };
  } catch {
    return { success: false, message: "Failed to fetch timer tasks" };
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

export async function getProjectTasks(
  projectId: string,
): Promise<ApiResponse<Task[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const hasAccess = await checkProjectAccess(session.user.id, projectId);
    if (!hasAccess) {
      return {
        success: false,
        message: "Unauthorized: You are not a member of this project",
      };
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

    if (validatedData.data.parentId) {
      const parentDepth = await getTaskDepth(validatedData.data.parentId);
      if (parentDepth >= MAX_TASK_DEPTH) {
        return {
          success: false,
          message: `Maximum nesting depth (${MAX_TASK_DEPTH}) reached`,
        };
      }
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
      },
    });

    revalidateTaskPaths();
    return { success: true, data: task as Task };
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

    revalidateTaskPaths();
    revalidatePath("/dashboard/projects");
    if (existingTask.projectId) {
      revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    }
    return { success: true, data: task as Task };
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

    await prisma.$transaction([
      prisma.task.deleteMany({ where: { parentId: id } }),
      prisma.task.delete({ where: { id } }),
    ]);

    revalidateTaskPaths();
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete task" };
  }
}

export async function getTaskById(
  id: string,
): Promise<ApiResponse<TaskDetail>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subject: true,
        subTasks: {
          include: {
            subTasks: true,
          },
        },
      },
    });

    if (!task || task.userId !== session.user.id) {
      return { success: false, message: "Task not found or unauthorized" };
    }

    return { success: true, data: task as TaskDetail };
  } catch {
    return { success: false, message: "Failed to load task" };
  }
}

export async function getUserTasks(
  subjectId?: string,
): Promise<ApiResponse<TaskWithSubject[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(subjectId ? { subjectId } : {}),
      },
      include: { subject: true },
      orderBy: [{ deadline: "asc" }],
    });

    return { success: true, data: tasks as TaskWithSubject[] };
  } catch (error) {
    console.error("[getUserTasks] failed:", error);
    return { success: false, message: "Failed to load tasks" };
  }
}
