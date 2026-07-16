import type { AnswerRecord, InterviewQuestion, QuestionCategory, ResumeProfile } from "@/types";
import { BEHAVIORAL_POOL, GENERIC_TECHNICAL_POOL, getSkillQuestions } from "./questionBank";

// Everything in this file runs entirely in the browser. There is no network
// call and no API key anywhere in this path — the "real-time" question each
// turn comes from re-scanning the resume + the growing answer transcript
// with plain string/regex heuristics, not from a hosted model.

let idCounter = 0;
function makeQuestion(
  category: QuestionCategory,
  text: string,
  minAnswerSeconds = 45,
  maxAnswerSeconds = 150
): InterviewQuestion {
  idCounter += 1;
  return { id: `rt-${idCounter}`, category, text, minAnswerSeconds, maxAnswerSeconds };
}

/**
 * Every resume-grounded angle worth asking about, built fresh from the
 * profile. Order roughly mirrors how a real interviewer would move through
 * a resume: career history first, then concrete projects/achievements,
 * then skills, then the softer background questions.
 */
export function buildResumeTopics(profile: ResumeProfile): InterviewQuestion[] {
  const out: InterviewQuestion[] = [];

  const pairs = profile.rolesWithCompanies.length
    ? profile.rolesWithCompanies
    : profile.roles.map((role) => ({ role, company: null as string | null }));

  pairs.slice(0, 4).forEach((pair, i) => {
    const where = pair.company ? ` at ${pair.company}` : "";
    if (i === 0) {
      out.push(
        makeQuestion(
          "resume",
          `I see you worked as ${pair.role}${where}. Tell me about the most impactful thing you did in that role.`
        )
      );
    } else {
      out.push(
        makeQuestion(
          "resume",
          `You also spent time as ${pair.role}${where}. What stands out most when you look back on that chapter?`
        )
      );
    }
  });

  if (profile.companies.length > 1) {
    const secondCompany =
      pairs.find((p, i) => i > 0 && p.company)?.company || profile.companies[1];
    out.push(
      makeQuestion(
        "resume",
        `You've worked across a few different companies, including ${secondCompany}. What made you decide to move on from that role?`
      )
    );
  }

  profile.projects.slice(0, 3).forEach((project) => {
    out.push(
      makeQuestion(
        "resume",
        `Tell me about ${project} — what was your specific role in it, and how did it turn out?`
      )
    );
  });

  profile.highlights.slice(0, 4).forEach((highlight) => {
    const trimmed = highlight.length > 160 ? `${highlight.slice(0, 157)}…` : highlight;
    out.push(
      makeQuestion(
        "resume",
        `Your resume says: "${trimmed}" — walk me through how you actually pulled that off.`,
        60,
        150
      )
    );
  });

  if (profile.yearsOfExperience !== null) {
    out.push(
      makeQuestion(
        "resume",
        `With about ${profile.yearsOfExperience} years of experience behind you, what's changed most in how you approach your work compared to when you started?`
      )
    );
  }

  if (profile.education.length > 0) {
    out.push(
      makeQuestion(
        "resume",
        `How has your background in ${profile.education[0]} shaped the way you work today?`
      )
    );
  }

  // Skill-specific technical prompts, two at a time so later ones don't all
  // fire back-to-back with the same generic framing.
  getSkillQuestions(profile.skills, 5).forEach((q) => out.push(q));

  if (profile.skills.length >= 2) {
    for (let i = 2; i + 1 < profile.skills.length; i += 2) {
      out.push(
        makeQuestion(
          "resume",
          `Between ${profile.skills[i]} and ${profile.skills[i + 1]}, which do you reach for more often day to day, and why?`
        )
      );
    }
  }

  return out;
}

/** Keywords worth listening for in a candidate's spoken answer. */
function buildKeywordPool(profile: ResumeProfile): { keyword: string; type: "skill" | "company" | "project" }[] {
  const pool: { keyword: string; type: "skill" | "company" | "project" }[] = [];
  for (const s of profile.skills) pool.push({ keyword: s, type: "skill" });
  for (const c of profile.companies) pool.push({ keyword: c, type: "company" });
  for (const p of profile.projects) pool.push({ keyword: p, type: "project" });
  return pool.filter((p) => p.keyword.trim().length >= 3);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans what the candidate just said for a resume keyword they haven't been
 * asked about yet, and — if found — writes a natural, specific follow-up
 * question referencing it. This is what makes the interview feel live: the
 * next question reacts to the previous answer instead of following a fixed
 * script.
 */
export function getFollowUpQuestion(
  lastAnswerText: string,
  profile: ResumeProfile,
  usedKeywords: Set<string>
): InterviewQuestion | null {
  const keywords = buildKeywordPool(profile);
  for (const { keyword, type } of keywords) {
    const key = keyword.toLowerCase();
    if (usedKeywords.has(key)) continue;
    const pattern = new RegExp(`(?<![a-z0-9])${escapeRegex(key)}(?![a-z0-9])`, "i");
    if (!pattern.test(lastAnswerText)) continue;

    usedKeywords.add(key);
    if (type === "skill") {
      return makeQuestion(
        "technical",
        `You mentioned ${keyword} just now — can you go deeper on one specific time you used it, and what the outcome was?`
      );
    }
    if (type === "company") {
      return makeQuestion(
        "resume",
        `You brought up ${keyword} — what was the biggest challenge you ran into while you were there?`
      );
    }
    return makeQuestion(
      "resume",
      `You referenced ${keyword} — if you rebuilt it today with what you know now, what would you do differently?`
    );
  }
  return null;
}

const FALLBACK_TEXT =
  "Is there a recent piece of work you're proud of that we haven't touched on yet? Tell me about it.";

/**
 * The single entry point the live session calls after every answer. It:
 * 1. Tries an adaptive follow-up based on what the candidate just said.
 * 2. Falls back to the next un-asked resume-grounded topic.
 * 3. Falls back to the shared behavioral/technical pools.
 * 4. Only as a last resort (pools fully exhausted) returns a generic wrap-up
 *    prompt so the session can never get stuck.
 * Everything is deduplicated against `usedTexts` so no question is ever
 * repeated within a session.
 */
export function getNextQuestion(args: {
  profile: ResumeProfile;
  lastAnswer: AnswerRecord | null;
  usedTexts: Set<string>;
  usedKeywords: Set<string>;
}): InterviewQuestion {
  const { profile, lastAnswer, usedTexts, usedKeywords } = args;

  if (lastAnswer && lastAnswer.transcript && lastAnswer.wordCount > 8) {
    const followUp = getFollowUpQuestion(lastAnswer.transcript, profile, usedKeywords);
    if (followUp && !usedTexts.has(followUp.text)) {
      usedTexts.add(followUp.text);
      return followUp;
    }
  }

  for (const t of buildResumeTopics(profile)) {
    if (!usedTexts.has(t.text)) {
      usedTexts.add(t.text);
      return t;
    }
  }

  for (const q of [...BEHAVIORAL_POOL, ...GENERIC_TECHNICAL_POOL]) {
    if (!usedTexts.has(q.text)) {
      usedTexts.add(q.text);
      return q;
    }
  }

  if (!usedTexts.has(FALLBACK_TEXT)) {
    usedTexts.add(FALLBACK_TEXT);
  }
  return makeQuestion("behavioral", FALLBACK_TEXT, 45, 150);
}
