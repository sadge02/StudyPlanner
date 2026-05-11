"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import { z } from "zod";
import { ApiResponse, Project, ProjectMember, ProjectOverview } from "@/types";
import { revalidatePath } from "next/cache";
import { checkProjectAdmin } from "../utils/access";
import { randomBytes } from "crypto";

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

export async function getUserProjectsOverview(): Promise<
  ApiResponse<ProjectOverview[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    password: true,
                    darkMode: true,
                    emailVerified: true,
                  },
                },
              },
              orderBy: { joinedAt: "asc" },
            },
            tasks: {
              include: {
                subject: true,
              },
              orderBy: [
                { deadline: "asc" },
                { title: "asc" },
              ],
            },
          },
        },
      },
      orderBy: {
        project: {
          updatedAt: "desc",
        },
      },
    });

    const projects = memberships.map((membership) => {
      const project = membership.project;

      return {
        ...project,
        role: membership.role,
        tasks: project.tasks.map((task) => {
          const proxyStart = project.createdAt;
          const proxyEnd = task.deadline ?? project.createdAt;
          return {
            id: task.id,
            projectId: project.id,
            projectName: project.name,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            startTime: proxyStart,
            endTime: proxyEnd,
            isProxyRange: !task.deadline,
            subject: task.subject,
          };
        }),
      };
    });

    return { success: true, data: projects as ProjectOverview[] };
  } catch {
    return { success: false, message: "Failed to fetch projects" };
  }
}

export async function createProject(
  data: z.infer<typeof createProjectSchema>,
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

    const inviteCode = randomBytes(4).toString("hex").toUpperCase();

    const project = await prisma.project.create({
      data: {
        ...validatedData.data,
        inviteCode,
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
  data: z.infer<typeof updateProjectSchema>,
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

export async function generateProjectCode(
  id: string,
): Promise<ApiResponse<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const isAdmin = await checkProjectAdmin(session.user.id, id);
    if (!isAdmin) {
      return { success: false, message: "Unauthorized: Admin access required" };
    }

    const newCode = randomBytes(4).toString("hex").toUpperCase();

    const project = await prisma.project.update({
      where: { id },
      data: { inviteCode: newCode },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);

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

    const trimmedCode = code.trim();

    const project = await prisma.project.findFirst({
      where: { inviteCode: { equals: trimmedCode, mode: "insensitive" } },
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
      return {
        success: false,
        message: "You are already a member of this project",
      };
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

export async function leaveProject(projectId: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return { success: false, message: "You are not a member of this project" };
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: {
        id: true,
        userId: true,
        role: true,
      },
    });

    if (members.length === 1) {
      await prisma.project.delete({
        where: { id: projectId },
      });

      revalidatePath("/dashboard/projects");
      revalidatePath(`/dashboard/projects/${projectId}`);
      return { success: true };
    }

    if (membership.role === "ADMIN") {
      const adminCount = members.filter((member) => member.role === "ADMIN").length;
      if (adminCount === 1) {
        return {
          success: false,
          message: "Assign another admin before leaving this project",
        };
      }
    }

    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to leave project" };
  }
}

export async function createProjectMember(
  projectId: string,
  userId: string,
  role: "ADMIN" | "MEMBER" = "MEMBER",
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
  userIdToRemove: string,
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

    const deleteResult = await prisma.projectMember.deleteMany({
      where: {
        userId: userIdToRemove,
        projectId, // Use deleteMany to avoid throwing if not found
      },
    });

    if (deleteResult.count === 0) {
      return { success: false, message: "Member not found" };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to remove member" };
  }
}

export async function updateProjectMemberRole(
  projectId: string,
  userIdToUpdate: string,
  newRole: "ADMIN" | "MEMBER",
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

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userIdToUpdate,
          projectId,
        },
      },
    });

    if (!existingMember) {
      return { success: false, message: "Member not found" };
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
