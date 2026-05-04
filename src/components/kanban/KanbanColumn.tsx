"use client";

import type { Task, KanbanColumn } from "@/types";
import KanbanCard from "./KanbanCard";
import { Badge } from "../ui/badge";

type KanbanColumnProps = {
  column: KanbanColumn;
  tasks: Task[];
};

const KanbanColumn = ({ column, tasks }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col gap-2 w-fit">
      <div className="flex items-center gap-2 px-1">
        <span className="font-semibold ml-2">{column.title}</span>
        <Badge variant="secondary" className="text-">
          {tasks.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 min-h-24 rounded-lg p-2 bg-muted">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
