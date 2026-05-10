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
    <div className="flex flex-col h-full md:p-6 gap-4 items-center">
      <Tabs
        defaultValue="kanban"
        className="flex flex-col md:items-center gap-4 md:gap-8 w-full h-full"
      >
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <TabsList className="h-11 shadow px-4">
            <TabsTrigger
              value="kanban"
              className="px-3 md:px-6 h-8 text-sm gap-2"
            >
              <LayoutGrid size={16} className="text-blue-600" />
              <span className="hidden sm:inline">Kanban Board</span>
              <span className="sm:hidden">Kanban</span>
            </TabsTrigger>
            <TabsTrigger
              value="todos"
              className="px-3 md:px-6 h-8 text-sm gap-2"
            >
              <ListTodo size={16} className="text-blue-600" />
              <span className="hidden sm:inline">General TODOs</span>
              <span className="sm:hidden">TODOs</span>
            </TabsTrigger>
          </TabsList>

          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-full sm:w-64 shadow-sm">
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

        <TabsContent value="kanban" className="flex flex-col gap-4 md:gap-8">
          <KanbanBoard initialTasks={tasks} projectId={selectedProjectId} />
        </TabsContent>

        <TabsContent value="todos" className="flex flex-col gap-4 md:gap-8">
          <TodoList initialTasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPageOverview;
