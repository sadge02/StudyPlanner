"use server";

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { prisma } from "../db";
import type {
  ApiResponse,
  StudyStats,
  StudyStatsPeriod,
  StudyTimeTrend,
  StudyTimerSession,
} from "@/types";

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

export async function startStudySession(data: {
  subjectId?: string;
  taskId?: string;
}): Promise<
  ApiResponse<StudyTimerSession>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      select: {
        id: true,
        startTime: true,
        subjectId: true,
        taskId: true,
      },
      orderBy: { startTime: "desc" },
    });

    if (activeSession) {
      return { success: true, data: activeSession };
    }

    if (data.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: data.subjectId },
        select: { userId: true },
      });
      if (!subject || subject.userId !== session.user.id) {
        return { success: false, message: "Subject not found or unauthorized" };
      }
    }

    if (data.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        select: { userId: true },
      });
      if (!task || task.userId !== session.user.id) {
        return { success: false, message: "Task not found or unauthorized" };
      }
    }

    const studySession = await prisma.studySession.create({
      data: {
        startTime: new Date(),
        userId: session.user.id,
        subjectId: data.subjectId,
        taskId: data.taskId,
      },
      select: {
        id: true,
        startTime: true,
        subjectId: true,
        taskId: true,
      },
    });

    return { success: true, data: studySession };
  } catch {
    return { success: false, message: "Failed to start study session" };
  }
}

export async function getActiveStudySession(): Promise<
  ApiResponse<StudyTimerSession | null>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      select: {
        id: true,
        startTime: true,
        subjectId: true,
        taskId: true,
      },
      orderBy: { startTime: "desc" },
    });

    return { success: true, data: activeSession };
  } catch {
    return { success: false, message: "Failed to fetch active study session" };
  }
}

export async function stopStudySession(
  id: string,
): Promise<ApiResponse<StudyTimerSession>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const existingSession = await prisma.studySession.findUnique({
      where: { id },
      select: {
        userId: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!existingSession || existingSession.userId !== session.user.id) {
      return { success: false, message: "Study session not found" };
    }

    if (existingSession.endTime) {
      return { success: false, message: "Study session already stopped" };
    }

    const stopTime = new Date();
    const duration = Math.max(
      0,
      Math.round((stopTime.getTime() - existingSession.startTime.getTime()) / 1000),
    );
    const studySession = await prisma.studySession.update({
      where: { id },
      data: {
        endTime: stopTime,
        duration,
      },
      select: {
        id: true,
        startTime: true,
        subjectId: true,
        taskId: true,
      },
    });

    revalidatePath("/dashboard/analytics");
    return { success: true, data: studySession };
  } catch {
    return { success: false, message: "Failed to stop study session" };
  }
}

const STUDY_STAT_PERIODS: StudyStatsPeriod[] = ["week", "month", "year", "all"];

function normalizePeriod(period?: string): StudyStatsPeriod {
  return STUDY_STAT_PERIODS.includes(period as StudyStatsPeriod)
    ? (period as StudyStatsPeriod)
    : "week";
}

function getPeriodStart(period: StudyStatsPeriod, today: Date) {
  if (period === "week") return startOfDay(subDays(today, 6));
  if (period === "month") return startOfDay(subDays(today, 29));
  if (period === "year") return startOfMonth(subMonths(today, 11));

  return undefined;
}

function buildTrendBuckets(
  period: StudyStatsPeriod,
  studySessions: { startTime: Date; duration: number | null }[],
  today: Date,
): StudyTimeTrend[] {
  const periodStart = getPeriodStart(period, today);
  const earliestSession = studySessions.at(-1)?.startTime;
  const chartStart =
    period === "all"
      ? startOfMonth(earliestSession ?? today)
      : periodStart ?? startOfDay(today);
  const chartEnd = endOfDay(today);

  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(chartStart, index);
      const sessions = studySessions.filter((session) =>
        isSameDay(session.startTime, day),
      );
      const durationSeconds = sessions.reduce(
        (sum, session) => sum + (session.duration ?? 0),
        0,
      );

      return {
        label: format(day, "EEE"),
        durationSeconds,
        durationHours: Number((durationSeconds / 3600).toFixed(2)),
        sessionsCount: sessions.length,
      };
    });
  }

  if (period === "month") {
    const weeks = new Map<string, StudyTimeTrend>();

    for (let day = chartStart; day <= chartEnd; day = addDays(day, 7)) {
      const weekStart = startOfWeek(day, { weekStartsOn: 1 });
      const label = format(weekStart, "MMM d");
      weeks.set(label, {
        label,
        durationSeconds: 0,
        durationHours: 0,
        sessionsCount: 0,
      });
    }

    for (const session of studySessions) {
      const weekStart = startOfWeek(session.startTime, { weekStartsOn: 1 });
      const label = format(weekStart, "MMM d");
      const bucket = weeks.get(label);
      if (!bucket) continue;

      bucket.durationSeconds += session.duration ?? 0;
      bucket.sessionsCount += 1;
      bucket.durationHours = Number((bucket.durationSeconds / 3600).toFixed(2));
    }

    return [...weeks.values()];
  }

  const months: StudyTimeTrend[] = [];
  for (
    let month = startOfMonth(chartStart);
    month <= chartEnd;
    month = addMonths(month, 1)
  ) {
    const sessions = studySessions.filter(
      (session) =>
        session.startTime.getFullYear() === month.getFullYear() &&
        session.startTime.getMonth() === month.getMonth(),
    );
    const durationSeconds = sessions.reduce(
      (sum, session) => sum + (session.duration ?? 0),
      0,
    );

    months.push({
      label: format(month, "MMM yyyy"),
      durationSeconds,
      durationHours: Number((durationSeconds / 3600).toFixed(2)),
      sessionsCount: sessions.length,
    });
  }

  return months;
}

function calculateStreaks(studySessions: { startTime: Date }[], today: Date) {
  const studiedDayKeys = new Set(
    studySessions.map((session) => format(startOfDay(session.startTime), "yyyy-MM-dd")),
  );

  let currentStreakDays = 0;
  for (let day = startOfDay(today); ; day = subDays(day, 1)) {
    if (!studiedDayKeys.has(format(day, "yyyy-MM-dd"))) break;
    currentStreakDays += 1;
  }

  const studiedDays = [...studiedDayKeys]
    .map((day) => startOfDay(new Date(`${day}T00:00:00`)))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreakDays = 0;
  let activeStreak = 0;
  let previousDay: Date | null = null;

  for (const day of studiedDays) {
    activeStreak =
      previousDay && differenceInCalendarDays(day, previousDay) === 1
        ? activeStreak + 1
        : 1;
    longestStreakDays = Math.max(longestStreakDays, activeStreak);
    previousDay = day;
  }

  return { currentStreakDays, longestStreakDays };
}

export async function getStudyStats(
  period?: StudyStatsPeriod,
): Promise<ApiResponse<StudyStats>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const normalizedPeriod = normalizePeriod(period);
    const today = new Date();
    const periodStart = getPeriodStart(normalizedPeriod, today);
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        duration: { not: null },
        ...(periodStart ? { startTime: { gte: periodStart } } : {}),
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
    const streakSessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        duration: { not: null },
      },
      select: { startTime: true },
      orderBy: { startTime: "asc" },
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
        trends: buildTrendBuckets(normalizedPeriod, studySessions, today),
        ...calculateStreaks(streakSessions, today),
        period: normalizedPeriod,
      },
    };
  } catch {
    return { success: false, message: "Failed to fetch study statistics" };
  }
}
