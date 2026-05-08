"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

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
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-4 shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-semibold flex gap-2 items-center">
            <ClipboardCheck size={20} className="text-blue-600" />
            Today&apos;s Board
          </div>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          className="text-primary hover:text-primary text-xs shadow-sm"
          onClick={() => router.push("/dashboard/kanban")}
        >
          View Calendar
        </Button>
      </div>

      <Separator />

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

      <Button
        type="button"
        variant="outline"
        className="w-fit self-center px-4 text-xs shadow-sm"
        onClick={() => router.push("/dashboard/todos")}
      >
        <Plus className="text-blue-600" /> Add Task
      </Button>
    </div>
  );
};

export default TodaysBoard;
