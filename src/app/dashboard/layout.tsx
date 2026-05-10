import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/lib/auth";
import { getActiveStudySession } from "@/lib/actions/session.actions";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const activeSessionResponse = await getActiveStudySession();
  const activeStudySession = activeSessionResponse.data
    ? {
        id: activeSessionResponse.data.id,
        startTime: activeSessionResponse.data.startTime.toISOString(),
      }
    : null;

  return (
    <AppShell activeStudySession={activeStudySession}>{children}</AppShell>
  );
}
