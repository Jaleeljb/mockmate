"use client";

import { LogoMark } from "./Logo";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function HeroSection() {
  return (
    <section className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 text-center sm:px-10 sm:pb-24 sm:pt-20">
      <LogoMark
        size={340}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-signal opacity-[0.06] sm:size-[440px]"
      />

      <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/5 px-4 py-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
          No AI grading · No accounts · Runs in your browser
        </p>
      </div>

      <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-6xl">
        One mock interview.
        <br />
        <span className="bg-gradient-to-r from-signal via-signalLight to-signal bg-clip-text text-transparent text-glow">
          Walk in ready.
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-balance text-paper/60 sm:text-lg">
        Upload your resume and onemock runs a full, timed 15-minute interview —
        questions pulled from your own experience, spoken aloud, and scored on
        delivery. No AI grading your content, no server, no account.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={() => scrollToId("practice")}
          className="w-full rounded-full bg-signal px-7 py-3.5 text-sm font-medium text-void shadow-[0_10px_36px_-8px_rgba(139,124,255,0.65)] transition-all hover:scale-[1.02] hover:shadow-[0_14px_42px_-6px_rgba(139,124,255,0.8)] sm:w-auto"
        >
          Start practicing free →
        </button>
        <button
          onClick={() => scrollToId("how-it-works")}
          className="w-full rounded-full border border-mist/30 px-7 py-3.5 text-sm text-paper/70 transition-colors hover:border-mist/60 hover:text-paper sm:w-auto"
        >
          See how it works
        </button>
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-paper/30">
        Built on the Web Speech API · Best in Chrome &amp; Edge
      </p>
    </section>
  );
}
