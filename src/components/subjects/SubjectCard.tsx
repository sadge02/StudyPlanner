import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { SubjectListItem } from "@/lib/actions/subject.actions";

export function SubjectCard({ subject }: { subject: SubjectListItem }) {
  const color = subject.color ?? "#3b82f6";

  return (
    <Link
      href={`/dashboard/subjects/${subject.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <BookOpen size={20} />
        </div>
        {subject.credits != null && (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {subject.credits} credits
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
        {subject.name}
      </h3>

      <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {subject._count.tasks} {subject._count.tasks === 1 ? "task" : "tasks"}
        </span>
      </div>
    </Link>
  );
}
