import KanbanBoard from "@/components/kanban/KanbanBoard";
import TodoList from "@/components/todos/TodoList";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectTasks } from "@/lib/actions/task.actions";
import { KanbanColumn } from "@/types";
import { LayoutGrid, ListTodo } from "lucide-react";

export const initialColumns: KanbanColumn[] = [
  { id: "todo", title: "TODO" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

// TODO: Add project display and switch
export default async function KanbanPage() {
  const projectId = "cmoxdtnef0008lwz7ytyzz8kf";
  const response = await getProjectTasks(projectId);
  const initialTasks = response.data ?? [];

  return (
    <div className="flex flex-col h-full p-6 gap-4 items-center">
      <Tabs defaultValue="kanban" className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <TabsList className="h-11 shadow px-4">
            <TabsTrigger value="kanban" className="px-6 h-9 text-sm gap-2">
              <LayoutGrid size={16} />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="todos" className="px-6 h-9 text-sm gap-2">
              <ListTodo size={16} />
              General TODOs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="flex flex-col gap-8">
          <p className="text-md text-muted-foreground text-center">
            Drag and drop tasks between columns to update their status. Add
            custom columns to fit your workflow.
          </p>
          <Separator />
          <KanbanBoard
            initialColumns={initialColumns}
            initialTasks={initialTasks}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="todos" className="flex flex-col gap-8">
          <p className="text-md text-muted-foreground text-center">
            Manage your personal tasks and miscellaneous to-dos that aren't tied
            to any subject or project.
          </p>
          <Separator />

          <TodoList initialTasks={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
