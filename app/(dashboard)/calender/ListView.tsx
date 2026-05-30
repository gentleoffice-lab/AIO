import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ListViewProps {
  events: any[];
}

export default function ListView({ events }: ListViewProps) {
  // Sortiere Events nach Datum (aufsteigend)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  if (sortedEvents.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Keine Termine gefunden.</div>;
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div key={event.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center justify-center min-w-[60px]">
            <span className="text-2xl font-bold">{format(new Date(event.start_time), "dd")}</span>
            <span className="text-xs uppercase text-muted-foreground">
              {format(new Date(event.start_time), "MMM", { locale: de })}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{event.title}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(event.start_time), "HH:mm")} Uhr 
              {event.location ? ` • ${event.location}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}