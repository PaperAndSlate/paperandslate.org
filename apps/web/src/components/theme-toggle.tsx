"use client";

import { Moon, Sun, Desktop } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("paper-slate-theme");
    const next = saved === "light" || saved === "dark" ? saved : "system";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
    setMounted(true);
  }, []);

  function changeTheme(next: "system" | "light" | "dark") {
    setTheme(next);
    if (next === "system") window.localStorage.removeItem("paper-slate-theme");
    else window.localStorage.setItem("paper-slate-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <label className="theme-control">
      <span className="sr-only">Color theme</span>
      {mounted && theme === "dark" ? <Moon aria-hidden size={16} /> : null}
      {mounted && theme === "light" ? <Sun aria-hidden size={16} /> : null}
      {mounted && theme === "system" ? <Desktop aria-hidden size={16} /> : null}
      <select
        aria-label="Color theme"
        value={mounted ? theme : "system"}
        onChange={(event) => changeTheme(event.currentTarget.value as "system" | "light" | "dark")}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
