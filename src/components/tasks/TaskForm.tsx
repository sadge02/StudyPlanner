"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CopyPlus, Trash2 } from "lucide-react";
import type { z } from "zod";

import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/schemas";
import { createTask, deleteTask, updateTask } from "@/lib/actions/task.actions";
import { TASK_STATUS_OPTIONS } from "@/lib/utils/constants";
import type { Subject } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaskFormInput = z.input<typeof createTaskSchema>;
type TaskFormOutput = z.output<typeof createTaskSchema>;

type Priority = "LOW" | "MEDIUM" | "HIGH";
type Status = "TODO" | "IN_PROGRESS" | "DONE";

type TaskFormDefaults = {
  title?: string;
  description?: string | null;
  priority?: Priority;
  status?: Status;
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
    setValue,
    control,
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

  const status = useWatch({ control, name: "status" });
  const priority = useWatch({ control, name: "priority" });
  const subjectId = useWatch({ control, name: "subjectId" });

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
        className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm"
      >
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            type="text"
            {...register("title")}
            placeholder="e.g. Binary Search Tree Implementation"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description">Description (optional)</Label>
          <Textarea
            id="task-description"
            {...register("description", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            rows={3}
            placeholder="Additional details, links, requirements..."
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status ?? "TODO"}
            onValueChange={(v) =>
              setValue("status", v as Status, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priority ?? "MEDIUM"}
            onValueChange={(v) =>
              setValue("priority", v as Priority, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-destructive">
              {errors.priority.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-deadline">Deadline (optional)</Label>
          <Input
            id="task-deadline"
            type="date"
            {...register("deadline", {
              setValueAs: (v) => (v === "" || !v ? null : new Date(v)),
            })}
          />
          {errors.deadline && (
            <p className="text-sm text-destructive">
              {errors.deadline.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Subject (optional)</Label>
          <Select
            value={subjectId || "none"}
            onValueChange={(v) =>
              setValue("subjectId", v === "none" ? "" : v, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="— None —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subjectId && (
            <p className="text-sm text-destructive">
              {errors.subjectId.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <CopyPlus size={18} />
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Task"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              <Trash2 size={18} />
              Delete
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
