import { ProductivityChart } from "@/components/analytics/ProductivityChart";
import { TaskCompletionChart } from "@/components/analytics/TaskCompletionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudyStats } from "@/lib/actions/session.actions";
import { getTaskCompletionStats } from "@/lib/actions/task.actions";

function formatDuration(seconds: number) {
  if (seconds === 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

const emptyStats = {
  totalHours: 0,
  sessionsCount: 0,
  averageSessionDuration: 0,
  bySubject: {},
  timeBySubject: [],
};

const emptyTaskStats = {
  totalTasks: 0,
  completedTasks: 0,
  incompleteTasks: 0,
  completionRate: 0,
};

export default async function AnalyticsPage() {
  const [statsResponse, taskStatsResponse] = await Promise.all([
    getStudyStats(),
    getTaskCompletionStats(),
  ]);
  const stats = statsResponse.data ?? emptyStats;
  const taskStats = taskStatsResponse.data ?? emptyTaskStats;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          See how your logged study time is distributed across subjects.
        </p>
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

      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      <ProductivityChart data={stats.timeBySubject} />
      <TaskCompletionChart stats={taskStats} />
    </div>
  );
}
