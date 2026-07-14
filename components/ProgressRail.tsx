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
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {plan.map((question, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <div
            key={question.id}
            title={`${CATEGORY_LABEL[question.category]} — ${question.text}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
              state === "current"
                ? "border-amber text-amber"
                : state === "done"
                ? "border-good/40 text-good/80"
                : "border-slate/40 text-slate"
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
