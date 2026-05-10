import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyPlus } from "lucide-react";
import { getSubjectById } from "@/lib/actions/subject.actions";
import { getUserTasks } from "@/lib/actions/task.actions";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Button } from "@/components/ui/button";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [subjectRes, tasksRes] = await Promise.all([
    getSubjectById(id),
    getUserTasks(id),
  ]);
  if (!subjectRes.success || !subjectRes.data) notFound();
  const subject = subjectRes.data;
  const tasks = tasksRes.success ? tasksRes.data ?? [] : [];

  const taskCount = subject.tasks.length;
  const eventCount = subject.events.length;
  const totalSeconds = subject.studySessions.reduce(
    (sum, s) => sum + (s.duration ?? 0),
    0,
  );
  const totalHours = totalSeconds / 3600;

  const taskTitleById = new Map(subject.tasks.map((t) => [t.id, t.title]));
  const hoursByTask = new Map<string, number>();
  for (const s of subject.studySessions) {
    if (!s.taskId || !s.duration) continue;
    hoursByTask.set(
      s.taskId,
      (hoursByTask.get(s.taskId) ?? 0) + s.duration / 3600,
    );
  }
  const breakdown = [...hoursByTask.entries()]
    .map(([taskId, hours]) => ({
      taskId,
      title: taskTitleById.get(taskId) ?? "Unknown task",
      hours,
    }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit {subject.name}</h1>
        <SubjectForm
          subjectId={subject.id}
          defaultValues={{
            name: subject.name,
            credits: subject.credits,
            color: subject.color,
          }}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Tasks" value={taskCount} />
          <StatCard label="Events" value={eventCount} />
          <StatCard
            label="Total study time"
            value={`${totalHours.toFixed(1)} h`}
          />
        </div>
        {breakdown.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 text-sm font-semibold text-foreground">
              Study time by task
            </div>
            <ul className="divide-y text-sm">
              {breakdown.map((b) => (
                <li
                  key={b.taskId}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <span className="text-foreground">{b.title}</span>
                  <span className="font-medium text-foreground">
                    {b.hours.toFixed(1)} h
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tasks</h2>
          <Button asChild>
            <Link href={`/dashboard/tasks/new?subjectId=${subject.id}`}>
              <CopyPlus size={18} />
              Add Task
            </Link>
          </Button>
        </div>
        <TaskTable tasks={tasks} showSubject={false} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
