"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * Applies `User.darkMode` from the session once after sign-in / refresh.
 * Does not re-apply on SessionProvider refetches, so a stale JWT cannot
 * override `next-themes` + localStorage after `ThemeToggle` updates the UI.
 */
export function ThemePreferenceSync() {
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();
  const appliedThemeForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      appliedThemeForUserId.current = null;
      return;
    }
    if (!session?.user?.id || typeof session.user.darkMode !== "boolean") {
      return;
    }
    if (appliedThemeForUserId.current === session.user.id) {
      return;
    }
    appliedThemeForUserId.current = session.user.id;
    setTheme(session.user.darkMode ? "dark" : "light");
  }, [status, session?.user?.id, session?.user?.darkMode, setTheme]);

  return null;
}
