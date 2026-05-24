"use client";

import { useTheme } from "@/lib/useTheme";

export default function GamesPage() {
  const { isDark } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Mini-Games</h1>
      <p className="text-zinc-500 mb-6">Spiele eine kurze Runde zum Entspannen.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border backdrop-blur-md ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white/40 border-zinc-200"}`}>
          <h3 className="text-xl font-semibold mb-2">🎮 Game 1</h3>
          <p className="text-sm text-zinc-500">Beschreibung des ersten Spiels.</p>
        </div>
        <div className={`p-6 rounded-2xl border backdrop-blur-md ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white/40 border-zinc-200"}`}>
          <h3 className="text-xl font-semibold mb-2">🕹️ Game 2</h3>
          <p className="text-sm text-zinc-500">Beschreibung des zweiten Spiels.</p>
        </div>
      </div>
    </div>
  );
}