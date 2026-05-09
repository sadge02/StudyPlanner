"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CopyPlus, Trash2 } from "lucide-react";
import type { z } from "zod";

import {
  createSubjectSchema,
  type CreateSubjectInput,
} from "@/schemas";
import {
  createSubject,
  deleteSubject,
  updateSubject,
} from "@/lib/actions/subject.actions";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type SubjectFormInput = z.input<typeof createSubjectSchema>;
type SubjectFormOutput = z.output<typeof createSubjectSchema>;

const DEFAULT_COLOR = "#3b82f6";

type SubjectFormProps = {
  subjectId?: string;
  defaultValues?: Partial<CreateSubjectInput>;
};

export function SubjectForm({ subjectId, defaultValues }: SubjectFormProps = {}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(subjectId);
  const { confirm, dialog } = useConfirm();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormInput, unknown, SubjectFormOutput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      credits: defaultValues?.credits ?? null,
      color: defaultValues?.color ?? DEFAULT_COLOR,
    },
  });

  const selectedColor = useWatch({ control, name: "color" }) ?? DEFAULT_COLOR;

  const onSubmit = async (data: CreateSubjectInput) => {
    setServerError(null);
    const res = isEdit
      ? await updateSubject(subjectId!, data)
      : await createSubject(data);
    if (!res.success) {
      setServerError(res.message ?? "Something went wrong");
      return;
    }
    router.back();
    router.refresh();
  };

  const onDelete = async () => {
    if (!subjectId) return;
    const ok = await confirm({
      title: "Delete subject?",
      description: "All its tasks and events will be deleted too.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setServerError(null);
    const res = await deleteSubject(subjectId);
    if (!res.success) {
      setServerError(res.message ?? "Failed to delete");
      return;
    }
    router.push("/dashboard/subjects");
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
            Name
          </label>
          <input
            type="text"
            {...register("name")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Credits (optional)
          </label>
          <input
            type="number"
            min={0}
            max={65}
            {...register("credits", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined ? null : Number(v),
            })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.credits && (
            <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Color
          </label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) =>
              setValue("color", e.target.value, { shouldValidate: true })
            }
            className="h-10 w-20 cursor-pointer rounded border border-slate-300"
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
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
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Subject"}
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
