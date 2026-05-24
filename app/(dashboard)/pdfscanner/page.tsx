"use client";

import { useTheme } from "@/lib/useTheme";

export default function PDFScannerPage() {
  const { isDark } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">PDF Scanner</h1>
      <p className="text-zinc-500 mb-6">Dokumente hochladen und digitalisieren.</p>
      
      <div className={`w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center backdrop-blur-md p-6
        ${isDark ? "bg-zinc-900/20 border-zinc-800 text-zinc-400" : "bg-white/20 border-zinc-300 text-zinc-600"}`}>
        <span className="text-4xl mb-3">📄</span>
        <p className="text-sm font-medium mb-1">Zieh deine Dateien hierher oder klicke zum Auswählen</p>
        <p className="text-xs text-zinc-500">Unterstützt PDF, PNG, JPG</p>
      </div>
    </div>
  );
}