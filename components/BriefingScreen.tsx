"use client";

import { useMemo } from "react";
import type { InterviewQuestion, ResumeProfile } from "@/types";
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from "@/lib/speechUtils";
import { MIN_INTERVIEW_SECONDS } from "@/lib/interviewEngine";
import { buildResumeFacts, summarizeFacts } from "@/lib/resumeFacts";
import InterviewerAvatar from "./InterviewerAvatar";

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
  const factsSummary = useMemo(() => summarizeFacts(buildResumeFacts(profile)), [profile]);
  const totalFacts =
    factsSummary.skill +
    factsSummary.project +
    factsSummary.role +
    factsSummary.experience_bullet +
    factsSummary.certification +
    factsSummary.education +
    factsSummary.achievement;

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <div className="flex items-center gap-4">
        <InterviewerAvatar state="idle" size={64} className="shrink-0" />
        <h1 className="font-display text-3xl font-medium text-paper sm:text-4xl">
          {profile.name ? `Ready when you are, ${profile.name.split(" ")[0]}.` : "Ready when you are."}
        </h1>
      </div>
      <p className="mt-3 max-w-lg text-paper/60">
        This session runs at least {Math.round(MIN_INTERVIEW_SECONDS / 60)} minutes across{" "}
        {plan.length} questions, mixing intro, resume-specific, technical, and behavioral rounds.
        {totalFacts > 0 && (
          <>
            {" "}
            We pulled {totalFacts} distinct point{totalFacts === 1 ? "" : "s"} from your resume —{" "}
            {factsSummary.skill} skill{factsSummary.skill === 1 ? "" : "s"}, {factsSummary.project} project
            {factsSummary.project === 1 ? "" : "s"}, and {totalFacts - factsSummary.skill - factsSummary.project}{" "}
            other detail{totalFacts - factsSummary.skill - factsSummary.project === 1 ? "" : "s"} — to draw
            questions from.
          </>
        )}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          className="glass-surface border border-mist/15 animate-rise rounded-xl p-4"
          style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">
            Detected skills {profile.skills.length > 0 && `(${profile.skills.length})`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.skills.length ? (
              <>
                {profile.skills.slice(0, 14).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-mist/20 bg-surfaceHover/80 px-2.5 py-1 text-xs text-paper/80 transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    {s}
                  </span>
                ))}
                {profile.skills.length > 14 && (
                  <span className="rounded-full border border-signal/20 bg-signal/5 px-2.5 py-1 text-xs text-signal/70">
                    +{profile.skills.length - 14} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-paper/40">None detected — we&apos;ll keep it behavioral.</span>
            )}
          </div>
        </div>

        <div
          className="glass-surface border border-mist/15 animate-rise rounded-xl p-4"
          style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">
            Detected projects {profile.projects.length > 0 && `(${profile.projects.length})`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.projects.length ? (
              profile.projects.slice(0, 6).map((p) => (
                <span
                  key={p.name}
                  className="rounded-full border border-mist/20 bg-surfaceHover/80 px-2.5 py-1 text-xs text-paper/80 transition-colors hover:border-signal/40 hover:text-signal"
                >
                  {p.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper/40">None detected from resume text.</span>
            )}
          </div>
        </div>

        <div
          className="glass-surface border border-mist/15 animate-rise rounded-xl p-4"
          style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Detected roles</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.roles.length ? (
              profile.roles.slice(0, 5).map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-mist/20 bg-surfaceHover/80 px-2.5 py-1 text-xs text-paper/80 transition-colors hover:border-signal/40 hover:text-signal"
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
        className="glass-surface border border-mist/15 animate-rise mt-6 rounded-xl p-4"
        style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Before you begin</p>
        <ul className="mt-3 space-y-2.5 text-sm text-paper/70">
          <li className="flex gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                voiceSupported ? "bg-good/15 text-good" : "bg-rec/15 text-rec"
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
                micSupported ? "bg-good/15 text-good" : "bg-rec/15 text-rec"
              }`}
            >
              {micSupported ? "✓" : "✕"}
            </span>
            {micSupported
              ? "Microphone answers are supported — allow mic access when prompted."
              : "Live speech-to-text isn't supported here — you can type your answers instead."}
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal/15 text-[10px] text-signal">
              •
            </span>
            Find a quiet spot. You can always finish an answer early and move on.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onRestart}
          className="rounded-full border border-mist/40 px-5 py-3 text-sm text-paper/60 transition-colors hover:border-mist hover:text-paper"
        >
          Upload a different resume
        </button>
        <button
          onClick={onBegin}
          className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-void shadow-[0_8px_30px_-8px_rgba(139,124,255,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_36px_-6px_rgba(139,124,255,0.75)] active:scale-[0.98]"
        >
          Start the interview →
        </button>
      </div>
    </div>
  );
}
