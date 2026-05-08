"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaskCompletionStats } from "@/types";
import { cn } from "@/lib/utils";

type TaskCompletionChartProps = {
  stats: TaskCompletionStats;
};

function TaskBucket({
  color,
  count,
  defaultOpen = false,
  items,
  title,
}: {
  color: string;
  count: number;
  defaultOpen?: boolean;
  items: TaskCompletionStats["completedTaskItems"];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border/70 text-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span>{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-medium">{count}</span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-border/70 px-3 py-2">
          {items.length > 0 ? (
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {items.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="min-w-0 truncate">{task.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {task.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No tasks here yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TaskCompletionChart({ stats }: TaskCompletionChartProps) {
  const chartData = [
    {
      name: "Completed",
      value: stats.completedTasks,
      color: "#22c55e",
      items: stats.completedTaskItems,
    },
    {
      name: "Remaining",
      value: stats.incompleteTasks,
      color: "#94a3b8",
      items: stats.incompleteTaskItems,
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
              <TaskBucket
                key={entry.name}
                color={entry.color}
                count={entry.value}
                defaultOpen={entry.name === "Remaining"}
                items={entry.items}
                title={entry.name}
              />
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
