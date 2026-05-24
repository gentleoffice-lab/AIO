"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import DashboardLayout from "./(dashboard)/layout"; 
// 1. IMPORTIERE DEINEN SUPABASE CLIENT
import { supabase } from "@/lib/supabaseClient"; 

interface Widget {
  id: string;
  title: string;
  icon: string;
  visible: boolean;
  size: "normal" | "wide";
  content: string;
}

export default function DashboardOverview() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 2. DER ECHTE AUTH-CHECK
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Holt die aktuelle Sitzung direkt live aus Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Keine Session da? Ab zum Login!
          router.push("/login");
        } else {
          // Session gültig? Dashboard freischalten!
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Sitzung:", error);
        router.push("/login");
      }
    };

    checkUserSession();

    // Optional aber hochprofessionell: Höre auf Änderungen (z.B. Logout in einem anderen Tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsLoggedIn(false);
        router.push("/login");
      } else if (session) {
        setIsLoggedIn(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // ... (Der gesamte restliche Widget- und Grid-Code bleibt exakt so wie er ist!)

  // 2. WIDGET-STATE (Deine Kacheln und Einstellungen)
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "chat", title: "KI-Chat", icon: "💬", visible: true, size: "normal", content: "Schneller Zugriff auf deine KI-Assistenten." },
    { id: "calender", title: "Kalender", icon: "📅", visible: true, size: "normal", content: "Deine nächsten Termine auf einen Blick." },
    { id: "notes", title: "Notizen", icon: "📝", visible: true, size: "wide", content: "Letzter Gedanke: Next.js Dashboard mit Widgets bauen!" },
    { id: "games", title: "Mini-Games", icon: "🎮", visible: true, size: "normal", content: "Highscore: 2.450 Punkte." },
    { id: "pdfscanner", title: "PDF Scanner", icon: "📄", visible: true, size: "normal", content: "Zieh Dokumente hierher zum Digitalisieren." },
  ]);

  // Funktion zum Umschalten der Sichtbarkeit (Ein-/Ausblenden)
  const toggleVisibility = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  // Funktion zum Ändern der Größe (Normal vs. Breit)
  const toggleSize = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, size: w.size === "normal" ? "wide" : "normal" } : w));
  };

  // 3. LADE-ANIMATION (Prüfungsphase)
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Sitzung wird geprüft...</p>
      </div>
    );
  }

  // 4. DASHBOARD MIT HEADER UND MENU RENDERN
  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header & Steuerungsbereich */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Dein Dashboard</h1>
            <p className="text-zinc-500 text-sm">Schön, dass du wieder da bist! Passe dein Interface an.</p>
          </div>

          {/* Steuerungsknöpfe zum Ein-/Ausblenden */}
          <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-wrap gap-2 text-xs
            ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white/40 border-zinc-200"}`}>
            <span className="text-zinc-500 self-center mr-2 font-medium">Widgets:</span>
            {widgets.map(w => (
              <button
                key={w.id}
                onClick={() => toggleVisibility(w.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition active:scale-95
                  ${w.visible 
                    ? (isDark ? "bg-white text-black" : "bg-black text-white") 
                    : (isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-200 text-zinc-400")}`}
              >
                {w.icon} {w.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamisches Kachel-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {widgets
            .filter(w => w.visible)
            .map(widget => (
              <div
                key={widget.id}
                className={`group relative rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:shadow-lg
                  ${widget.size === "wide" ? "md:col-span-2" : "col-span-1"}
                  ${isDark ? "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700" : "bg-white/30 border-zinc-200/80 hover:border-zinc-300"}`}
              >
                {/* Widget Toolbar */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleSize(widget.id)}
                    title={widget.size === "normal" ? "Breit machen" : "Normalgröße"}
                    className={`p-1.5 rounded-md text-xs border transition active:scale-90
                      ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    {widget.size === "normal" ? "↔️" : "↕️"}
                  </button>
                  <button
                    onClick={() => toggleVisibility(widget.id)}
                    title="Ausblenden"
                    className={`p-1.5 rounded-md text-xs border transition active:scale-90
                      ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-red-400" : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-red-50"}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Widget-Inhalt */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl p-2 bg-zinc-500/10 rounded-xl">{widget.icon}</span>
                    <h3 className="text-lg font-semibold tracking-tight">{widget.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed pr-10">{widget.content}</p>
                </div>

                {/* Aktionsbutton */}
                <div className="mt-6 pt-4 border-t border-zinc-500/10 flex justify-end">
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition
                    ${isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"}`}>
                    Öffnen →
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Feedback, wenn alles ausgeblendet ist */}
        {widgets.filter(w => w.visible).length === 0 && (
          <div className={`w-full p-12 rounded-2xl border text-center border-dashed
            ${isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-300 text-zinc-400"}`}>
            <p className="text-base mb-2">Alle Widgets ausgeblendet.</p>
            <p className="text-xs">Nutze die Steuerungsleiste oben, um deine Tools wieder hinzuzufügen.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}