import KanbanColumn from "@/components/kanban/KanbanColumn";
import { mockTasks } from "@/lib/mock-data";

const TestPage = () => {
  const mockTask = mockTasks;

  return (
    <div className="p-4">
      <KanbanColumn
        column={{ id: "test-column", title: "Test Column" }}
        tasks={mockTask}
      />
    </div>
  );
};

export default TestPage;
