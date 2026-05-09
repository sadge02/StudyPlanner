"use client";

import { Task, KanbanColumn as Column } from "@/types";
import KanbanCard from "./KanbanCard";
import { Badge } from "../ui/badge";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import AddTaskButton from "./AddTaskButton";

type KanbanColumnProps = {
  column: Column;
  tasks: Task[];
  allowAdd?: boolean;
  onTaskDelete?: (taskId: string) => void;
  projectId: string;
};

const KanbanColumn = ({
  column,
  tasks,
  allowAdd = false,
  onTaskDelete,
  projectId,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    // w-fit + min-w-84 ensures the column is at least 21rem (KanbanCard w-xs is 20 rem + 1 rem padding)
    <div className="flex flex-col gap-3 w-fit min-w-84">
      <div className="flex items-center gap-2 px-1 justify-center">
        <span className="font-semibold text-md">{column.title}</span>
        <Badge variant="secondary" className="text-xs shadow-sm">
          {tasks.length}
        </Badge>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 min-h-25 h-fit rounded-2xl p-2 bg-muted/90 shadow"
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onDelete={onTaskDelete} />
          ))}
        </div>
      </SortableContext>

      {allowAdd && <AddTaskButton projectId={projectId} />}
    </div>
  );
};

export default KanbanColumn;
