"use client";

import { useState } from "react";
import { Task, KanbanColumn as Column } from "@/types";
import KanbanColumn from "./KanbanColumn";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";
import AddColumnButton from "./AddColumnButton";

type Props = {
  initialColumns: Column[];
  initialTasks: Task[];
};

const KanbanBoard = ({ initialColumns, initialTasks }: Props) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const {
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getTasksForColumn,
  } = useKanbanDnd(initialTasks, columns);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleAddColumn = (name: string) => {
    const newColumn = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      title: name,
    };
    setColumns((prev) => [...prev, newColumn]);
    // TODO: await createStatus(name);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    // TODO: await deleteStatus(columnId);
  };

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
      <div className="flex flex-row gap-4 p-4 overflow-x-auto items-start">
        {columns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksForColumn(column.id)}
            allowAdd={index === 0}
            onDelete={handleDeleteColumn}
          />
        ))}
        <AddColumnButton onAdd={handleAddColumn} />
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
