// app/(dashboard)/layout.tsx
"use client";

import { useTheme } from "@/lib/useTheme";
import Header from "./components/Header";
import Background from "./components/Background";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function SidebarLink({ href, label, close }: { href: string; label: string; close: () => void }) {
  return (
    <Link href={href} onClick={close} className="block transition-all duration-300 hover:translate-x-2 hover:opacity-70">
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className={`min-h-screen overflow-x-hidden transition-all duration-500 ${isDark ? "bg-black text-white" : "bg-[#f5f5f4] text-black"}`}>
      
      <Background isDark={isDark} />

      <Header open={open} setOpen={setOpen} isDark={isDark} setTheme={setTheme} />

      <main>{children}</main>

      <div onClick={() => setOpen(false)} className={`fixed inset-0 z-30 transition-all duration-300 ${open ? "opacity-100 pointer-events-auto bg-black/50 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`} />
      
      <aside className={`fixed top-0 left-0 z-40 h-full w-[300px] transition-transform duration-500 ${open ? "translate-x-0" : "-translate-x-full"} ${isDark ? "bg-zinc-950/85 text-white border-zinc-800" : "bg-white/85 text-black border-zinc-300"} backdrop-blur-2xl border-r shadow-2xl flex flex-col`}>
        <div className="relative p-6 flex justify-center border-b border-inherit">
          <button onClick={() => setOpen(false)} className="absolute left-4 top-1/2 -translate-y-1/2">✕</button>
          <Image src={isDark ? "/logo_dark.png" : "/logo_light.png"} alt="AIO" width={100} height={100} />
        </div>

        <nav className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <p className="text-zinc-500 uppercase text-xs tracking-[0.25em]">Main</p>
            <SidebarLink href="/" label="Dashboard" close={() => setOpen(false)} />
            <SidebarLink href="/chat" label="Chat" close={() => setOpen(false)} />
            <SidebarLink href="/components/Games" label="Games" close={() => setOpen(false)} />
          </div>
          <div className="space-y-4">
            <p className="text-zinc-500 uppercase text-xs tracking-[0.25em]">Tools</p>
            <SidebarLink href="/calender" label="Kalender" close={() => setOpen(false)} />
            <SidebarLink href="/components/Tfzf Trainer" label="Tfzf Trainer" close={() => setOpen(false)} />
            <SidebarLink href="/components/Rechner" label="Rechner" close={() => setOpen(false)} />
            <SidebarLink href="/components/Notizen" label="Notizen" close={() => setOpen(false)} />
            <SidebarLink href="/components/Upload" label="Upload" close={() => setOpen(false)} />
            <SidebarLink href="/pdfscanner" label="PDF Scannen" close={() => setOpen(false)} />
          </div>
          <div className="space-y-4">
            <p className="text-zinc-500 uppercase text-xs tracking-[0.25em]">Optionen</p>
            <SidebarLink href="/components/Einstellungen" label="Einstellungen" close={() => setOpen(false)} />
            <SidebarLink href="/components/Impressum" label="Impressum" close={() => setOpen(false)} />
          </div>
        </nav>
      </aside>
    </div>
  );
}