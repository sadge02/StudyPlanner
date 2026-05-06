"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemePreferenceSync } from "@/components/providers/theme-preference-sync";

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ThemePreferenceSync />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
