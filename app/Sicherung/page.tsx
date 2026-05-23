"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Hilfskomponente für die Sidebar-Links (vermeidet Redundanz)
function SidebarLink({ href, label, close }: { href: string; label: string; close: () => void }) {
  return (
    <Link
      href={href}
      onClick={close}
      className="block transition-all duration-300 hover:translate-x-2 hover:opacity-70"
    >
      {label}
    </Link>
  );
}

export default function Dashboard() {
  // ==========================================================
  // 1. STATES & LOGIK
  // ==========================================================
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Willkommen bei AIO Chat." }
  ]);

  const isDark = theme === "dark";

  // Theme laden & speichern
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Nachrichten senden
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", text: input },
      { role: "ai", text: "Antwort wird später verbunden." }
    ];

    setMessages(newMessages);
    setInput("");
  };

  // Enter-Taste abfangen
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  // ==========================================================
  // 2. RENDERING
  // ==========================================================
  return (
    <main className={`min-h-screen overflow-x-hidden transition-all duration-500
      ${isDark ? "bg-black text-white" : "bg-[#f5f5f4] text-black"}`}>

      {/* --- HINTERGRUND --- */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute top-[-240px] left-1/2 -translate-x-1/2 w-[950px] h-[950px] rounded-full blur-3xl opacity-[0.05] transition-all duration-[2000ms]
          ${isDark ? "bg-white" : "bg-black"}`} />
        <div className={`absolute bottom-[-260px] right-[-160px] w-[650px] h-[650px] rounded-full blur-3xl opacity-[0.04] animate-pulse transition-all duration-[2000ms]
          ${isDark ? "bg-zinc-400" : "bg-zinc-500"}`} />
      </div>

      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-xl border-b
        ${isDark ? "bg-black/60 border-zinc-800" : "bg-white/60 border-zinc-300"}`}>
        
        <button onClick={() => setOpen(!open)} className="text-2xl z-50">
          {open ? "✕" : "☰"}
        </button>

        <button onClick={() => setOpen(false)}>
          <Image
            src={isDark ? "/logo_dark.png" : "/logo_light.png"}
            alt="AIO Logo" width={80} height={80}
          />
        </button>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isDark ? "bg-zinc-800" : "bg-zinc-300"}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${isDark ? "left-1 bg-white" : "left-6 bg-black"}`} />
        </button>
      </header>

      {/* --- CHAT-BEREICH --- */}
      <section className="relative h-[calc(100vh-81px)] flex flex-col">
        <div className="relative flex-1 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-4xl mx-auto px-6 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm transition-all
                    ${msg.role === "user"
                      ? (isDark ? "bg-white text-black" : "bg-black text-white")
                      : (isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200")
                    }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className={`border-t backdrop-blur-xl ${isDark ? "border-zinc-800 bg-black/70" : "border-zinc-300 bg-white/70"}`}>
          <div className="max-w-4xl mx-auto px-6 py-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben..."
              className={`flex-1 rounded-2xl px-4 py-3 outline-none ${isDark ? "bg-zinc-900 text-white" : "bg-white text-black"}`}
            />
            <button onClick={sendMessage} className={`px-6 py-3 rounded-2xl transition ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
              Send
            </button>
          </div>
        </div>
      </section>

      {/* --- SIDEBAR & OVERLAY --- */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 transition-all duration-300 ease-in-out
          ${open ? "opacity-100 pointer-events-auto bg-black/50 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
      />

      <aside className={`fixed top-0 left-0 z-40 h-full w-[300px] transition-transform duration-500 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${isDark ? "bg-zinc-950/85 text-white border-zinc-800" : "bg-white/85 text-black border-zinc-300"}
          backdrop-blur-2xl border-r shadow-2xl flex flex-col`}
      >
        <div className="relative p-6 flex justify-center border-b border-inherit">
          <button onClick={() => setOpen(false)} className="absolute left-4 top-1/2 -translate-y-1/2">✕</button>
          <Image src={isDark ? "/logo_dark.png" : "/logo_light.png"} alt="AIO" width={100} height={100} />
        </div>

        <nav className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <p className="text-zinc-500 uppercase text-xs tracking-[0.25em]">Main</p>
            <SidebarLink href="/" label="Chat" close={() => setOpen(false)} />
            <SidebarLink href="/game" label="Game" close={() => setOpen(false)} />
          </div>
          <div className="space-y-4">
            <p className="text-zinc-500 uppercase text-xs tracking-[0.25em]">Tools</p>
            <SidebarLink href="/tools/rechner" label="Rechner" close={() => setOpen(false)} />
            <SidebarLink href="/tools/notizen" label="Notizen" close={() => setOpen(false)} />
          </div>
        </nav>
      </aside>
    </main>
  );
}