"use client";

export default function Waveform({ active }: { active: boolean }) {
  const bars = [6, 14, 22, 14, 8, 18, 10, 20, 12, 6];
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-amber transition-all duration-300 ${
            active ? "animate-pulseRec" : "opacity-30"
          }`}
          style={{
            height: active ? `${h}px` : "4px",
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
