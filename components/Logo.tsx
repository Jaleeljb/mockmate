/**
 * The OneMock mark: a single open ring with a bright lead dot — read equally
 * as a camera aperture, a countdown ring, and the "one" the product is named
 * for. It's the one shape used everywhere the product needs to identify
 * itself, from the nav bar to the favicon.
 */
export function LogoMark({ className = "", size = 26 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle
        cx="16"
        cy="16"
        r="12.5"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="2.2"
      />
      <circle
        cx="16"
        cy="16"
        r="12.5"
        stroke="url(#onemock-ring)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="58 78.5"
        transform="rotate(-90 16 16)"
      />
      <circle cx="16" cy="3.5" r="2.4" fill="url(#onemock-dot)" />
      <defs>
        <linearGradient id="onemock-ring" x1="3.5" y1="3.5" x2="28.5" y2="28.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9BFFF" />
          <stop offset="1" stopColor="#8B7CFF" />
        </linearGradient>
        <linearGradient id="onemock-dot" x1="13.6" y1="1.1" x2="18.4" y2="5.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9BFFF" />
          <stop offset="1" stopColor="#8B7CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({
  className = "",
  markClassName = "text-signal",
  size = 26,
}: {
  className?: string;
  markClassName?: string;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} size={size} />
      <span className="font-display text-lg font-semibold tracking-tight text-paper">
        one<span className="text-signal">mock</span>
      </span>
    </span>
  );
}
