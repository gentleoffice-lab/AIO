"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { useTheme } from "@/lib/useTheme";
import Link from "next/link";

export default function PdfScannerPage() {
  const { isDark } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Kamera beim Laden der Seite starten
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Nutzt bevorzugt die Rückkamera beim Handy
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Kamera-Zugriff verweigert:", err);
        setCameraError("Kamera konnte nicht gestartet werden. Bitte erlaube den Zugriff.");
      }
    }

    startCamera();

    // Clean-up: Kamera ausschalten, wenn die Seite verlassen wird
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Dokument abfotografieren
  const captureDocument = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Bild als Data-URL speichern
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
      }
    }
  };

  // PDF generieren und herunterladen
  const downloadPdf = () => {
    if (!capturedImage) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4"
    });

    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Bild proportional an A4 anpassen
      const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;
      
      // Zentriert auf dem PDF platzieren
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(capturedImage, "JPEG", x, y, width, height);
      pdf.save("gescanntes_dokument.pdf");
    };
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 px-6 py-10 flex flex-col items-center
      ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-500/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PDF Scanner</h1>
            <p className="text-xs text-zinc-500">Dokumente digitalisieren</p>
          </div>
          <Link 
            href="/"
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            ← Dashboard
          </Link>
        </div>

        {cameraError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {cameraError}
          </div>
        )}

        {/* Scan- & Preview-Fenster */}
        <div className={`overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-md relative ${
          isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-white border-zinc-200"
        }`}>
          <canvas ref={canvasRef} className="hidden" />

          {!capturedImage ? (
            <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Overlay-Rahmen für Dokumente */}
              <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-lg pointer-events-none flex items-center justify-center">
                <p className="text-xs text-white/60 bg-black/40 px-2 py-1 rounded">Dokument hier ausrichten</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={capturedImage} 
                alt="Scan Vorschau" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Steuerungstasten */}
        <div className="flex gap-4">
          {!capturedImage ? (
            <button
              onClick={captureDocument}
              disabled={!!cameraError}
              className="flex-1 text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl transition shadow-md active:scale-95"
            >
              📸 Foto aufnehmen
            </button>
          ) : (
            <>
              <button
                onClick={() => setCapturedImage(null)}
                className={`flex-1 text-center text-sm font-medium py-3 rounded-xl transition border ${
                  isDark 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" 
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                🔄 Erneut versuchen
              </button>
              <button
                onClick={downloadPdf}
                className="flex-1 text-center text-sm font-semibold bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl transition shadow-md active:scale-95"
              >
                📥 PDF speichern
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}