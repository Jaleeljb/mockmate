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
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
        Studio 15 · Pre-Roll
      </p>
      <h1 className="font-display text-3xl font-medium text-paper sm:text-4xl">
        {profile.name ? `Ready when you are, ${profile.name.split(" ")[0]}.` : "Ready when you are."}
      </h1>
      <p className="mt-3 text-paper/60">
        This session runs at least {Math.round(MIN_INTERVIEW_SECONDS / 60)} minutes across{" "}
        {plan.length} questions, mixing intro, resume-specific, technical, and behavioral rounds.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate/30 bg-panel p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Detected skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.length ? (
              profile.skills.slice(0, 8).map((s) => (
                <span key={s} className="rounded-full bg-panelLight px-2.5 py-1 text-xs text-paper/80">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper/40">None detected — we'll keep it behavioral.</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate/30 bg-panel p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Detected roles</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.roles.length ? (
              profile.roles.slice(0, 5).map((r) => (
                <span key={r} className="rounded-full bg-panelLight px-2.5 py-1 text-xs text-paper/80">
                  {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper/40">None detected from resume text.</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate/30 bg-panel p-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Before you begin</p>
        <ul className="mt-3 space-y-2 text-sm text-paper/70">
          <li className="flex gap-2">
            <span className={voiceSupported ? "text-good" : "text-onair"}>{voiceSupported ? "✓" : "✕"}</span>
            Your browser {voiceSupported ? "will read each question aloud." : "can't read questions aloud — they'll be shown as text instead."}
          </li>
          <li className="flex gap-2">
            <span className={micSupported ? "text-good" : "text-onair"}>{micSupported ? "✓" : "✕"}</span>
            {micSupported
              ? "Microphone answers are supported — allow mic access when prompted."
              : "Live speech-to-text isn't supported here — you can type your answers instead."}
          </li>
          <li className="flex gap-2">
            <span className="text-amber">•</span>
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
          className="rounded-full bg-amber px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start the interview →
        </button>
      </div>
    </div>
  );
}
