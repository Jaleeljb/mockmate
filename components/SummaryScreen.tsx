"use client";

import type { AnswerRecord, QuestionCategory } from "@/types";
import { buildFeedback, formatDuration, type AnswerStatus } from "@/lib/feedback";

const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  opening: "Opening",
  resume: "Resume",
  technical: "Technical",
  behavioral: "Behavioral",
  closing: "Closing",
};

const STATUS_STYLE: Record<AnswerStatus, { label: string; dot: string; text: string }> = {
  skipped: { label: "Skipped", dot: "bg-rec", text: "text-rec" },
  brief: { label: "Brief", dot: "bg-signal", text: "text-signal" },
  solid: { label: "Answered", dot: "bg-good", text: "text-good" },
};

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
  const nothingAnswered = feedback.questionsAnswered === 0;

  return (
    <div className="mx-auto w-full max-w-3xl animate-rise pb-16">
      <h1 className="font-display text-3xl font-medium text-paper sm:text-4xl">That&apos;s a wrap.</h1>
      <p className="mt-3 max-w-xl text-paper/60">
        This read-out is generated only from what you actually said — pacing, length,
        completion, and word choice — not a judgment of whether the content was
        technically correct.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Duration" value={formatDuration(feedback.totalDurationSeconds)} />
        <Stat label="Completed" value={`${feedback.questionsAnswered}/${feedback.questionsTotal}`} />
        <Stat
          label="Avg. words / answer"
          value={feedback.questionsAnswered ? String(feedback.averageWordsPerAnsweredQuestion) : "—"}
        />
        <Stat
          label="Filler / 100 words"
          value={feedback.questionsAnswered ? feedback.averageFillerRate.toFixed(1) : "—"}
        />
      </div>

      {nothingAnswered ? (
        <div className="glass-surface mt-8 rounded-xl border border-rec/30 bg-rec/5 p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-rec">No answers captured</p>
          <p className="mt-2 text-sm text-paper/70">{feedback.improvements[0]}</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass-surface rounded-xl border border-good/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-good">Where you were strong</p>
              <ul className="mt-3 space-y-3">
                {feedback.strengths.map((note, i) => (
                  <li key={i} className="flex gap-3 text-sm text-paper/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-surface rounded-xl border border-signal/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-signal">Where to improve</p>
              {feedback.improvements.length ? (
                <ul className="mt-3 space-y-3">
                  {feedback.improvements.map((note, i) => (
                    <li key={i} className="flex gap-3 text-sm text-paper/80">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-paper/50">
                  Nothing stood out as a clear gap this round — solid, complete session.
                </p>
              )}
            </div>
          </div>

          {feedback.categoryBreakdown.length > 1 && (
            <div className="glass-surface mt-6 rounded-xl border border-mist/15 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">By question type</p>
              <div className="mt-4 space-y-4">
                {feedback.categoryBreakdown.map((cat) => {
                  const maxWords = Math.max(...feedback.categoryBreakdown.map((c) => c.averageWords), 1);
                  const widthPct = cat.averageWords ? Math.max(6, (cat.averageWords / maxWords) * 100) : 0;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper/70">{CATEGORY_LABEL[cat.category]}</span>
                        <span className="font-mono text-paper/40">
                          {cat.answered}/{cat.total} answered · {cat.averageWords || 0}w avg
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-void/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-signal to-signalLight"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-paper/40">Answer by answer</p>
        <div className="space-y-3">
          {feedback.perAnswer.map((answer, i) => {
            const style = STATUS_STYLE[answer.status];
            return (
              <details
                key={answer.questionId}
                className="glass-surface group rounded-xl border border-mist/15 p-4 transition-colors open:border-signal/40"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-signal">
                        <span>
                          {i + 1} · {answer.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-paper">{answer.questionText}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-paper/40">
                      {answer.wordCount}w · {answer.durationSeconds}s
                    </span>
                  </div>
                </summary>
                <p className="mt-3 border-t border-mist/20 pt-3 text-sm text-paper/70">
                  {answer.status === "skipped" ? (
                    <span className="italic text-rec/70">
                      No answer was captured for this question — it was left blank.
                    </span>
                  ) : (
                    answer.transcript
                  )}
                </p>
              </details>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-10 rounded-full border border-mist/40 px-6 py-3 text-sm text-paper/70 transition-all hover:border-signal hover:text-signal hover:shadow-[0_8px_24px_-8px_rgba(139,124,255,0.4)]"
      >
        Run another session
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-surface rounded-xl border border-mist/15 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">{label}</p>
      <p className="mt-1 bg-gradient-to-br from-paper to-paper/70 bg-clip-text font-display text-2xl text-transparent">
        {value}
      </p>
    </div>
  );
}
