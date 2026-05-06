import { getUserTasks } from "@/lib/actions/task.actions";
import TodoList from "@/components/todos/TodoList";
import { mockTasks } from "@/lib/mock-data";

export default async function Testpage() {
  const response = await getUserTasks();
  const tasks = response.data ?? [];
  // const tasks = mockTasks;

  return (
    <div className="flex flex-col h-full">
      <div className="pt-4 border-b p-6 mb-4">
        <h1 className="text-2xl font-bold">General TODOs</h1>
        <p className="text-sm text-muted-foreground">
          Manage your miscellaneous and non-academic activities.
        </p>
      </div>
      <TodoList initialTasks={tasks} />
    </div>
  );
}
