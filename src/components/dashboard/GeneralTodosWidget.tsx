"use client";

import { Task } from "@/types";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type Props = {
  tasks: Task[];
};

const GeneralTodosWidget = ({ tasks }: Props) => {
  const router = useRouter();
  const visible = tasks.slice(0, 4);

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">General TODOs</span>
        <button onClick={() => router.push("/dashboard/todos")}>
          <Plus
            size={16}
            className="text-muted-foreground hover:text-foreground"
          />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No todos yet.</p>
        )}
        {visible.map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
            <span className="truncate text-muted-foreground">{task.title}</span>
          </div>
        ))}
      </div>
      {tasks.length > 4 && (
        <button
          className="text-xs text-primary font-medium"
          onClick={() => router.push("/dashboard/todos")}
        >
          View all ({tasks.length})
        </button>
      )}
    </div>
  );
};

export default GeneralTodosWidget;
