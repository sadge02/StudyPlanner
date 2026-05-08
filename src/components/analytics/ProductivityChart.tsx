"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubjectStudyTime } from "@/types";

type ProductivityChartProps = {
  data: SubjectStudyTime[];
};

function formatHours(hours: number) {
  return `${hours.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}h`;
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Spent per Subject</CardTitle>
          <CardDescription>
            Completed study sessions will appear here once tracked.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Spent per Subject</CardTitle>
        <CardDescription>
          Study session durations grouped by subject.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="subjectName"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatHours}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatHours(Number(value)),
                    name === "durationHours" ? "Time spent" : name,
                  ]}
                  labelClassName="text-foreground"
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="durationHours" radius={[6, 6, 0, 0]}>
                  {data.map((subject) => (
                    <Cell key={subject.subjectName} fill={subject.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4 sm:grid-cols-[220px_1fr] xl:grid-cols-1">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="durationSeconds"
                    nameKey="subjectName"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {data.map((subject) => (
                      <Cell key={subject.subjectName} fill={subject.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatHours(Number(value) / 3600),
                      "Time spent",
                    ]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {data.map((subject) => (
                <div
                  key={subject.subjectName}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="truncate">{subject.subjectName}</span>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {formatHours(subject.durationHours)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
