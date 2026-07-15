const TAGS = [
  "Resume-aware questions",
  "Runs fully in your browser",
  "Voice or typed answers",
  "15-minute minimum session",
  "Zero accounts, zero cost",
  "Rule-based feedback report",
  "PDF · DOCX · TXT support",
  "Private by design",
];

export default function MarqueeStrip() {
  const track = [...TAGS, ...TAGS];
  return (
    <div className="border-y border-mist/10 bg-surface/30 py-5">
      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-paper/30">
        What every session includes
      </p>
      <div className="group relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent" />
        <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
          {track.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="whitespace-nowrap rounded-full border border-mist/20 bg-surfaceHover/60 px-4 py-1.5 text-xs text-paper/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
