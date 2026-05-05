"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { prisma } from "../db";
import { ApiResponse, Note } from "@/types";
import { checkProjectAccess, getAllUserProjects } from "../utils/access";
import {
  createNoteSchema,
  updateNoteSchema,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/schemas/note.schema";

export async function getProjectNotes(
  projectId: string,
): Promise<ApiResponse<Note[]>> {
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

    const notes = await prisma.note.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: notes as unknown as Note[] };
  } catch {
    return { success: false, message: "Failed to fetch project notes" };
  }
}

export async function createNote(
  input: CreateNoteInput,
): Promise<ApiResponse<Note>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validationResult = createNoteSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        message:
          "Validation error: " + validationResult.error.issues[0].message,
      };
    }
    const validatedData = validationResult.data;

    if (validatedData.projectId) {
      const hasAccess = await checkProjectAccess(
        session.user.id,
        validatedData.projectId,
      );
      if (!hasAccess) {
        return {
          success: false,
          message: "Unauthorized: You are not a member of this project",
        };
      }
    }

    const note = await prisma.note.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/notes");
    if (validatedData.projectId) {
      revalidatePath(`/dashboard/projects/${validatedData.projectId}`);
    }
    if (validatedData.subjectId) {
      revalidatePath(`/dashboard/subjects/${validatedData.subjectId}`);
    }

    return { success: true, data: note as unknown as Note };
  } catch {
    return { success: false, message: "Failed to create note" };
  }
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<ApiResponse<Note>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validationResult = updateNoteSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        message:
          "Validation error: " + validationResult.error.issues[0].message,
      };
    }
    const validatedData = validationResult.data;

    const existingNote = await prisma.note.findUnique({ where: { id } });

    if (!existingNote) {
      return { success: false, message: "Note not found" };
    }

    // Check ownership or project access
    if (existingNote.userId !== session.user.id) {
      if (!existingNote.projectId) {
        return { success: false, message: "Unauthorized" };
      }
      const hasAccess = await checkProjectAccess(
        session.user.id,
        existingNote.projectId,
      );
      if (!hasAccess) {
        return { success: false, message: "Unauthorized" };
      }
    }

    // Check access to new project if moving
    if (
      validatedData.projectId &&
      validatedData.projectId !== existingNote.projectId
    ) {
      const hasAccess = await checkProjectAccess(
        session.user.id,
        validatedData.projectId,
      );
      if (!hasAccess) {
        return {
          success: false,
          message: "Unauthorized: You are not a member of the target project",
        };
      }
    }

    const note = await prisma.note.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/notes");
    if (note.projectId) revalidatePath(`/dashboard/projects/${note.projectId}`);
    if (existingNote.projectId && existingNote.projectId !== note.projectId) {
      revalidatePath(`/dashboard/projects/${existingNote.projectId}`);
    }
    if (note.subjectId) revalidatePath(`/dashboard/subjects/${note.subjectId}`);

    return { success: true, data: note as unknown as Note };
  } catch {
    return { success: false, message: "Failed to update note" };
  }
}

export async function deleteNote(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const existingNote = await prisma.note.findUnique({ where: { id } });
    if (!existingNote) {
      return { success: false, message: "Note not found" };
    }

    if (existingNote.userId !== session.user.id) {
      if (!existingNote.projectId) {
        return { success: false, message: "Unauthorized" };
      }
      const hasAccess = await checkProjectAccess(
        session.user.id,
        existingNote.projectId,
      );
      if (!hasAccess) {
        return { success: false, message: "Unauthorized" };
      }
    }

    await prisma.note.delete({ where: { id } });

    revalidatePath("/dashboard/notes");
    if (existingNote.projectId)
      revalidatePath(`/dashboard/projects/${existingNote.projectId}`);
    if (existingNote.subjectId)
      revalidatePath(`/dashboard/subjects/${existingNote.subjectId}`);

    return { success: true, data: null };
  } catch {
    return { success: false, message: "Failed to delete note" };
  }
}

export async function getUserNotes(): Promise<ApiResponse<Note[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userProjects = await getAllUserProjects(session.user.id);

    const notes = await prisma.note.findMany({
      where: {
        OR: [{ userId: session.user.id }, { projectId: { in: userProjects } }],
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: notes as unknown as Note[] };
  } catch {
    return { success: false, message: "Failed to fetch notes" };
  }
}

export async function getSubjectNotes(
  subjectId: string,
): Promise<ApiResponse<Note[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userProjects = await getAllUserProjects(session.user.id);

    const notes = await prisma.note.findMany({
      where: {
        subjectId,
        OR: [{ userId: session.user.id }, { projectId: { in: userProjects } }],
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: notes as unknown as Note[] };
  } catch {
    return { success: false, message: "Failed to fetch subject notes" };
  }
}

export async function getNoteById(id: string): Promise<ApiResponse<Note>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return { success: false, message: "Note not found" };
    }

    if (note.userId !== session.user.id) {
      if (!note.projectId) {
        return { success: false, message: "Unauthorized" };
      }
      const hasAccess = await checkProjectAccess(
        session.user.id,
        note.projectId,
      );
      if (!hasAccess) {
        return { success: false, message: "Unauthorized" };
      }
    }

    return { success: true, data: note as unknown as Note };
  } catch {
    return { success: false, message: "Failed to fetch note" };
  }
}
