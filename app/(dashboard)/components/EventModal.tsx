"use client";
import { useState, useEffect } from "react";

export default function EventModal({ isOpen, onClose, onSave, defaultDate, defaultTime }: any) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState(defaultTime || "");

  // Update bei Klick in Zelle
  useEffect(() => {
    setDate(defaultDate);
    setTime(defaultTime);
  }, [defaultDate, defaultTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card-bg p-6 rounded-2xl w-full max-w-sm border border-border">
        <h3 className="text-xl font-bold mb-4">Neuer Termin</h3>
        <input placeholder="Titel" className="w-full p-2 mb-3 bg-background border rounded" onChange={(e) => setTitle(e.target.value)} />
        <input type="date" value={date} className="w-full p-2 mb-3 bg-background border rounded" onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} className="w-full p-2 mb-4 bg-background border rounded" onChange={(e) => setTime(e.target.value)} />
        
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 hover:bg-border rounded">Abbrechen</button>
          <button 
            onClick={() => onSave({ title, startTime: `${date}T${time}:00Z`, duration: 30 })} 
            className="px-4 py-2 bg-foreground text-background rounded"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}