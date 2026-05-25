"use client";

import { useState } from "react";
import { useTheme } from "@/lib/useTheme";

export default function ChatPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${isDark ? "text-white" : "text-black"}`}>
      
      {/* Header Bereich */}
      <div className={`p-4 border-b ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
        <h1 className="text-xl font-bold">KI-Assistent</h1>
      </div>

      {/* Nachrichten Bereich */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <p>Keine Nachrichten. Starte ein Gespräch!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-2xl max-w-lg ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} 
              ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"}`}>
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* Eingabebereich */}
      <div className={`p-4 border-t ${isDark ? "bg-zinc-950/50 border-zinc-800" : "bg-white/50 border-zinc-200"}`}>
        <div className={`max-w-4xl mx-auto flex items-center gap-3 p-2 rounded-xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Schreibe eine Nachricht..."
            className="flex-1 bg-transparent px-2 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            className={`px-4 py-2 rounded-lg font-semibold transition ${isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"}`}
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}