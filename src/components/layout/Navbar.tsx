"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, ChevronRight, Menu, Search, LogOut } from "lucide-react";
import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  kanban: "Kanban",
  tasks: "Tasks",
  calendar: "Calendar",
  subjects: "Subjects",
  projects: "Projects",
  notes: "Notes",
  analytics: "Analytics",
  settings: "Settings",
};

function formatSegment(seg: string) {
  const key = seg.toLowerCase();
  if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key];
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
}

function segmentLabel(seg: string, parentSeg?: string) {
  const mapped = SEGMENT_LABELS[seg.toLowerCase()];
  if (mapped) return mapped;
  const looksLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) ||
    seg.length >= 18;
  if (looksLikeId && parentSeg) {
    const parent = parentSeg.toLowerCase();
    if (parent === "subjects") return "Subject";
    if (parent === "projects") return "Project";
  }
  return formatSegment(seg);
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let path = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const parentSeg = i > 0 ? segments[i - 1] : undefined;
    path += `/${seg}`;
    let label = segmentLabel(seg, parentSeg);
    if (seg === "kanban") label = "Tasks";
    crumbs.push({ href: path, label });
  }
  return crumbs;
}

export function Navbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname() ?? "/dashboard";
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header
      className="grid h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-border border-b bg-background px-4 sm:grid-cols-[minmax(0,1fr)_28rem_minmax(0,1fr)] sm:gap-6 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-2 sm:justify-self-start">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 md:hidden"
          aria-label="Open navigation menu"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-5 text-muted-foreground" aria-hidden />
        </Button>

        <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden">
          <ol className="flex flex-wrap items-center gap-1 text-lg font-semibold text-foreground sm:text-base">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <Fragment key={crumb.href}>
                  {i > 0 && (
                    <ChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground/50"
                      aria-hidden
                    />
                  )}
                  <li className={isLast ? "min-w-0 truncate" : "min-w-0 shrink-0"}>
                    {isLast ? (
                      <span className="block truncate">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="hidden w-full min-w-0 sm:block sm:w-[28rem] sm:justify-self-center">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <label htmlFor="nav-search" className="sr-only">
            Search
          </label>
          <input
            id="nav-search"
            type="search"
            placeholder="Search..."
            aria-readonly="true"
            readOnly
            className="block w-full cursor-default rounded-full border border-input bg-muted/50 py-2 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="col-start-2 flex shrink-0 items-center justify-self-end gap-1 sm:col-start-3 sm:space-x-4">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications — coming soon"
          title="Notifications — coming soon"
          className="relative cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-background"
          />
        </button>

        <div className="mx-2 hidden h-8 w-px bg-border sm:block" />

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline-block">Log out</span>
        </button>
      </div>
    </header>
  );
}
