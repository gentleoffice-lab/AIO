"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getHours, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import EventModal from "../components/EventModal";
import { useAuth } from "../../(auth)/AuthContext";
import { addWeeks, subWeeks, addMonths, subMonths } from "date-fns"; // Import ergänzen!

import ListView from "./ListView";
import WeekView from "./WeekView";
//import MonthView from "./MonthView";

export default function KalenderPage() {
  // 1. Context nutzen
  const { calendarId, loading: authLoading } = useAuth();
  
  // 2. UI States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ date: "", time: "" });
  const [view, setView] = useState("week");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 3. Events laden, sobald calendarId aus dem Context bereit ist
  const fetchEvents = async () => {
    if (!calendarId) return;
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('calendar_id', calendarId);
      
    if (error) console.error("Event-Ladefehler:", error);
    else setEvents(data || []);
  };

  useEffect(() => {
    fetchEvents();
  }, [calendarId]);

  // 4. Hilfsfunktionen für das Grid
  const getDays = () => {
    if (view === "day") return [currentDate];
    if (view === "month") return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    return eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
  };

  const days = getDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleCellClick = (day: Date, hour?: number) => {
    setSelectedCell({
      date: format(day, "yyyy-MM-dd"),
      time: hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : "09:00"
    });
    setIsModalOpen(true);
  };

  // 5. Loading/Error States
  if (authLoading) return <div className="p-10">Wird geladen...</div>;
  if (!calendarId) return <div className="p-10">Kein Kalender gefunden. Bitte stellen Sie sicher, dass ein Kalender mit Ihrem Profil verknüpft ist.</div>;

  // ... (oberhalb im Code behältst du deine Logik bei)

  return (
    <div className="flex flex-col h-screen bg-background">





      {/* Header Bereich */}
      
<div className="flex items-center justify-between p-4 border-b border-border">
  {/* Linke Seite: Navigation & Datum */}
  <div className="flex items-center gap-4">
    <div className="text-xs text-muted-foreground">{currentDate.getFullYear()}</div>
    <div className="flex items-center gap-2">
      <button 
  onClick={() => setCurrentDate(prev => 
    view === "week" ? subWeeks(prev, 1) : subMonths(prev, 1)
  )} 
  className="p-2 hover:bg-accent rounded-full transition-colors"
>
  &lt;
</button>
      <h2 
  className="text-lg font-bold w-40 text-center cursor-pointer hover:text-primary transition-colors"
  onClick={() => {/* Hier später DatePicker für Jahr öffnen */}}
>
  {format(currentDate, view === "week" ? "dd. MMM" : "MMMM yyyy", { locale: de })}
</h2>
<button 
  onClick={() => setCurrentDate(prev => 
    view === "week" ? addWeeks(prev, 1) : addMonths(prev, 1)
  )} 
  className="p-2 hover:bg-accent rounded-full transition-colors"
>
  &gt;
</button>
    </div>
  </div>

  {/* Rechte Seite: Suche, Heute & User */}
  <div className="flex items-center gap-3">
    <button className="p-2 hover:bg-accent rounded">🔍</button>
    <button 
      onClick={() => setCurrentDate(new Date())} 
      className="px-3 py-1 text-sm border rounded hover:bg-accent"
    >
      Heute
    </button>
    
    {/* Hier wird später dein User-Icon aus dem Profil geladen */}
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
      👤
    </div>
  </div>
</div>


{/* View-Switcher */}
<div className="flex gap-2 p-2 border-b">
  {["day", "week", "month", "list"].map((v) => (
    <button 
      key={v}
      onClick={() => setView(v)}
      className={`px-3 py-1 text-sm rounded capitalize ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
    >
      {v}
    </button>
  ))}
</div>

{/* Hier laden wir die Ansicht dynamisch */}
<div className="flex-1 overflow-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
  {view === "list" && <ListView events={events} />}

  {view === "week" && (
  <WeekView 
  events={events} 
  currentDate={currentDate} 
  onCellClick={(date, time) => {
    setSelectedCell({ date: format(date, "yyyy-MM-dd"), time });
    setIsModalOpen(true);
  }} 
/>
)}

  {/* Weitere Views folgen... */}
</div>




      {/* TEST: Hier zeigen wir die geladenen Events als Liste an */}
      {/* Chronologische Liste der Termine */}
<div className="p-4 bg-card rounded-lg border border-border mt-4">
  <h3 className="font-semibold mb-4 text-lg">Bevorstehende Termine</h3>
  {events.length > 0 ? (
    <div className="space-y-3">
      {events.map((e) => (
        <div key={e.id} className="flex items-center p-3 bg-accent/50 rounded-md hover:bg-accent transition-colors">
          <div className="min-w-[120px] text-sm font-medium text-primary">
            {format(new Date(e.start_time), "dd.MM. HH:mm", { locale: de })}
          </div>
          <div className="flex-1">
            <p className="font-medium">{e.title}</p>
            {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Keine Termine geplant.</p>
  )}


</div>

      {/* Hier kommt später dein Gitter wieder hin */}
      {/* Floating Action Button für neue Termine */}
<button
  onClick={() => setIsModalOpen(true)}
  className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-50 border border-primary/20"
>
  +
</button>


{/* Das Modal wird hier permanent gerendert, aber nur bei isModalOpen = true sichtbar */}
<EventModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)}
  initialDate={selectedCell.date} 
  initialTime={selectedCell.time}
/>


    </div>
  );
}