const STEPS = [
  {
    n: "01",
    title: "Upload your resume",
    copy: "Drop in a PDF, DOCX, or TXT. It's parsed right in your browser tab to pull out your roles, skills, and companies — nothing leaves your device.",
  },
  {
    n: "02",
    title: "Run the 20–25 question session",
    copy: "Questions are read aloud one at a time — an intro, resume-specific, technical, and behavioral rounds — while a live clock tracks your pace.",
  },
  {
    n: "03",
    title: "Review your report",
    copy: "Get a transparent, rule-based breakdown of pacing, filler words, and answer depth for every question, plus the full transcript.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-5 py-24 sm:px-10">
      <div className="text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">How it works</p>
        <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
          Three steps, one full mock.
        </h2>
      </div>

      <div className="relative mt-14 grid gap-8 sm:grid-cols-3">
        <div
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-mist/25 to-transparent sm:block"
          aria-hidden
        />
        {STEPS.map((step) => (
          <div key={step.n} className="relative text-center sm:text-left">
            <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-signal/30 bg-void font-mono text-sm text-signal sm:mx-0">
              {step.n}
            </div>
            <p className="mt-4 font-display text-lg font-medium text-paper">{step.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
