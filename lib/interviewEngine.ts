import type { InterviewQuestion, ResumeProfile } from "@/types";
import { buildResumeFacts, type ResumeFact, type ResumeFactType } from "./resumeFacts";
import {
  OPENING_POOL,
  CLOSING_POOL,
  BEHAVIORAL_POOL,
  GENERIC_TECHNICAL_POOL,
  questionFromFact,
} from "./questionBank";

export const MIN_INTERVIEW_SECONDS = 15 * 60; // hard floor required by the brief
const QUESTION_OVERHEAD_SECONDS = 14; // time spent on TTS + transition between questions

// Total resume-driven questions in a single session, and how many of each
// fact type are allowed to contribute — keeps a resume with, say, 40
// detected skills and 8 projects from turning into a 45-minute grilling on
// skills alone. Round-robin selection below still guarantees a mix.
const MAX_RESUME_QUESTIONS = 9;
const TYPE_PRIORITY: ResumeFactType[] = [
  "role",
  "project",
  "skill",
  "experience_bullet",
  "achievement",
  "certification",
  "education",
  "tenure",
];
const TYPE_CAP: Record<ResumeFactType, number> = {
  role: 2,
  project: 3,
  skill: 4,
  experience_bullet: 3,
  achievement: 1,
  certification: 1,
  education: 1,
  tenure: 1,
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Converts the resume's JSON fact list into an ordered list of interview
 * questions. Facts are drawn round-robin across types (one role, one
 * project, one skill, one bullet, ...) so a resume-heavy plan still reads
 * as varied rather than "five skill questions in a row", and every fact
 * type gets a chance to be represented before any one type maxes out.
 */
function buildResumeQuestions(facts: ResumeFact[]): InterviewQuestion[] {
  const byType = new Map<ResumeFactType, ResumeFact[]>();
  for (const fact of facts) {
    if (!byType.has(fact.type)) byType.set(fact.type, []);
    byType.get(fact.type)!.push(fact);
  }

  const cursor = new Map<ResumeFactType, number>();
  const seenText = new Set<string>();
  const out: InterviewQuestion[] = [];
  let templateIndex = 0;
  let guard = 0;

  while (out.length < MAX_RESUME_QUESTIONS && guard < MAX_RESUME_QUESTIONS * TYPE_PRIORITY.length) {
    guard += 1;
    let addedThisRound = false;

    for (const type of TYPE_PRIORITY) {
      if (out.length >= MAX_RESUME_QUESTIONS) break;

      const pool = byType.get(type) ?? [];
      const usedOfType = out.filter((qn) => qn.id.startsWith(`${type}-`)).length;
      const start = cursor.get(type) ?? 0;
      if (start >= pool.length || usedOfType >= TYPE_CAP[type]) continue;

      const fact = pool[start];
      cursor.set(type, start + 1);

      const question = questionFromFact(fact, templateIndex);
      if (!question) continue;
      const key = normalizeText(question.text);
      if (seenText.has(key)) continue;

      seenText.add(key);
      // Tag generated resume questions with their source fact type so the
      // per-type cap above can be enforced without a second data structure.
      out.push({ ...question, id: `${type}-${question.id}` });
      if (type === "skill") templateIndex += 1;
      addedThisRound = true;
    }

    if (!addedThisRound) break; // every type is exhausted or capped
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
  const usedIds = new Set<string>();
  const usedText = new Set<string>();

  const push = (question: InterviewQuestion) => {
    if (usedIds.has(question.id)) return;
    const key = normalizeText(question.text);
    if (usedText.has(key)) return;
    usedIds.add(question.id);
    usedText.add(key);
    plan.push(question);
  };

  const facts = buildResumeFacts(profile);

  OPENING_POOL.forEach(push);
  buildResumeQuestions(facts).forEach(push);

  let runningTotal = plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
  const closingReserve = estimateSeconds(CLOSING_POOL[0]);

  const behavioralQueue = [...BEHAVIORAL_POOL];
  const technicalQueue = [...GENERIC_TECHNICAL_POOL];

  let guard = 0;
  while (runningTotal + closingReserve < MIN_INTERVIEW_SECONDS && guard < 80) {
    guard += 1;

    // Pull from whichever queue is "due" on a roughly 2:1 behavioral:technical
    // cadence, but fall back to the other queue if the due one has already
    // run dry — only stop once BOTH are genuinely empty.
    let next: InterviewQuestion | undefined;
    if (guard % 3 === 0 && technicalQueue.length) {
      next = technicalQueue.shift();
    } else if (behavioralQueue.length) {
      next = behavioralQueue.shift();
    } else if (technicalQueue.length) {
      next = technicalQueue.shift();
    }
    if (!next) break;

    const before = plan.length;
    push(next);
    if (plan.length === before) continue; // deduped — keep going, pool isn't exhausted
    runningTotal += estimateSeconds(next);
  }

  const closing = CLOSING_POOL.find((c) => !usedIds.has(c.id)) || CLOSING_POOL[0];
  push(closing);

  return plan;
}

/**
 * Returns an unused behavioral/technical question to extend a live session
 * that is running under 15 minutes despite the pre-built plan (e.g. very
 * short answers throughout).
 */
export function getFillerQuestion(usedIds: Set<string>): InterviewQuestion | null {
  const pool = [...BEHAVIORAL_POOL, ...GENERIC_TECHNICAL_POOL];
  return pool.find((question) => !usedIds.has(question.id)) || null;
}

export function estimatedPlanSeconds(plan: InterviewQuestion[]): number {
  return plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
}
