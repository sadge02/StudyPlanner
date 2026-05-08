import { AnalyticsPeriodSelector } from "@/components/analytics/AnalyticsPeriodSelector";
import { ProductivityChart } from "@/components/analytics/ProductivityChart";
import { StudyTimeTrendChart } from "@/components/analytics/StudyTimeTrendChart";
import { StudyTimer } from "@/components/analytics/StudyTimer";
import { TaskCompletionChart } from "@/components/analytics/TaskCompletionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudyStats } from "@/lib/actions/session.actions";
import { getSubjects } from "@/lib/actions/subject.actions";
import {
  getStudyTimerTasks,
  getTaskCompletionStats,
} from "@/lib/actions/task.actions";
import type { StudyStats, StudyStatsPeriod } from "@/types";

function formatDuration(seconds: number) {
  if (seconds === 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

const validPeriods: StudyStatsPeriod[] = ["week", "month", "year", "all"];

function parsePeriod(period?: string): StudyStatsPeriod {
  return validPeriods.includes(period as StudyStatsPeriod)
    ? (period as StudyStatsPeriod)
    : "week";
}

const emptyStats: StudyStats = {
  totalHours: 0,
  sessionsCount: 0,
  averageSessionDuration: 0,
  bySubject: {},
  timeBySubject: [],
  trends: [],
  currentStreakDays: 0,
  longestStreakDays: 0,
  period: "week",
};

const emptyTaskStats = {
  totalTasks: 0,
  completedTasks: 0,
  incompleteTasks: 0,
  completionRate: 0,
  completedTaskItems: [],
  incompleteTaskItems: [],
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params?.period);
  const [statsResponse, subjectsResponse, taskOptionsResponse, taskStatsResponse] =
    await Promise.all([
    getStudyStats(period),
    getSubjects(),
    getStudyTimerTasks(),
    getTaskCompletionStats(),
  ]);
  const stats = statsResponse.data ?? emptyStats;
  const taskStats = taskStatsResponse.data ?? emptyTaskStats;
  const subjects = subjectsResponse.data ?? [];
  const taskOptions = taskOptionsResponse.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            See how your logged study time is distributed across subjects.
          </p>
        </div>

        <AnalyticsPeriodSelector period={stats.period} />
      </div>

      {!statsResponse.success && statsResponse.message ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {statsResponse.message}
        </div>
      ) : null}

      {!taskStatsResponse.success && taskStatsResponse.message ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {taskStatsResponse.message}
        </div>
      ) : null}

      {!subjectsResponse.success && subjectsResponse.message ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {subjectsResponse.message}
        </div>
      ) : null}

      {!taskOptionsResponse.success && taskOptionsResponse.message ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {taskOptionsResponse.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Study Time
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.totalHours.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
            h
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.sessionsCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Average Session
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatDuration(stats.averageSessionDuration)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">
              {stats.currentStreakDays}d
            </div>
            <div className="text-xs text-muted-foreground">
              Longest: {stats.longestStreakDays}d
            </div>
          </CardContent>
        </Card>
      </div>

      <StudyTimer subjects={subjects} tasks={taskOptions} />
      <StudyTimeTrendChart data={stats.trends} period={stats.period} />
      <ProductivityChart data={stats.timeBySubject} />
      <TaskCompletionChart stats={taskStats} />
    </div>
  );
}
