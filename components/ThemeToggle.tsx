"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-emerald-400 transition hover:bg-zinc-800 hover:text-emerald-300 light:border-emerald-600/30 light:bg-white light:text-emerald-700 light:hover:bg-zinc-100"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
