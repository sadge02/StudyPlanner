"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KanbanBoard from "./KanbanBoard";
import { Task } from "@/types";
import { Separator } from "../ui/separator";

type Project = {
  id: string;
  name: string;
  tasks: Task[];
};

type Props = {
  projects: Project[];
  initialProjectId: string;
};

const TasksPageOverview = ({ projects, initialProjectId }: Props) => {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? projects[0];
  const tasks = selectedProject?.tasks ?? [];

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`?project=${projectId}`, { scroll: false });
  };

  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        You are not part of any projects yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex w-full justify-center flex-col">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-md text-muted-foreground">
          Drag and drop tasks between columns to update their status. Add custom
          columns to fit your workflow.
        </p>
      </div>
      <Separator />
      <div className="flex flex-row sm:flex-row gap-3">
        <span className="text-lg">Select a project:</span>
        <Select value={selectedProjectId} onValueChange={handleProjectChange}>
          <SelectTrigger className="sm:w-64 shadow-sm">
            <SelectValue placeholder="Select project" />
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

      <KanbanBoard
        key={selectedProjectId}
        initialTasks={tasks}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default TasksPageOverview;
