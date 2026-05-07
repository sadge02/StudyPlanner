import { CalendarView } from "@/components/calendar/CalendarView";
import { getEvents } from "@/lib/actions/event.actions";
import { getCalendarTasks } from "@/lib/actions/task.actions";

export default async function CalendarPage() {
  const eventsResponse = await getEvents();
  const tasksResponse = await getCalendarTasks();
  const events = eventsResponse.data ?? [];
  const taskDeadlines = tasksResponse.data ?? [];
  const errorMessage = [eventsResponse, tasksResponse]
    .filter((response) => !response.success && response.message)
    .map((response) => response.message)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Calendar
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Your scheduled lectures, exams, study blocks, and deadlines in one
          place.
        </p>
      </div>

      <CalendarView
        events={events}
        taskDeadlines={taskDeadlines}
        errorMessage={errorMessage || undefined}
      />
    </div>
  );
}
