"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export type ShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-black antialiased">
      <Navbar user={user} onOpenMobileNav={() => setMobileSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 gap-6 px-4 py-6 sm:px-8 sm:py-8 md:px-10">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onMobileOpenChange={setMobileSidebarOpen}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <main className="container mx-auto max-w-6xl min-h-0 flex-1 overflow-y-auto px-0 pb-12 sm:px-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
