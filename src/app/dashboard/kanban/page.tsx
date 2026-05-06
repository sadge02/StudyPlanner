"use client";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import { mockColumns, mockTasks } from "@/lib/mock-data";

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="pt-4 border-b p-6 mb-4">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-sm text-muted-foreground">
          Drag and drop tasks to update their status
        </p>
      </div>
      <KanbanBoard initialColumns={mockColumns} initialTasks={mockTasks} />
    </div>
  );
}
