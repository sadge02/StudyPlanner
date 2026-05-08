import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProjectTasks } from "@/lib/actions/task.actions";
import { KanbanColumn } from "@/types";

export const initialColumns: KanbanColumn[] = [
  { id: "todo", title: "TODO" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// TODO: Add project display and switch
export default async function KanbanPage() {
  const projectId = "cmoxdtnef0008lwz7ytyzz8kf"; // TODO: get from URL or context
  const response = await getProjectTasks(projectId);
  const initialTasks = response.data ?? [];

  console.log("ascascascsa", initialTasks);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Kanban Board
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Drag and drop tasks to update their state
          </p>
        </div>

        <Button />
      </div>

      <Separator />

      <KanbanBoard
        initialColumns={initialColumns}
        initialTasks={initialTasks}
        projectId={projectId}
      />
    </div>
  );
}
