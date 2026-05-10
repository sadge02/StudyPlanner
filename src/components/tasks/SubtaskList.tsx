import Link from "next/link";

type SubtaskNode = {
  id: string;
  title: string;
  status: string;
  subTasks?: SubtaskNode[];
};

export function SubtaskList({ tasks }: { tasks: SubtaskNode[] }) {
  return (
    <ul className="space-y-1 border-l-2 border-border pl-4">
      {tasks.map((t) => (
        <li key={t.id}>
          <div className="flex items-center justify-between py-1">
            <Link
              href={`/dashboard/tasks/${t.id}`}
              className="font-medium text-foreground hover:text-brand"
            >
              {t.title}
            </Link>
            <span className="text-xs text-muted-foreground">{t.status}</span>
          </div>
          {t.subTasks && t.subTasks.length > 0 && (
            <SubtaskList tasks={t.subTasks} />
          )}
        </li>
      ))}
    </ul>
  );
}
