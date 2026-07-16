"use client";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function ClosingCTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-8 sm:px-10">
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-amber/20 px-6 py-14 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 500px 300px at 50% 0%, rgba(201,166,107,0.16), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
            Ready to walk in prepared?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-paper/60">
            Fifteen minutes, your own resume, zero setup. Start whenever you&apos;re ready.
          </p>
          <button
            onClick={() => scrollToId("practice")}
            className="mt-8 rounded-full bg-amber px-8 py-3.5 text-sm font-medium text-ink shadow-[0_10px_36px_-8px_rgba(201,166,107,0.65)] transition-transform hover:scale-[1.02]"
          >
            Start practicing free →
          </button>
        </div>
      </div>
    </section>
  );
}
