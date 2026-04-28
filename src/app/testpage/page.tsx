import KanbanCard from "@/components/kanban/KanbanCard";
import { mockTasks } from "@/lib/mock-data";

const TestPage = () => {
  const mockTask = mockTasks[3];

  return (
    <div>
      <KanbanCard task={mockTask} />
    </div>
  );
};

export default TestPage;
