export interface ResumeProfile {
  rawText: string;
  name: string | null;
  skills: string[];
  roles: string[];
  companies: string[];
  yearsOfExperience: number | null;
  education: string[];
}

export type QuestionCategory =
  | "opening"
  | "resume"
  | "technical"
  | "behavioral"
  | "closing";

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  text: string;
  minAnswerSeconds: number;
  maxAnswerSeconds: number;
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  category: QuestionCategory;
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  fillerWordCount: number;
}

export type InterviewPhase =
  | "upload"
  | "ready"
  | "asking"
  | "listening"
  | "transition"
  | "complete";
