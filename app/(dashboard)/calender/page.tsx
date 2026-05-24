"use client";

import { useTheme } from "@/lib/useTheme";

export default function KalenderPage() {
  const { isDark } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Kalender</h1>
      <p className="text-zinc-500 mb-6">Verwalte deine Termine und Ereignisse.</p>
      
      {/* Platzhalter-Box für dein Kalender-UI */}
      <div className={`w-full h-96 rounded-2xl border flex items-center justify-center backdrop-blur-md
        ${isDark ? "bg-zinc-900/40 border-zinc-800 text-zinc-400" : "bg-white/40 border-zinc-200 text-zinc-600"}`}>
        📅 Kalender-Modul wird hier integriert.
      </div>
    </div>
  );
}