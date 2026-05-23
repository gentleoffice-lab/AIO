"use client";

import { useEffect, useState } from "react";

/**
 * Zentraler Hook für das Theme-Management.
 * Übernimmt das Laden und Speichern im LocalStorage automatisch.
 */
export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Beim Mounten: Theme aus LocalStorage laden
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  // Bei Änderung: Theme in LocalStorage sichern
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark: theme === "dark",
  };
}


