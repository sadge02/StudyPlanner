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

export function useStudyTimer() {
  const [currentSession, setCurrentSession] =
    useState<StudyTimerSession | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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

  const startTimer = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const response = await startStudySession();
      if (!response.success || !response.data) {
        setErrorMessage(response.message ?? "Failed to start timer");
        return;
      }

      setCurrentSession(response.data);
      setStartedAt(response.data.startTime);
      setElapsedBeforePause(0);
      setElapsed(0);
      setIsPaused(false);
    });
  };

  const pauseTimer = () => {
    if (!currentSession) return;

    if (isPaused) {
      setStartedAt(new Date());
      setIsPaused(false);
      return;
    }

    setElapsedBeforePause(elapsed);
    setStartedAt(null);
    setIsPaused(true);
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
