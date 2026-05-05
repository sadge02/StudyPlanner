"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { DropdownMenu } from "radix-ui";

import type { ShellUser } from "@/components/layout/AppShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  kanban: "Kanban",
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
    crumbs.push({
      href: path,
      label: segmentLabel(seg, parentSeg),
    });
  }
  return crumbs;
}

function initialsFrom(user: ShellUser) {
  const base = user.name?.trim() || user.email?.split("@")[0] || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

export function Navbar({
  user,
  onOpenMobileNav,
}: {
  user: ShellUser;
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname() ?? "/dashboard";
  const crumbs = buildBreadcrumbs(pathname);
  const primary = user.name?.trim() || user.email?.split("@")[0] || "Account";
  const secondary = user.email && user.name ? user.email : null;

  return (
    <header className="shrink-0 bg-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-4 sm:px-10">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 md:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 md:hidden [&_svg]:text-black"
            aria-label="Open navigation menu"
            onClick={onOpenMobileNav}
          >
            <Menu className="size-5" aria-hidden />
          </Button>

          <Link
            href="/dashboard"
            className="shrink-0 bg-slate-200 px-5 py-2 font-medium text-black text-sm"
          >
            StudyPlanner
          </Link>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex flex-wrap items-center gap-1 font-medium text-sm text-black">
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <Fragment key={crumb.href}>
                    {i > 0 && (
                      <ChevronRight className="size-3.5 shrink-0 text-black/35" aria-hidden />
                    )}
                    <li className="min-w-0">
                      {isLast ? (
                        <span className="bg-white px-4 py-1.5">{crumb.label}</span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="truncate text-black transition-opacity hover:opacity-75"
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

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-black opacity-60 hover:bg-black/5 hover:text-black hover:opacity-100"
            aria-label="Notifications — coming soon"
            title="Notifications — coming soon"
          >
            <Bell className="size-5" aria-hidden />
          </Button>

          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 gap-2 rounded-sm border border-black/10 bg-slate-200 px-2 text-black hover:bg-white/80",
              )}
              aria-label="Open account menu"
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- OAuth URLs are dynamic and not configured in next.config
                <img
                  src={user.image}
                  alt=""
                  className="size-8 rounded-sm object-cover"
                />
              ) : (
                <span
                  className="flex size-8 items-center justify-center rounded-sm bg-white font-semibold text-black text-xs"
                  aria-hidden
                >
                  {initialsFrom(user)}
                </span>
              )}
              <span className="hidden max-w-[8rem] truncate text-left text-sm font-medium sm:block">
                {primary}
              </span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={6}
                align="end"
                className={cn(
                  "z-50 min-w-[12rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
                )}
              >
                <div className="border-slate-100 border-b px-2 py-2">
                  <p className="truncate font-medium text-slate-900 text-sm">{primary}</p>
                  {secondary ? (
                    <p className="truncate text-slate-500 text-xs">{secondary}</p>
                  ) : null}
                </div>
                <DropdownMenu.Item
                  asChild
                  className="cursor-pointer rounded-md px-2 py-2 text-slate-700 text-sm outline-none select-none data-highlighted:bg-slate-100"
                >
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-slate-100" />
                <DropdownMenu.Item
                  className="cursor-pointer rounded-md px-2 py-2 text-red-600 text-sm outline-none select-none data-highlighted:bg-red-50"
                  onSelect={() => signOut({ callbackUrl: "/login" })}
                >
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
