"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type RoleType = "free user" | "premium user" | "free TFZF" | "premium TFZF";

export default function RegisterPage() {
  const router = useRouter();
  
  // Formular-States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); 
  
  // Neue, verfeinerte Rollen-Struktur (Standard ist 'free user')
  const [role, setRole] = useState<RoleType>("free user");

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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Account erstellen</h2>
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
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Benutzername</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z.B. MaxMustermann" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">E-Mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />

            {/* Strategische Rollenauswahl */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">Konto-Typ wählen</label>
              
              {/* Haupt-Zielgruppe: Große, prominente Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setRole("free user")}
                  className={`py-2.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                    role === "free user" 
                      ? "bg-white text-black font-semibold shadow-md" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Free User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("premium user")}
                  className={`py-2.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                    role === "premium user" 
                      ? "bg-white text-black font-semibold shadow-md" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ✉️ Premium User
                </button>
              </div>

              {/* Randgruppe: Klein, unauffällig und farblich zurückhaltend */}
              <div className="flex justify-center gap-4 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setRole("free TFZF")}
                  className={`text-[11px] font-medium transition hover:underline ${
                    role === "free TFZF" 
                      ? "text-white font-bold underline" 
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  Für Free TFZF registrieren
                </button>
                <button
                  type="button"
                  onClick={() => setRole("premium TFZF")}
                  className={`text-[11px] font-medium transition hover:underline ${
                    role === "premium TFZF" 
                      ? "text-white font-bold underline" 
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  Für Premium TFZF registrieren
                </button>
              </div>
            </div>

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Passwort (mind. 6 Zeichen)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />

            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen" 
              className="w-full rounded-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl transition hover:bg-zinc-200 active:scale-[0.98] text-sm disabled:opacity-50 mt-4"
          >
            {loading ? "Konto wird erstellt..." : "Registrieren"}
          </button>
        </form>

        <div className="text-xs text-zinc-500 pt-2">
          Bereits ein Konto?{" "}
          <button onClick={() => router.push("/login")} className="text-white hover:underline font-medium">
            Hier einloggen
          </button>
        </div>
      </div>
    </div>
  );
}