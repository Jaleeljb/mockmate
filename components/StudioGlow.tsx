"use client";

export default function StudioGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="orb h-[420px] w-[420px] animate-[floaty_14s_ease-in-out_infinite]"
        style={{ top: "-8%", left: "-6%", background: "rgba(227, 168, 87, 0.16)" }}
      />
      <div
        className="orb h-[380px] w-[380px] animate-[floaty_18s_ease-in-out_infinite_reverse]"
        style={{ bottom: "-10%", right: "-8%", background: "rgba(111, 162, 135, 0.14)" }}
      />
    </div>
  );
}
