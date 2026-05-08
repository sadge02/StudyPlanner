"use client";

import { Clock, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ActiveTimerSnapshot = {
  id: string;
  elapsedSeconds?: number;
  isPaused?: boolean;
  startTime: string;
};

type StudyTimerEventDetail = ActiveTimerSnapshot | null;

type StudyTimerEvent = CustomEvent<StudyTimerEventDetail>;

type ActiveTimerIndicatorProps = {
  initialSession: ActiveTimerSnapshot | null;
};

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function getElapsedSeconds(session: ActiveTimerSnapshot) {
  if (session.isPaused) return session.elapsedSeconds ?? 0;

  return Math.max(
    0,
    Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000),
  );
}

export function ActiveTimerIndicator({
  initialSession,
}: ActiveTimerIndicatorProps) {
  const [activeSession, setActiveSession] = useState(initialSession);
  const [elapsed, setElapsed] = useState(
    initialSession ? formatElapsed(getElapsedSeconds(initialSession)) : "00:00:00",
  );

  useEffect(() => {
    const handleTimerChange = (event: Event) => {
      const nextSession = (event as StudyTimerEvent).detail;
      setActiveSession(nextSession);
      setElapsed(
        nextSession ? formatElapsed(getElapsedSeconds(nextSession)) : "00:00:00",
      );
    };

    window.addEventListener("study-timer-change", handleTimerChange);
    return () => {
      window.removeEventListener("study-timer-change", handleTimerChange);
    };
  }, []);

  useEffect(() => {
    if (!activeSession || activeSession.isPaused) return;

    const updateElapsed = () => {
      setElapsed(formatElapsed(getElapsedSeconds(activeSession)));
    };
    updateElapsed();

    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:flex",
        activeSession.isPaused
          ? "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      )}
    >
      {activeSession.isPaused ? (
        <span className="flex size-4 items-center justify-center rounded-full bg-orange-500/20">
          <Pause className="size-3 fill-orange-500 text-orange-500" aria-hidden />
        </span>
      ) : (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
      )}
      <Clock className="size-3.5" aria-hidden />
      <span className="font-mono tabular-nums">{elapsed}</span>
    </div>
  );
}
