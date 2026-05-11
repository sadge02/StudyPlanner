import { getUserNotes } from "@/lib/actions/note.actions";
import { getSubjects } from "@/lib/actions/subject.actions";
import { NotesView } from "@/components/notes/NotesView";
import type { NoteWithRelations } from "@/types";

export default async function NotesPage() {
  const [notesRes, subjectsRes] = await Promise.all([
    getUserNotes(),
    getSubjects(),
  ]);

  const notes = notesRes.success
    ? (notesRes.data as NoteWithRelations[] ?? [])
    : [];
  const subjects = subjectsRes.success ? subjectsRes.data ?? [] : [];

  return <NotesView initialNotes={notes} subjects={subjects} />;
}
