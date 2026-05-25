"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  // Standardmäßig auf "dark", oder was du bevorzugst
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Beim Mounten: Theme aus LocalStorage laden
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // WICHTIG: Sobald sich das Theme ändert, die Klasse im HTML-Tag umschreiben!
  useEffect(() => {
    localStorage.setItem("theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark: theme === "dark",
  };
}