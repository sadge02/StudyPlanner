import TodaysBoard from "@/components/dashboard/TodaysBoard";
import NextClassBanner from "@/components/dashboard/NextClassBanner";
import GeneralTodosWidget from "@/components/dashboard/GeneralTodosWidget";
import { auth } from "@/lib/auth";
import {
  getProductivityTrends,
  getTodaysTasks,
  getUserTasks,
} from "@/lib/actions/task.actions";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const session = await auth();

  const todaysTasks = (await getTodaysTasks()).data ?? [];
  const todos = (await getUserTasks()).data ?? [];

  const today = new Date();
  const name = session?.user?.name ? `, ${session.user.name}` : "";

  const trends = (await getProductivityTrends()).data ?? [];
  const totalDone = trends.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-bold">
          {getGreeting()}
          {name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <TodaysBoard initialTasks={todaysTasks} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <NextClassBanner />
          <GeneralTodosWidget tasks={todos} />
        </div>
      </div>
    </div>
  );
}
