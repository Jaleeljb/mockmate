"use client";

import { useState } from "react";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "#practice", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

function scrollToId(id: string) {
  document.getElementById(id.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
}

export default function NavBar({
  phase,
  onExit,
}: {
  phase: "upload" | "briefing" | "session" | "summary";
  onExit: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = phase === "upload";

  return (
    <header className="sticky top-0 z-40 border-b border-mist/10 bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-10">
        <button onClick={() => scrollToId("practice")} className="transition-opacity hover:opacity-80">
          <Logo />
        </button>

        {isLanding ? (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToId(link.href)}
                  className="font-mono text-xs uppercase tracking-[0.15em] text-paper/55 transition-colors hover:text-signal"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => scrollToId("practice")}
              className="hidden rounded-full bg-signal px-5 py-2 text-sm font-medium text-void shadow-[0_6px_20px_-6px_rgba(139,124,255,0.6)] transition-transform hover:scale-[1.02] md:inline-block"
            >
              Start practicing
            </button>
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-mist/25 text-paper/70 md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {menuOpen ? (
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M1 4h14M1 8h14M1 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-mist/25 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-paper/40">
              {phase}
            </span>
            <button
              onClick={onExit}
              className="rounded-full border border-mist/30 px-4 py-1.5 text-xs text-paper/60 transition-colors hover:border-rec/50 hover:text-rec"
            >
              Exit session
            </button>
          </div>
        )}
      </div>

      {isLanding && menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-mist/10 bg-void/95 px-5 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                setMenuOpen(false);
                scrollToId(link.href);
              }}
              className="rounded-lg px-2 py-2.5 text-left font-mono text-xs uppercase tracking-[0.15em] text-paper/60 hover:bg-surfaceHover/60 hover:text-signal"
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
