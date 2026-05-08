"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const priorityColor: Record<string, string> = {
  HIGH: "bg-orange-500 text-white hover:bg-orange-500",
  MEDIUM: "bg-secondary text-secondary-foreground",
  LOW: "bg-green-100 text-green-700",
};

type Props = {
  initialTasks: Task[];
};

const TodaysBoard = ({ initialTasks }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const router = useRouter();

  const handleToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const newStatus = task?.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    const response = await updateTask(taskId, { status: newStatus });
    if (!response.success)
      toast.error(response.message ?? "Failed to update task");
  };

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Today&apos;s Board</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        <button
          className="text-sm text-primary font-medium"
          onClick={() => router.push("/dashboard/kanban")}
        >
          View Calendar
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks due today.</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-background"
          >
            <Checkbox
              checked={task.status === "DONE"}
              onCheckedChange={() => handleToggle(task.id)}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={`text-sm font-medium truncate ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title}
              </span>
              {task.subjectId && (
                <span className="text-xs text-muted-foreground truncate">
                  {task.subjectId}
                </span>
              )}
            </div>
            <Badge className={priorityColor[task.priority]}>
              {task.priority}
            </Badge>
          </div>
        ))}
      </div>

      <button
        className="text-sm text-primary font-medium text-center mt-1"
        onClick={() => router.push("/dashboard/todos")}
      >
        + Add Task
      </button>
    </div>
  );
};

export default TodaysBoard;
