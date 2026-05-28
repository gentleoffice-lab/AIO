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

  // Wichtig für Next.js: Sicherstellen, dass die Komponente erst 
  // auf dem Client gerendert wird, um Hydration-Fehler zu vermeiden.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Gibt einen Platzhalter in der richtigen Größe zurück, 
    // um ein Layout-Springen zu verhindern.
    return (
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-xl border-b bg-white/60 border-zinc-300 dark:bg-black/60 dark:border-zinc-800 transition-colors duration-300">
        <div className="w-8 h-8" /> 
        <div className="w-20 h-20" />
        <div className="w-11 h-6 rounded-full bg-zinc-300 dark:bg-zinc-800" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b bg-white border-zinc-300 dark:bg-black dark:border-zinc-800">
      
      {/* Menü-Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className="text-2xl z-50 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Menü öffnen/schließen"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Logo - CSS Wechsel */}
      <div className="flex items-center">
        <Image
          src="/logo_light.png"
          alt="AIO Logo"
          width={80}
          height={80}
          className="block dark:hidden object-contain"
        />
        <Image
          src="/logo_dark.png"
          alt="AIO Logo"
          width={80}
          height={80}
          className="hidden dark:block object-contain"
        />
      </div>

      {/* Theme-Toggle */}
      {/* Theme-Toggle */}
{/* Theme-Toggle */}
<button
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="relative w-12 h-6 rounded-full transition-all duration-300 bg-border shadow-inner overflow-hidden border border-border"
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