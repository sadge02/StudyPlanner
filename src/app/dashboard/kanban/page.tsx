import KanbanBoard from "@/components/kanban/KanbanBoard";
import { getProjectTasks } from "@/lib/actions/task.actions";
import { KanbanColumn } from "@/types";

export const initialColumns: KanbanColumn[] = [
  { id: "todo", title: "TODO" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default async function KanbanPage() {
  const projectId = "cmoujjygs0001bszr27tu81x5"; // TODO: get from URL or context
  const response = await getProjectTasks(projectId);
  const initialTasks = response.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="pt-4 border-b p-6 mb-4">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-sm text-muted-foreground">
          Drag and drop tasks to update their status
        </p>
      </div>
      <KanbanBoard
        initialColumns={initialColumns}
        initialTasks={initialTasks}
        projectId={projectId}
      />
    </div>
  );
}
