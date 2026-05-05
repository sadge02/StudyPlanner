import { KanbanColumn, Task } from "@/types";

export const mockColumns: KanbanColumn[] = [
  { id: "todo", title: "TODO" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Write essay",
    description: "Write a 500-word essay on the impact of climate change.",
    status: "todo",
    priority: "HIGH",
    userId: "mock-user-1",
    deadline: new Date("2025-05-10"),
    subjectId: "math",
    projectId: null,
    parentId: null,
  },
  {
    id: "2",
    title: "Read chapter 4",
    description: "Read chapter 4 of the textbook.",
    status: "in-progress",
    priority: "MEDIUM",
    userId: "mock-user-1",
    deadline: null,
    subjectId: null,
    projectId: null,
    parentId: null,
  },
  {
    id: "3",
    title: "Submit lab report",
    description: "Submit the lab report for the chemistry experiment.",
    status: "done",
    priority: "LOW",
    userId: "mock-user-1",
    deadline: new Date("2025-05-01"),
    subjectId: "bio",
    projectId: null,
    parentId: null,
  },
  {
    id: "4",
    title: "Prepare presentation",
    description: "Cover slides 1-10, include diagrams",
    status: "in-progress",
    priority: "HIGH",
    userId: "mock-user-1",
    deadline: new Date("2025-05-15"),
    projectId: "project-1",
    subjectId: "math",
    parentId: "1",
  },
];
