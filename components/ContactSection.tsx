"use client";

import { useState } from "react";

const CONTACT_EMAIL = "hello@studio15.app";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Studio 15 — message from ${name || "a visitor"}`
  )}&body=${encodeURIComponent(message)}`;

  return (
    <section id="contact" className="mx-auto max-w-3xl px-5 py-24 sm:px-10">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-amber">Get in touch</p>
      <h2 className="font-serif text-3xl italic leading-tight text-paper sm:text-4xl">
        Notes, bugs, or ideas welcome.
      </h2>
      <p className="mt-4 max-w-lg text-paper/60">
        There&apos;s no backend behind this form — writing your message here just opens
        it in your own email client, addressed and ready to send.
      </p>

      <form
        className="glass-panel mt-8 rounded-2xl border border-slate/15 p-6 sm:p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Lee"
              className="mt-2 w-full rounded-xl border border-slate/25 bg-ink/40 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/30"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate/25 bg-ink/40 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/30"
            />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Tell us what worked, what didn't, or what you'd like to see next."
            className="mt-2 w-full rounded-xl border border-slate/25 bg-ink/40 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/30"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={mailtoHref}
            className="inline-flex justify-center rounded-full bg-amber px-6 py-3 text-sm font-medium text-ink shadow-[0_8px_30px_-8px_rgba(201,166,107,0.6)] transition-transform hover:scale-[1.02]"
          >
            Open in email client →
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-sm text-paper/50 hover:text-amber">
            {CONTACT_EMAIL}
          </a>
        </div>
      </form>
    </section>
  );
}
