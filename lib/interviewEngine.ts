import type { InterviewQuestion, ResumeProfile } from "@/types";
import {
  OPENING_POOL,
  CLOSING_POOL,
  BEHAVIORAL_POOL,
  GENERIC_TECHNICAL_POOL,
  getSkillQuestions,
} from "./questionBank";

export const MIN_INTERVIEW_SECONDS = 15 * 60; // hard floor required by the brief
const QUESTION_OVERHEAD_SECONDS = 14; // time spent on TTS + transition between questions

function buildResumeQuestions(profile: ResumeProfile): InterviewQuestion[] {
  const out: InterviewQuestion[] = [];
  let idx = 0;

  if (profile.roles.length > 0 && profile.companies.length > 0) {
    const role = profile.roles[0];
    const company = profile.companies[0];
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `I see you worked as ${role} at ${company}. Tell me about the most impactful thing you did in that role.`,
      minAnswerSeconds: 60,
      maxAnswerSeconds: 150,
    });
  } else if (profile.roles.length > 0) {
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `Your resume mentions experience as ${profile.roles[0]}. Tell me about the most impactful thing you did in that role.`,
      minAnswerSeconds: 60,
      maxAnswerSeconds: 150,
    });
  }

  if (profile.companies.length > 1) {
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `You've worked across a few different companies, including ${profile.companies[1]}. What made you decide to move on from that role?`,
      minAnswerSeconds: 45,
      maxAnswerSeconds: 120,
    });
  }

  if (profile.yearsOfExperience !== null) {
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `With about ${profile.yearsOfExperience} years of experience behind you, what's changed most in how you approach your work compared to when you started?`,
      minAnswerSeconds: 45,
      maxAnswerSeconds: 120,
    });
  }

  if (profile.education.length > 0) {
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `How has your background in ${profile.education[0]} shaped the way you work today?`,
      minAnswerSeconds: 45,
      maxAnswerSeconds: 120,
    });
  }

  if (profile.skills.length >= 2) {
    out.push({
      id: `resume-${idx++}`,
      category: "resume",
      text: `Your resume highlights ${profile.skills[0]} and ${profile.skills[1]} among your strengths. Which one do you feel most confident in right now, and why?`,
      minAnswerSeconds: 45,
      maxAnswerSeconds: 120,
    });
  }

  return out;
}

function estimateSeconds(question: InterviewQuestion): number {
  return (question.minAnswerSeconds + question.maxAnswerSeconds) / 2 + QUESTION_OVERHEAD_SECONDS;
}

/**
 * Builds a full interview plan for this candidate's resume, sized so the
 * estimated total run time is at least MIN_INTERVIEW_SECONDS (15 minutes).
 * The live session timer independently enforces the floor even if a
 * candidate answers faster than estimated (see getFillerQuestion).
 */
export function buildInterviewPlan(profile: ResumeProfile): InterviewQuestion[] {
  const plan: InterviewQuestion[] = [];
  const used = new Set<string>();

  const push = (question: InterviewQuestion) => {
    if (used.has(question.id)) return;
    used.add(question.id);
    plan.push(question);
  };

  OPENING_POOL.forEach(push);
  buildResumeQuestions(profile).forEach(push);
  getSkillQuestions(profile.skills, 5).forEach(push);

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

  const closing = CLOSING_POOL.find((c) => !used.has(c.id)) || CLOSING_POOL[0];
  push(closing);

  return plan;
}

/**
 * Returns an unused behavioral question to extend a live session that is
 * running under 15 minutes despite the pre-built plan (e.g. very short answers).
 */
export function getFillerQuestion(usedIds: Set<string>): InterviewQuestion | null {
  const pool = [...BEHAVIORAL_POOL, ...GENERIC_TECHNICAL_POOL];
  return pool.find((question) => !usedIds.has(question.id)) || null;
}

export function estimatedPlanSeconds(plan: InterviewQuestion[]): number {
  return plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
}
