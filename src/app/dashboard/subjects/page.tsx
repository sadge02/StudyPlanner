import Link from "next/link";
import { CopyPlus } from "lucide-react";
import { getUserSubjects } from "@/lib/actions/subject.actions";
import { getUserTasks } from "@/lib/actions/task.actions";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Button } from "@/components/ui/button";

export default async function SubjectsPage() {
  const [subjectsRes, tasksRes] = await Promise.all([
    getUserSubjects(),
    getUserTasks(),
  ]);
  const subjects = subjectsRes.success ? subjectsRes.data ?? [] : [];
  const tasks = tasksRes.success ? tasksRes.data ?? [] : [];

  return (
    <div className="p-4 sm:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Button asChild>
          <Link href="/dashboard/subjects/new">
            <CopyPlus size={18} />
            Add Subject
          </Link>
        </Button>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No subjects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All tasks</h2>
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <CopyPlus size={18} />
              Add Task
            </Link>
          </Button>
        </div>

        <TaskTable tasks={tasks} />
      </div>
    </div>
  );
}
