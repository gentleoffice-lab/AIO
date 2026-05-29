"use client";
import { useState, useRef, useEffect } from "react";

export default function EventModal({ isOpen, onClose, onSave, defaultDate, defaultTime }) {
  const [formData, setFormData] = useState({
    title: "",
    start_time: defaultDate && defaultTime ? `${defaultDate}T${defaultTime}` : "",
    duration_minutes: 30,
    is_all_day: false,
    description: ""
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-zinc-100">
        <h3 className="text-2xl font-bold mb-6">Neuer Termin</h3>
        <div className="space-y-4">
          <input placeholder="Titel" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
            onChange={e => setFormData({...formData, title: e.target.value})} />
          <input type="datetime-local" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
            value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          <input type="number" placeholder="Dauer (Minuten)" className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none"
            value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})} />
        </div>
        <button onClick={() => onSave(formData)} className="w-full mt-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition">
          Speichern
        </button>
      </div>
    </div>
  );
}