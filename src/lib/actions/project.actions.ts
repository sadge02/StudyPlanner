"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import { ApiResponse, Project, ProjectMember } from "@/types";
import { revalidatePath } from "next/cache";
import { checkProjectAdmin } from "../utils/access";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().nullable(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional().nullable(),
});

const updateRoleSchema = z.object({
  newRole: z.enum(["ADMIN", "MEMBER"]),
});

export async function createProject(
  data: z.infer<typeof createProjectSchema>
): Promise<ApiResponse<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedData = createProjectSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData.data,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, data: project as Project };
  } catch {
    return { success: false, message: "Failed to create project" };
  }
}

export async function updateProject(
  id: string,
  data: z.infer<typeof updateProjectSchema>
): Promise<ApiResponse<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, id);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    const validatedData = updateProjectSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const project = await prisma.project.update({
      where: { id },
      data: validatedData.data,
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { success: true, data: project as Project };
  } catch {
    return { success: false, message: "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, id);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete project" };
  }
}

export async function generateProjectCode(id: string): Promise<ApiResponse<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, id);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const project = await prisma.project.update({
      where: { id },
      data: { inviteCode: newCode },
    });

    return { success: true, data: project.inviteCode };
  } catch {
    return { success: false, message: "Failed to generate invite code" };
  }
}

export async function joinProject(code: string): Promise<ApiResponse<Project>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const project = await prisma.project.findUnique({
      where: { inviteCode: code },
    });

    if (!project) {
      return { success: false, message: "Invalid invite code" };
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: project.id,
        },
      },
    });

    if (existingMember) {
      return { success: false, message: "You are already a member of this project" };
    }

    await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        role: "MEMBER",
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, data: project as Project };
  } catch {
    return { success: false, message: "Failed to join project" };
  }
}

export async function createProjectMember(
  projectId: string,
  userId: string,
  role: "ADMIN" | "MEMBER" = "MEMBER"
): Promise<ApiResponse<ProjectMember>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, projectId);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      return { success: false, message: "User is already a member" };
    }

    const member = await prisma.projectMember.create({
      data: {
        userId,
        projectId,
        role,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, data: member as unknown as ProjectMember };
  } catch {
    return { success: false, message: "Failed to add member to project" };
  }
}

export async function removeProjectMember(
  projectId: string,
  userIdToRemove: string
): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, projectId);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    if (session.user.id === userIdToRemove) {
      return { success: false, message: "Cannot remove yourself" };
    }

    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: userIdToRemove,
          projectId,
        },
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to remove member" };
  }
}

export async function updateProjectMemberRole(
  projectId: string,
  userIdToUpdate: string,
  newRole: "ADMIN" | "MEMBER"
): Promise<ApiResponse<ProjectMember>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, projectId);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    if (session.user.id === userIdToUpdate) {
      return { success: false, message: "Cannot modify your own role" };
    }

    const validatedData = updateRoleSchema.safeParse({ newRole });
    if (!validatedData.success) {
      return {
        success: false,
        message: "Validation error: " + validatedData.error.issues[0].message,
      };
    }

    const member = await prisma.projectMember.update({
      where: {
        userId_projectId: {
          userId: userIdToUpdate,
          projectId,
        },
      },
      data: {
        role: validatedData.data.newRole,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, data: member as unknown as ProjectMember };
  } catch {
    return { success: false, message: "Failed to update member role" };
  }
}