import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/actions/task.actions";
import { getUserSubjects } from "@/lib/actions/subject.actions";
import { TaskForm } from "@/components/tasks/TaskForm";
import { SubtaskList } from "@/components/tasks/SubtaskList";
import Link from "next/link";
import { CopyPlus } from "lucide-react";
import type { TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [taskRes, subjectsRes] = await Promise.all([
    getTaskById(id),
    getUserSubjects(),
  ]);

  if (!taskRes.success || !taskRes.data) notFound();
  const task = taskRes.data;
  const subjects = subjectsRes.success ? subjectsRes.data ?? [] : [];

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Edit {task.title}</h1>
      <TaskForm
        subjects={subjects}
        taskId={task.id}
        defaultValues={{
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status as TaskStatus,
          deadline: task.deadline,
          subjectId: task.subjectId,
        }}
      />
      {task.subTasks.length === 0 ? null : (
        <div>
          <h2 className="text-xl font-bold mb-4">Subtasks</h2>
          <SubtaskList tasks={task.subTasks} />
        </div>
      )}
      <Button asChild className="mt-4">
        <Link href={`/dashboard/tasks/new?parentId=${task.id}`}>
          <CopyPlus size={18} />
          Add subtask
        </Link>
      </Button>
    </div>
  );
}
