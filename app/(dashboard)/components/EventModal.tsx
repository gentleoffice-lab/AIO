"use client";
import { useState, useRef, useEffect } from "react";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; 
  initialTime?: string;
  calendarId: number | null; // Wichtig: Typisierung!
  onSave: (data: any) => Promise<void>;
}




export default function EventModal({ isOpen, onClose, onSave, initialDate, initialTime, calendarId }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    start_time: initialDate && initialTime ? `${initialDate}T${initialTime  }` : "",
    duration_minutes: 30, // Standard 30 Minuten
    is_private: false,
    location: "",
    description: ""
  });

  const modalRef = useRef(null);

  const handleSave = async () => {
    if (!calendarId) {
      alert("Fehler: Kein Kalender zugewiesen!");
      return;
    }
    await onSave({ ...formData, calendar_id: calendarId });
}

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // WICHTIG: Hier prüfen wir, ob modalRef.current überhaupt existiert
      if (modalRef.current && !(modalRef.current as any).contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl w-full max-w-md shadow-2xl text-zinc-100">
        <h3 className="text-2xl font-bold mb-6">Neuer Termin</h3>
        
        <div className="space-y-4">
          {/* Titel */}
          <input placeholder="Titel hinzufügen" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
            onChange={e => setFormData({...formData, title: e.target.value})} />

          {/* Von-Zeit & Dauer Dropdown in einer Reihe */}
          <div className="flex gap-2">
            <input type="datetime-local" className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
              value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
            
            <select className="w-24 p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
              value={formData.duration_minutes}
              onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}>
              <option value="15">15 Min</option>
              <option value="30">30 Min</option>
              <option value="45">45 Min</option>
              <option value="60">60 Min</option>
            </select>
          </div>

          {/* Ort & Privat-Check */}
          <input placeholder="Ort hinzufügen" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
            onChange={e => setFormData({...formData, location: e.target.value})} />
            
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" className="accent-blue-500" onChange={e => setFormData({...formData, is_private: e.target.checked})} /> Privat (nur für mich sichtbar)
          </label>

          {/* Beschreibung */}
          <textarea placeholder="Beschreibung oder Link hinzufügen" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none h-24"
            onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">Zurück</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition font-bold">Speichern</button>
        </div>
      </div>
    </div>
  );
}