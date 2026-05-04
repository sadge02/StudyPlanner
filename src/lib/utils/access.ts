import { prisma } from "../db";
import { ProjectRole } from "@prisma/client";

/**
 * Verifies if a user is a member of a project.
 */
export async function checkProjectAccess(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  return !!member;
}

/**
 * Verifies if a user is admin of a project.
 */
export async function checkProjectAdmin(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  return member?.role === ProjectRole.ADMIN;
}

/**
 /* Returns all project IDs the user belongs to.
 */
export async function getAllUserProjects(userId: string): Promise<string[]> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  return memberships.map((m) => m.projectId);
}
