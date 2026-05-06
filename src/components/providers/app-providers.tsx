"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemePreferenceSync } from "@/components/providers/theme-preference-sync";

function isSignInFormPath(pathname: string | null) {
  return pathname === "/login" || pathname === "/register";
}

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const signInFormOnly = isSignInFormPath(pathname);

  return (
    <SessionProvider session={session}>
      <ThemeProvider forcedTheme={signInFormOnly ? "light" : undefined}>
        <ThemePreferenceSync skip={signInFormOnly} />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
