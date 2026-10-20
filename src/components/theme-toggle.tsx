"use client";
import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

export type AppTheme = "light" | "dark" | "system";

export function setAppTheme(value: AppTheme) {
  localStorage.setItem("ad-astra-theme", value);
  const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  window.dispatchEvent(new CustomEvent("ad-astra-theme-change", { detail: value }));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  useEffect(() => {
    const saved = localStorage.getItem("ad-astra-theme");
    const initialTheme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setTheme(initialTheme);
    applyTheme(initialTheme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => { if ((localStorage.getItem("ad-astra-theme") ?? "system") === "system") applyTheme("system"); };
    const syncTheme = (event: Event) => setTheme((event as CustomEvent<AppTheme>).detail);
    media.addEventListener("change", updateSystemTheme);
    window.addEventListener("ad-astra-theme-change", syncTheme);
    return () => { media.removeEventListener("change", updateSystemTheme); window.removeEventListener("ad-astra-theme-change", syncTheme); };
  }, []);
  function applyTheme(value: "light" | "dark" | "system") {
    const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;
  return <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-app-muted transition-colors hover:bg-app-accent-soft hover:text-app-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent" onClick={() => { setTheme(next); setAppTheme(next); }} aria-label={`Theme: ${theme}. Switch to ${next}`} title={`Theme: ${theme}. Switch to ${next}`}><Icon size={17} /></button>;
}
