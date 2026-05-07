 "use client";

import { useState } from "react";
import { AlertTriangle, Users } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { TimelineView } from "@/components/calendar/TimelineView";
import { LeaveProjectButton } from "@/components/projects/LeaveProjectButton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectOverview } from "@/types";

export function ProjectsOverview({
  projects,
}: {
  projects: ProjectOverview[];
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");

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

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const completed = selectedProject.tasks.filter((task) => task.status === "DONE").length;
  const upcoming = [...selectedProject.tasks]
    .filter((task) => task.status !== "DONE")
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())[0];
  const recentTasks = selectedProject.tasks.slice(0, 6);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">Project roadmap</CardTitle>
              <CardDescription>
                Choose a project and work with its timeline directly.
              </CardDescription>
            </div>

            <div className="w-full max-w-sm space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Selected project
              </p>
              <Select
                value={selectedProject.id}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
              <Badge variant={selectedProject.role === "ADMIN" ? "default" : "outline"}>
                {selectedProject.role}
              </Badge>
              <Badge variant="secondary">
                {selectedProject.members.length} member
                {selectedProject.members.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <LeaveProjectButton
              projectId={selectedProject.id}
              projectName={selectedProject.name}
            />
          </div>

          <CardDescription className="max-w-3xl text-sm leading-5">
            {selectedProject.description || "No project description yet."}
          </CardDescription>

          <TimelineView tasks={selectedProject.tasks} />
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="border border-border/70 bg-background/70 shadow-sm">
            <CardHeader>
              <CardDescription>Progress</CardDescription>
              <CardTitle>
                {selectedProject.tasks.length
                  ? `${Math.round((completed / selectedProject.tasks.length) * 100)}%`
                  : "0%"}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border border-border/70 bg-background/70 shadow-sm">
            <CardHeader>
              <CardDescription>Invite Code</CardDescription>
              <CardTitle>{selectedProject.inviteCode}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border border-border/70 bg-background/70 shadow-sm">
            <CardHeader>
              <CardDescription>Next Milestone</CardDescription>
              <CardTitle className="text-base">
                {upcoming
                  ? `${upcoming.title} in ${Math.max(0, differenceInCalendarDays(upcoming.endTime, new Date()))}d`
                  : "None"}
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Team</h3>
            </div>
            <div className="space-y-2">
              {selectedProject.members.map((member) => (
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
          {selectedProject.tasks.some((task) => task.isProxyRange) ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5" />
              Some tasks use proxy timing
            </div>
          ) : null}

          <Separator />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentTasks.map((task) => (
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
        </div>
      </section>
    </div>
  );
}
