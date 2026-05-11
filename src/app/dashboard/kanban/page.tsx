import TasksPageOverview from "@/components/kanban/TasksPageOverview";
import { getUserProjectsOverview } from "@/lib/actions/project.actions";
import { Task } from "@/types";

type Props = {
  searchParams: Promise<{ project?: string }>;
};

export default async function KanbanPage({ searchParams }: Props) {
  const { project } = await searchParams;

  const responseProjects = await getUserProjectsOverview();
  const userProjects = responseProjects.data ?? [];

  const projects = userProjects.map((p) => ({
    id: p.id,
    name: p.name,
    tasks: p.tasks as unknown as Task[],
  }));

  const initialProjectId = project ?? projects[0]?.id ?? "";

  return (
    <TasksPageOverview
      projects={projects}
      initialProjectId={initialProjectId}
    />
  );
}
