"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2, X } from "lucide-react";

import { deleteTask, updateTask } from "@/lib/actions/task.actions";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import type { TaskStatus, TaskWithSubject } from "@/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "all";

const PRIORITY_STYLES = {
  HIGH: { label: "High", color: "text-red-600 dark:text-red-400", icon: "!" },
  MEDIUM: { label: "Medium", color: "text-muted-foreground", icon: "—" },
  LOW: { label: "Low", color: "text-muted-foreground", icon: "↓" },
} as const;

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  DONE: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
};

function formatDeadline(d: Date | null) {
  if (!d) return "—";
  const date = new Date(d);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TaskTable({
  tasks,
  showSubject = true,
}: {
  tasks: TaskWithSubject[];
  showSubject?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("");

  const availableSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const t of tasks) {
      if (t.subject)
        map.set(t.subject.id, { id: t.subject.id, name: t.subject.name });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const filtered = useMemo(() => {
    let deadlineMax: Date | null = null;
    if (deadlineFilter) {
      const [y, m, d] = deadlineFilter.split("-").map(Number);
      deadlineMax = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
    return tasks.filter((t) => {
      if (subjectFilter && t.subjectId !== subjectFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (deadlineMax) {
        if (!t.deadline) return false;
        if (new Date(t.deadline) > deadlineMax) return false;
      }
      return true;
    });
  }, [tasks, subjectFilter, statusFilter, deadlineFilter]);

  const hasFilters = Boolean(subjectFilter || statusFilter || deadlineFilter);
  const changeSubjectFilter = (v: string) => {
    setSubjectFilter(v === ALL_VALUE ? "" : v);
    setSelected(new Set());
  };
  const changeStatusFilter = (v: string) => {
    setStatusFilter(v === ALL_VALUE ? "" : v);
    setSelected(new Set());
  };
  const changeDeadlineFilter = (v: string) => {
    setDeadlineFilter(v);
    setSelected(new Set());
  };
  const resetFilters = () => {
    setSubjectFilter("");
    setStatusFilter("");
    setDeadlineFilter("");
    setSelected(new Set());
  };

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const reportFailures = (
    results: PromiseSettledResult<{ success: boolean; message?: string }>[],
    actionLabel: string,
  ) => {
    const failures = results.filter(
      (r) =>
        r.status === "rejected" || (r.status === "fulfilled" && !r.value.success),
    );
    if (failures.length === 0) {
      setActionError(null);
      return;
    }
    const firstMessage =
      failures
        .map((r) =>
          r.status === "fulfilled" ? r.value.message : (r.reason as Error)?.message,
        )
        .find(Boolean) ?? "Unknown error";
    setActionError(
      `Failed to ${actionLabel} ${failures.length} of ${results.length} task(s): ${firstMessage}`,
    );
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selected.size} task(s)?`,
      description: "Subtasks of selected tasks will also be deleted.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const ids = [...selected];
    startTransition(async () => {
      const results = await Promise.allSettled(ids.map((id) => deleteTask(id)));
      reportFailures(results, "delete");
      setSelected(new Set());
      router.refresh();
    });
  };

  const handleMarkDone = () => {
    const ids = [...selected];
    startTransition(async () => {
      const results = await Promise.allSettled(
        ids.map((id) => updateTask(id, { status: "DONE" })),
      );
      reportFailures(results, "mark done");
      setSelected(new Set());
      router.refresh();
    });
  };

  if (tasks.length === 0) {
    return (
      <>
        {dialog}
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No tasks yet.
        </div>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {dialog}
      {actionError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-end gap-3 border-b px-6 py-3">
          {showSubject && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Subject
              </Label>
              <Select
                value={subjectFilter || ALL_VALUE}
                onValueChange={changeSubjectFilter}
              >
                <SelectTrigger className="h-8 min-w-[140px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All</SelectItem>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Due before
            </Label>
            <Input
              type="date"
              value={deadlineFilter}
              onChange={(e) => changeDeadlineFilter(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </Label>
            <Select
              value={statusFilter || ALL_VALUE}
              onValueChange={changeStatusFilter}
            >
              <SelectTrigger className="h-8 min-w-[140px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All</SelectItem>
                {TASK_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="ml-auto"
            >
              <X size={14} />
              Clear filters
            </Button>
          )}
        </div>
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Task name</th>
              {showSubject && <th className="px-6 py-3">Subject</th>}
              <th className="px-6 py-3">Due date</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showSubject ? 5 : 4}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No tasks match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((t) => {
              const prio = PRIORITY_STYLES[t.priority];
              return (
                <tr key={t.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selected.has(t.id)}
                        onCheckedChange={(checked) =>
                          toggle(t.id, checked === true)
                        }
                        aria-label={`Select task ${t.title}`}
                      />
                      <Link
                        href={`/dashboard/tasks/${t.id}`}
                        className="font-medium text-foreground hover:text-brand"
                      >
                        {t.title}
                      </Link>
                    </div>
                  </td>
                  {showSubject && (
                    <td className="px-6 py-4">
                      {t.subject ? (
                        <span
                          className="inline-block rounded-md px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${t.subject.color ?? "#3b82f6"}20`,
                            color: t.subject.color ?? "#3b82f6",
                          }}
                        >
                          {t.subject.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDeadline(t.deadline)}
                  </td>
                  <td className={`px-6 py-4 ${prio.color}`}>
                    <span className="font-semibold">{prio.icon}</span> {prio.label}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold uppercase ${
                        STATUS_STYLES[t.status as TaskStatus] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t px-6 py-3 text-sm text-muted-foreground">
          <span>
            Showing {filtered.length} of {tasks.length} tasks
          </span>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-2 text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <Button
            type="button"
            onClick={handleMarkDone}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <CheckCircle2 size={18} />
            Mark as Done
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
