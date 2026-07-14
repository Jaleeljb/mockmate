"use client";

import { useMemo, useState } from "react";
import type { AnswerRecord, InterviewQuestion, ResumeProfile } from "@/types";
import ResumeUpload from "./ResumeUpload";
import BriefingScreen from "./BriefingScreen";
import InterviewStage from "./InterviewStage";
import SummaryScreen from "./SummaryScreen";
import StudioGlow from "./StudioGlow";
import NavBar from "./NavBar";
import AboutSection from "./AboutSection";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
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
      return <InterviewStage key={sessionKey} initialPlan={plan} onComplete={handleComplete} />;
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

  const isLanding = phase === "upload";

  return (
    <div className="relative">
      <StudioGlow />
      <NavBar phase={phase} onExit={handleRestart} />

      <div className="relative z-10">
        <main id="practice" className="px-5 py-14 sm:px-10 sm:py-20">
          {content}
        </main>

        {isLanding && (
          <>
            <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-slate/20 to-transparent" />
            <AboutSection />
            <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-slate/20 to-transparent" />
            <FAQSection />
            <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-slate/20 to-transparent" />
            <ContactSection />
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
