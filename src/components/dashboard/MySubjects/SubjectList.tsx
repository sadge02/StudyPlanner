import { getUserSubjectsStats } from "@/lib/actions/subject.actions";
import Link from "next/link";
import { SubjectCard } from "./SubjectCard";
import { Button } from "@/components/ui/button";

export const SubjectList = async () => {
  const response = await getUserSubjectsStats();
  const subjects = response.data ?? [];

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">My Courses</h2>
        <Link href="/dashboard/subjects">
          <Button variant="outline" size="sm" className="shadow">
            View All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
