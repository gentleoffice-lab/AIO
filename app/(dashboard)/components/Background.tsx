"use client";

export default function Background({
  isDark,
}: {
  isDark: boolean;
}) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      <div
        className={`absolute top-[-240px] left-1/2 -translate-x-1/2
        w-[950px] h-[950px] rounded-full blur-3xl opacity-[0.05]
        transition-all duration-[2000ms]
        ${isDark ? "bg-white" : "bg-black"}`}
      />

      <div
        className={`absolute bottom-[-260px] right-[-160px]
        w-[650px] h-[650px] rounded-full blur-3xl opacity-[0.04]
        animate-pulse transition-all duration-[2000ms]
        ${isDark ? "bg-zinc-400" : "bg-zinc-500"}`}
      />

    </div>
  );
}