"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // Standardmäßig aktiviert
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Bitte fülle alle Felder aus.");
      setLoading(false);
      return;
    }

    try {
      // Supabase-Sitzung konfigurieren basierend auf "Eingeloggt bleiben"
      // 'local' speichert dauerhaft, 'session' löscht beim Schließen des Tabs
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push("/");
      }
    } catch (err) {
      setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setErrorMsg("Google-Login konnte nicht gestartet werden.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Willkommen bei AIO</h2>
          <p className="text-sm text-zinc-500 mt-1">Bitte logge dich in deinen Account ein</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl font-medium transition active:scale-[0.98] text-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? "Verbindung wird hergestellt..." : "Mit Google anmelden"}
        </button>

        <div className="relative flex py-2 items-center text-xs text-zinc-600">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 uppercase tracking-wider">oder</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* E-Mail Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3 text-left">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail-Adresse" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />
          </div>

          {/* NEU: Eingeloggt bleiben Checkbox */}
          <div className="flex items-center justify-between text-xs px-1 py-1">
            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-white focus:ring-0 accent-white w-4 h-4"
              />
              <span className="group-hover:text-zinc-300 transition">Eingeloggt bleiben</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl transition hover:bg-zinc-200 active:scale-[0.98] text-sm disabled:opacity-50"
          >
            {loading ? "Wird geprüft..." : "Einloggen"}
          </button>
        </form>

        {/* NEU: Link zur Registrierung */}
        <div className="text-xs text-zinc-500 pt-2">
          Noch kein Konto?{" "}
          <button onClick={() => router.push("/register")} className="text-white hover:underline font-medium">
            Jetzt registrieren
          </button>
        </div>
      </div>
    </div>
  );
}