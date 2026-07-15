import type { AnswerRecord, QuestionCategory } from "@/types";

// Below this word count, an answer is treated as not really answered at all —
// e.g. the mic caught a stray word, or the candidate clicked through.
const SKIP_WORD_THRESHOLD = 3;
// Below this, an answer counts as "answered" but is flagged as thin.
const BRIEF_WORD_THRESHOLD = 25;
const FILLER_RATE_HIGH = 4; // filler words per 100 words
const FILLER_RATE_LOW = 1.5;

export type AnswerStatus = "skipped" | "brief" | "solid";

export interface AnswerAnalysis extends AnswerRecord {
  status: AnswerStatus;
  fillerRatePer100: number;
  wordsPerMinute: number;
}

export interface CategoryBreakdown {
  category: QuestionCategory;
  total: number;
  answered: number;
  skipped: number;
  averageWords: number;
  averageFillerRate: number;
}

export interface InterviewFeedback {
  totalDurationSeconds: number;
  questionsTotal: number;
  questionsAnswered: number;
  questionsSkipped: number;
  questionsBrief: number;
  completionRate: number; // 0–100
  totalWords: number;
  averageWordsPerAnsweredQuestion: number;
  averageFillerRate: number; // per 100 words, across answered questions
  categoryBreakdown: CategoryBreakdown[];
  skippedQuestions: AnswerAnalysis[];
  strongestAnswer: AnswerAnalysis | null;
  briefestAnswer: AnswerAnalysis | null;
  strengths: string[];
  improvements: string[];
  perAnswer: AnswerAnalysis[];
}

function classify(a: AnswerRecord): AnswerStatus {
  if (a.wordCount <= SKIP_WORD_THRESHOLD) return "skipped";
  if (a.wordCount < BRIEF_WORD_THRESHOLD) return "brief";
  return "solid";
}

function fillerRatePer100(a: AnswerRecord): number {
  if (a.wordCount === 0) return 0;
  return (a.fillerWordCount / a.wordCount) * 100;
}

const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  opening: "opening",
  resume: "resume-specific",
  technical: "technical",
  behavioral: "behavioral",
  closing: "closing",
};

