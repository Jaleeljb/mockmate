"use client";

import { useMemo, useState } from "react";
import type { AnswerRecord, InterviewQuestion, ResumeProfile } from "@/types";
import ResumeUpload from "./ResumeUpload";
import BriefingScreen from "./BriefingScreen";
import InterviewStage from "./InterviewStage";
import SummaryScreen from "./SummaryScreen";
import AmbientField from "./AmbientField";
import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import MarqueeStrip from "./MarqueeStrip";
import StatsRow from "./StatsRow";
import FeaturesGrid from "./FeaturesGrid";
import HowItWorksSection from "./HowItWorksSection";
import ClosingCTA from "./ClosingCTA";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import { buildInterviewPlan } from "@/lib/interviewEngine";

type AppPhase = "upload" | "briefing" | "session" | "summary";

const PANEL_EYEBROW: Record<AppPhase, string> = {
  upload: "Try it now",
  briefing: "Pre-roll",
  session: "On air",
  summary: "Session report",
};

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
  const isSummary = phase === "summary";

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientField />
      <NavBar phase={phase} onExit={handleRestart} />

      <div className="relative z-10 flex flex-1 flex-col lg:min-h-0">
        {isLanding && (
          <>
            <HeroSection />
            <MarqueeStrip />
          </>
        )}

        {isSummary ? (
          <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6 lg:min-h-0">
            {content}
          </section>
        ) : (
          <section id="practice" className="mx-auto max-w-3xl px-5 py-16 sm:px-10">
            <div className="viewfinder rounded-3xl border border-mist/15 bg-surface/25 p-6 backdrop-blur-sm sm:p-10">
              <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-signal">
                onemock · {PANEL_EYEBROW[phase]}
              </p>
              {content}
            </div>
          </section>
        )}

        {isLanding && (
          <>
            <StatsRow />
            <FeaturesGrid />
            <HowItWorksSection />
            <FAQSection />
            <ClosingCTA />
            <ContactSection />
          </>
        )}

        {!isSummary && <Footer />}
      </div>
    </div>
  );
}
