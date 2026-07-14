"use client";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function Timer({
  elapsedSeconds,
  targetSeconds,
  live,
}: {
  elapsedSeconds: number;
  targetSeconds: number;
  live: boolean;
}) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = Math.floor(elapsedSeconds % 60);
  const reachedTarget = elapsedSeconds >= targetSeconds;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          live ? "bg-onair animate-pulseRec" : "bg-slate"
        }`}
        aria-hidden
      />
      <span className="font-mono text-sm tracking-widest text-paper/70">
        {live ? "ON AIR" : "STANDBY"}
      </span>
      <span className="font-mono text-2xl tabular-nums text-paper">
        {pad(minutes)}:{pad(seconds)}
      </span>
      <span className="font-mono text-xs text-paper/40">
        / {Math.floor(targetSeconds / 60)}:{pad(targetSeconds % 60)} min
      </span>
      {reachedTarget && (
        <span className="rounded-full bg-good/20 px-2 py-0.5 font-mono text-xs text-good">
          floor met
        </span>
      )}
    </div>
  );
}
