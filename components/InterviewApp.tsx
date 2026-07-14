"use client";

import { useMemo, useState } from "react";
import type { AnswerRecord, InterviewQuestion, ResumeProfile } from "@/types";
import ResumeUpload from "./ResumeUpload";
import BriefingScreen from "./BriefingScreen";
import InterviewStage from "./InterviewStage";
import SummaryScreen from "./SummaryScreen";
import { buildInterviewPlan } from "@/lib/interviewEngine";

type AppPhase = "upload" | "briefing" | "session" | "summary";

export default function InterviewApp() {
  const [phase, setPhase] = useState<AppPhase>("upload");
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [plan, setPlan] = useState<InterviewQuestion[]>([]);
  const [result, setResult] = useState<{ answers: AnswerRecord[]; totalDurationSeconds: number } | null>(
    null
  );
  const [sessionKey, setSessionKey] = useState(0);

  const handleProfileReady = (nextProfile: ResumeProfile) => {
    setProfile(nextProfile);
    setPlan(buildInterviewPlan(nextProfile));
    setPhase("briefing");
  };

  const handleRestart = () => {
    setProfile(null);
    setPlan([]);
    setResult(null);
    setSessionKey((k) => k + 1);
    setPhase("upload");
  };

  const handleComplete = (answers: AnswerRecord[], totalDurationSeconds: number) => {
    setResult({ answers, totalDurationSeconds });
    setPhase("summary");
  };

  const content = useMemo(() => {
    if (phase === "upload" || !profile) {
      return <ResumeUpload onProfileReady={handleProfileReady} />;
    }
    if (phase === "briefing") {
      return (
        <BriefingScreen
          profile={profile}
          plan={plan}
          onBegin={() => setPhase("session")}
          onRestart={handleRestart}
        />
      );
    }
    if (phase === "session") {
      return (
        <InterviewStage key={sessionKey} initialPlan={plan} onComplete={handleComplete} />
      );
    }
    if (phase === "summary" && result) {
      return (
        <SummaryScreen
          answers={result.answers}
          totalDurationSeconds={result.totalDurationSeconds}
          onRestart={handleRestart}
        />
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, profile, plan, result, sessionKey]);

  return (
    <main className="min-h-screen px-5 py-10 sm:px-10 sm:py-16">
      <div className="mx-auto mb-10 flex max-w-3xl items-center justify-between">
        <span className="font-display text-lg font-medium text-paper">Studio 15</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-paper/30">
          {phase}
        </span>
      </div>
      {content}
    </main>
  );
}
