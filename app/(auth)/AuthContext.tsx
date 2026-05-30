// app/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Profil und Kalender suchen
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_uuid', user.id).single();
        if (profile) {
          const { data: cal } = await supabase.from('calendars').select('id').eq('owner_id', profile.id).single();
          if (cal) setCalendarId(cal.id);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, calendarId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);