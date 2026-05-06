"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Applies the signed-in user's `darkMode` DB preference to next-themes.
 * Anonymous users keep theme from localStorage only.
 */
export function ThemePreferenceSync() {
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof session?.user?.darkMode !== "boolean") return;
    setTheme(session.user.darkMode ? "dark" : "light");
  }, [status, session?.user?.darkMode, setTheme]);

  return null;
}
