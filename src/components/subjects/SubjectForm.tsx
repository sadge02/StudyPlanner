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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm"
      >
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject-name">Name</Label>
          <Input
            id="subject-name"
            type="text"
            {...register("name")}
            placeholder="e.g. Computer Science"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject-credits">Credits (optional)</Label>
          <Input
            id="subject-credits"
            type="number"
            min={0}
            max={65}
            {...register("credits", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined ? null : Number(v),
            })}
          />
          {errors.credits && (
            <p className="text-sm text-destructive">{errors.credits.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject-color">Color</Label>
          <input
            id="subject-color"
            type="color"
            value={selectedColor}
            onChange={(e) =>
              setValue("color", e.target.value, { shouldValidate: true })
            }
            className="h-10 w-20 cursor-pointer rounded-md border border-input bg-background"
          />
          {errors.color && (
            <p className="text-sm text-destructive">{errors.color.message}</p>
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
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Subject"}
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
