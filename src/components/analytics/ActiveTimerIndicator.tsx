"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export type ActiveTimerSnapshot = {
  id: string;
  startTime: string;
};

type StudyTimerEventDetail = ActiveTimerSnapshot | null;

type StudyTimerEvent = CustomEvent<StudyTimerEventDetail>;

type ActiveTimerIndicatorProps = {
  initialSession: ActiveTimerSnapshot | null;
};

function formatElapsed(startTime: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(startTime).getTime()) / 1000),
  );
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function ActiveTimerIndicator({
  initialSession,
}: ActiveTimerIndicatorProps) {
  const [activeSession, setActiveSession] = useState(initialSession);
  const [elapsed, setElapsed] = useState(
    initialSession ? formatElapsed(initialSession.startTime) : "00:00:00",
  );

  useEffect(() => {
    const handleTimerChange = (event: Event) => {
      const nextSession = (event as StudyTimerEvent).detail;
      setActiveSession(nextSession);
      setElapsed(nextSession ? formatElapsed(nextSession.startTime) : "00:00:00");
    };

    window.addEventListener("study-timer-change", handleTimerChange);
    return () => {
      window.removeEventListener("study-timer-change", handleTimerChange);
    };
  }, []);

  useEffect(() => {
    if (!activeSession) return;

    const updateElapsed = () => {
      setElapsed(formatElapsed(activeSession.startTime));
    };
    updateElapsed();

    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  return (
    <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 sm:flex">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <Clock className="size-3.5" aria-hidden />
      <span className="font-mono tabular-nums">{elapsed}</span>
    </div>
  );
}
