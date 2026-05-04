"use client";

import { useState } from "react";
import { Task, KanbanColumn as Column } from "@/types";
import KanbanColumn from "./KanbanColumn";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import { arrayMove } from "@dnd-kit/sortable";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";

type Props = {
  initialColumns: Column[];
  initialTasks: Task[];
};

const KanbanBoard = ({ initialColumns, initialTasks }: Props) => {
  const [columns] = useState<Column[]>(initialColumns);
  const {
    tasks,
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getTasksForColumn,
  } = useKanbanDnd(initialTasks, columns);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <DndContext
      id="kanban-dnd"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      collisionDetection={closestCorners}
      accessibility={{
        announcements: {
          onDragStart: () => "",
          onDragOver: () => "",
          onDragEnd: () => "",
          onDragCancel: () => "",
        },
      }}
    >
      <div className="flex flex-row gap-4 p-4 overflow-x-auto">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksForColumn(column.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