export function buildFeedback(answers: AnswerRecord[], totalDurationSeconds: number): InterviewFeedback {
  const perAnswer: AnswerAnalysis[] = answers.map((a) => ({
    ...a,
    status: classify(a),
    fillerRatePer100: fillerRatePer100(a),
    wordsPerMinute: a.durationSeconds > 0 ? Math.round((a.wordCount / a.durationSeconds) * 60) : 0,
  }));

  const answered = perAnswer.filter((a) => a.status !== "skipped");
  const skippedQuestions = perAnswer.filter((a) => a.status === "skipped");
  const briefAnswers = perAnswer.filter((a) => a.status === "brief");

  const questionsTotal = perAnswer.length;
  const questionsAnswered = answered.length;
  const questionsSkipped = skippedQuestions.length;
  const completionRate = questionsTotal ? Math.round((questionsAnswered / questionsTotal) * 100) : 0;

  const totalWords = answered.reduce((sum, a) => sum + a.wordCount, 0);
  const averageWordsPerAnsweredQuestion = answered.length ? Math.round(totalWords / answered.length) : 0;
  const averageFillerRate = answered.length
    ? answered.reduce((sum, a) => sum + a.fillerRatePer100, 0) / answered.length
    : 0;

  const strongestAnswer = answered.length
    ? answered.reduce((best, a) => (a.wordCount > best.wordCount ? a : best), answered[0])
    : null;
  const briefestAnswer = answered.length
    ? answered.reduce((min, a) => (a.wordCount < min.wordCount ? a : min), answered[0])
    : null;

  // Per-category breakdown, built only from categories that actually appeared.
  const categories = Array.from(new Set(perAnswer.map((a) => a.category)));
  const categoryBreakdown: CategoryBreakdown[] = categories.map((category) => {
    const inCategory = perAnswer.filter((a) => a.category === category);
    const answeredInCategory = inCategory.filter((a) => a.status !== "skipped");
    const words = answeredInCategory.reduce((sum, a) => sum + a.wordCount, 0);
    const fillerSum = answeredInCategory.reduce((sum, a) => sum + a.fillerRatePer100, 0);
    return {
      category,
      total: inCategory.length,
      answered: answeredInCategory.length,
      skipped: inCategory.length - answeredInCategory.length,
      averageWords: answeredInCategory.length ? Math.round(words / answeredInCategory.length) : 0,
      averageFillerRate: answeredInCategory.length ? fillerSum / answeredInCategory.length : 0,
    };
  });

  const strengths: string[] = [];
  const improvements: string[] = [];

  // --- Handle the "answered nothing" case plainly and stop there. ---
  if (questionsAnswered === 0) {
    improvements.push(
      questionsTotal > 0
        ? `No answers were captured for any of the ${questionsTotal} questions asked. There's no transcript to evaluate delivery on — try the session again and speak or type at least a short response to each question.`
        : "No questions were recorded for this session."
    );
    return {
      totalDurationSeconds,
      questionsTotal,
      questionsAnswered,
      questionsSkipped,
      questionsBrief: briefAnswers.length,
      completionRate,
      totalWords,
      averageWordsPerAnsweredQuestion,
      averageFillerRate,
      categoryBreakdown,
      skippedQuestions,
      strongestAnswer,
      briefestAnswer,
      strengths,
      improvements,
      perAnswer,
    };
  }

  // --- Completion ---
  if (questionsSkipped === 0) {
    strengths.push(`You answered all ${questionsTotal} questions in the session — full follow-through.`);
  } else {
    const list = skippedQuestions.map((a) => `"${a.questionText}"`).join(", ");
    improvements.push(
      `${questionsSkipped} of ${questionsTotal} question${questionsSkipped > 1 ? "s were" : " was"} left unanswered: ${list}. Even a short, imperfect answer scores better in a real interview than moving on silently.`
    );
  }

  // --- Filler words ---
  if (averageFillerRate <= FILLER_RATE_LOW) {
    strengths.push(
      `Filler-word usage was low — about ${averageFillerRate.toFixed(1)} per 100 words — delivery read as controlled.`
    );
  } else if (averageFillerRate >= FILLER_RATE_HIGH) {
    improvements.push(
      `Filler words ("um", "like", "you know") appeared often — about ${averageFillerRate.toFixed(1)} per 100 words. A short pause reads as more confident than a filler word.`
    );
  }

  // --- Depth / length ---
  if (averageWordsPerAnsweredQuestion > 0 && averageWordsPerAnsweredQuestion < 25) {
    improvements.push(
      `Answered questions averaged only ${averageWordsPerAnsweredQuestion} words. Try adding a specific example and a concrete outcome to each answer.`
    );
  } else if (averageWordsPerAnsweredQuestion >= 60 && averageWordsPerAnsweredQuestion <= 160) {
    strengths.push(
      `Answered questions averaged ${averageWordsPerAnsweredQuestion} words — enough room to add detail without rambling.`
    );
  } else if (averageWordsPerAnsweredQuestion > 160) {
    improvements.push(
      `Answers ran long — averaging ${averageWordsPerAnsweredQuestion} words. Aim to land your main point within 60–90 seconds, then stop.`
    );
  }

  if (briefAnswers.length > 0) {
    const list = briefAnswers.map((a) => `"${a.questionText}" (${a.wordCount}w)`).join(", ");
    improvements.push(`These answers were quite brief: ${list}. A little more detail would go a long way.`);
  }

  // --- Behavioral / STAR structure ---
  const behavioralAnswered = answered.filter((a) => a.category === "behavioral");
  if (behavioralAnswered.length > 0) {
    const starLike = behavioralAnswered.filter((a) => /result|outcome|impact|learned|led to/i.test(a.transcript));
    const ratio = starLike.length / behavioralAnswered.length;
    if (ratio >= 0.6) {
      strengths.push("Behavioral answers consistently closed with a clear result or outcome — a strong STAR pattern.");
    } else if (behavioralAnswered.length >= 2) {
      improvements.push(
        "For behavioral questions, try explicitly naming the outcome or result at the end — it's the part interviewers remember most."
      );
    }
  }

  // --- Category comparison (only when there's more than one comparable category) ---
  const comparable = categoryBreakdown.filter((c) => c.answered >= 1 && c.category !== "opening" && c.category !== "closing");
  if (comparable.length >= 2) {
    const strongest = comparable.reduce((best, c) => (c.averageWords > best.averageWords ? c : best), comparable[0]);
    const weakest = comparable.reduce((min, c) => (c.averageWords < min.averageWords ? c : min), comparable[0]);
    if (strongest.category !== weakest.category && strongest.averageWords - weakest.averageWords >= 20) {
      strengths.push(
        `Strongest depth was in ${CATEGORY_LABEL[strongest.category]} answers, averaging ${strongest.averageWords} words.`
      );
      improvements.push(
        `${CATEGORY_LABEL[weakest.category][0].toUpperCase()}${CATEGORY_LABEL[weakest.category].slice(1)} answers were comparatively thin, averaging ${weakest.averageWords} words versus ${strongest.averageWords} elsewhere.`
      );
    }
  }

  // --- Session length ---
  if (totalDurationSeconds >= 15 * 60) {
    strengths.push("You held the full 15-minute session — solid stamina for a real interview loop.");
  }

  if (strengths.length === 0) {
    strengths.push("Not enough strong signal yet — answer more fully in your next run to surface clear strengths.");
  }

  return {
    totalDurationSeconds,
    questionsTotal,
    questionsAnswered,
    questionsSkipped,
    questionsBrief: briefAnswers.length,
    completionRate,
    totalWords,
    averageWordsPerAnsweredQuestion,
    averageFillerRate,
    categoryBreakdown,
    skippedQuestions,
    strongestAnswer,
    briefestAnswer,
    strengths,
    improvements,
    perAnswer,
  };
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
