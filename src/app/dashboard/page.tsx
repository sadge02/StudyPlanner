import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
      <div className="w-full max-w-lg p-8 space-y-4 bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-blue-50/50 text-center">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome to your Dashboard, {session?.user?.name?.split(' ')[0] || "User"}!
        </h1>
        
        <p className="text-slate-500">
          This is a simple placeholder. Your main dashboard content will go here.
        </p>
      </div>
    </div>
  );
}
