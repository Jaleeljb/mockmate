"use client";

import { useMemo } from "react";
import type { InterviewQuestion, ResumeProfile } from "@/types";
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from "@/lib/speechUtils";
import { MIN_INTERVIEW_SECONDS } from "@/lib/interviewEngine";

export default function BriefingScreen({
  profile,
  plan,
  onBegin,
  onRestart,
}: {
  profile: ResumeProfile;
  plan: InterviewQuestion[];
  onBegin: () => void;
  onRestart: () => void;
}) {
  const micSupported = useMemo(() => isSpeechRecognitionSupported(), []);
  const voiceSupported = useMemo(() => isSpeechSynthesisSupported(), []);

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/5 px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Studio 15 · Pre-Roll</p>
      </div>
      <h1 className="font-display text-3xl font-medium text-paper sm:text-4xl">
        {profile.name ? `Ready when you are, ${profile.name.split(" ")[0]}.` : "Ready when you are."}
      </h1>
      <p className="mt-3 max-w-lg text-paper/60">
        This session runs at least {Math.round(MIN_INTERVIEW_SECONDS / 60)} minutes across{" "}
        {plan.length} questions, mixing intro, resume-specific, technical, and behavioral rounds.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div
          className="glass-panel border border-slate/15 animate-rise rounded-xl p-4"
          style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Detected skills</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.skills.length ? (
              profile.skills.slice(0, 8).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-slate/20 bg-panelLight/80 px-2.5 py-1 text-xs text-paper/80 transition-colors hover:border-amber/40 hover:text-amber"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper/40">None detected — we&apos;ll keep it behavioral.</span>
            )}
          </div>
        </div>

        <div
          className="glass-panel border border-slate/15 animate-rise rounded-xl p-4"
          style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Detected roles</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.roles.length ? (
              profile.roles.slice(0, 5).map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-slate/20 bg-panelLight/80 px-2.5 py-1 text-xs text-paper/80 transition-colors hover:border-amber/40 hover:text-amber"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper/40">None detected from resume text.</span>
            )}
          </div>
        </div>
      </div>

      <div
        className="glass-panel border border-slate/15 animate-rise mt-6 rounded-xl p-4"
        style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Before you begin</p>
        <ul className="mt-3 space-y-2.5 text-sm text-paper/70">
          <li className="flex gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                voiceSupported ? "bg-good/15 text-good" : "bg-onair/15 text-onair"
              }`}
            >
              {voiceSupported ? "✓" : "✕"}
            </span>
            Your browser{" "}
            {voiceSupported
              ? "will read each question aloud."
              : "can't read questions aloud — they'll be shown as text instead."}
          </li>
          <li className="flex gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                micSupported ? "bg-good/15 text-good" : "bg-onair/15 text-onair"
              }`}
            >
              {micSupported ? "✓" : "✕"}
            </span>
            {micSupported
              ? "Microphone answers are supported — allow mic access when prompted."
              : "Live speech-to-text isn't supported here — you can type your answers instead."}
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber/15 text-[10px] text-amber">
              •
            </span>
            Find a quiet spot. You can always finish an answer early and move on.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onRestart}
          className="rounded-full border border-slate/40 px-5 py-3 text-sm text-paper/60 transition-colors hover:border-slate hover:text-paper"
        >
          Upload a different resume
        </button>
        <button
          onClick={onBegin}
          className="rounded-full bg-amber px-6 py-3 text-sm font-medium text-ink shadow-[0_8px_30px_-8px_rgba(201,166,107,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_36px_-6px_rgba(201,166,107,0.75)] active:scale-[0.98]"
        >
          Start the interview →
        </button>
      </div>
    </div>
  );
}
