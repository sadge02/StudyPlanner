"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * Applies the signed-in user's `darkMode` DB preference to next-themes.
 * Uses a stable key so we don't call `setTheme` while JWT still has a stale
 * `darkMode` during a toggle (avoids flicker).
 */
export function ThemePreferenceSync() {
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();
  const lastAppliedKey = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      lastAppliedKey.current = null;
      return;
    }
    if (typeof session.user.darkMode !== "boolean") return;

    const key = `${session.user.id}:${session.user.darkMode}`;
    if (lastAppliedKey.current === key) return;
    lastAppliedKey.current = key;
    setTheme(session.user.darkMode ? "dark" : "light");
  }, [status, session?.user?.id, session?.user?.darkMode, setTheme]);

  return null;
}
