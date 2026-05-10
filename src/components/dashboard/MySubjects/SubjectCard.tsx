import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SubjectListStatsItem } from "@/lib/actions/subject.actions";

export async function SubjectCard({
  subject,
}: {
  subject: SubjectListStatsItem;
}) {
  const color = subject.color ?? "#3b82f6";
  const total = subject._count.tasks;
  const done = subject.completedTasks;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`/dashboard/subjects/${subject.id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <BookOpen size={16} />
        </div>
        {subject.credits != null && (
          <span className="text-xs text-muted-foreground">
            {subject.credits} Credits
          </span>
        )}
      </div>

      <div>
        <p className="font-semibold text-sm text-foreground">{subject.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total} {total === 1 ? "task" : "tasks"}
        </p>
      </div>

      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </Link>
  );
}
