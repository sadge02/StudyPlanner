"use client";

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

type Props = {
  initialTasks: Task[];
  projectId: string;
};

export const initialColumns: Column[] = [
  { id: "todo", title: "TODO" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const KanbanBoard = ({ initialTasks, projectId }: Props) => {
  const {
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDeleteTask,
    getTasksForColumn,
  } = useKanbanDnd(initialTasks, initialColumns);

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
      <div className="flex flex-row gap-4 overflow-x-auto items-start">
        {initialColumns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksForColumn(column.id)}
            allowAdd={index === 0}
            onTaskDelete={handleDeleteTask}
            projectId={projectId}
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
