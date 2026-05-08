"use client";

import { Task } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, Check, X, List } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { updateTask, createTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type Props = {
  tasks: Task[];
};

const GeneralTodosWidget = ({ tasks: initialTasks }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();
  const visible = tasks.slice(0, 4);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );
    const response = await updateTask(task.id, { status: newStatus });
    if (!response.success)
      toast.error(response.message ?? "Failed to update task");
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;

    const optimistic: Task = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      status: "TODO",
      priority: "MEDIUM",
      description: null,
      deadline: null,
      userId: "",
      projectId: null,
      subjectId: null,
      parentId: null,
    };

    setTasks((prev) => [...prev, optimistic]);
    setNewTitle("");
    setAdding(false);

    const response = await createTask({
      title: optimistic.title,
      priority: "MEDIUM",
    });
    if (!response.success)
      toast.error(response.message ?? "Failed to create task");
  };

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-4 shadow">
      <div className="flex items-center justify-between">
        <div className="font-semibold flex gap-2 items-center">
          <List size={20} className="text-blue-600" />
          General TODOs
        </div>
        <Button
          type="button"
          variant="outline"
          className="shadow-sm"
          onClick={() => {
            setAdding(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <Plus size={16} className="hover:text-foreground text-blue-600" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {visible.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No todos yet.</p>
        )}
        {adding && (
          <div className="flex items-center gap-2">
            <Checkbox disabled />
            <Input
              ref={inputRef}
              className="h-7 text-sm"
              placeholder="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
            />
            <Button size="sm" className="h-7 w-7 p-0" onClick={handleAdd}>
              <Check size={12} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => {
                setAdding(false);
                setNewTitle("");
              }}
            >
              <X size={12} />
            </Button>
          </div>
        )}

        {visible.map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={task.status === "DONE"}
              onCheckedChange={() => handleToggle(task)}
            />
            <span className="truncate text-muted-foreground">{task.title}</span>
          </div>
        ))}
      </div>

      {tasks.length > 4 && (
        <Button
          type="button"
          variant="outline"
          className="text-xs w-full text-primary hover:text-primary shadow-sm"
          onClick={() => router.push("/dashboard/todos")}
        >
          View all ({tasks.length})
        </Button>
      )}
    </div>
  );
};

export default GeneralTodosWidget;
