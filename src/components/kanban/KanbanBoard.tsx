"use client";

import { useState } from "react";
import type { Task, KanbanColumn as Column } from "@/types";
import KanbanColumn from "./KanbanColumn";

type KanbanBoardProps = {
  initialColumns: Column[];
  initialTasks: Task[];
};

const KanbanBoard = ({ initialColumns, initialTasks }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns] = useState<Column[]>(initialColumns);

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((task) => task.status === columnId);

  return (
    <div className="flex flex-row gap-4 p-4 overflow-x-auto">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={getTasksForColumn(column.id)}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
