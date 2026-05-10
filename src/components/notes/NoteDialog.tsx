"use client";

import { z } from "zod";
import { useState, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, File, Loader2, FileUp } from "lucide-react";
import { createNoteSchema, type CreateNoteInput } from "@/schemas/note.schema";
import type { NoteWithRelations, Subject, Note } from "@/types";
import { createNote, updateNote } from "@/lib/actions/note.actions";
import {
  getFileCategory,
  getFileCategoryColor,
  renderFileIcon,
} from "@/lib/file-utils";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { titleField } from "@/schemas/shared";

const UNCATEGORIZED_VALUE = "uncategorized_sentinel_12345";

const noteDialogSchema = createNoteSchema.extend({
  fileName: titleField.optional(),
  selectSubjectId: z.string().optional(),
});

type NoteDialogFormData = z.infer<typeof noteDialogSchema>;

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteWithRelations;
  subjects: Subject[];
  defaultSubjectId?: string;
  onSuccess?: (note: Note) => void;
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
  subjects,
  defaultSubjectId,
  onSuccess,
}: NoteDialogProps) {
  const isEditing = !!note;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const initialSubjectId = isEditing
    ? (note?.subjectId || UNCATEGORIZED_VALUE)
    : (defaultSubjectId || UNCATEGORIZED_VALUE);

  const initialFileState = isEditing && note?.fileUrl
    ? {
        url: note.fileUrl,
        name: note.title,
      }
    : null;

  const { startUpload } = useUploadThing("noteUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const file = res[0];
        const fileData = {
          url: file.ufsUrl ?? file.url,
          name: file.name,
          size: file.size,
        };
        setValue("fileUrl", fileData.url);
        setValue("fileName", fileData.name);
        const titleWithoutExt = fileData.name.replace(/\.[^/.]+$/, "");
        if (!getValues("title") || getValues("title").trim() === "") {
          setValue("title", titleWithoutExt);
        }
        toast.success("File uploaded");
      }
      setUploadingFile(false);
    },
    onUploadError: (error) => {
      toast.error(error.message ?? "Upload failed");
      setUploadingFile(false);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
    control,
  } = useForm<NoteDialogFormData>({
    resolver: zodResolver(noteDialogSchema),
    defaultValues: {
      title: isEditing && note ? note.title : "",
      content: isEditing && note ? (note.content || "") : "",
      fileUrl: isEditing && note ? (note.fileUrl || undefined) : undefined,
      fileName: isEditing && note && note.fileUrl ? note.title : undefined,
      selectSubjectId: initialSubjectId,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: isEditing && note ? note.title : "",
        content: isEditing && note ? (note.content || "") : "",
        fileUrl: isEditing && note ? (note.fileUrl || undefined) : undefined,
        fileName: isEditing && note && note.fileUrl ? note.title : undefined,
        selectSubjectId: isEditing
          ? (note?.subjectId || UNCATEGORIZED_VALUE)
          : (defaultSubjectId || UNCATEGORIZED_VALUE),
      });
    }
  }, [open, note, isEditing, defaultSubjectId, reset]);

  const selectSubjectIdValue = useWatch({ control, name: "selectSubjectId" }) || initialSubjectId;
  const fileUrlValue = useWatch({ control, name: "fileUrl" });
  const fileNameValue = useWatch({ control, name: "fileName" });

  const uploadedFile = fileUrlValue
    ? {
        url: fileUrlValue,
        name: fileNameValue || (note && note.fileUrl ? note.title : "file"),
      }
    : initialFileState;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const file = fileArray[0];
      if (file.size > 32 * 1024 * 1024) {
        toast.error("File too large (max 32MB)");
        return;
      }

      setUploadingFile(true);
      await startUpload([file]);
    },
    [startUpload]
  );

  const onSubmit = useCallback(
    async (data: NoteDialogFormData) => {
      setIsSubmitting(true);
      try {
        let actualSubjectId: string | undefined;
        const val = data.selectSubjectId;
        if (val && val !== UNCATEGORIZED_VALUE) {
          actualSubjectId = val;
        } else {
          actualSubjectId = "";
        }

        const input: CreateNoteInput = {
          title: data.fileName && data.fileUrl ? data.fileName : data.title,
          content: data.content || undefined,
          fileUrl: data.fileUrl,
          subjectId: actualSubjectId,
        };

        let response;
        if (isEditing && note) {
          response = await updateNote(note.id, input);
        } else {
          response = await createNote(input);
        }

        if (response.success && response.data) {
          toast.success(isEditing ? "Note updated" : "Note created");
          onSuccess?.(response.data);
          handleClose();
        } else {
          toast.error(response.message ?? "Failed to save note");
        }
      } catch {
        toast.error("Failed to save note");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditing, note, onSuccess, handleClose]
  );

  const handleRemoveFile = useCallback(() => {
    setValue("fileUrl", undefined);
    setValue("fileName", undefined);
  }, [setValue]);

  function getFileIconProps() {
    if (!uploadedFile) {
      return { color: "#64748b" };
    }
    const category = getFileCategory(uploadedFile.name);
    return {
      color: getFileCategoryColor(category),
    };
  }

  const fileIconProps = getFileIconProps();

  const handleSubjectChange = useCallback((val: string) => {
    setValue("selectSubjectId", val);
  }, [setValue]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!uploadedFile && !uploadingFile && (
            <div
              className={
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer " +
                (dragOver ? "border-brand bg-brand/5" : "hover:border-brand")
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files.length > 0) {
                  handleFileSelect(e.dataTransfer.files);
                }
              }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files.length > 0) {
                    handleFileSelect(target.files);
                  }
                };
                input.click();
              }}
            >
              <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Click or drag file to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, images, and more (max 32MB)
              </p>
            </div>
          )}

          {uploadingFile && (
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
              <Loader2 size={20} className="animate-spin text-brand" />
              <span className="text-sm text-muted-foreground">Uploading file...</span>
            </div>
          )}

          {uploadedFile && (
            <div
              className="flex items-center gap-3 p-4 rounded-lg border"
              style={{ borderColor: `${fileIconProps.color}40`, backgroundColor: `${fileIconProps.color}08` }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${fileIconProps.color}15`, color: fileIconProps.color }}
              >
                {renderFileIcon(uploadedFile.name, { size: 24 })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {uploadedFile.name}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemoveFile}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder={uploadedFile ? "File name (editable)" : "Note title"}
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content / Notes (optional)</Label>
            <Textarea
              id="content"
              placeholder="Add notes or description..."
              rows={4}
              {...register("content")}
              className="resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="selectSubjectId">Folder (optional)</Label>
            <Select
              value={selectSubjectIdValue}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: subject.color ?? "#3b82f6" }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || uploadingFile}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploadingFile}>
              {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
