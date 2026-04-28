export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: TaskPriority;
  userId: string;
  deadline?: string;
  projectId?: string;
  subjectId?: string;
  parentId?: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
};
