import { ProductivityChart } from "@/components/analytics/ProductivityChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudyStats } from "@/lib/actions/session.actions";

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

export default async function AnalyticsPage() {
  const statsResponse = await getStudyStats();
  const stats = statsResponse.data ?? emptyStats;

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
    </div>
  );
}
