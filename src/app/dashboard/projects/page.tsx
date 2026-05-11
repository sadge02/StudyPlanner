import { CreateProjectButton } from "@/components/projects/CreateProjectButton";
import { JoinProjectButton } from "@/components/projects/JoinProjectButton";
import { ProjectsOverview } from "@/components/projects/ProjectsOverview";
import { getUserProjectsOverview } from "@/lib/actions/project.actions";

export default async function ProjectsPage() {
  const projectsResponse = await getUserProjectsOverview();
  const projects = projectsResponse.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Track your shared workspaces, watch deadlines align across teams, and
            follow project tasks on a Gantt-style timeline.
          </p>
        </div>

        <div className="flex gap-2">
          <JoinProjectButton />
          <CreateProjectButton />
        </div>
      </div>

      {!projectsResponse.success && projectsResponse.message ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {projectsResponse.message}
        </div>
      ) : null}

      <ProjectsOverview projects={projects} />
    </div>
  );
}
