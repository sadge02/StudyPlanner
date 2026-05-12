import { prisma } from "../db";
import { ProjectRole } from "@prisma/client";

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

export async function getAllUserProjects(userId: string): Promise<string[]> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  return memberships.map((m) => m.projectId);
}
