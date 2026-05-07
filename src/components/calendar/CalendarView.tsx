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
import type { EventWithSubject } from "@/types";

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

type CalendarBlock = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    description: string | null;
    subjectName: string | null;
    color: string | null;
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
  errorMessage,
}: {
  events: CalendarEventInput[];
  errorMessage?: string;
}) {
  const calendarEvents: CalendarBlock[] = events.map((event) => {
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
        description: event.description,
        subjectName: event.subject?.name ?? null,
        color: event.subject?.color ?? null,
      },
    };
  });

  return (
    <Card className="calendar-shell border border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Schedule overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              {calendarEvents.length} {calendarEvents.length === 1 ? "event" : "events"} loaded from your planner.
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
              const subjectColor = isValidColor(event.resource.color)
                ? event.resource.color
                : "var(--color-chart-2)";

              return {
                style: {
                  backgroundColor: subjectColor,
                  borderColor: subjectColor,
                  color: "white",
                },
              };
            }}
            tooltipAccessor={(event) =>
              event.resource.description || event.resource.subjectName || event.title
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
