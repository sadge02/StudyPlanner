"use client";

import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  set,
  startOfDay,
} from "date-fns";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTask } from "@/lib/actions/task.actions";
import { Badge } from "@/components/ui/badge";
import type { ProjectTimelineTask } from "@/types";

const LEFT_COLUMN_WIDTH = 220;
const DAY_WIDTH = 52;
const GROUP_HEADER_HEIGHT = 34;
const ROW_HEIGHT = 54;

function statusColor(status: string) {
  switch (status) {
    case "DONE":
      return "#22c55e";
    case "IN_PROGRESS":
      return "#f59e0b";
    case "TODO":
      return "#94a3b8";
    default:
      return "#60a5fa";
  }
}

type DragState = {
  taskId: string;
  originalEndTime: Date;
};

function withPreservedTime(targetDay: Date, sourceTime: Date) {
  return set(targetDay, {
    hours: sourceTime.getHours(),
    minutes: sourceTime.getMinutes(),
    seconds: sourceTime.getSeconds(),
    milliseconds: sourceTime.getMilliseconds(),
  });
}

export function TimelineView({
  tasks,
}: {
  tasks: ProjectTimelineTask[];
}) {
  const router = useRouter();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [deadlineOverrides, setDeadlineOverrides] = useState<
    Record<string, Date>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const timelineTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        endTime: deadlineOverrides[task.id] ?? task.endTime,
      })),
    [deadlineOverrides, tasks],
  );

  const groupedTasks = useMemo(() => {
    const frozenEndTimes = new Map(
      tasks.map((task) => [task.id, task.endTime.getTime()]),
    );
    const groups = new Map<
      string,
      { projectId: string; projectName: string; tasks: ProjectTimelineTask[] }
    >();

    for (const task of timelineTasks) {
      const existing = groups.get(task.projectId);
      if (existing) {
        existing.tasks.push(task);
      } else {
        groups.set(task.projectId, {
          projectId: task.projectId,
          projectName: task.projectName,
          tasks: [task],
        });
      }
    }

    return [...groups.values()].map((group) => ({
      ...group,
      tasks: group.tasks.sort(
        (a, b) =>
          (dragState
            ? frozenEndTimes.get(a.id) ?? a.endTime.getTime()
            : a.endTime.getTime()) -
          (dragState
            ? frozenEndTimes.get(b.id) ?? b.endTime.getTime()
            : b.endTime.getTime()),
      ),
    }));
  }, [dragState, tasks, timelineTasks]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
        No scheduled tasks yet. Add deadlines to project tasks and they will
        appear on the timeline here.
      </div>
    );
  }

  const sortedTasks = groupedTasks.flatMap((group) => group.tasks);
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
  const svgHeight =
    56 +
    groupedTasks.reduce(
      (height, group) => height + GROUP_HEADER_HEIGHT + group.tasks.length * ROW_HEIGHT,
      0,
    );

  const handleDragStart = (task: ProjectTimelineTask) => {
    if (isPending) return;
    setErrorMessage(null);
    setDragState({
      taskId: task.id,
      originalEndTime: deadlineOverrides[task.id] ?? task.endTime,
    });
  };

  const handlePointerMove = (
    event: React.PointerEvent<SVGSVGElement>,
  ) => {
    if (!dragState) return;

    const svgRect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - svgRect.left;
    const clampedX = Math.max(LEFT_COLUMN_WIDTH, relativeX);
    const dayIndex = Math.max(
      0,
      Math.min(
        totalDays - 1,
        Math.round((clampedX - LEFT_COLUMN_WIDTH) / DAY_WIDTH),
      ),
    );
    const nextDay = addDays(chartStart, dayIndex);
    const nextEndTime = withPreservedTime(nextDay, dragState.originalEndTime);

    setDeadlineOverrides((current) => ({
      ...current,
      [dragState.taskId]: nextEndTime,
    }));
  };

  const finalizeDrag = () => {
    if (!dragState) return;

    const { originalEndTime, taskId } = dragState;
    const nextDeadline = deadlineOverrides[dragState.taskId];
    if (
      !nextDeadline ||
      nextDeadline.getTime() === originalEndTime.getTime()
    ) {
      setDragState(null);
      return;
    }

    startTransition(async () => {
      const response = await updateTask(taskId, { deadline: nextDeadline });
      if (!response.success) {
        setErrorMessage(response.message ?? "Failed to reschedule task");
        setDeadlineOverrides((current) => ({
          ...current,
          [taskId]: originalEndTime,
        }));
        setDragState(null);
        return;
      }

      setDeadlineOverrides((current) => {
        const next = { ...current };
        delete next[taskId];
        return next;
      });
      router.refresh();
      setDragState(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Timeline span: {totalDays} days</Badge>
        <span>
          {format(chartStart, "MMM d")} to {format(chartEnd, "MMM d, yyyy")}
        </span>
        <span>Drag the bar end handle to reschedule a deadline.</span>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-full"
          role="img"
          aria-label="Project task timeline"
          onPointerMove={handlePointerMove}
          onPointerUp={finalizeDrag}
          onPointerLeave={finalizeDrag}
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

          {(() => {
            let currentY = 44;

            return groupedTasks.map((group) => {
              const groupStartY = currentY;
              currentY += GROUP_HEADER_HEIGHT;

              return (
                <g key={group.projectId}>
                  <rect
                    x={0}
                    y={groupStartY}
                    width={svgWidth}
                    height={GROUP_HEADER_HEIGHT}
                    fill="rgba(148, 163, 184, 0.08)"
                  />
                  <text
                    x={16}
                    y={groupStartY + 21}
                    fontSize="13"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {group.projectName}
                  </text>

                  {group.tasks.map((task) => {
                    const rowY = currentY;
                    currentY += ROW_HEIGHT;

                    const taskOffset = differenceInCalendarDays(
                      startOfDay(task.startTime),
                      chartStart,
                    );
                    const taskDurationDays = Math.max(
                      1,
                      differenceInCalendarDays(
                        endOfDay(task.endTime),
                        startOfDay(task.startTime),
                      ) + 1,
                    );
                    const taskSpan = taskDurationDays * DAY_WIDTH;
                    const barX = LEFT_COLUMN_WIDTH + taskOffset * DAY_WIDTH + 6;
                    const barWidth = Math.max(16, taskSpan - 12);
                    const fillColor = statusColor(task.status);

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
                        <text
                          x={16}
                          y={rowY + 36}
                          fontSize="11"
                          fill="currentColor"
                          opacity="0.62"
                        >
                          {(task.subject?.name ?? task.status.replaceAll("_", " ")) +
                            ` • ${taskDurationDays}d`}
                          {task.isProxyRange ? " • proxy deadline" : ""}
                        </text>

                        <rect
                          x={barX}
                          y={rowY + 4}
                          rx={10}
                          ry={10}
                          width={barWidth}
                          height={24}
                          fill={fillColor}
                          opacity={task.isProxyRange ? 0.5 : 0.92}
                        />

                        <text
                          x={barX + 10}
                          y={rowY + 20}
                          fontSize="11"
                          fill="white"
                        >
                          {taskDurationDays}d
                        </text>

                        <rect
                          x={barX + barWidth - 8}
                          y={rowY + 2}
                          width={12}
                          height={28}
                          rx={6}
                          ry={6}
                          fill="rgba(255,255,255,0.85)"
                          stroke={fillColor}
                          className="cursor-ew-resize"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleDragStart(task);
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            });
          })()}
        </svg>
      </div>
    </div>
  );
}
