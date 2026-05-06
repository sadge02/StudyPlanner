import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
      <div className="w-full max-w-lg space-y-4 rounded-lg border border-border bg-card p-8 text-center text-card-foreground shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Welcome to your Dashboard,{" "}
          {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>

        <p className="text-muted-foreground">
          This is a simple placeholder. Your main dashboard content will go here.
        </p>
      </div>
    </div>
  );
}
