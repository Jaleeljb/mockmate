const FAQS: { q: string; a: string }[] = [
  {
    q: "Does my resume get uploaded anywhere?",
    a: "No. Your PDF, DOCX, or TXT file is parsed entirely in your browser tab using local libraries. It's never sent to a server, and nothing is stored once you close the tab.",
  },
  {
    q: "Why is there no AI grading my answers?",
    a: "onemock deliberately avoids calling an external AI model to judge correctness — that keeps the tool fast, free to run, and private. Instead, the session report scores pacing, answer length, and filler-word usage: things you can act on immediately.",
  },
  {
    q: "What if my browser doesn't support voice input?",
    a: "Live speech-to-text currently works best in Chrome and Edge. If it's unavailable, questions are still read aloud (or shown as text), and you can simply type your answers in the box provided — the full session still runs normally.",
  },
  {
    q: "Can I end an answer early or go back?",
    a: "You can move to the next question whenever you're ready. There's no going back to a previous answer mid-session — like a real interview, you keep moving forward. You can always start a fresh session afterward.",
  },
  {
    q: "Why does the number of questions vary between 20 and 25?",
    a: "Each session lands on a slightly different count in that range so runs don't feel identical. Resume-specific questions are prioritized first — the richer your resume, the more of the session draws directly from it — then behavioral and technical rounds fill out the rest.",
  },
  {
    q: "Is this free to use?",
    a: "Yes. There's no account, no API key, and no server cost to run a session — everything happens on your device.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-10">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">Common questions</p>
      <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
        Before you press record.
      </h2>

      <div className="mt-10 space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="glass-surface group rounded-xl border border-mist/15 p-5 open:border-signal/30"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-display text-base font-medium text-paper">{item.q}</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-mist/25 text-paper/50 transition-transform duration-300 group-open:rotate-45 group-open:border-signal/50 group-open:text-signal">
                +
              </span>
            </summary>
            <p className="mt-3 border-t border-mist/15 pt-3 text-sm leading-relaxed text-paper/60">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
