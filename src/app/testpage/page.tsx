import KanbanCard from "@/components/kanban/KanbanCard";
import { mockTasks } from "@/lib/mock-data";

const TestPage = () => {
  const mockTask = mockTasks[3];

  return (
    <div className="p-4">
      <KanbanCard task={mockTask} />
    </div>
  );
};

export default TestPage;
