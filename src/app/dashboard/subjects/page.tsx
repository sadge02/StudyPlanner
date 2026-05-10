import Link from "next/link";
import { CopyPlus } from "lucide-react";
import { getUserSubjects } from "@/lib/actions/subject.actions";
import { getUserTasks } from "@/lib/actions/task.actions";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { TaskTable } from "@/components/tasks/TaskTable";

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
        <Link
          href="/dashboard/subjects/new"
          className="flex items-center gap-2 rounded-md bg-brand hover:bg-brand-hover text-white px-4 py-2 font-medium text-sm shadow-md transition-colors"
        >
          <CopyPlus size={18} />
          Add Subject
        </Link>
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
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-2 rounded-md bg-brand hover:bg-brand-hover text-white px-4 py-2 font-medium text-sm shadow-md transition-colors"
          >
            <CopyPlus size={18} />
            Add Task
          </Link>
        </div>

        <TaskTable tasks={tasks} />
      </div>
    </div>
  );
}
