"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/useTheme"; // 1. THEME HIER IMPORTIERT

// 3. TFZF OPTIONEN ENTFARNT - Nur noch die zwei Standardrollen übrig
type RoleType = "free user" | "premium user";

export default function RegisterPage() {
  const router = useRouter();
  const { isDark } = useTheme(); // 1. IS_DARK EXTRACTED
  
  // Formular-States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); 
  
  // Standard-Rolle ist fest auf 'free user' gesetzt
  const [role] = useState<RoleType>("free user");

  // Status-States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validierung
    if (!email.trim() || !password || !confirmPassword || !username.trim()) {
      setErrorMsg("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setLoading(true);

      // 1. In Supabase Auth registrieren
      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            role: role, 
          },
        },
      });

      if (authError) {
        setErrorMsg(authError.message);
        return;
      }

      if (data?.user) {
        // 2. Insert in deine 'profiles' Tabelle
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            { 
              id: data.user.id, 
              username: username, 
              role: role,
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error("Profil-Erstellung in DB fehlgeschlagen:", profileError);
        }

        setSuccessMsg("Registrierung erfolgreich! Du wirst zum Dashboard weitergeleitet...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300
      ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      
      <div className={`w-full max-w-md p-8 rounded-2xl border backdrop-blur-xl space-y-6 text-center shadow-xl
        ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white/70"}`}>
        
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            Account erstellen
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Registriere dich für dein AIO-System</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-left">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-3">
            
            {/* Benutzername */}
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Benutzername</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z.B. MaxMustermann" 
              className={`w-full rounded-xl px-4 py-3 outline-none transition text-sm border
                ${isDark 
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"}`}
            />

            {/* E-Mail */}
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

            {/* Strategische Rollenauswahl (2. PREMIUM AUSGEGRAUT & 3. TFZF ENTFARNT) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">Konto-Typ wählen</label>
              
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border
                ${isDark ? "bg-zinc-950 border-zinc-800/60" : "bg-zinc-100 border-zinc-200"}`}>
                
                {/* Free User: Aktiv und vorausgewählt */}
                <button
                  type="button"
                  className={`py-2.5 rounded-lg text-xs font-semibold transition shadow-sm
                    ${isDark ? "bg-white text-black" : "bg-black text-white"}`}
                >
                  Free User
                </button>

                {/* Premium User: Deaktiviert, ausgegraut und mit Schloss-Symbol */}
                <button
                  type="button"
                  disabled
                  className="py-2.5 rounded-lg text-xs font-medium transition opacity-40 cursor-not-allowed flex items-center justify-center gap-1 bg-zinc-800/20 text-zinc-400 relative"
                >
                  🔒 Premium User
                  <span className="absolute -top-2 -right-1 bg-zinc-700 text-[8px] text-white px-1 py-0.5 rounded scale-90 font-bold tracking-wide uppercase shadow">
                    Bald
                  </span>
                </button>
              </div>
            </div>

            {/* Passwort */}
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Passwort (mind. 6 Zeichen)</label>
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

            {/* Passwort wiederholen */}
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen" 
              className={`w-full rounded-xl px-4 py-3 outline-none transition text-sm border
                ${isDark 
                  ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"}`}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-xl transition active:scale-[0.98] text-sm disabled:opacity-50 mt-4 shadow-md
              ${isDark 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-black text-white hover:bg-zinc-800"}`}
          >
            {loading ? "Konto wird erstellt..." : "Registrieren"}
          </button>
        </form>

        <div className="text-xs text-zinc-500 pt-2">
          Bereits ein Konto?{" "}
          <button 
            onClick={() => router.push("/login")} 
            className={`font-medium hover:underline ${isDark ? "text-white" : "text-black"}`}
          >
            Hier einloggen
          </button>
        </div>
      </div>
    </div>
  );
}