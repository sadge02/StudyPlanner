"use client";

import { Task, KanbanColumn as Column } from "@/types";
import KanbanColumn from "./KanbanColumn";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
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
  { id: "TODO", title: "TODO" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
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
      <div className="flex gap-4 overflow-x-auto items-start flex-1 min-h-0 pb-4">
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
