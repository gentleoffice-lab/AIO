"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Header({ open, setOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Definition des Styles als Variable, um Redundanz und Fehler zu vermeiden
  const headerBaseStyles = "sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-xl border-b bg-card-bg/80 border-border transition-colors duration-300";

  if (!mounted) {
    return <header className={headerBaseStyles} />;
  }

  return (
    <header className={headerBaseStyles}>
      {/* Menü-Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className="text-2xl z-50 p-2 rounded-lg hover:bg-border transition-colors text-foreground"
        aria-label="Menü öffnen/schließen"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Logo - Logik statt CSS-Klassen */}
      <div className="flex items-center">
        <Image
          src={theme === "dark" ? "/logo_dark.png" : "/logo_light.png"}
          alt="AIO Logo"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      {/* Theme-Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="relative w-12 h-6 rounded-full transition-all duration-300 bg-background shadow-inner overflow-hidden border border-border"
        aria-label="Theme umschalten"
      >
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-foreground 
          ${theme === "dark" ? "left-7" : "left-1"}`} 
        />
      </button>
    </header>
  );
}