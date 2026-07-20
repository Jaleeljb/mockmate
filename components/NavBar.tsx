"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "#practice", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
  { href: "https://makeresu.vercel.app/", label: "MakeResu", external: true },
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
  const [scrolled, setScrolled] = useState(false);
  const isLanding = phase === "upload";

  // On the landing hero, the bar starts transparent over the artwork and
  // only picks up a solid, blurred backdrop once the page actually scrolls —
  // everywhere else there's no hero behind it, so it stays solid throughout.
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const solid = !isLanding || scrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        solid
          ? "border-b border-mist/10 bg-void/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-5 sm:px-10">
        <button onClick={() => scrollToId("practice")} className="justify-self-start transition-opacity hover:opacity-80">
          <Logo />
        </button>

        {isLanding ? (
          <nav className="hidden items-center justify-center gap-9 md:flex">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.15em] text-paper/55 transition-colors hover:text-signal"
                >
                  {link.label}
                  <ArrowUpRight size={12} strokeWidth={2.25} />
                </a>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollToId(link.href)}
                  className="font-mono text-xs uppercase tracking-[0.15em] text-paper/55 transition-colors hover:text-signal"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>
        ) : (
          <div />
        )}

        <div className="flex items-center justify-self-end gap-3">
          {isLanding ? (
            <>
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
            <>
              <span className="rounded-full border border-mist/25 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-paper/40">
                {phase}
              </span>
              <button
                onClick={onExit}
                className="rounded-full border border-mist/30 px-4 py-1.5 text-xs text-paper/60 transition-colors hover:border-rec/50 hover:text-rec"
              >
                Exit session
              </button>
            </>
          )}
        </div>
      </div>

      {isLanding && menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-mist/10 bg-void/95 px-5 py-3 md:hidden">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2.5 text-left font-mono text-xs uppercase tracking-[0.15em] text-paper/60 hover:bg-surfaceHover/60 hover:text-signal"
              >
                {link.label}
                <ArrowUpRight size={12} strokeWidth={2.25} />
              </a>
            ) : (
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
            )
          )}
        </nav>
      )}
    </header>
  );
}
