import KanbanBoard from "@/components/kanban/KanbanBoard";
import TodoList from "@/components/todos/TodoList";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProjectsOverview } from "@/lib/actions/project.actions";
import { getProjectTasks } from "@/lib/actions/task.actions";
import { LayoutGrid, ListTodo } from "lucide-react";

// TODO: Add project display and switch
export default async function KanbanPage() {
  const projectId = "cmoxdtnef0008lwz7ytyzz8kf";
  const responseTasks = await getProjectTasks(projectId);
  const initialTasks = responseTasks.data ?? [];

  const responseProjects = await getUserProjectsOverview();
  const userProjects = responseProjects.data ?? [];

  console.log("PROJEKTOS:", userProjects);

  return (
    <div className="flex flex-col h-full p-6 gap-4 items-center">
      <Tabs defaultValue="kanban" className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <TabsList className="h-11 shadow px-4">
            <TabsTrigger value="kanban" className="px-6 h-8 text-sm gap-2">
              <LayoutGrid size={16} className="text-blue-600" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="todos" className="px-6 h-8 text-sm gap-2">
              <ListTodo size={16} className="text-blue-600" />
              General TODOs
            </TabsTrigger>
          </TabsList>

          {/* ADD PROJECT SELECTOR HERE */}
        </div>

        <TabsContent value="kanban" className="flex flex-col gap-8">
          <p className="text-md text-muted-foreground text-center">
            Drag and drop tasks between columns to update their status. Add
            custom columns to fit your workflow.
          </p>
          <Separator />
          <KanbanBoard initialTasks={initialTasks} projectId={projectId} />
        </TabsContent>

        <TabsContent value="todos" className="flex flex-col gap-8">
          <p className="text-md text-muted-foreground text-center">
            Manage your personal tasks and miscellaneous to-dos.
          </p>
          <Separator />
          <TodoList initialTasks={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
