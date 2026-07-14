function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="border-t border-slate/10 bg-ink/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg font-medium text-paper">
              Studio <span className="bg-gradient-to-r from-amber to-goldLight bg-clip-text text-transparent">15</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-paper/50">
              A resume-aware mock interview studio that runs entirely in your
              browser — no accounts, no servers, no API keys.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li>
                <button onClick={() => scrollToId("practice")} className="hover:text-amber">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("about")} className="hover:text-amber">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("faq")} className="hover:text-amber">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("contact")} className="hover:text-amber">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Good to know</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li>Resumes are parsed locally, never uploaded</li>
              <li>Works best in Chrome or Edge for voice</li>
              <li>Sessions run at least 15 minutes</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate/10 pt-6 text-xs text-paper/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Studio 15. Built for practice, not for grading.</span>
          <span className="font-mono uppercase tracking-widest">runs fully client-side</span>
        </div>
      </div>
    </footer>
  );
}
