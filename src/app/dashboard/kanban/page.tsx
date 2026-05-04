import KanbanBoard from "@/components/kanban/KanbanBoard";
import { mockColumns, mockTasks } from "@/lib/mock-data";

export default function KanbanPage() {
  return <KanbanBoard initialColumns={mockColumns} initialTasks={mockTasks} />;
}
