"use client";

import { Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { updateUserDarkMode } from "@/lib/actions/user-preferences.actions";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { status, update } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const current = (resolvedTheme ?? theme) || "light";
  const isDark = current === "dark";

  async function toggleTheme() {
    const nextIsDark = !isDark;
    const previousTheme = isDark ? "dark" : "light";
    setTheme(nextIsDark ? "dark" : "light");
    if (status !== "authenticated") return;
    try {
      await updateUserDarkMode(nextIsDark);
    } catch {
      setTheme(previousTheme);
      return;
    }
    try {
      await update({ user: { darkMode: nextIsDark } });
    } catch {
      /* JWT may lag until refetch; DB is already updated */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="shrink-0 text-muted-foreground hover:text-foreground"
      aria-label={!mounted ? "Toggle theme" : (isDark ? "Switch to light mode" : "Switch to dark mode")}
      disabled={!mounted}
      onClick={() => void toggleTheme()}
    >
      {!mounted ? (
        <span className="size-5" aria-hidden />
      ) : isDark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  );
}
