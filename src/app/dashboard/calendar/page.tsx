import { CalendarView } from "@/components/calendar/CalendarView";
import { getEvents } from "@/lib/actions/event.actions";

export default async function CalendarPage() {
  const eventsResponse = await getEvents();
  const events = eventsResponse.data ?? [];

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
        errorMessage={
          eventsResponse.success ? undefined : eventsResponse.message
        }
      />
    </div>
  );
}
