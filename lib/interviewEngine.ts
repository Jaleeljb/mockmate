import type { InterviewQuestion, ResumeProfile } from "@/types";
import { OPENING_POOL, CLOSING_POOL, BEHAVIORAL_POOL, GENERIC_TECHNICAL_POOL } from "./questionBank";
import { buildResumeTopics } from "./realtimeEngine";

export const MIN_INTERVIEW_SECONDS = 15 * 60; // hard floor required by the brief
const QUESTION_OVERHEAD_SECONDS = 14; // time spent on TTS + transition between questions

function estimateSeconds(question: InterviewQuestion): number {
  return (question.minAnswerSeconds + question.maxAnswerSeconds) / 2 + QUESTION_OVERHEAD_SECONDS;
}

/**
 * Builds a *preview* plan for the briefing screen only — an estimate of how
 * many questions and how long the session will likely run, sized so the
 * estimated total clears the 15-minute floor. This is not the literal script
 * of the live session: once the interview starts, InterviewStage asks
 * realtimeEngine.getNextQuestion() for each question turn-by-turn, adapting
 * to what the candidate actually says. That keeps the estimate honest (based
 * on this candidate's real resume) while letting the live session react in
 * real time rather than following a fixed script.
 */
export function buildInterviewPlan(profile: ResumeProfile): InterviewQuestion[] {
  const plan: InterviewQuestion[] = [];
  const used = new Set<string>();

  const push = (question: InterviewQuestion) => {
    if (used.has(question.text)) return;
    used.add(question.text);
    plan.push(question);
  };

  OPENING_POOL.forEach(push);
  buildResumeTopics(profile).forEach(push);

  let runningTotal = plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
  const closingReserve = estimateSeconds(CLOSING_POOL[0]);

  const behavioralQueue = [...BEHAVIORAL_POOL];
  const technicalQueue = [...GENERIC_TECHNICAL_POOL];

  let guard = 0;
  while (runningTotal + closingReserve < MIN_INTERVIEW_SECONDS && guard < 40) {
    guard += 1;
    const next =
      guard % 3 === 0 && technicalQueue.length
        ? technicalQueue.shift()
        : behavioralQueue.shift();
    if (!next) break;
    push(next);
    runningTotal += estimateSeconds(next);
  }

  push(CLOSING_POOL[0]);

  return plan;
}

export function estimatedPlanSeconds(plan: InterviewQuestion[]): number {
  return plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
}
