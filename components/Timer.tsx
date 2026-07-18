"use client";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function Timer({
  elapsedSeconds,
  live,
}: {
  elapsedSeconds: number;
  live: boolean;
}) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = Math.floor(elapsedSeconds % 60);

  return (
    <div className="glass-surface flex flex-wrap items-center gap-3 rounded-full border border-mist/15 px-4 py-2.5">
      <span className="relative flex h-2.5 w-2.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rec opacity-60" />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-rec" : "bg-mist"}`} />
      </span>
      <span className="font-mono text-sm tracking-widest text-paper/70">
        {live ? "ON AIR" : "STANDBY"}
      </span>
      <span className="font-mono text-2xl tabular-nums text-paper">
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
