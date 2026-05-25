"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/useTheme"; // Theme-Support geladen

export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme(); // Prüft, ob Hell- oder Dunkelmodus aktiv ist

  // Formular-States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Status-States
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. NORMALER E-MAIL & PASSWORT LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Bitte fülle alle Felder aus.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Erfolgreich? Ab zum Dashboard!
      router.push("/");
    } catch (err) {
      setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  // 2. NEU: HIER IST DER COCH-BEFEHL FÜR GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Leitet den Nutzer nach dem Google-Login direkt auf deine Hauptseite (Dashboard)
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) {
        setErrorMsg(`Google-Login fehlgeschlagen: ${error.message}`);
      }
    } catch (err) {
      console.error("Fehler beim OAuth-Flow:", err);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300
      ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      
      <div className={`w-full max-w-md p-8 rounded-2xl border backdrop-blur-xl space-y-6 text-center shadow-xl
        ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white/70"}`}>
        
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            Anmelden
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Logge dich in dein AIO-System ein</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        {/* Normales E-Mail Login Formular */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">E-Mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com" 
              className={`w-full rounded-xl px-4 py-3 outline-none transition text-sm border
                ${isDark 
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"}`}
            />

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Passwort</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className={`w-full rounded-xl px-4 py-3 outline-none transition text-sm border
                ${isDark 
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"}`}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-xl transition active:scale-[0.98] text-sm disabled:opacity-50 mt-2 shadow-md
              ${isDark 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-black text-white hover:bg-zinc-800"}`}
          >
            {loading ? "Wird geprüft..." : "Einloggen"}
          </button>
        </form>

        {/* TRENNELEMENT */}
        <div className="relative flex py-2 items-center">
          <div className={`flex-grow border-t ${isDark ? "border-zinc-800" : "border-zinc-200"}`}></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs font-medium">oder</span>
          <div className={`flex-grow border-t ${isDark ? "border-zinc-800" : "border-zinc-200"}`}></div>
        </div>

        {/* 3. GOOGLE BUTTON JETZT MIT ONCLICK VERKNÜPFT */}
        <button
          type="button"
          onClick={handleGoogleLogin} // <-- HIER WIRD DIE FUNKTION AUSGELÖST
          className={`w-full py-3 rounded-xl border font-medium text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm
            ${isDark 
              ? "bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-800" 
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"}`}
        >
          {/* Ein kleines Google-Icon aus Textzeichen oder ein passendes Emoji */}
          <span className="font-bold text-base">G</span> Mit Google anmelden
        </button>

        <div className="text-xs text-zinc-500 pt-2">
          Noch kein Konto?{" "}
          <button 
            onClick={() => router.push("/register")} 
            className={`font-medium hover:underline ${isDark ? "text-white" : "text-black"}`}
          >
            Hier registrieren
          </button>
        </div>
      </div>
    </div>
  );
}