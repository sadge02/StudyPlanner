"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaskCompletionStats } from "@/types";

type TaskCompletionChartProps = {
  stats: TaskCompletionStats;
};

export function TaskCompletionChart({ stats }: TaskCompletionChartProps) {
  const chartData = [
    {
      name: "Completed",
      value: stats.completedTasks,
      color: "#22c55e",
    },
    {
      name: "Remaining",
      value: stats.incompleteTasks,
      color: "#94a3b8",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion Rate</CardTitle>
        <CardDescription>
          Completed tasks compared with your total task load.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={stats.totalTasks > 0 ? 4 : 0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} tasks`, name]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold">
                {stats.completionRate}%
              </span>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>

          <div className="grid content-center gap-3">
            {chartData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}</span>
                </div>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}

            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
