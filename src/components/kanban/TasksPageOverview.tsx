"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TodoList from "../todos/TodoList";
import KanbanBoard from "./KanbanBoard";
import { LayoutGrid, ListTodo } from "lucide-react";
import { Task } from "@/types";

type Project = {
  id: string;
  name: string;
  tasks: Task[];
};

type Props = {
  projects: Project[];
};

const TasksPageOverview = ({ projects }: Props) => {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? projects[0];
  const tasks = selectedProject?.tasks ?? [];

  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        You are not part of any projects yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 items-center">
      <Tabs defaultValue="kanban" className="flex flex-col gap-8">
        <div className="flex justify-center gap-4">
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

          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-64 shadow-sm">
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

        <TabsContent value="kanban" className="flex flex-col gap-8">
          <KanbanBoard initialTasks={tasks} projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="todos" className="flex flex-col gap-8">
          <TodoList initialTasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPageOverview;
