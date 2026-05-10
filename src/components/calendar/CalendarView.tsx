"use client";

import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type EventProps,
  type SlotInfo,
  type ToolbarProps,
  type View,
} from "react-big-calendar";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isWithinInterval,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RRule, rrulestr } from "rrule";
import { EventForm } from "@/components/events/EventForm";
import { deleteEvent } from "@/lib/actions/event.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { EventWithSubject, Subject, TaskWithSubject } from "@/types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

const calendarViews = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];
const viewLabels: Record<View, string> = {
  month: "Month",
  week: "7 Days",
  work_week: "Work week",
  day: "Day",
  agenda: "List",
};

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
    sourceId: string;
    description: string | null;
    subjectName: string | null;
    color: string | null;
    priority?: string;
    status?: string;
    recurrenceRule?: string | null;
    isRecurring?: boolean;
  };
};

type CalendarRange = {
  start: Date;
  end: Date;
};

function isCalendarBlock(
  value: CalendarBlock | null,
): value is CalendarBlock {
  return value !== null;
}

function isValidColor(value: string | null | undefined): value is string {
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

function getRangeForView(date: Date, view: View): CalendarRange {
  if (view === Views.WEEK) {
    return {
      start: startOfWeek(date),
      end: endOfWeek(date),
    };
  }

  if (view === Views.DAY) {
    return {
      start: startOfDay(date),
      end: endOfDay(date),
    };
  }

  if (view === Views.AGENDA) {
    return {
      start: startOfDay(date),
      end: endOfDay(addDays(date, 13)),
    };
  }

  return {
    start: startOfWeek(startOfMonth(date)),
    end: endOfWeek(endOfMonth(date)),
  };
}

function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
}: ToolbarProps<CalendarBlock, object>) {
  const views: View[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          Next
        </Button>
        <div className="ml-2 text-lg font-semibold tracking-tight">{label}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {views.map((nextView) => (
          <Button
            key={nextView}
            variant={view === nextView ? "default" : "outline"}
            size="sm"
            onClick={() => onView(nextView)}
          >
            {viewLabels[nextView]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function normalizeRange(range: Date[] | { start: Date; end: Date } | Date): CalendarRange {
  if (Array.isArray(range)) {
    const dates = [...range].sort((a, b) => a.getTime() - b.getTime());
    return { start: dates[0], end: dates[dates.length - 1] };
  }

  if (range instanceof Date) {
    return { start: range, end: range };
  }

  return range;
}

function expandRecurringEvent(
  event: CalendarEventInput,
  range: CalendarRange,
): CalendarBlock[] {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const duration = end.getTime() - start.getTime();

  if (!event.isRecurring || !event.recurrenceRule) {
    const overlaps =
      start <= range.end &&
      end >= range.start;

    return overlaps
      ? [
          {
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
              kind: "event",
              sourceId: event.id,
              description: event.description,
              subjectName: event.subject?.name ?? null,
              color: event.subject?.color ?? null,
              recurrenceRule: event.recurrenceRule,
              isRecurring: false,
            },
          },
        ]
      : [];
  }

  try {
    const rule = rrulestr(event.recurrenceRule, {
      dtstart: start,
    }) as RRule;

    return rule.between(range.start, range.end, true).map((occurrence, index) => {
      const occurrenceEnd = new Date(occurrence.getTime() + duration);

      return {
        id: `${event.id}-${index}-${occurrence.toISOString()}`,
        title: event.title,
        start: occurrence,
        end: occurrenceEnd,
        allDay:
          occurrence.getHours() === 0 &&
          occurrence.getMinutes() === 0 &&
          occurrenceEnd.getHours() === 0 &&
          occurrenceEnd.getMinutes() === 0,
        resource: {
          kind: "event",
          sourceId: event.id,
          description: event.description,
          subjectName: event.subject?.name ?? null,
          color: event.subject?.color ?? null,
          recurrenceRule: event.recurrenceRule,
          isRecurring: true,
        },
      };
    });
  } catch {
    return [];
  }
}

export function CalendarView({
  events,
  taskDeadlines,
  subjects,
  errorMessage,
}: {
  events: CalendarEventInput[];
  taskDeadlines: CalendarTaskInput[];
  subjects: Subject[];
  errorMessage?: string;
}) {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarRange | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarBlock | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [visibleRange, setVisibleRange] = useState<CalendarRange>(() =>
    getRangeForView(new Date(), Views.MONTH),
  );

  const calendarEvents: CalendarBlock[] = useMemo(() => {
    const deadlineBlocks: CalendarBlock[] = taskDeadlines
      .filter((task) => task.deadline)
      .map<CalendarBlock | null>((task) => {
        const dueAt = new Date(task.deadline as Date | string);
        const end = new Date(dueAt.getTime() + 30 * 60 * 1000);

        if (
          !isWithinInterval(dueAt, {
            start: visibleRange.start,
            end: visibleRange.end,
          })
        ) {
          return null;
        }

        return {
          id: `task-${task.id}`,
          title: `Due: ${task.title}`,
          start: dueAt,
          end,
          allDay: false,
          resource: {
            kind: "task" as const,
            sourceId: task.id,
            description: task.description,
            subjectName: task.subject?.name ?? null,
            color: task.subject?.color ?? null,
            priority: task.priority,
            status: task.status,
          },
        };
      })
      .filter(isCalendarBlock);

    return [
      ...events.flatMap((event) => expandRecurringEvent(event, visibleRange)),
      ...deadlineBlocks,
    ].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, taskDeadlines, visibleRange]);

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot({
      start: slot.start,
      end: slot.end,
    });
    setCreateModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarBlock) => {
    setSelectedEvent(event);
    setDetailsModalOpen(true);
  };

  return (
    <>
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
        "[&_.rbc-today]:bg-[color-mix(in_oklab,var(--color-primary)_8%,transparent)] dark:[&_.rbc-today]:bg-[color-mix(in_oklab,var(--color-primary)_16%,var(--color-card))]",
        "[&_.rbc-off-range-bg]:bg-transparent",
        "[&_.rbc-off-range]:text-muted-foreground/55 dark:[&_.rbc-off-range]:text-muted-foreground/60",
        "[&_.rbc-date-cell]:pr-2 [&_.rbc-date-cell]:pt-1",
        "[&_.rbc-off-range_.rbc-button-link]:text-muted-foreground/55 dark:[&_.rbc-off-range_.rbc-button-link]:text-muted-foreground/60",
        "[&_.rbc-date-cell_.rbc-button-link]:font-normal",
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
      <CardContent className="pt-2">
        {errorMessage ? (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}
        <div className="h-[760px] min-h-[560px]">
          <Calendar
            className="h-full"
            localizer={localizer}
            events={calendarEvents}
            date={currentDate}
            view={currentView}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            views={calendarViews}
            length={14}
            popup
            selectable
            messages={{ week: "7 Days", day: "Day", agenda: "List" }}
            components={{ event: EventBlock, toolbar: CalendarToolbar }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onNavigate={(date) => {
              setCurrentDate(date);
              setVisibleRange(getRangeForView(date, currentView));
            }}
            onView={(view) => {
              setCurrentView(view);
              setVisibleRange(getRangeForView(currentDate, view));
            }}
            onRangeChange={(range) => setVisibleRange(normalizeRange(range))}
            eventPropGetter={(event) => {
              const subjectColor: string =
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

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create event</DialogTitle>
            <DialogDescription>
              Picked directly from the calendar, so the time window is already filled in.
            </DialogDescription>
          </DialogHeader>
          {selectedSlot ? (
            <EventForm
              key={`${selectedSlot.start.toISOString()}-${selectedSlot.end.toISOString()}`}
              subjects={subjects}
              initialStart={selectedSlot.start}
              initialEnd={selectedSlot.end}
              onCancel={() => setCreateModalOpen(false)}
              onSuccess={() => {
                setCreateModalOpen(false);
                router.refresh();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailsModalOpen}
        onOpenChange={(open) => {
          setDetailsModalOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.resource.kind === "task"
                ? "Task deadline details"
                : "Scheduled event details"}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent ? (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Starts
                  </p>
                  <p className="mt-1 text-sm">
                    {format(selectedEvent.start, "PPP p")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Ends
                  </p>
                  <p className="mt-1 text-sm">
                    {format(selectedEvent.end, "PPP p")}
                  </p>
                </div>
                {selectedEvent.resource.subjectName ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Subject
                    </p>
                    <p className="mt-1 text-sm">{selectedEvent.resource.subjectName}</p>
                  </div>
                ) : null}
                {selectedEvent.resource.priority ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Priority
                    </p>
                    <p className="mt-1 text-sm">{selectedEvent.resource.priority}</p>
                  </div>
                ) : null}
                {selectedEvent.resource.status ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 text-sm">{selectedEvent.resource.status}</p>
                  </div>
                ) : null}
                {selectedEvent.resource.isRecurring &&
                selectedEvent.resource.recurrenceRule ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Recurrence
                    </p>
                    <p className="mt-1 break-all text-sm">
                      {selectedEvent.resource.recurrenceRule}
                    </p>
                  </div>
                ) : null}
              </div>

              {selectedEvent.resource.description ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground/90">
                    {selectedEvent.resource.description}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}

          <DialogFooter showCloseButton>
            {selectedEvent?.resource.kind === "event" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedSlot({
                      start: selectedEvent.start,
                      end: selectedEvent.end,
                    });
                    setCreateModalOpen(true);
                  }}
                >
                  Duplicate as new event
                </Button>
                <Button
                  variant="destructive"
                  disabled={isDeletePending}
                  onClick={() => {
                    setDeleteError(null);
                    startDeleteTransition(async () => {
                      const response = await deleteEvent(
                        selectedEvent.resource.sourceId,
                      );
                      if (!response.success) {
                        setDeleteError(
                          response.message ?? "Failed to delete event",
                        );
                        return;
                      }
                      setDetailsModalOpen(false);
                      setSelectedEvent(null);
                      router.refresh();
                    });
                  }}
                >
                  {isDeletePending ? "Deleting..." : "Delete"}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
