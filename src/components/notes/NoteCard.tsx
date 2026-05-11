"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  StickyNote,
  MoreHorizontal,
  Download,
  Pencil,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import type { NoteWithRelations } from "@/types";
import {
  getFileCategory,
  getFileCategoryColor,
  canPreviewInBrowser,
  renderFileIcon,
} from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { deleteNote } from "@/lib/actions/note.actions";

interface NoteCardProps {
  note: NoteWithRelations;
  onEdit: (note: NoteWithRelations) => void;
  onDelete?: () => void;
  isDragging?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  isDragging,
  draggable = false,
  onDragStart,
}: NoteCardProps) {
  const { confirm, dialog } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFile = !!note.fileUrl;
  const hasContent = !!note.content;
  const fileName = note.title;

  const fileCategory = hasFile ? getFileCategory(fileName) : "other";

  let iconColor = "#64748b";
  if (hasFile) {
    iconColor = getFileCategoryColor(fileCategory);
  } else if (hasContent) {
    iconColor = "#3b82f6";
  }

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: "Delete note?",
      description: `This will permanently delete "${note.title}". This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await deleteNote(note.id);
      if (response.success) {
        toast.success("Note deleted");
        onDelete?.();
      } else {
        toast.error(response.message ?? "Failed to delete note");
      }
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  }, [note.id, note.title, confirm, onDelete]);

  const handleOpenFile = useCallback(() => {
    if (!note.fileUrl) return;

    const canPreview = canPreviewInBrowser(fileName);

    if (canPreview) {
      window.open(note.fileUrl, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = note.fileUrl;
      link.download = fileName;
      link.click();
      toast.success("Download started");
    }
  }, [note.fileUrl, fileName]);

  const handleDownload = useCallback(() => {
    if (!note.fileUrl) return;
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.download = fileName;
    link.click();
    toast.success("Download started");
  }, [note.fileUrl, fileName]);

  const contentPreview = hasContent
    ? note.content!.length > 100
      ? note.content!.slice(0, 100) + "..."
      : note.content
    : null;

  function renderIcon() {
    if (hasFile) {
      return renderFileIcon(fileName, { size: 18 });
    }
    if (hasContent) {
      return <FileText size={18} />;
    }
    return <StickyNote size={18} />;
  }

  return (
    <>
      {dialog}
      <Card
        className={cn(
          "group relative overflow-hidden transition-all",
          isDragging ? "opacity-50 scale-95" : "hover:shadow-md",
          draggable && "cursor-grab active:cursor-grabbing"
        )}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: iconColor }}
        />

        <div className="p-4 pl-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${iconColor}15`,
                  color: iconColor,
                }}
              >
                {renderIcon()}
              </div>

                <div className="min-w-0 flex-1">
                 {hasFile && note.fileUrl ? (
                   <a
                     href={note.fileUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="font-semibold text-sm text-foreground truncate hover:text-brand transition-colors block"
                     title={note.title}
                   >
                     {note.title}
                   </a>
                 ) : (
                   <h3
                     className="font-semibold text-sm text-foreground truncate cursor-pointer hover:text-brand transition-colors"
                     onClick={() => onEdit(note)}
                     title={note.title}
                   >
                     {note.title}
                   </h3>
                 )}

                {contentPreview && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {contentPreview}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {note.subject && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${note.subject.color ?? "#3b82f6"}15`,
                        color: note.subject.color ?? "#3b82f6",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: note.subject.color ?? "#3b82f6" }}
                      />
                      {note.subject.name}
                    </span>
                  )}

                  {!note.subject && !note.projectId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Uncategorized
                    </span>
                  )}

                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {hasFile && (
                  <>
                    <DropdownMenuItem onClick={handleOpenFile}>
                      <Eye size={14} className="mr-2" />
                      {canPreviewInBrowser(fileName) ? "Open" : "Open / Download"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download size={14} className="mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Pencil size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={14} className="mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </>
  );
}
