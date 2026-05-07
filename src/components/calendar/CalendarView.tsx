"use client";

import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type EventProps,
} from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventWithSubject, TaskWithSubject } from "@/types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

const calendarViews = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

type CalendarEventInput = Omit<
  EventWithSubject,
  "startTime" | "endTime"
> & {
  startTime: Date | string;
  endTime: Date | string;
};

type CalendarTaskInput = Omit<TaskWithSubject, "deadline"> & {
  deadline: Date | string | null;
};

type CalendarBlock = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    kind: "event" | "task";
    description: string | null;
    subjectName: string | null;
    color: string | null;
    priority?: string;
    status?: string;
  };
};

function isValidColor(value: string | null | undefined) {
  if (!value) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function EventBlock({ event }: EventProps<CalendarBlock>) {
  return (
    <div className="truncate">
      <div className="truncate font-medium">{event.title}</div>
      {event.resource.subjectName ? (
        <div className="truncate text-[11px] opacity-80">
          {event.resource.subjectName}
        </div>
      ) : null}
    </div>
  );
}

export function CalendarView({
  events,
  taskDeadlines,
  errorMessage,
}: {
  events: CalendarEventInput[];
  taskDeadlines: CalendarTaskInput[];
  errorMessage?: string;
}) {
  const calendarEvents: CalendarBlock[] = [
    ...events.map((event) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      return {
        id: event.id,
        title: event.title,
        start,
        end,
        allDay:
          start.getHours() === 0 &&
          start.getMinutes() === 0 &&
          end.getHours() === 0 &&
          end.getMinutes() === 0,
        resource: {
          kind: "event" as const,
          description: event.description,
          subjectName: event.subject?.name ?? null,
          color: event.subject?.color ?? null,
        },
      };
    }),
    ...taskDeadlines
      .filter((task) => task.deadline)
      .map((task) => {
        const dueAt = new Date(task.deadline as Date | string);
        const end = new Date(dueAt.getTime() + 30 * 60 * 1000);

        return {
          id: `task-${task.id}`,
          title: `Due: ${task.title}`,
          start: dueAt,
          end,
          allDay: false,
          resource: {
            kind: "task" as const,
            description: task.description,
            subjectName: task.subject?.name ?? null,
            color: task.subject?.color ?? null,
            priority: task.priority,
            status: task.status,
          },
        };
      }),
  ].sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <Card
      className={cn(
        "border border-border/70 shadow-sm",
        "[&_.rbc-calendar]:rounded-xl [&_.rbc-calendar]:bg-card [&_.rbc-calendar]:text-sm [&_.rbc-calendar]:text-card-foreground",
        "[&_.rbc-toolbar]:mb-4 [&_.rbc-toolbar]:flex-col [&_.rbc-toolbar]:gap-3 sm:[&_.rbc-toolbar]:flex-row sm:[&_.rbc-toolbar]:items-center sm:[&_.rbc-toolbar]:justify-between",
        "[&_.rbc-toolbar_button]:rounded-md [&_.rbc-toolbar_button]:border [&_.rbc-toolbar_button]:border-border [&_.rbc-toolbar_button]:bg-background [&_.rbc-toolbar_button]:px-3 [&_.rbc-toolbar_button]:py-2 [&_.rbc-toolbar_button]:text-sm [&_.rbc-toolbar_button]:text-foreground [&_.rbc-toolbar_button]:transition-colors",
        "[&_.rbc-toolbar_button:hover]:bg-accent [&_.rbc-toolbar_button:hover]:text-accent-foreground [&_.rbc-toolbar_button:focus-visible]:bg-accent [&_.rbc-toolbar_button:focus-visible]:text-accent-foreground",
        "[&_.rbc-toolbar_button.rbc-active]:border-transparent [&_.rbc-toolbar_button.rbc-active]:bg-primary [&_.rbc-toolbar_button.rbc-active]:text-primary-foreground",
        "[&_.rbc-toolbar-label]:text-lg [&_.rbc-toolbar-label]:font-semibold [&_.rbc-toolbar-label]:tracking-tight",
        "[&_.rbc-header]:border-border [&_.rbc-header]:bg-muted/40 [&_.rbc-header]:px-2 [&_.rbc-header]:py-3 [&_.rbc-header]:text-sm [&_.rbc-header]:font-medium [&_.rbc-header]:text-foreground",
        "[&_.rbc-month-view]:overflow-hidden [&_.rbc-month-view]:rounded-xl [&_.rbc-month-view]:border [&_.rbc-month-view]:border-border/70",
        "[&_.rbc-time-view]:overflow-hidden [&_.rbc-time-view]:rounded-xl [&_.rbc-time-view]:border [&_.rbc-time-view]:border-border/70",
        "[&_.rbc-agenda-view]:overflow-hidden [&_.rbc-agenda-view]:rounded-xl [&_.rbc-agenda-view]:border [&_.rbc-agenda-view]:border-border/70",
        "[&_.rbc-day-bg+_.rbc-day-bg]:border-border [&_.rbc-header+_.rbc-header]:border-border [&_.rbc-month-row+_.rbc-month-row]:border-border",
        "[&_.rbc-time-content>*+*]:border-border [&_.rbc-timeslot-group]:border-border [&_.rbc-time-header-content]:border-border [&_.rbc-time-header-gutter]:border-border",
        "[&_.rbc-today]:bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)]",
        "[&_.rbc-off-range-bg]:bg-[color-mix(in_oklab,var(--color-muted)_70%,transparent)]",
        "[&_.rbc-event]:rounded-lg [&_.rbc-event]:border-0 [&_.rbc-event]:px-2 [&_.rbc-event]:py-1 [&_.rbc-event]:shadow-none",
        "[&_.calendar-task-event]:border-l-[3px] [&_.calendar-task-event]:border-l-[color-mix(in_oklab,black_30%,transparent)]",
        "[&_.calendar-scheduled-event]:border-l-0",
        "[&_.rbc-event:focus]:outline-none [&_.rbc-event:focus]:ring-2 [&_.rbc-event:focus]:ring-ring [&_.rbc-event:focus]:ring-offset-0",
        "[&_.rbc-current-time-indicator]:bg-destructive",
        "[&_.rbc-agenda-view_table.rbc-agenda-table]:border-border",
        "[&_.rbc-agenda-view_table.rbc-agenda-table_>_tbody>tr>td]:border-border",
        "[&_.rbc-agenda-view_table.rbc-agenda-table_>_tbody>tr>th]:border-border",
      )}
    >
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Schedule overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              {calendarEvents.length}{" "}
              {calendarEvents.length === 1 ? "item" : "items"} loaded, with
              lectures and task deadlines shown together.
            </p>
          </div>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[760px] min-h-[560px]">
          <Calendar
            className="h-full"
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            views={calendarViews}
            popup
            selectable={false}
            components={{ event: EventBlock }}
            eventPropGetter={(event) => {
              const subjectColor =
                event.resource.kind === "task"
                  ? "var(--color-chart-4)"
                  : isValidColor(event.resource.color)
                    ? event.resource.color
                    : "var(--color-chart-2)";

              return {
                className:
                  event.resource.kind === "task"
                    ? "calendar-task-event"
                    : "calendar-scheduled-event",
                style: {
                  backgroundColor: subjectColor,
                  borderColor: subjectColor,
                  color: "white",
                },
              };
            }}
            tooltipAccessor={(event) =>
              [
                event.title,
                event.resource.subjectName,
                event.resource.priority
                  ? `Priority: ${event.resource.priority}`
                  : null,
                event.resource.status ? `Status: ${event.resource.status}` : null,
                event.resource.description,
              ]
                .filter(Boolean)
                .join(" • ")
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
