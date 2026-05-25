"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import { supabase } from "@/lib/supabaseClient"; 

interface Widget {
  id: string;
  title: string;
  icon: string;
  visible: boolean;
  size: "normal" | "wide";
  content: string;
  isPremium: boolean;
}

// Typisches Android Material-Design QR-Code Icon als SVG
const AndroidQrIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
  </svg>
);

export default function DashboardOverview() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ECHTER AUTH-CHECK
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/login");
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Sitzung:", error);
        router.push("/login");
      }
    };

    checkUserSession();

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

  // WIDGET-STATE
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "chat", title: "KI-Chat", icon: "💬", visible: true, size: "normal", content: "Schneller Zugriff auf deine KI-Assistenten.", isPremium: false },
    { id: "calender", title: "Kalender", icon: "📅", visible: true, size: "normal", content: "Deine nächsten Termine auf einen Blick.", isPremium: false },
    { id: "notes", title: "Notizen", icon: "📝", visible: true, size: "wide", content: "Letzter Gedanke: Next.js Dashboard mit Widgets bauen!", isPremium: false },
    { id: "games", title: "Mini-Games", icon: "🎮", visible: true, size: "normal", content: "Spiele eine schnelle Runde zwischendurch.", isPremium: false },
    { id: "pdfscanner", title: "PDF Scanner", icon: "📄", visible: true, size: "normal", content: "Scanne deine Dokumente direkt in die Cloud.", isPremium: false },
  ]);

  const toggleVisibility = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const toggleSize = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, size: w.size === "normal" ? "wide" : "normal" } : w));
  };

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Sitzung wird geprüft...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-6 py-10 space-y-10 transition-colors duration-300">
        
        {/* Header-Bereich */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-500/10 pb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              {/* GEÄNDERT: Inline-Style erzwingt echtes Weiß (#ffffff) im Dark Mode und dunkles Grau (#18181b) im Light Mode */}
              <h1 
                className="text-3xl font-bold tracking-tight mb-1" 
                style={{ color: isDark ? "#ffffff" : "#18181b" }}
              >
                Dein Dashboard
              </h1>
              <p className="text-zinc-500 text-sm">Schön, dass du wieder da bist! Passe dein Interface an.</p>
            </div>
            
            {/* Android QR-Code Button */}
            <button 
              title="QR-Code scannen" 
              className={`p-3 rounded-xl border transition active:scale-95 shadow-sm ml-4 flex items-center justify-center
                ${isDark 
                  ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" 
                  : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"}`}
            >
              <AndroidQrIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Scroll-Leiste */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <div className={`p-1.5 rounded-xl border backdrop-blur-md inline-flex items-center gap-1.5 text-xs whitespace-nowrap min-w-full md:min-w-0
              ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white/40 border-zinc-200"}`}>
              {widgets.map(w => (
                <button
                  key={w.id}
                  onClick={() => toggleVisibility(w.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition inline-flex items-center gap-1.5 shrink-0
                    ${w.visible 
                      ? (isDark ? "bg-white text-black font-semibold" : "bg-black text-white font-semibold") 
                      : (isDark ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border border-zinc-200/60")}`}
                >
                  <span className="text-sm">{w.icon}</span> 
                  <span>{w.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamisches Kachel-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {widgets
            .filter(w => w.visible)
            .map(widget => (
              <div
                key={widget.id}
                className={`group relative rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300
                  ${widget.size === "wide" ? "md:col-span-2" : "col-span-1"}
                  ${isDark 
                    ? "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:shadow-lg" 
                    : "bg-white/30 border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg"}`}
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
                    <span className="text-2xl p-2 rounded-xl bg-zinc-500/10">{widget.icon}</span>
                    {/* GEÄNDERT: Auch die Widget-Titel nutzen jetzt Inline-Styles zur Farberzwingung */}
                    <h3 
                      className="text-lg font-semibold tracking-tight"
                      style={{ color: isDark ? "#ffffff" : "#18181b" }}
                    >
                      {widget.title}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed pr-10">{widget.content}</p>
                </div>

                {/* Aktionsbutton */}
                <div className="mt-6 pt-4 border-t border-zinc-500/10 flex justify-end">
                  <button 
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition
                      ${isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"}`}
                  >
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
            <p className="text-xs">Nutze die Menüleiste oben, um deine Tools wieder einzublenden.</p>
          </div>
        )}
      </div>
    </>
  );
}