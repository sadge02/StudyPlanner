import TasksPageOverview from "@/components/kanban/TasksPageOverview";
import { getUserProjectsOverview } from "@/lib/actions/project.actions";
import { Task } from "@/types";

export default async function KanbanPage() {
  const responseProjects = await getUserProjectsOverview();
  const userProjects = responseProjects.data ?? [];

  const projects = userProjects.map((p) => ({
    id: p.id,
    name: p.name,
    tasks: p.tasks as unknown as Task[],
  }));

  return <TasksPageOverview projects={projects} />;
}
