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
import { X } from "lucide-react";

type KanbanColumnProps = {
  column: Column;
  tasks: Task[];
  allowAdd?: boolean;
  onDelete?: (columnId: string) => void;
};

const KanbanColumn = ({
  column,
  tasks,
  allowAdd = false,
  onDelete,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    // w-fit + min-w-84 ensures the column is at least 21rem (KanbanCard w-xs is 20 rem + 1 rem padding)
    <div className="flex flex-col gap-3 w-fit min-w-84">
      <div className="flex items-center gap-2 px-1">
        <span className="font-semibold text-sm">{column.title}</span>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
        {onDelete && (
          <X
            size={14}
            className="ml-auto cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(column.id)}
          />
        )}
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 min-h-32 h-fit rounded-lg p-2 bg-muted/90"
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {allowAdd && <AddTaskButton defaultStatus={column.id} />}
    </div>
  );
};

export default KanbanColumn;
