"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Verhindert Hydration-Fehler (Button wird erst auf dem Client gerendert)
  useEffect(() => {
    setMounted(true);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password) {
      setErrorMsg("Bitte fülle alle Felder aus.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      router.push("/");
    } catch (err) {
      setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}` },
      });
      if (error) setErrorMsg(`Google-Login fehlgeschlagen: ${error.message}`);
    } catch (err) {
      console.error("Fehler beim OAuth-Flow:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 bg-background text-foreground">
      
      {/* Box Hintergrund und Border */}
      <div className="w-full max-w-md p-8 rounded-2xl border backdrop-blur-xl space-y-6 text-center shadow-xl border-border bg-card-bg/70">
        
        {/* Header-Bereich: Button oben rechts, Text zentral */}
        <div className="relative mb-8">
          {/* Switch-Button absolut oben rechts */}
          {mounted && (
            <div className="absolute right-0 -top-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative w-11 h-6 rounded-full transition-all duration-300 bg-border border border-border shadow-inner"
                aria-label="Theme umschalten"
              >
                <div 
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-foreground 
                  ${theme === "dark" ? "left-6" : "left-1"}`} 
                />
              </button>
            </div>
          )}

          {/* Text zentral */}
          <div className="text-center pt-4">
            <h2 className="text-2xl font-bold tracking-tight">Anmelden</h2>
            <p className="text-sm text-zinc-500 mt-1">Logge dich in dein AIO-System ein</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">E-Mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400 dark:focus:border-zinc-600"
            />

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Passwort</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold rounded-xl transition active:scale-[0.98] text-sm disabled:opacity-50 mt-2 shadow-md bg-foreground text-background hover:opacity-90"
          >
            {loading ? "Wird geprüft..." : "Einloggen"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs font-medium">oder</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl border font-medium text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm bg-card-bg border-border hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="font-bold text-base">G</span> Mit Google anmelden
        </button>

        <div className="text-xs text-zinc-500 pt-2">
          Noch kein Konto?{" "}
          <button 
            onClick={() => router.push("/register")} 
            className="font-medium hover:underline text-foreground"
          >
            Hier registrieren
          </button>
        </div>
      </div>
    </div>
  );
}