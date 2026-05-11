"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import type { ActiveTimerSnapshot } from "@/components/analytics/ActiveTimerIndicator";

export type ShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AppShell({
  activeStudySession,
  children,
}: {
  activeStudySession: ActiveTimerSnapshot | null;
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          activeStudySession={activeStudySession}
          onOpenMobileNav={() => setMobileSidebarOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
