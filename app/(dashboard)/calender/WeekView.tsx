import React, { useEffect, useRef } from 'react';
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
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 8 * 2 * 48; 
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Das Grid nutzt nun dynamische Spalten: 40px für Zeit, Rest verteilt auf 7 Tage */}
      <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] border-t border-border/10">
        
        {/* Header-Zeile */}
        <div className="sticky top-0 bg-background z-20 border-r border-border/10 h-10"></div>
        {days.map(day => (
          <div 
            key={day.toString()} 
            className={`flex flex-col items-center justify-center border-r border-border/10 h-10 sticky top-0 bg-background z-20 text-[10px] font-bold uppercase ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <span>{format(day, "EE", { locale: de })}</span>
            <span>{format(day, "d")}</span>
          </div>
        ))}

        {/* Raster-Zeilen */}
        {hours.map(hour => (
          ['00', '30'].map(minute => {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
            return (
              <React.Fragment key={timeStr}>
                <div className="text-[9px] text-muted-foreground text-center pt-1 border-r border-border/10 h-12">
                  {minute === '00' ? timeStr : ''}
                </div>
                {days.map((day, dIdx) => (
                    <div 
                        key={dIdx} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCellClick(day, timeStr);
                        }}
                        className="border-r border-b h-12 cursor-pointer hover:bg-accent/20 transition-colors"
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