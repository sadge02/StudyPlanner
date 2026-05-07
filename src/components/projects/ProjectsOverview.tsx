import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";
import { differenceInCalendarDays, format, isPast, startOfDay } from "date-fns";
import { TimelineView } from "@/components/calendar/TimelineView";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProjectOverview } from "@/types";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card size="sm" className="bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>{icon}</CardAction>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function ProjectsOverview({
  projects,
}: {
  projects: ProjectOverview[];
}) {
  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, project) =>
      sum + project.tasks.filter((task) => task.status === "DONE").length,
    0,
  );
  const overdueTasks = projects.reduce(
    (sum, project) =>
      sum +
      project.tasks.filter(
        (task) =>
          task.status !== "DONE" &&
          !task.isProxyRange &&
          isPast(task.endTime) &&
          !startOfDay(task.endTime).getTime().toString().includes("NaN"),
      ).length,
    0,
  );

  if (projects.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-gradient-to-br from-card to-muted/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Projects</CardTitle>
          <CardDescription>
            You are not part of any shared projects yet. Once a project exists,
            its tasks and timeline will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active Projects"
          value={String(projects.length)}
          icon={<FolderKanban className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Scheduled Tasks"
          value={String(totalTasks)}
          icon={<Clock3 className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Completed Tasks"
          value={`${completedTasks}${overdueTasks ? ` / ${overdueTasks} overdue` : ""}`}
          icon={<CheckCircle2 className="size-4 text-muted-foreground" />}
        />
      </section>

      <section className="grid gap-6">
        {projects.map((project) => {
          const completed = project.tasks.filter((task) => task.status === "DONE").length;
          const upcoming = project.tasks
            .filter((task) => task.status !== "DONE")
            .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())[0];

          return (
            <Card
              key={project.id}
              className="overflow-hidden border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm"
            >
              <CardHeader className="border-b border-border/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-2xl">{project.name}</CardTitle>
                      <Badge variant={project.role === "ADMIN" ? "default" : "outline"}>
                        {project.role}
                      </Badge>
                      <Badge variant="secondary">
                        {project.members.length} member{project.members.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <CardDescription className="max-w-3xl text-sm leading-6">
                      {project.description || "No project description yet."}
                    </CardDescription>
                  </div>

                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Open project
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-1">
                <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      <Card size="sm" className="bg-background/70">
                        <CardHeader>
                          <CardDescription>Progress</CardDescription>
                          <CardTitle>
                            {project.tasks.length
                              ? `${Math.round((completed / project.tasks.length) * 100)}%`
                              : "0%"}
                          </CardTitle>
                        </CardHeader>
                      </Card>

                      <Card size="sm" className="bg-background/70">
                        <CardHeader>
                          <CardDescription>Invite Code</CardDescription>
                          <CardTitle>{project.inviteCode}</CardTitle>
                        </CardHeader>
                      </Card>

                      <Card size="sm" className="bg-background/70">
                        <CardHeader>
                          <CardDescription>Next Milestone</CardDescription>
                          <CardTitle className="text-base">
                            {upcoming
                              ? `${upcoming.title} in ${Math.max(0, differenceInCalendarDays(upcoming.endTime, new Date()))}d`
                              : "None"}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Team</h3>
                      </div>
                      <div className="space-y-2">
                        {project.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {member.user.name || member.user.email || "Unnamed user"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Joined {format(member.joinedAt, "MMM d, yyyy")}
                              </p>
                            </div>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium">Timeline</h3>
                        <p className="text-sm text-muted-foreground">
                          Task bars use deadlines and proxy dates because tasks
                          do not currently store a dedicated start timestamp.
                        </p>
                      </div>
                      {project.tasks.some((task) => task.isProxyRange) ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="size-3.5" />
                          Some tasks use proxy timing
                        </div>
                      ) : null}
                    </div>

                    <TimelineView tasks={project.tasks} />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {project.tasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-medium">{task.title}</p>
                        <Badge variant={task.priority === "HIGH" ? "destructive" : "outline"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {task.description || "No task details yet."}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{task.status}</Badge>
                        <span>Due {format(task.endTime, "MMM d, yyyy")}</span>
                        {task.subject?.name ? <span>{task.subject.name}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
