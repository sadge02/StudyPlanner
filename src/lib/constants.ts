import type { TaskStatus } from "@/types";

export const TASK_STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
] as const satisfies ReadonlyArray<{ value: TaskStatus; label: string }>;
