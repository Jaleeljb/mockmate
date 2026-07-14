import type { AnswerRecord } from "@/types";

export interface InterviewFeedback {
  totalDurationSeconds: number;
  totalWords: number;
  averageWordsPerAnswer: number;
  averageFillerPerAnswer: number;
  strongestAnswer: AnswerRecord | null;
  briefestAnswer: AnswerRecord | null;
  notes: string[];
}

export function buildFeedback(answers: AnswerRecord[], totalDurationSeconds: number): InterviewFeedback {
  const answered = answers.filter((a) => a.wordCount > 0);
  const totalWords = answered.reduce((sum, a) => sum + a.wordCount, 0);
  const totalFillers = answered.reduce((sum, a) => sum + a.fillerWordCount, 0);
  const averageWordsPerAnswer = answered.length ? Math.round(totalWords / answered.length) : 0;
  const averageFillerPerAnswer = answered.length ? totalFillers / answered.length : 0;

  const strongestAnswer = answered.length
    ? answered.reduce((best, a) => (a.wordCount > best.wordCount ? a : best), answered[0])
    : null;
  const briefestAnswer = answered.length
    ? answered.reduce((min, a) => (a.wordCount < min.wordCount ? a : min), answered[0])
    : null;

  const notes: string[] = [];

  if (averageWordsPerAnswer < 25) {
    notes.push(
      "Most answers were quite short. Try structuring responses with a brief setup, the action you took, and the result — it naturally adds useful detail."
    );
  } else if (averageWordsPerAnswer > 160) {
    notes.push(
      "Several answers ran long. Aim to land your main point within 60–90 seconds, then stop — interviewers often follow up if they want more."
    );
  } else {
    notes.push("Your answer length was in a solid range — detailed without rambling.");
  }

  if (averageFillerPerAnswer > 3) {
    notes.push(
      "Filler words like 'um', 'like', and 'you know' showed up often. A short pause reads as more confident than a filler word."
    );
  } else {
    notes.push("Filler-word usage was low — your delivery sounded controlled.");
  }

  const behavioralAnswers = answered.filter((a) => a.category === "behavioral");
  const starLike = behavioralAnswers.filter((a) => /result|outcome|impact|learned/i.test(a.transcript));
  if (behavioralAnswers.length > 0 && starLike.length / behavioralAnswers.length < 0.4) {
    notes.push(
      "For behavioral questions, try explicitly naming the outcome or result at the end — it's the part interviewers remember most."
    );
  }

  if (totalDurationSeconds >= 15 * 60) {
    notes.push("You completed the full 15-minute session — good stamina for a real interview loop.");
  }

  return {
    totalDurationSeconds,
    totalWords,
    averageWordsPerAnswer,
    averageFillerPerAnswer,
    strongestAnswer,
    briefestAnswer,
    notes,
  };
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
