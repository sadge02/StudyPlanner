"use client";

import { Task, KanbanColumn as Column } from "@/types";
import KanbanCard from "./KanbanCard";
import { Badge } from "../ui/badge";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import CreateTaskDialog from "./CreateTaskDialog";
import { useState } from "react";

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
  const [dialogOpen, setDialogOpen] = useState(false);

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

      {allowAdd && (
        <>
          <Button
            variant="outline"
            className="w-full mt-1 border-dashed text-muted-foreground"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={16} />
            Add task
          </Button>

          <CreateTaskDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            defaultStatus={column.id}
          />
        </>
      )}
    </div>
  );
};

export default KanbanColumn;
