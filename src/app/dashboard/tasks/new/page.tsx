import { getUserSubjects } from "@/lib/actions/subject.actions";
import { TaskForm } from "@/components/tasks/TaskForm";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string; parentId?: string }>;
}) {
  const [{ subjectId, parentId }, res] = await Promise.all([
    searchParams,
    getUserSubjects(),
  ]);
  const subjects = res.success ? res.data ?? [] : [];

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Create Task</h1>
      <TaskForm
        subjects={subjects}
        defaultValues={subjectId || parentId ? { subjectId, parentId } : undefined}
      />
    </div>
  );
}
