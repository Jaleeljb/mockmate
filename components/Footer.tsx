import Logo from "./Logo";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="border-t border-mist/10 bg-void/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-paper/50">
              A resume-aware mock interview studio that runs entirely in your
              browser — no accounts, no servers, no API keys.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/60">
              <li>
                <button onClick={() => scrollToId("practice")} className="hover:text-signal">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("features")} className="hover:text-signal">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("faq")} className="hover:text-signal">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("contact")} className="hover:text-signal">
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
              <li>20–25 questions per session</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-mist/10 pt-6 text-xs text-paper/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} onemock. Built for practice, not for grading.</span>
          <span className="font-mono uppercase tracking-widest">runs fully client-side</span>
        </div>
      </div>
    </footer>
  );
}
