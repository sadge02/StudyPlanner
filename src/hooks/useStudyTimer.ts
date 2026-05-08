"use client";

import { useEffect, useState, useTransition } from "react";
import {
  startStudySession,
  stopStudySession,
} from "@/lib/actions/session.actions";
import type { StudyTimerSession } from "@/types";

function secondsSince(startTime: Date) {
  return Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000));
}

function emitTimerChange(
  session: StudyTimerSession | null,
  options?: { elapsedSeconds?: number; isPaused?: boolean; startTime?: Date },
) {
  window.dispatchEvent(
    new CustomEvent("study-timer-change", {
      detail: session
        ? {
            id: session.id,
            elapsedSeconds: options?.elapsedSeconds,
            isPaused: options?.isPaused,
            startTime: (options?.startTime ?? session.startTime).toISOString(),
          }
        : null,
    }),
  );
}

type StudyTimerControlEvent = CustomEvent<{
  elapsedSeconds: number;
  isPaused: boolean;
}>;

export function useStudyTimer(initialSession: StudyTimerSession | null) {
  const [currentSession, setCurrentSession] =
    useState<StudyTimerSession | null>(initialSession);
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialSession?.startTime ?? null,
  );
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [elapsed, setElapsed] = useState(
    initialSession ? secondsSince(initialSession.startTime) : 0,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!startedAt || isPaused) return;

    const updateElapsed = () => {
      setElapsed(elapsedBeforePause + secondsSince(startedAt));
    };
    updateElapsed();

    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [elapsedBeforePause, isPaused, startedAt]);

  useEffect(() => {
    const handleTimerControl = (event: Event) => {
      if (!currentSession) return;

      const { elapsedSeconds, isPaused: nextPaused } = (
        event as StudyTimerControlEvent
      ).detail;

      if (nextPaused) {
        setElapsed(elapsedSeconds);
        setElapsedBeforePause(elapsedSeconds);
        setStartedAt(null);
        setIsPaused(true);
        return;
      }

      setElapsed(elapsedSeconds);
      setElapsedBeforePause(elapsedSeconds);
      setStartedAt(new Date());
      setIsPaused(false);
    };

    window.addEventListener("study-timer-control", handleTimerControl);
    return () => {
      window.removeEventListener("study-timer-control", handleTimerControl);
    };
  }, [currentSession]);

  const startTimer = (data: { subjectId?: string; taskId?: string }) => {
    setErrorMessage(null);
    startTransition(async () => {
      const response = await startStudySession(data);
      if (!response.success || !response.data) {
        setErrorMessage(response.message ?? "Failed to start timer");
        return;
      }

      setCurrentSession(response.data);
      setStartedAt(response.data.startTime);
      setElapsedBeforePause(0);
      setElapsed(0);
      setIsPaused(false);
      emitTimerChange(response.data);
    });
  };

  const pauseTimer = () => {
    if (!currentSession) return;

    if (isPaused) {
      const resumedAt = new Date();
      setStartedAt(resumedAt);
      setIsPaused(false);
      emitTimerChange(currentSession, {
        elapsedSeconds: elapsedBeforePause,
        isPaused: false,
        startTime: new Date(Date.now() - elapsedBeforePause * 1000),
      });
      return;
    }

    setElapsedBeforePause(elapsed);
    setStartedAt(null);
    setIsPaused(true);
    emitTimerChange(currentSession, {
      elapsedSeconds: elapsed,
      isPaused: true,
    });
  };

  const stopTimer = () => {
    if (!currentSession) return;

    const sessionId = currentSession.id;
    setErrorMessage(null);
    startTransition(async () => {
      const response = await stopStudySession(sessionId);
      if (!response.success) {
        setErrorMessage(response.message ?? "Failed to stop timer");
        return;
      }

      setCurrentSession(null);
      setStartedAt(null);
      setElapsedBeforePause(0);
      setElapsed(0);
      setIsPaused(false);
      emitTimerChange(null);
    });
  };

  return {
    elapsed,
    errorMessage,
    isActive: Boolean(currentSession),
    isLoading: isPending,
    isPaused,
    pauseTimer,
    startTimer,
    stopTimer,
  };
}
