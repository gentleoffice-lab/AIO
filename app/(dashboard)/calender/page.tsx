"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval, getHours, 
  startOfMonth, endOfMonth, isSameDay, isToday 
} from "date-fns";
import { de } from "date-fns/locale";
import EventModal from "../components/EventModal";

export default function KalenderPage() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ date: "", time: "" });

 const handleCellClick = (day: Date, hour: number) => {
    setSelectedCell({
      date: format(day, "yyyy-MM-dd"),
      time: `${hour.toString().padStart(2, '0')}:00`
    });
    setIsModalOpen(true);
  };
  const getDays = () => {
    if (view === "day") return [currentDate];
    if (view === "month") {
      return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    }
    return eachDayOfInterval({ 
      start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
      end: endOfWeek(currentDate, { weekStartsOn: 1 }) 
    });
  };
  const days = getDays();
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  // Hilfsfunktion: Ist Tag Wochenende?
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    // Haupt-Hintergrund etwas heller als reines Schwarz (zinc-950)
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      
      {/* Header - Etwas heller (zinc-900) */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
        <h2 className="text-xl font-bold capitalize">{format(currentDate, "MMMM yyyy", { locale: de })}</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 border border-zinc-700 rounded text-sm hover:bg-zinc-800">Heute</button>
          <select value={view} onChange={(e) => setView(e.target.value)} className="bg-zinc-800 border border-zinc-700 p-1 rounded text-sm">
            <option value="week">Woche</option>
            <option value="day">Tag</option>
            <option value="month">Monat</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`grid ${view === 'month' ? 'grid-cols-7' : (view === 'day' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_repeat(7,1fr)]')} border-t border-l border-zinc-800`}>
          
          {/* Header der Spalten */}
          {view !== 'month' && (
            <>
              <div className="bg-zinc-900 border-r border-b border-zinc-800" />
              {days.map((day) => (
                <div key={day.toString()} className={`p-2 text-center border-r border-b border-zinc-800 ${isToday(day) ? 'bg-blue-900/30' : (isWeekend(day) ? 'bg-zinc-900/50' : 'bg-zinc-900')}`}>
                  <div className="text-xs uppercase text-zinc-400">{format(day, "EE", { locale: de })}</div>
                  <div className={`font-bold ${isWeekend(day) ? 'text-zinc-500' : 'text-zinc-100'}`}>{format(day, "dd")}</div>
                </div>
              ))}
            </>
          )}

          {/* Zellen Inhalt */}
          {hours.map(hour => (
            <div key={hour} className="contents">
              <div className="p-2 text-right text-xs border-r border-b border-zinc-800 bg-zinc-900 text-zinc-500">{hour}:00</div>
              {days.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  onClick={() => handleCellClick(day, hour)}
                  // Wochenende leicht dunkler markieren: 'bg-zinc-900/30'
                  className={`relative border-r border-b border-zinc-800 h-20 cursor-pointer hover:bg-zinc-800 ${isWeekend(day) ? 'bg-zinc-900/30' : 'bg-zinc-950'}`}
                >
                  {isToday(day) && getHours(new Date()) === hour && (
                    <div className="absolute left-0 right-0 border-t-2 border-red-500 z-10" />
                  )}
                  {/* ... Event Mapping bleibt gleich ... */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}