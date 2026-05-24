"use client";
import Image from "next/image";
// Definition der benötigten Props
interface HeaderProps {
open: boolean;
setOpen: (open: boolean) => void;
isDark: boolean;
setTheme: (theme: "dark" | "light") => void;
}
export default function Header({
open,
setOpen,
isDark,
setTheme,
}: HeaderProps) {
return (
<header
className={`sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur-xl
border-b
${isDark ? "bg-black/60 border-zinc-800" : "bg-white/60 border-zinc-300"}`}
>
<button
onClick={() => setOpen(!open)}
className="text-2xl z-50"
>
{open ? "✕" : "☰"}
</button>
<button onClick={() => setOpen(false)}>
<Image
src={isDark ? "/logo_dark.png" : "/logo_light.png"}
alt="AIO Logo"
width={80}
height={80}
/>
</button>
<button
onClick={() =>
setTheme(isDark ? "light" : "dark")
}
className={`relative w-11 h-6 rounded-full transition-all duration-300
${isDark ? "bg-zinc-800" : "bg-zinc-300"}`}
>
<div

className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300
${isDark ? "left-1 bg-white" : "left-6 bg-black"}`}
/>
</button>
</header>
);
}