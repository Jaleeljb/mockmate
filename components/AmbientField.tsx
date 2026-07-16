"use client";

/**
 * The quiet motion layer behind every screen: a hairline aperture grid,
 * two slow-drifting color fields, and one oversized ring echoing the
 * logomark. Everything here is z-0 and pointer-events-none — atmosphere,
 * not UI.
 */
export default function AmbientField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aperture-field" />

      <div
        className="orb h-[440px] w-[440px] animate-drift"
        style={{ top: "-10%", left: "-8%", background: "rgba(139, 124, 255, 0.15)" }}
      />
      <div
        className="orb h-[380px] w-[380px] animate-drift"
        style={{ bottom: "-12%", right: "-8%", background: "rgba(61, 220, 151, 0.08)", animationDelay: "-9s" }}
      />

      <svg
        className="absolute -right-24 top-1/3 hidden animate-ringSpin opacity-[0.05] sm:block"
        width="520"
        height="520"
        viewBox="0 0 32 32"
        fill="none"
      >
        <circle cx="16" cy="16" r="14" stroke="#F4F2EC" strokeWidth="0.6" strokeDasharray="4 3" />
      </svg>
    </div>
  );
}
