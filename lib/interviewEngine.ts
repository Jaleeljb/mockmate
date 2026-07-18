import type { InterviewQuestion, ResumeProfile } from "@/types";
import { buildResumeFacts, type ResumeFact, type ResumeFactType } from "./resumeFacts";
import {
  OPENING_POOL,
  CLOSING_POOL,
  BEHAVIORAL_POOL,
  GENERIC_TECHNICAL_POOL,
  questionFromFact,
} from "./questionBank";

// Every session asks a fixed number of questions rather than running to a
// clock — somewhere in this range, picked once per session for a little
// natural variation rather than always landing on the exact same number.
export const MIN_QUESTIONS = 20;
export const MAX_QUESTIONS = 25;

const QUESTION_OVERHEAD_SECONDS = 14; // time spent on TTS + transition between questions, for duration estimates only

// How many resume-driven questions are allowed to contribute, and how many
// of each fact type — keeps a resume with, say, 40 detected skills from
// crowding out behavioral/technical variety. Round-robin selection below
// still guarantees a mix across whatever's available.
const MAX_RESUME_QUESTIONS = 12;
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
  skill: 5,
  experience_bullet: 3,
  achievement: 1,
  certification: 1,
  education: 1,
  tenure: 1,
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function pickTargetQuestionCount(): number {
  return MIN_QUESTIONS + Math.floor(Math.random() * (MAX_QUESTIONS - MIN_QUESTIONS + 1));
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
 * Builds a full interview plan for this candidate's resume: a fixed number
 * of questions — MIN_QUESTIONS to MAX_QUESTIONS, picked once per session —
 * opening with the standard intro, closing with the standard "questions for
 * me?", and resume-specific content prioritized in between, topped up with
 * behavioral/technical questions to reach the target count exactly.
 */
export function buildInterviewPlan(profile: ResumeProfile): InterviewQuestion[] {
  const target = pickTargetQuestionCount();

  const plan: InterviewQuestion[] = [];
  const usedIds = new Set<string>();
  const usedText = new Set<string>();

  const push = (question: InterviewQuestion) => {
    if (plan.length >= target) return false;
    if (usedIds.has(question.id)) return false;
    const key = normalizeText(question.text);
    if (usedText.has(key)) return false;
    usedIds.add(question.id);
    usedText.add(key);
    plan.push(question);
    return true;
  };

  const facts = buildResumeFacts(profile);

  OPENING_POOL.forEach(push);
  buildResumeQuestions(facts).forEach(push);

  // Reserve the very last slot for the closing question — fill everything
  // before it with behavioral/technical questions, on a rough 2:1 cadence,
  // falling back to whichever pool still has questions if the "due" one
  // has already run dry (only stop once both are genuinely empty).
  const behavioralQueue = [...BEHAVIORAL_POOL];
  const technicalQueue = [...GENERIC_TECHNICAL_POOL];

  let guard = 0;
  while (plan.length < target - 1 && guard < 200) {
    guard += 1;

    let next: InterviewQuestion | undefined;
    if (guard % 3 === 0 && technicalQueue.length) {
      next = technicalQueue.shift();
    } else if (behavioralQueue.length) {
      next = behavioralQueue.shift();
    } else if (technicalQueue.length) {
      next = technicalQueue.shift();
    }
    if (!next) break; // both queues genuinely empty — stop rather than loop forever

    push(next);
  }

  const closing = CLOSING_POOL.find((c) => !usedIds.has(c.id)) || CLOSING_POOL[0];
  push(closing);

  return plan;
}

export function estimatedPlanSeconds(plan: InterviewQuestion[]): number {
  return plan.reduce((sum, question) => sum + estimateSeconds(question), 0);
}
