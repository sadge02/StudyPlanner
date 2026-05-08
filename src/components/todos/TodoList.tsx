"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createTask, deleteTask, updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import {
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

type Props = {
  initialTasks: Task[];
};

const priorityColor: Record<string, string> = {
  HIGH: "bg-orange-500 text-white hover:bg-orange-500",
  MEDIUM: "bg-secondary text-secondary-foreground hover:bg-secondary",
  LOW: "bg-green-100 text-green-700 hover:bg-green-100",
};

const TodoList = ({ initialTasks }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const current = tasks.filter((t) => t.status !== "DONE");
  const completed = tasks.filter((t) => t.status === "DONE");
  const visibleCompleted = showAllCompleted ? completed : completed.slice(0, 2);

  const handleToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const newStatus = task?.status === "DONE" ? "TODO" : "DONE";

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    const response = await updateTask(taskId, { status: newStatus });
    if (response.success) {
      toast.success("Task updated successfully");
    } else {
      toast.error(response.message ?? "Failed to update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    const response = await deleteTask(taskId);
    if (response.success) {
      toast.success("Task deleted");
    } else {
      toast.error(response.message ?? "Failed to delete task");
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    const optimisticTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description || null,
      status: "TODO",
      priority,
      deadline: deadline ? new Date(deadline) : null,
      userId: "",
      projectId: null,
      subjectId: null,
      parentId: null,
    };

    setTasks((prev) => [optimisticTask, ...prev]);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDeadline("");

    const response = await createTask({
      title: title.trim(),
      priority,
      description: description || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    });

    if (response.success) {
      toast.success("Task added successfully");
    } else {
      toast.error(response.message ?? "Failed to add task");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Quick add card */}
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-muted-foreground shrink-0" />
          <Input
            className="border-none shadow-none p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Textarea
          className="border-none shadow-none p-0 resize-none text-sm focus-visible:ring-0 placeholder:text-muted-foreground min-h-16"
          placeholder="Add a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Deadline:</span>
            <Input
              type="date"
              className="w-40 h-8"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <Button className="ml-auto" onClick={handleAdd}>
            Add Task
          </Button>
        </div>
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
          <TodoItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
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
            <TodoItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {completed.length > 2 && (
            <button
              className="text-sm text-primary font-medium mt-1"
              onClick={() => setShowAllCompleted((v) => !v)}
            >
              {showAllCompleted
                ? "Hide completed tasks"
                : "View all completed tasks"}
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
  onDelete: (id: string) => void;
};

const TodoItem = ({ task, onToggle, onDelete }: TodoItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const done = task.status === "DONE";
  const hasDetails = task.description;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-4">
        <Checkbox checked={done} onCheckedChange={() => onToggle(task.id)} />
        <span
          className={`flex-1 font-medium ${done ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <Badge className={priorityColor[task.priority]}>
            {task.priority}
          </Badge>
          {task.deadline && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar size={14} />
              {new Date(task.deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
          {hasDetails && (
            <button onClick={() => setExpanded((v) => !v)}>
              {expanded ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>
          )}
          <Trash2
            size={15}
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
          />
        </div>
      </div>
      {expanded && hasDetails && (
        <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t">
          <p className="pt-3">{task.description}</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
