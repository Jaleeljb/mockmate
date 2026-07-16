export interface RoleCompanyPair {
  role: string;
  company: string | null;
}

export interface ResumeProfile {
  rawText: string;
  name: string | null;
  skills: string[];
  roles: string[];
  companies: string[];
  yearsOfExperience: number | null;
  education: string[];
  /** Roles paired with the nearest company mention in the text, in resume order. */
  rolesWithCompanies: RoleCompanyPair[];
  /** Sentences/bullets that mention a concrete metric or start with a strong action verb. */
  highlights: string[];
  /** Named projects/platforms/systems detected in the resume text. */
  projects: string[];
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
