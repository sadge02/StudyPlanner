"use client";

import { useState, useCallback } from "react";
import { Plus, List, FolderOpen } from "lucide-react";
import type { NoteWithRelations, Subject, Note } from "@/types";
import { NoteDialog } from "@/components/notes/NoteDialog";
import { NoteCard } from "@/components/notes/NoteCard";
import { updateNote } from "@/lib/actions/note.actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "folders" | "list";

interface NotesViewProps {
  initialNotes: NoteWithRelations[];
  subjects: Subject[];
  defaultSubjectId?: string;
}

export type NoteGroup = {
  id: string;
  name: string;
  color: string | null;
  notes: NoteWithRelations[];
  isUncategorized?: boolean;
};

function groupNotesBySubject(
  notes: NoteWithRelations[],
  subjects: Subject[]
): NoteGroup[] {
  const groups = new Map<string, NoteGroup>();

  const uncategorizedGroup: NoteGroup = {
    id: "uncategorized",
    name: "Uncategorized",
    color: null,
    notes: [],
    isUncategorized: true,
  };
  groups.set("uncategorized", uncategorizedGroup);

  subjects.forEach((subject) => {
    groups.set(subject.id, {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      notes: [],
    });
  });

  notes.forEach((note) => {
    if (note.subjectId && groups.has(note.subjectId)) {
      groups.get(note.subjectId)!.notes.push(note);
    } else if (!note.subjectId) {
      groups.get("uncategorized")!.notes.push(note);
    }
  });

  const result = Array.from(groups.values()).filter(
    (g) => g.notes.length > 0 || g.isUncategorized
  );

  result.sort((a, b) => {
    if (a.isUncategorized) return -1;
    if (b.isUncategorized) return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

export function NotesView({
  initialNotes,
  subjects,
  defaultSubjectId,
}: NotesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("folders");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithRelations | null>(null);
  const [dialogSubjectId, setDialogSubjectId] = useState<string | undefined>(
    defaultSubjectId
  );
  const [notes, setNotes] = useState<NoteWithRelations[]>(initialNotes);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);

  const groups = groupNotesBySubject(notes, subjects);
  const totalNotes = notes.length;
  const hasNotes = totalNotes > 0;

  const handleNoteEdit = useCallback((note: NoteWithRelations) => {
    setEditingNote(note);
    setDialogSubjectId(note.subjectId || undefined);
    setDialogOpen(true);
  }, []);

  const handleNewNote = useCallback(
    (subjectId?: string) => {
      setEditingNote(null);
      setDialogSubjectId(subjectId);
      setDialogOpen(true);
    },
    []
  );

  const handleDialogSuccess = useCallback(
    (note: Note) => {
      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === note.id
              ? ({
                  ...n,
                  ...note,
                  subject:
                    note.subjectId && subjects.find((s) => s.id === note.subjectId)
                      ? subjects.find((s) => s.id === note.subjectId)!
                      : null,
                } as NoteWithRelations)
              : n
          )
        );
      } else {
        setNotes((prev) => [
          {
            ...note,
            subject:
              note.subjectId && subjects.find((s) => s.id === note.subjectId)
                ? subjects.find((s) => s.id === note.subjectId)!
                : null,
          } as NoteWithRelations,
          ...prev,
        ]);
      }
      setDialogOpen(false);
      setEditingNote(null);
    },
    [editingNote, subjects]
  );

  const handleNoteDelete = useCallback(
    (deletedNoteId: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== deletedNoteId));
    },
    []
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, noteId: string) => {
      setDraggedNoteId(noteId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", noteId);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedNoteId(null);
    setOverGroupId(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetGroupId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const noteId = e.dataTransfer.getData("text/plain");
      if (!noteId || !draggedNoteId) {
        handleDragEnd();
        return;
      }

      const note = notes.find((n) => n.id === noteId);
      if (!note) {
        handleDragEnd();
        return;
      }

      const currentGroupId = note.subjectId ?? "uncategorized";
      if (currentGroupId === targetGroupId) {
        handleDragEnd();
        return;
      }

      const newSubjectId = targetGroupId === "uncategorized" ? null : targetGroupId;

      setNotes((prev) => {
        const targetSubject = newSubjectId
          ? subjects.find((s) => s.id === newSubjectId) || null
          : null;

        return prev.map((n) => {
          if (n.id === noteId) {
            return {
              ...n,
              subjectId: newSubjectId,
              subject: targetSubject,
            };
          }
          return n;
        });
      });

      try {
        const response = await updateNote(noteId, {
          subjectId: newSubjectId || undefined,
        });

        if (response.success) {
          const targetGroup = groups.find((g) => g.id === targetGroupId);
          toast.success(`Note moved to ${targetGroup?.name || "folder"}`);
        } else {
          toast.error(response.message ?? "Failed to move note");
          setNotes(initialNotes);
        }
      } catch {
        toast.error("Failed to move note");
        setNotes(initialNotes);
      }

      handleDragEnd();
    },
    [draggedNoteId, notes, subjects, groups, initialNotes, handleDragEnd]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, groupId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverGroupId(groupId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setOverGroupId(null);
  }, []);

  return (
    <div className="p-4 sm:p-8 w-full">
      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        note={editingNote || undefined}
        subjects={subjects}
        defaultSubjectId={dialogSubjectId}
        onSuccess={handleDialogSuccess}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Notes
            {totalNotes > 0 && (
              <Badge variant="secondary" className="font-normal">
                {totalNotes}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your notes and files. Drag notes to move between folders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="folders" className="gap-1.5">
                <FolderOpen size={14} />
                Folders
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List size={14} />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => handleNewNote()}>
            <Plus size={18} className="mr-1.5" />
            New Note
          </Button>
        </div>
      </div>

      {!hasNotes ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No notes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first note or upload a file to get started
          </p>
          <Button className="mt-4" onClick={() => handleNewNote()}>
            <Plus size={18} className="mr-1.5" />
            Create Note
          </Button>
        </div>
      ) : viewMode === "folders" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className={cn(
                "rounded-xl border transition-all",
                overGroupId === group.id &&
                  "border-brand ring-2 ring-brand/20 bg-brand/5",
                draggedNoteId && "drop-zone-active"
              )}
              onDragOver={(e) => handleDragOver(e, group.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, group.id)}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{
                  backgroundColor: group.color ? `${group.color}08` : undefined,
                  borderBottomColor: group.color ? `${group.color}20` : undefined,
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: group.color
                      ? `${group.color}15`
                      : "hsl(var(--muted))",
                    color: group.color || "hsl(var(--muted-foreground))",
                  }}
                >
                  <FolderOpen size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">
                    {group.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {group.notes.length} {group.notes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleNewNote(group.isUncategorized ? undefined : group.id)}
                  className="shrink-0"
                >
                  <Plus size={14} />
                </Button>
              </div>

              {group.notes.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Drag notes here to move them
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {group.notes.map((note) => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <NoteCard
                        note={note}
                        onEdit={handleNoteEdit}
                        onDelete={() => handleNoteDelete(note.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleNoteEdit}
              onDelete={() => handleNoteDelete(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
