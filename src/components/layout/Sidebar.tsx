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
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Tasks", href: "/dashboard/kanban", icon: SquareKanban },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { label: "Subjects", href: "/dashboard/subjects", icon: BookMarked },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
];

function BookLogo() {
  return (
    <div className="shrink-0 rounded-md bg-blue-600 p-1.5 shadow-sm">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        aria-hidden
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    </div>
  );
}

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
        "flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          isActive ? "text-sidebar-primary" : "text-muted-foreground",
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
      className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
    >
      {!collapsed ? (
        <div className="mb-4 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Main Menu
        </div>
      ) : (
        <span className="sr-only">Main menu</span>
      )}
      {navItems.map((item) => (
        <NavLinkRow
          key={item.href}
          item={item}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={() => onMobileOpenChange(false)}
        />
      ))}
    </nav>
  );

  const collapseToggle = (
    <div
      className={cn(
        "hidden border-sidebar-border border-t p-4 md:block",
        collapsed ? "px-3" : "px-4",
      )}
    >
      <button
        type="button"
        onClick={() => onCollapsedChange(!collapsed)}
        className={cn(
          "flex w-full items-center rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          collapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
        )}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft
            className="h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : (
          <>
            <PanelLeftClose
              className="h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={() => onMobileOpenChange(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[4px_0_24px_rgb(0,0,0,0.06)] transition-[transform,width] duration-200 ease-out md:relative md:z-0 md:translate-x-0 dark:shadow-[4px_0_24px_rgb(0,0,0,0.2)] md:border-r",
          "w-[min(16rem,calc(100vw-2rem))]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[4.75rem]" : "md:w-64",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-sidebar-border border-b px-6 md:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <BookLogo />
            <span className="truncate font-bold text-lg text-sidebar-foreground tracking-tight">
              StudyPlanner
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="hidden h-16 shrink-0 border-sidebar-border border-b px-6 md:flex md:items-center">
          {collapsed ? (
            <div className="flex w-full justify-center">
              <BookLogo />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <BookLogo />
              <span className="truncate font-bold text-lg text-sidebar-foreground tracking-tight">
                StudyPlanner
              </span>
            </div>
          )}
        </div>

        {navSection}
        {collapseToggle}
      </aside>
    </>
  );
}
