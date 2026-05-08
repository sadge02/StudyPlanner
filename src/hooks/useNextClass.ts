"use client";

import { useEffect, useState } from "react";
import { EventWithSubject } from "@/types";

// Mock event — replace with: const response = await getNextEvent()
const mockNextEvent: EventWithSubject = {
  id: "event-1",
  title: "Data Structures",
  description: "Lecture with Prof. Aris • Room 302",
  startTime: new Date(new Date().setHours(new Date().getHours() + 1, 30, 0, 0)),
  endTime: new Date(new Date().setHours(new Date().getHours() + 3, 0, 0, 0)),
  isRecurring: true,
  recurrenceRule: null,
  userId: "mock-user-1",
  subjectId: "subject-1",
  subject: {
    id: "subject-1",
    name: "Data Structures",
    credits: 4,
    color: "#3b82f6",
    userId: "mock-user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Starting now";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useNextClass() {
  const [event, setEvent] = useState<EventWithSubject | null>(mockNextEvent);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    // TODO: fetch real event
    // const response = await getNextEvent();
    // setEvent(response.data ?? null);
  }, []);

  useEffect(() => {
    if (!event) return;

    const tick = () => {
      const now = new Date();
      const diff = new Date(event.startTime).getTime() - now.getTime();
      setTimeRemaining(formatTimeRemaining(diff));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [event]);

  return { event, timeRemaining };
}
