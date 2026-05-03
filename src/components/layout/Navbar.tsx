"use client";

import { signOut } from "next-auth/react";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  // Create a simple breadcrumb from the pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentPageList = segments.length > 1 
    ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1) 
    : "Dashboard";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center">
        <button type="button" className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-900 rounded-md">
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">{currentPageList}</h2>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-4">
        <div className="hidden sm:block relative mr-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors"
          />
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center space-x-2 p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline-block text-sm font-medium">Log out</span>
        </button>
      </div>
    </header>
  );
}
