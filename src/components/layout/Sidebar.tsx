"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Kanban, BookOpen, Presentation, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Tasks", href: "/dashboard/kanban", icon: Kanban },
    { label: "Projects", href: "/dashboard/projects", icon: Presentation },
    { label: "Notes", href: "/dashboard/notes", icon: BookOpen },
    { label: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgb(0,0,0,0.02)]">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="bg-blue-600 p-1.5 rounded-md mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">StudyPlanner</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Link
          href="/dashboard/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-slate-400" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
