"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getHours, startOfMonth, endOfMonth, isSameDay, isToday} from "date-fns";
import { de } from "date-fns/locale";
import EventModal from "../components/EventModal";




export default function KalenderPage() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ date: "", time: "" });
  
  // Die Referenz für den Scroll-Container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hilfsfunktionen
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
  
  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Scroll-Effekt: Springt bei Ansichtswechsel auf 8:00 Uhr
  useEffect(() => {
    if (view !== 'month' && scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 80; 
    }
  }, [view]);

  // Daten laden (dein bestehender Code)
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth
      .getUser();
      if (user) {

        const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_uuid', user.id)
        .single();

        if (data) setProfile(data);
      }
      const { data } = await supabase
      .from('calendar_events')
      .select('*');
      if (data) setEvents(data);
    }
    loadData();
  }, []);

  const getDays = () => {
    if (view === "day") return [currentDate];
    if (view === "month") return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    return eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
  };

  const days = getDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Grid-Spalten Logik
  const gridTemplate = view === 'month' ? 'grid-cols-7' : view === 'day' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_repeat(7,1fr)]';

  const handleCellClick = (day: Date, hour?: number) => {
    setSelectedCell({
      date: format(day, "yyyy-MM-dd"),
      time: hour ? `${hour.toString().padStart(2, '0')}:00` : "09:00"
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">

      {/* Header mit dynamischen Farben */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card-bg shrink-0">
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy", { locale: de })}</h2>
        <div className="flex items-center gap-4">
          {profile && <span className="text-sm font-medium">Hallo, {profile.first_name}</span>}
          
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 border border-border rounded text-sm hover:bg-accent hover:text-accent-foreground">
            Heute
          </button>
          
          <select value={view} onChange={(e) => setView(e.target.value)} className="bg-background border border-border p-1 rounded text-sm">
            <option value="day">Tag</option>
            <option value="week">Woche</option>
            <option value="month">Monat</option>
          </select>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{profile ? `${(profile.first_name?.[0] || "")}${(profile.last_name?.[0] || "")}`.toUpperCase() : "JD"}</span>
            )}
          </div>
        </div>
      </div>


      <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto snap-x snap-mandatory"
          >
        <div 
          className={`grid ${view === 'month' ? 'grid-cols-7' : (view === 'day' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_repeat(7,1fr)]')} border-t border-l border-border`}
          style={{ minWidth: view === 'week' ? '800px' : 'auto' }}
        >
          {view !== 'month' && (
            <>
              {/* Die Sticky Zeit-Spalte */}
              <div className="bg-card-bg border-r border-b border-border sticky left-0 z-20" />
              {days.map((day) => (
                <div key={day.toString()} className={`p-2 text-center border-r border-b border-border 
                  ${isToday(day) ? 'bg-primary/20' : (isWeekend(day) ? 'bg-muted/40' : 'bg-card')}`}>
                  <div className="text-xs text-muted-foreground">{format(day, "EE", { locale: de })}</div>
                  <div className={`font-bold ${isWeekend(day) ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {format(day, "dd")}
                  </div>
                </div>
              ))}
            </>
          )}





          {/* Inhalt Zellen */}
{view === 'month' ? (
  <>
    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((dayName) => (
      <div key={dayName} className="p-2 text-center text-xs font-bold text-muted-foreground border-b border-border">
        {dayName}
      </div>
    ))}
    
    {/* Platzhalter */}
{Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
  <div 
    key={`empty-${i}`} 
    className="h-32 border-r border-b border-border bg-muted/10" 
  />
    ))}

    {/* Tatsächliche Tage */}
{days.map((day) => (
  <div 
    key={day.toString()} 
    onClick={() => handleCellClick(day, 9)} 
    className={`h-32 border-r border-b border-border p-2 cursor-pointer transition-colors flex flex-col items-start
      ${isWeekend(day) ? 'bg-muted' : 'bg-background'} 
      ${isDateToday(day) ? 'bg-blue-500/10' : ''} 
      hover:bg-accent/40`}
  >
    <span className={isToday(day) ? 'font-bold text-primary' : ''}>
      {format(day, "d")}
    </span>
  </div>
))}
  </>
) : (
            hours.map(hour => (
  <div key={hour} className="contents">
    {/* Zeit-Spalte (links) */}
    <div className="p-2 text-right text-xs border-r border-b border-border bg-card-bg text-muted-foreground">
      {hour}:00
    </div>

    {/* Tages-Zellen */}
{days.map((day, dayIndex) => (
  <div 
    key={dayIndex} 
    onClick={() => handleCellClick(day, hour)} 
    className={`relative border-r border-b border-border h-20 cursor-pointer transition-colors 
  ${isWeekend(day) ? 'bg-muted/30' : 'bg-background'} // <--- HIER
  ${isToday(day) ? 'bg-blue-500/10' : ''}             // <--- HIER
  hover:bg-accent/40`}
  >
    {/* Nur noch die Zeit-Linie in der Wochenansicht */}
    {isToday(day) && getHours(new Date()) === hour && (
      <div className="absolute top-[50%] left-0 w-full h-[2px] bg-red-500 z-10" />
    )}
    {events
          .filter(e => isSameDay(new Date(e.start_time), day) && getHours(new Date(e.start_time)) === hour)
          .map(e => (
            <div key={e.id} className="bg-primary text-primary-foreground text-[10px] p-1 m-1 rounded truncate">
              {e.title}
            </div>
          ))
        }
      </div>
    ))}
  </div>
))
          )}
        </div> {/* Schließt das Grid-Div */}
      </div> {/* Schließt das Flex-1 Overflow-Div */}

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedCell.date}
        defaultTime={selectedCell.time}
        


      onSave={async (data: any) => {
  try {
    // 1. Startzeit in Date-Objekt umwandeln
    const start = new Date(data.start_time);
    
    // 2. Endzeit berechnen (Startzeit + Dauer in Minuten)
    const duration = data.duration_minutes || 30;
    const end = new Date(start.getTime() + (duration * 60000));

    // 3. Supabase Insert
    const { error } = await supabase
      .from('calendar_events')
      .insert([{
        calendar_id: 1, // Prüfe, ob dies die richtige ID ist
        title: data.title,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: duration,
        is_private: !!data.is_private,
        is_all_day: !!data.is_all_day,
        description: data.description || "",
        location: data.location || ""
      }]);

    if (error) throw error;
    
    // 4. Nach Erfolg Modal schließen und Seite neu laden
    setIsModalOpen(false);
    window.location.reload();
    
  } catch (err) {
    console.error("Fehler:", err);
    alert("Speichern fehlgeschlagen: " + (err as any).message);
  }
}}




      />
    </div> /* Schließt das Haupt-Div */
  );
}