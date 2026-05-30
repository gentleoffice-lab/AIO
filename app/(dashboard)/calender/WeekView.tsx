import React from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface WeekViewProps {
  events: any[];
  currentDate: Date;
  onCellClick: (day: Date, time: string) => void;
}

export default function WeekView({ events, currentDate, onCellClick }: WeekViewProps) {
  const days = eachDayOfInterval({ 
    start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
    end: endOfWeek(currentDate, { weekStartsOn: 1 }) 
  });

  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 bis 23:00

  return (
    <div className="w-full -mx-4 px-0">
      <div className="grid grid-cols-8 border-t border-border/10">
        
        {/* Header-Zeile: Hier nur die Wochentage */}
        <div className="border-r border-border/10 h-12"></div>
        {days.map(day => (
          <div key={day.toString()} className={`p-2 text-center border-r border-border/10 text-xs font-semibold ${isToday(day) ? 'bg-primary/10' : ''}`}>
            {format(day, "EE dd.", { locale: de })}
          </div>
        ))}

        {/* Raster-Zeilen: Hier ist timeStr definiert */}
        {hours.map(hour => (
          ['00', '30'].map(minute => {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
            return (
              <React.Fragment key={timeStr}>
                <div className="text-[10px] text-muted-foreground text-right pr-2 border-r border-border/10 h-12 flex items-center justify-end">
                  {minute === '00' ? timeStr : ''}
                </div>
                {days.map((day, dIdx) => (
                    <div 
                        key={dIdx} 
                        onClick={(e) => {
                        e.stopPropagation(); // Stoppt das Bubbling
                        console.log("Klick registriert auf:", day, timeStr); // Debug-Log
                        onCellClick(day, timeStr);
                        }}
                        className="border-r border-b h-12 cursor-pointer hover:bg-accent/20 transition-colors pointer-events-auto z-10"
                    />
                    ))}
              </React.Fragment>
            );
          })
        ))}
      </div>
    </div>
  );
}