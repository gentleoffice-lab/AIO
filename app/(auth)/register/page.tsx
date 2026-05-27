"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "next-themes";

type RoleType = "free user" | "premium user";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Verhindert Hydration-Fehler
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Formular-States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [role] = useState<RoleType>("free user");

  // Status-States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password || !confirmPassword || !username.trim()) {
      setErrorMsg("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role } },
      });

      if (authError) throw authError;

      if (data?.user) {
        await supabase.from("profiles").insert([{ 
          id: data.user.id, 
          username, 
          role,
          updated_at: new Date().toISOString()
        }]);

        setSuccessMsg("Registrierung erfolgreich! Weiterleitung...");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 bg-background text-foreground">
      
      <div className="w-full max-w-md p-8 rounded-2xl border backdrop-blur-xl space-y-6 text-center shadow-xl border-border bg-card-bg/70">
        
        {/* Header mit Switch-Button */}
        <div className="relative mb-8">
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

          <div className="text-center pt-4">
            <h2 className="text-2xl font-bold tracking-tight">Account erstellen</h2>
            <p className="text-sm text-zinc-500 mt-1">Registriere dich für dein AIO-System</p>
          </div>
        </div>

        {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-left">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-left">{successMsg}</div>}

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Benutzername</label>
            <input 
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="z.B. MaxMustermann" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400"
            />

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">E-Mail</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400"
            />

            {/* Rollenauswahl */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">Konto-Typ wählen</label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-background border-border">
                <button type="button" className="py-2.5 rounded-lg text-xs font-semibold transition shadow-sm bg-foreground text-background">Free User</button>
                <button type="button" disabled className="py-2.5 rounded-lg text-xs font-medium transition opacity-40 cursor-not-allowed bg-zinc-800/20 text-zinc-400">🔒 Premium (Bald)</button>
              </div>
            </div>

            <label className="text-xs font-semibold text-zinc-400 block -mb-1">Passwort</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400"
            />
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen" 
              className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border bg-background border-border focus:border-zinc-400"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3 font-semibold rounded-xl transition active:scale-[0.98] text-sm disabled:opacity-50 mt-4 shadow-md bg-foreground text-background hover:opacity-90"
          >
            {loading ? "Wird erstellt..." : "Registrieren"}
          </button>
        </form>

        <div className="text-xs text-zinc-500 pt-2">
          Bereits ein Konto?{" "}
          <button onClick={() => router.push("/login")} className="font-medium hover:underline text-foreground">
            Hier einloggen
          </button>
        </div>
      </div>
    </div>
  );
}