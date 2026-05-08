"use client";

import { Pause, Play, Square } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import type { StudyTimerSession, StudyTimerTaskOption, Subject } from "@/types";

type StudyTimerProps = {
  activeSession: StudyTimerSession | null;
  subjects: Subject[];
  tasks: StudyTimerTaskOption[];
};

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function StudyTimer({ activeSession, subjects, tasks }: StudyTimerProps) {
  const [subjectId, setSubjectId] = useState(
    activeSession?.subjectId ?? "none",
  );
  const [taskId, setTaskId] = useState(activeSession?.taskId ?? "none");
  const {
    elapsed,
    errorMessage,
    isActive,
    isLoading,
    isPaused,
    pauseTimer,
    startTimer,
    stopTimer,
  } = useStudyTimer(activeSession);

  const handleStart = () => {
    startTimer({
      subjectId: subjectId === "none" ? undefined : subjectId,
      taskId: taskId === "none" ? undefined : taskId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Timer</CardTitle>
        <CardDescription>Track focused study sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-5 text-center">
          <div className="font-mono text-4xl font-semibold tabular-nums">
            {formatElapsed(elapsed)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {isActive ? (isPaused ? "Paused" : "Running") : "Ready"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={subjectId}
            onValueChange={setSubjectId}
            disabled={isActive || isLoading}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Subject" />
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

          <Select
            value={taskId}
            onValueChange={setTaskId}
            disabled={isActive || isLoading}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No task</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleStart} disabled={isActive || isLoading}>
            <Play />
            Start
          </Button>
          <Button
            variant="outline"
            onClick={pauseTimer}
            disabled={!isActive || isLoading}
          >
            <Pause />
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="destructive"
            onClick={stopTimer}
            disabled={!isActive || isLoading}
          >
            <Square />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
