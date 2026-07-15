import { FileSearch, Timer, Mic, ShieldCheck, LineChart, Infinity as InfinityIcon } from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume-Aware Questions",
    copy: "Every question pulls from what's actually on your resume — your roles, skills, and companies — not a generic bank.",
  },
  {
    icon: Timer,
    title: "A Real 15-Minute Loop",
    copy: "Paced and timed like an opening-round interview, with a live clock that keeps going until the floor is met.",
  },
  {
    icon: Mic,
    title: "Voice or Typed Answers",
    copy: "Speak naturally with live speech-to-text, or type instead — both work end to end, no browser left behind.",
  },
  {
    icon: ShieldCheck,
    title: "Runs Fully in Your Browser",
    copy: "Resume parsing and scoring all happen client-side. Nothing you upload or say is sent to a server.",
  },
  {
    icon: LineChart,
    title: "Rule-Based Feedback",
    copy: "A transparent report on pacing, filler words, and answer depth — not a black-box AI grading your content.",
  },
  {
    icon: InfinityIcon,
    title: "Available Anytime, Free",
    copy: "No sign-up, no API key, no per-session cost. Practice as many times as you want, whenever you want.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-5 py-24 sm:px-10">
      <div className="text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">Why onemock</p>
        <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
          Everything you need, nothing you don&apos;t.
        </h2>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, copy }) => (
          <div
            key={title}
            className="glass-surface rounded-xl border border-mist/15 p-5 transition-colors hover:border-signal/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/10 text-signal">
              <Icon size={18} strokeWidth={1.75} />
            </div>
            <p className="mt-4 font-display text-base font-medium text-paper">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
