"use client";

import { Task, KanbanColumn as Column } from "@/types";
import KanbanCard from "./KanbanCard";
import { Badge } from "../ui/badge";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

type KanbanColumnProps = {
  column: Column;
  tasks: Task[];
};

const KanbanColumn = ({ column, tasks }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    // w-fit + min-w-84 ensures the column is at least 21rem (KanbanCard w-xs is 20 rem + 1 rem padding)
    <div className="flex flex-col gap-3 w-fit min-w-84">
      <div className="flex items-center gap-2 px-1">
        <span className="font-semibold text-sm">{column.title}</span>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 min-h-128 rounded-lg p-2 bg-muted/50"
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
