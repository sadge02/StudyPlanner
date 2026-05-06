"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import { CheckSquare } from "lucide-react";

type Props = {
  initialTasks: Task[];
};

const TodoList = ({ initialTasks }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [input, setInput] = useState("");
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const current = tasks.filter((t) => t.status !== "DONE");
  const completed = tasks.filter((t) => t.status === "DONE");
  const visibleCompleted = showAllCompleted ? completed : completed.slice(0, 2);

  const handleToggle = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" }
          : t,
      ),
    );

    const response = await updateTask(taskId, { status: "DONE" });

    if (response.success) {
      toast.success("Task updated successfully");
    } else {
      toast.error(response.message ?? "Failed to update task");
    }
  };

  const handleAdd = async () => {
    if (!input.trim()) return;

    const optimisticTask: Task = {
      id: crypto.randomUUID(),
      title: input.trim(),
      status: "TODO",
      priority: "MEDIUM",
      description: null,
      deadline: null,
      userId: "",
      projectId: null,
      subjectId: null,
      parentId: null,
    };

    setTasks((prev) => [optimisticTask, ...prev]);
    setInput("");

    const response = await createTask({
      title: input.trim(),
      priority: "MEDIUM",
    });

    if (response.success) {
      toast.success("Task added successfully");
    } else {
      toast.error(response.message ?? "Failed to add task");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Quick add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <CheckSquare
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-10 bg-white py-6"
            placeholder="Add a quick task (e.g. Email advisor about internship)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button className="py-6" onClick={handleAdd}>
          Add Task
        </Button>
      </div>

      {/* Current tasks */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">Current</h2>
          <span className="text-sm text-muted-foreground">
            {current.length}
          </span>
        </div>
        {current.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending tasks.</p>
        )}
        {current.map((task) => (
          <TodoItem key={task.id} task={task} onToggle={handleToggle} />
        ))}
      </div>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg text-muted-foreground">
              Completed
            </h2>
            <span className="text-sm text-muted-foreground">
              {completed.length}
            </span>
          </div>
          {visibleCompleted.map((task) => (
            <TodoItem key={task.id} task={task} onToggle={handleToggle} />
          ))}
          {completed.length > 2 && (
            <button
              className="text-sm text-primary font-medium mt-1"
              onClick={() => setShowAllCompleted((v) => !v)}
            >
              {showAllCompleted
                ? "Hide completed tasks"
                : `View all completed tasks`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

type TodoItemProps = {
  task: Task;
  onToggle: (id: string) => void;
};

// TODO: Add badge, description
const TodoItem = ({ task, onToggle }: TodoItemProps) => {
  const done = task.status === "DONE";
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <Checkbox checked={done} onCheckedChange={() => onToggle(task.id)} />
      <span className={done ? "line-through text-muted-foreground" : ""}>
        {task.title}
      </span>
    </div>
  );
};

export default TodoList;
