"use client";

import { useMemo, useState, useTransition } from "react";
import { createEvent } from "@/lib/actions/event.actions";
import { createEventSchema } from "@/schemas";
import type { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RecurrencePreset = "none" | "daily" | "weekly" | "monthly" | "custom";

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildRecurrenceRule(preset: RecurrencePreset, startTime: string) {
  if (preset === "none") return null;
  if (preset === "daily") return "FREQ=DAILY";

  const startDate = new Date(startTime);
  const dayKeys = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  if (preset === "weekly") {
    return `FREQ=WEEKLY;BYDAY=${dayKeys[startDate.getDay()]}`;
  }

  if (preset === "monthly") {
    return `FREQ=MONTHLY;BYMONTHDAY=${startDate.getDate()}`;
  }

  return null;
}

export function EventForm({
  subjects,
  initialStart,
  initialEnd,
  onSuccess,
  onCancel,
}: {
  subjects: Subject[];
  initialStart: Date;
  initialEnd: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(formatDateTimeLocal(initialStart));
  const [endTime, setEndTime] = useState(formatDateTimeLocal(initialEnd));
  const [subjectId, setSubjectId] = useState<string>("none");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePreset, setRecurrencePreset] =
    useState<RecurrencePreset>("none");
  const [customRule, setCustomRule] = useState("");

  const resolvedRule = useMemo(() => {
    if (!isRecurring) return null;
    if (recurrencePreset === "custom") {
      return customRule.trim() || null;
    }
    return buildRecurrenceRule(recurrencePreset, startTime);
  }, [customRule, isRecurring, recurrencePreset, startTime]);

  const handleSubmit = () => {
    setErrorMessage(null);

    const payload = {
      title,
      description,
      startTime,
      endTime,
      isRecurring,
      recurrenceRule: resolvedRule,
      subjectId: subjectId === "none" ? null : subjectId,
    };

    const validation = createEventSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message ?? "Invalid event data");
      return;
    }

    startTransition(async () => {
      const response = await createEvent({
        ...payload,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        subjectId: subjectId === "none" ? undefined : subjectId,
      });
      if (!response.success) {
        setErrorMessage(response.message ?? "Failed to create event");
        return;
      }

      setTitle("");
      setDescription("");
      setIsRecurring(false);
      setRecurrencePreset("none");
      setCustomRule("");
      setSubjectId("none");
      onSuccess?.();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-title">Title</Label>
          <Input
            id="event-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Lecture, exam, office hours..."
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Room, meeting link, agenda, or prep notes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-start">Start</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-end">End</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No subject</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="event-recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => {
              const nextValue = checked === true;
              setIsRecurring(nextValue);
              if (!nextValue) {
                setRecurrencePreset("none");
                setCustomRule("");
              } else if (recurrencePreset === "none") {
                setRecurrencePreset("weekly");
              }
            }}
          />
          <div className="space-y-1">
            <Label htmlFor="event-recurring">Recurring event</Label>
            <p className="text-sm text-muted-foreground">
              Repeat this class or meeting using an RRULE-backed schedule.
            </p>
          </div>
        </div>

        {isRecurring ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label>Repeat pattern</Label>
              <Select
                value={recurrencePreset}
                onValueChange={(value) =>
                  setRecurrencePreset(value as RecurrencePreset)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom RRULE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrencePreset === "custom" ? (
              <div className="space-y-2">
                <Label htmlFor="event-rrule">RRULE</Label>
                <Input
                  id="event-rrule"
                  value={customRule}
                  onChange={(event) => setCustomRule(event.target.value)}
                  placeholder="FREQ=WEEKLY;BYDAY=MO,WE"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                {resolvedRule ?? "Choose a recurrence preset."}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Creating..." : "Create event"}
        </Button>
      </div>
    </div>
  );
}
