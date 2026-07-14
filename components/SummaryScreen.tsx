"use client";

import type { AnswerRecord } from "@/types";
import { buildFeedback, formatDuration } from "@/lib/feedback";

export default function SummaryScreen({
  answers,
  totalDurationSeconds,
  onRestart,
}: {
  answers: AnswerRecord[];
  totalDurationSeconds: number;
  onRestart: () => void;
}) {
  const feedback = buildFeedback(answers, totalDurationSeconds);

  return (
    <div className="mx-auto w-full max-w-3xl animate-rise pb-16">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
        Studio 15 · Session Report
      </p>
      <h1 className="font-display text-3xl font-medium text-paper sm:text-4xl">
        That&apos;s a wrap.
      </h1>
      <p className="mt-3 text-paper/60">
        This read-out is generated from your own answers — pacing, length, and word
        choice — not a judgment of whether the content was technically correct.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Duration" value={formatDuration(feedback.totalDurationSeconds)} />
        <Stat label="Questions" value={String(answers.length)} />
        <Stat label="Avg. words / answer" value={String(feedback.averageWordsPerAnswer)} />
        <Stat label="Filler words / answer" value={feedback.averageFillerPerAnswer.toFixed(1)} />
      </div>

      <div className="mt-8 rounded-xl border border-slate/30 bg-panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Coaching notes</p>
        <ul className="mt-3 space-y-3">
          {feedback.notes.map((note, i) => (
            <li key={i} className="flex gap-3 text-sm text-paper/80">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-paper/40">
          Answer by answer
        </p>
        <div className="space-y-3">
          {answers.map((answer, i) => (
            <details
              key={answer.questionId}
              className="group rounded-xl border border-slate/30 bg-panel p-4 open:border-amber/40"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-amber">
                      {i + 1} · {answer.category}
                    </p>
                    <p className="mt-1 text-sm font-medium text-paper">{answer.questionText}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-paper/40">
                    {answer.wordCount}w · {answer.durationSeconds}s
                  </span>
                </div>
              </summary>
              <p className="mt-3 border-t border-slate/20 pt-3 text-sm text-paper/70">
                {answer.transcript || (
                  <span className="italic text-paper/30">No transcript captured for this answer.</span>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-10 rounded-full border border-slate/40 px-6 py-3 text-sm text-paper/70 transition-colors hover:border-amber hover:text-amber"
      >
        Run another session
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate/30 bg-panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">{label}</p>
      <p className="mt-1 font-display text-2xl text-paper">{value}</p>
    </div>
  );
}
