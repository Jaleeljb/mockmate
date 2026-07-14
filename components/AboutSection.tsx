export default function AboutSection() {
  const pillars = [
    {
      title: "Reads your resume, not a template",
      copy: "Every question is drawn from what's actually on your resume — your roles, your companies, your skills — so the session feels tailored, not generic.",
    },
    {
      title: "A real 15-minute loop",
      copy: "No token exchange, no five-question demo. The session is paced and timed like an opening-round interview, with a live clock that holds you to it.",
    },
    {
      title: "Runs entirely in your browser",
      copy: "Resume parsing, voice, and scoring all happen client-side. Nothing you say or upload is sent to a server or stored anywhere.",
    },
  ];

  return (
    <section id="about" className="mx-auto max-w-5xl px-5 py-24 sm:px-10">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-amber">About the studio</p>
          <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
            A rehearsal room, not a quiz.
          </h2>
          <p className="mt-5 text-paper/60">
            Studio 15 was built on a simple idea: the best way to prepare for an
            interview is to sit through one, end to end, under a little real
            pressure. Not flashcards. Not a chatbot grading your grammar — an
            actual paced conversation that doesn&apos;t stop until the clock says
            you&apos;ve earned the wrap.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="glass-panel rounded-xl border border-slate/15 p-5 transition-colors hover:border-amber/30"
            >
              <p className="font-display text-base font-medium text-paper">{pillar.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
