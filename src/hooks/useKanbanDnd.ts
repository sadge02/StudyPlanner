import { useState, useEffect } from "react";
import { Task, KanbanColumn as Column, TaskStatus } from "@/types";
import { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { deleteTask, updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";

export function useKanbanDnd(initialTasks: Task[], columns: Column[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync internal task state when the project changes.
  // useKanbanDnd owns task state for optimistic DnD updates, but when the
  // parent switches projects it passes a new initialTasks array — we reset
  // here to avoid showing stale tasks from the previous project.
  // This won't cause an infinite loop because initialTasks only changes
  // when the user selects a different project in TasksPageOverview.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(initialTasks);
  }, [initialTasks]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      const response = await updateTask(taskId, { status: task.status as TaskStatus });

      if (response.success) {
        toast.success("Task status updated");
      } else {
        toast.error("Failed to update task");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const response = await deleteTask(taskId);

    if (response.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } else {
      toast.error("Failed to delete task");
    }
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
