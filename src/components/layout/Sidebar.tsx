"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  SquareKanban,
  BookMarked,
  FolderKanban,
  StickyNote,
  LineChart,
  PanelLeftClose,
  PanelLeft,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Kanban", href: "/dashboard/kanban", icon: SquareKanban },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Subjects", href: "/dashboard/subjects", icon: BookMarked },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
];

function NavLinkRow({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isActive =
    item.exact === true
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center rounded-sm text-sm font-medium text-black transition-opacity",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-1.5",
        isActive
          ? "bg-white shadow-sm ring-1 ring-black/5"
          : "hover:opacity-75",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 text-slate-600",
          isActive && "text-black",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "truncate transition-[opacity,width] duration-200 ease-out",
          collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 border-slate-600/30 border-b px-4 pb-4 pt-6 text-center md:border-slate-500/25",
        collapsed && "px-3 pt-4 pb-2",
      )}
    >
      <div className={cn("mx-auto mb-3 flex justify-center", collapsed && "mb-2")}>
        <div className="rounded-md bg-slate-300 p-2 text-black ring-1 ring-black/10">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="block"
            aria-hidden
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>
      </div>
      <h2
        className={cn(
          "font-semibold tracking-tight text-black",
          collapsed ? "sr-only" : "text-2xl sm:text-3xl",
        )}
      >
        StudyPlanner
      </h2>
    </div>
  );
}

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function Sidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  const navSection = (
    <nav
      aria-label="Main navigation"
      className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
    >
      {!collapsed ? (
        <h3 className="px-4 font-semibold text-black text-xl">Menu</h3>
      ) : (
        <span className="sr-only">Main menu</span>
      )}
      <ul className="mt-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <NavLinkRow
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );

  const collapseToggle = (
    <div
      className={cn(
        "hidden shrink-0 border-slate-600/30 border-t p-3 md:block",
        collapsed ? "px-2" : "px-4",
      )}
    >
      <button
        type="button"
        onClick={() => onCollapsedChange(!collapsed)}
        className={cn(
          "flex w-full items-center rounded-sm py-2.5 font-medium text-black text-sm transition-opacity hover:opacity-75",
          collapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
        )}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="h-5 w-5 shrink-0" aria-hidden />
        ) : (
          <>
            <PanelLeftClose className="h-5 w-5 shrink-0 opacity-70" aria-hidden />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );

  const shellClass =
    "flex h-full flex-col rounded-md rounded-r-none bg-slate-200 md:h-auto md:min-h-0 md:rounded-md md:shadow-none";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/35 transition-opacity duration-200 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={() => onMobileOpenChange(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(17rem,calc(100vw-2.5rem))] flex-col transition-[transform,width] duration-200 ease-out md:relative md:z-0 md:h-full md:w-auto md:translate-x-0 md:rounded-md",
          shellClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[4.75rem]" : "md:w-1/4 md:max-w-[18rem]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between rounded-t-md rounded-r-none bg-slate-200 pt-4 pr-4 pl-5 md:hidden">
          <Link
            href="/dashboard"
            className={cn(
              "min-w-0 flex-1 text-center font-semibold text-black text-2xl",
            )}
            onClick={() => onMobileOpenChange(false)}
          >
            StudyPlanner
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-sm p-2 text-black transition-opacity hover:opacity-75"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="hidden rounded-t-md md:block">
          <BrandMark collapsed={collapsed} />
        </div>

        {navSection}
        {collapseToggle}
      </aside>
    </>
  );
}
