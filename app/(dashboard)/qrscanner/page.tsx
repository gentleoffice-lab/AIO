"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useTheme } from "@/lib/useTheme";
import Link from "next/link";

export default function QrScannerPage() {
  const { isDark } = useTheme();
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    // Der Scanner wird an die ID "reader" gebunden
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,                 // Bilder pro Sekunde
        qrbox: { width: 250, height: 250 }, // Größe des Scan-Fensters
      },
      /* verbose= */ false
    );

    // Wenn ein QR-Code erfolgreich erkannt wurde
    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear(); // Kamera stoppen nach Erfolg
      },
      (error) => {
        // Optionale Fehlerbehandlung während der Echtzeitsuche (wird hier ignoriert, um Log-Spam zu vermeiden)
      }
    );

    // Clean-up: Kamera stoppen, wenn der User die Seite verlässt
    return () => {
      scanner.clear().catch((error) => console.error("Scanner Clean-up Fehler:", error));
    };
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 px-6 py-10 flex flex-col items-center
      ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-500/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR-Code Scanner</h1>
            <p className="text-xs text-zinc-500">Halte einen QR-Code in die Kamera</p>
          </div>
          <Link 
            href="/"
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Scan-Fenster */}
        <div className={`overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-md ${
          isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-white border-zinc-200"
        }`}>
          {/* In dieses Div rendert die Library das Kamera-Feed */}
          <div id="reader" className="w-full overflow-hidden rounded-xl"></div>
        </div>

        {/* Ergebnis-Anzeige */}
        {scanResult && (
          <div className={`p-5 rounded-2xl border space-y-3 animate-fade-in ${
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-md"
          }`}>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ergebnis gefunden:</p>
            <div className={`p-3 rounded-xl text-sm break-all font-mono select-all ${
              isDark ? "bg-black/40 text-green-400" : "bg-zinc-100 text-green-700"
            }`}>
              {scanResult}
            </div>
            {scanResult.startsWith("http") && (
              <a
                href={scanResult}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl transition"
              >
                Link im Browser öffnen ↗
              </a>
            )}
            <button
              onClick={() => window.location.reload()}
              className={`w-full text-center text-xs font-medium py-2 rounded-xl transition ${
                isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              Erneut scannen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}