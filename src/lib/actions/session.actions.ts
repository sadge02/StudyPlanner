"use server";

import { auth } from "../auth";
import { prisma } from "../db";
import type { ApiResponse, StudyStats } from "@/types";

/**
 * Study Session Server Actions
 * M1 - Handle study time tracking and analytics
 */

const FALLBACK_SUBJECT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
];

export async function getStudyStats(): Promise<ApiResponse<StudyStats>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        duration: { not: null },
      },
      include: {
        subject: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const subjectTotals = new Map<
      string,
      { durationSeconds: number; sessionsCount: number; color?: string | null }
    >();

    for (const studySession of studySessions) {
      const subjectName = studySession.subject?.name ?? "Unassigned";
      const current = subjectTotals.get(subjectName) ?? {
        durationSeconds: 0,
        sessionsCount: 0,
        color: studySession.subject?.color,
      };

      current.durationSeconds += studySession.duration ?? 0;
      current.sessionsCount += 1;
      current.color ??= studySession.subject?.color;
      subjectTotals.set(subjectName, current);
    }

    const timeBySubject = [...subjectTotals.entries()]
      .map(([subjectName, subject], index) => ({
        subjectName,
        durationSeconds: subject.durationSeconds,
        durationHours: Number((subject.durationSeconds / 3600).toFixed(2)),
        sessionsCount: subject.sessionsCount,
        color:
          subject.color ??
          FALLBACK_SUBJECT_COLORS[index % FALLBACK_SUBJECT_COLORS.length],
      }))
      .sort((a, b) => b.durationSeconds - a.durationSeconds);

    const totalSeconds = studySessions.reduce(
      (sum, studySession) => sum + (studySession.duration ?? 0),
      0,
    );

    return {
      success: true,
      data: {
        totalHours: Number((totalSeconds / 3600).toFixed(2)),
        sessionsCount: studySessions.length,
        averageSessionDuration: studySessions.length
          ? Math.round(totalSeconds / studySessions.length)
          : 0,
        bySubject: Object.fromEntries(
          timeBySubject.map((subject) => [
            subject.subjectName,
            subject.durationSeconds,
          ]),
        ),
        timeBySubject,
      },
    };
  } catch {
    return { success: false, message: "Failed to fetch study statistics" };
  }
}
