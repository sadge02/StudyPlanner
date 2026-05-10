import { SubjectForm } from "@/components/subjects/SubjectForm";

export default function NewSubjectPage() {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Create Subject</h1>
      <SubjectForm />
    </div>
  );
}
