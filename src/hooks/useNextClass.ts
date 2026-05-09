"use client";

import { useEffect, useState } from "react";
import { EventWithSubject } from "@/types";
import { getNextEvent } from "@/lib/actions/event.actions";

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Starting now";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useNextClass() {
  const [event, setEvent] = useState<EventWithSubject | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      console.log("fetching next event");
      const response = await getNextEvent();
      console.log("next event response", response);
      setEvent(response.data ?? null);
    };
    fetchEvent();
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
