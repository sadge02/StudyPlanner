"use client";

import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { ProjectTimelineTask } from "@/types";

const LEFT_COLUMN_WIDTH = 220;
const DAY_WIDTH = 52;
const ROW_HEIGHT = 54;

function priorityColor(priority: ProjectTimelineTask["priority"]) {
  switch (priority) {
    case "HIGH":
      return "#d9485f";
    case "MEDIUM":
      return "#f59e0b";
    default:
      return "#10b981";
  }
}

export function TimelineView({
  tasks,
}: {
  tasks: ProjectTimelineTask[];
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
        No scheduled tasks yet. Add deadlines to project tasks and they will
        appear on the timeline here.
      </div>
    );
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => a.endTime.getTime() - b.endTime.getTime(),
  );
  const chartStart = startOfDay(
    sortedTasks.reduce(
      (earliest, task) =>
        task.startTime.getTime() < earliest.getTime() ? task.startTime : earliest,
      sortedTasks[0].startTime,
    ),
  );
  const chartEnd = endOfDay(
    sortedTasks.reduce(
      (latest, task) =>
        task.endTime.getTime() > latest.getTime() ? task.endTime : latest,
      sortedTasks[0].endTime,
    ),
  );
  const totalDays = Math.max(
    1,
    differenceInCalendarDays(chartEnd, chartStart) + 1,
  );
  const svgWidth = LEFT_COLUMN_WIDTH + totalDays * DAY_WIDTH;
  const svgHeight = 60 + sortedTasks.length * ROW_HEIGHT;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Timeline span: {totalDays} days</Badge>
        <span>
          {format(chartStart, "MMM d")} to {format(chartEnd, "MMM d, yyyy")}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-full"
          role="img"
          aria-label="Project task timeline"
        >
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

          {Array.from({ length: totalDays }, (_, index) => {
            const day = addDays(chartStart, index);
            const x = LEFT_COLUMN_WIDTH + index * DAY_WIDTH;
            return (
              <g key={day.toISOString()}>
                <rect
                  x={x}
                  y={0}
                  width={DAY_WIDTH}
                  height={svgHeight}
                  fill={index % 2 === 0 ? "rgba(148, 163, 184, 0.06)" : "transparent"}
                />
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={svgHeight}
                  stroke="rgba(148, 163, 184, 0.18)"
                />
                <text
                  x={x + DAY_WIDTH / 2}
                  y={24}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  opacity={0.72}
                >
                  {format(day, "MMM d")}
                </text>
              </g>
            );
          })}

          <line
            x1={LEFT_COLUMN_WIDTH}
            y1={0}
            x2={LEFT_COLUMN_WIDTH}
            y2={svgHeight}
            stroke="rgba(148, 163, 184, 0.3)"
          />

          {sortedTasks.map((task, index) => {
            const rowY = 44 + index * ROW_HEIGHT;
            const taskOffset = differenceInCalendarDays(
              startOfDay(task.startTime),
              chartStart,
            );
            const taskSpan =
              Math.max(
                1,
                differenceInCalendarDays(
                  endOfDay(task.endTime),
                  startOfDay(task.startTime),
                ) + 1,
              ) * DAY_WIDTH;
            const barX = LEFT_COLUMN_WIDTH + taskOffset * DAY_WIDTH + 6;
            const barWidth = Math.max(14, taskSpan - 12);
            const strokeColor = priorityColor(task.priority);

            return (
              <g key={task.id}>
                <line
                  x1={0}
                  y1={rowY + ROW_HEIGHT - 8}
                  x2={svgWidth}
                  y2={rowY + ROW_HEIGHT - 8}
                  stroke="rgba(148, 163, 184, 0.12)"
                />

                <text x={16} y={rowY + 18} fontSize="13" fill="currentColor">
                  {task.title}
                </text>
                <text x={16} y={rowY + 36} fontSize="11" fill="currentColor" opacity="0.62">
                  {task.subject?.name ?? task.status.replaceAll("_", " ")}
                  {task.isProxyRange ? " • no deadline range" : ""}
                </text>

                <rect
                  x={barX}
                  y={rowY + 4}
                  rx={10}
                  ry={10}
                  width={barWidth}
                  height={24}
                  fill={strokeColor}
                  opacity={task.isProxyRange ? 0.45 : 0.92}
                />

                <text
                  x={barX + 10}
                  y={rowY + 20}
                  fontSize="11"
                  fill="white"
                >
                  {task.isProxyRange || isSameDay(task.startTime, task.endTime)
                    ? format(task.endTime, "MMM d")
                    : `${format(task.startTime, "MMM d")} - ${format(task.endTime, "MMM d")}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
