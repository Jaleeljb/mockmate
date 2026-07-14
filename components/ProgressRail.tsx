"use client";

import type { InterviewQuestion } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  opening: "Intro",
  resume: "Resume",
  technical: "Technical",
  behavioral: "Behavioral",
  closing: "Closing",
};

export default function ProgressRail({
  plan,
  currentIndex,
}: {
  plan: InterviewQuestion[];
  currentIndex: number;
}) {
  return (
    <div className="no-scrollbar relative flex gap-2 overflow-x-auto pb-1">
      <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-slate/15" aria-hidden />
      {plan.map((question, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <div
            key={question.id}
            title={`${CATEGORY_LABEL[question.category]} — ${question.text}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur transition-colors duration-300 ${
              state === "current"
                ? "border-amber bg-amber/10 text-amber shadow-[0_0_16px_-4px_rgba(227,168,87,0.6)]"
                : state === "done"
                ? "border-good/40 bg-ink/40 text-good/80"
                : "border-slate/30 bg-ink/30 text-slate"
            }`}
          >
            <span>{i + 1}</span>
            <span className="hidden sm:inline">{CATEGORY_LABEL[question.category]}</span>
          </div>
        );
      })}
    </div>
  );
}
