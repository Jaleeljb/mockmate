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

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
  const ringOffset = RING_CIRCUMFERENCE * (1 - feedback.completionRate / 100);

  return (
    <div className="flex w-full flex-1 flex-col gap-4 animate-rise lg:h-full lg:min-h-0">
      {/* Header — one row, so it never eats vertical space the panels need. */}
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-paper sm:text-3xl">That&apos;s a wrap.</h1>
          <p className="mt-1 max-w-xl text-sm text-paper/50">
            Generated only from what you actually said — pacing, length, completion, word
            choice. Not a judgment of correctness.
          </p>
        </div>
        <button
          onClick={onRestart}
          className="shrink-0 rounded-full border border-mist/40 px-5 py-2.5 text-sm text-paper/70 transition-all hover:border-signal hover:text-signal hover:shadow-[0_8px_24px_-8px_rgba(139,124,255,0.4)]"
        >
          Run another session
        </button>
      </div>

      {nothingAnswered ? (
        <div className="glass-surface flex flex-1 flex-col items-center justify-center rounded-2xl border border-rec/30 bg-rec/5 p-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wide text-rec">No answers captured</p>
          <p className="mt-3 max-w-sm text-sm text-paper/70">{feedback.improvements[0]}</p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-12">
          {/* Column 1 — at-a-glance ring + core stats */}
          <div className="glass-surface flex flex-col rounded-2xl border border-mist/15 p-5 lg:col-span-3">
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-paper/40">At a glance</p>

            <div className="relative mx-auto mt-3 h-32 w-32 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="rgba(135,135,143,0.15)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="url(#completion-ring)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="completion-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#C9BFFF" />
                    <stop offset="1" stopColor="#8B7CFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl text-paper">{feedback.completionRate}%</span>
                <span className="font-mono text-[9px] uppercase tracking-wide text-paper/40">completed</span>
              </div>
            </div>

            <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-3">
              <MiniStat label="Duration" value={formatDuration(feedback.totalDurationSeconds)} />
              <MiniStat label="Questions" value={`${feedback.questionsAnswered}/${feedback.questionsTotal}`} />
              <MiniStat
                label="Avg words"
                value={feedback.questionsAnswered ? String(feedback.averageWordsPerAnsweredQuestion) : "—"}
              />
              <MiniStat
                label="Filler /100w"
                value={feedback.questionsAnswered ? feedback.averageFillerRate.toFixed(1) : "—"}
              />
            </div>
          </div>

          {/* Column 2 — strengths & improvements */}
          <div className="flex min-h-0 flex-col gap-4 lg:col-span-5">
            <Panel title="Where you were strong" tone="good" className="flex-1">
              <ul className="space-y-2.5">
                {feedback.strengths.map((note, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-snug text-paper/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                    {note}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Where to improve" tone="signal" className="flex-1">
              {feedback.improvements.length ? (
                <ul className="space-y-2.5">
                  {feedback.improvements.map((note, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-snug text-paper/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-paper/50">
                  Nothing stood out as a clear gap this round — solid, complete session.
                </p>
              )}
            </Panel>
          </div>

          {/* Column 3 — category breakdown + answer-by-answer transcript */}
          <div className="flex min-h-0 flex-col gap-4 lg:col-span-4">
            {feedback.categoryBreakdown.length > 1 && (
              <div className="glass-surface shrink-0 rounded-2xl border border-mist/15 p-4">
                <p className="font-mono text-[10px] uppercase tracking-wide text-paper/40">By question type</p>
                <div className="mt-3 space-y-3">
                  {feedback.categoryBreakdown.map((cat) => {
                    const maxWords = Math.max(...feedback.categoryBreakdown.map((c) => c.averageWords), 1);
                    const widthPct = cat.averageWords ? Math.max(6, (cat.averageWords / maxWords) * 100) : 0;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-paper/70">{CATEGORY_LABEL[cat.category]}</span>
                          <span className="font-mono text-paper/40">
                            {cat.answered}/{cat.total} · {cat.averageWords || 0}w
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-void/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-signal to-signalLight transition-[width] duration-700 ease-out"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-surface flex min-h-0 flex-1 flex-col rounded-2xl border border-mist/15 p-4">
              <p className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-paper/40">
                Answer by answer
              </p>
              <div className="thin-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
                {feedback.perAnswer.map((answer, i) => {
                  const style = STATUS_STYLE[answer.status];
                  return (
                    <details
                      key={answer.questionId}
                      className="glass-surface group rounded-xl border border-mist/15 p-3 transition-colors open:border-signal/40"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-wide text-signal">
                              <span>
                                {i + 1} · {answer.category}
                              </span>
                              <span className={`inline-flex items-center gap-1 ${style.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {style.label}
                              </span>
                            </p>
                            <p className="mt-1 truncate text-sm font-medium text-paper group-open:whitespace-normal">
                              {answer.questionText}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] text-paper/40">
                            {answer.wordCount}w · {answer.durationSeconds}s
                          </span>
                        </div>
                      </summary>
                      <p className="mt-2.5 border-t border-mist/20 pt-2.5 text-sm text-paper/70">
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
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mist/15 bg-void/30 px-3 py-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-wide text-paper/40">{label}</p>
      <p className="mt-0.5 font-display text-lg text-paper">{value}</p>
    </div>
  );
}

function Panel({
  title,
  tone,
  className = "",
  children,
}: {
  title: string;
  tone: "good" | "signal";
  className?: string;
  children: React.ReactNode;
}) {
  const toneClass = tone === "good" ? "border-good/25 text-good" : "border-signal/25 text-signal";
  return (
    <div className={`glass-surface flex min-h-0 flex-col rounded-2xl border p-5 ${toneClass} ${className}`}>
      <p className="shrink-0 font-mono text-[10px] uppercase tracking-wide">{title}</p>
      <div className="thin-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}
