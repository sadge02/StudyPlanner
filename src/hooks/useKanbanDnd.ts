import { useState } from "react";
import { Task, KanbanColumn as Column } from "@/types";
import { DragStartEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useKanbanDnd(initialTasks: Task[], columns: Column[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    if (taskId === overId) return;

    const activeTask = tasks.find((t) => t.id === taskId);
    const overTask = tasks.find((t) => t.id === overId);
    if (!activeTask) return;

    const overColumnId = columns.find((col) => col.id === overId)
      ? overId
      : overTask?.status;
    if (!overColumnId) return;

    setTasks((prev) => {
      const activeTasks = prev.filter((t) => t.status === activeTask.status);
      const overTasks = prev.filter((t) => t.status === overColumnId);
      const oldIndex = activeTasks.findIndex((t) => t.id === taskId);
      const isBelowLastItem =
        overTask &&
        overTasks.findIndex((t) => t.id === overId) === overTasks.length - 1;

      const newIndex = overTask
        ? isBelowLastItem
          ? overTasks.length
          : overTasks.findIndex((t) => t.id === overId)
        : overTasks.length;

      if (activeTask.status === overColumnId) {
        const reordered = arrayMove(activeTasks, oldIndex, newIndex);
        return [...prev.filter((t) => t.status !== overColumnId), ...reordered];
      } else {
        const updated = { ...activeTask, status: overColumnId };
        const newOverTasks = [...overTasks];
        newOverTasks.splice(newIndex, 0, updated);
        return [
          ...prev.filter(
            (t) => t.status !== activeTask.status && t.status !== overColumnId,
          ),
          ...activeTasks.filter((t) => t.id !== taskId),
          ...newOverTasks,
        ];
      }
    });
  };

  const handleDragEnd = () => {
    setActiveTask(null);

    // TODO: Uncomment when seeding is ready:
    // const { active, over } = event;
    // if (!over) return;
    // const taskId = active.id as string;
    // const task = tasks.find((t) => t.id === taskId);
    // if (task) updateTask(taskId, { status: task.status });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    // TODO: await deleteTask(taskId);
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter(
      (task) => task.status.toLowerCase() === columnId.toLowerCase(),
    );

  return {
    tasks,
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getTasksForColumn,
    handleDeleteTask,
  };
}
