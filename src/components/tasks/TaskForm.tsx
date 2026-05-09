"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CopyPlus, Trash2 } from "lucide-react";
import type { z } from "zod";

import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/schemas";
import { createTask, deleteTask, updateTask } from "@/lib/actions/task.actions";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import type { Subject } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type TaskFormInput = z.input<typeof createTaskSchema>;
type TaskFormOutput = z.output<typeof createTaskSchema>;

type TaskFormDefaults = {
  title?: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  deadline?: Date | null;
  subjectId?: string | null;
  parentId?: string | null;
};

type TaskFormProps = {
  subjects: Pick<Subject, "id" | "name" | "color">[];
  taskId?: string;
  defaultValues?: TaskFormDefaults;
};

function dateToInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TaskForm({ subjects, taskId, defaultValues }: TaskFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(taskId);
  const { confirm, dialog } = useConfirm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput, unknown, TaskFormOutput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? null,
      priority: defaultValues?.priority ?? "MEDIUM",
      status: defaultValues?.status ?? "TODO",
      deadline: dateToInputValue(defaultValues?.deadline) || null,
      subjectId: defaultValues?.subjectId ?? "",
      projectId: "",
      parentId: defaultValues?.parentId ?? "",
    },
  });

  const onSubmit = async (data: CreateTaskInput) => {
    setServerError(null);
    const res = isEdit
      ? await updateTask(taskId!, data)
      : await createTask(data);
    if (!res.success) {
      setServerError(res.message ?? "Something went wrong");
      return;
    }
    router.back();
    router.refresh();
  };

  const onDelete = async () => {
    if (!taskId) return;
    const ok = await confirm({
      title: "Delete task?",
      description: "All subtasks will also be deleted.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setServerError(null);
    const res = await deleteTask(taskId);
    if (!res.success) {
      setServerError(res.message ?? "Failed to delete");
      return;
    }
    router.back();
    router.refresh();
  };

  return (
    <>
      {dialog}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4"
      >
        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder="e.g. Binary Search Tree Implementation"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description (optional)
          </label>
          <textarea
            {...register("description", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            rows={3}
            placeholder="Additional details, links, requirements..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            {...register("status")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TASK_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            {...register("priority")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Deadline (optional)
          </label>
          <input
            type="date"
            {...register("deadline", {
              setValueAs: (v) => (v === "" || !v ? null : new Date(v)),
            })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Subject (optional)
          </label>
          <select
            {...register("subjectId")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— None —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            <CopyPlus size={18} />
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Task"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </form>
    </>
  );
}
