import TodoList from "@/components/todos/TodoList";
import { getUserTasks } from "@/lib/actions/task.actions";

export const Todos = async () => {
  const response = await getUserTasks();
  const todos = response.data ?? [];

  return (
    <div className="flex w-full justify-center flex-col">
      <h1 className="text-3xl font-bold">General Todos</h1>
      <p className="text-md text-muted-foreground mb-4">
        Manage your personal tasks and miscellaneous to-dos.
      </p>
      <TodoList initialTasks={todos} />
    </div>
  );
};

export default Todos;
