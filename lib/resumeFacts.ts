import type { ResumeProfile } from "@/types";

/**
 * Every distinct "point" pulled from the resume — one skill, one project,
 * one job, one accomplishment bullet, one certification, and so on — is
 * normalized into a ResumeFact. The interview engine builds its question
 * plan by walking this JSON array rather than reaching into ResumeProfile
 * fields directly, so adding a new kind of resume content (a new section,
 * a new fact type) only ever requires a new case here, in one place, and
 * every fact automatically becomes eligible to generate a question.
 */
export type ResumeFactType =
  | "skill"
  | "project"
  | "role"
  | "experience_bullet"
  | "certification"
  | "education"
  | "achievement"
  | "tenure";

export interface ResumeFact {
  type: ResumeFactType;
  id: string;
  subject: string;
  detail?: string;
}

function slug(type: string, index: number): string {
  return `${type}-${index}`;
}

/**
 * Flattens a parsed resume into the JSON fact list the question engine
 * runs on. This is the "backend" the interview draws every resume-aware
 * question from — nothing here is skipped or capped based on a fixed
 * dictionary; whatever analyzeResumeText() found, this turns into facts.
 */
export function buildResumeFacts(profile: ResumeProfile): ResumeFact[] {
  const facts: ResumeFact[] = [];

  profile.skills.forEach((skill, i) => {
    facts.push({ type: "skill", id: slug("skill", i), subject: skill });
  });

  profile.projects.forEach((project, i) => {
    facts.push({
      type: "project",
      id: slug("project", i),
      subject: project.name,
      detail: project.description,
    });
  });

  profile.roles.forEach((role, i) => {
    facts.push({
      type: "role",
      id: slug("role", i),
      subject: role,
      detail: profile.companies[i] ?? profile.companies[0],
    });
  });

  profile.experienceBullets.forEach((bullet, i) => {
    facts.push({ type: "experience_bullet", id: slug("xp", i), subject: bullet });
  });

  profile.certifications.forEach((cert, i) => {
    facts.push({ type: "certification", id: slug("cert", i), subject: cert });
  });

  profile.education.forEach((edu, i) => {
    facts.push({ type: "education", id: slug("edu", i), subject: edu });
  });

  profile.achievements.forEach((achievement, i) => {
    facts.push({ type: "achievement", id: slug("achievement", i), subject: achievement });
  });

  if (profile.yearsOfExperience !== null) {
    facts.push({
      type: "tenure",
      id: "tenure-0",
      subject: String(profile.yearsOfExperience),
    });
  }

  return facts;
}

/** How many facts of each type were pulled from the resume — surfaced in
 *  the briefing screen so the candidate can see the extraction actually
 *  covered their whole resume, not just a handful of buzzwords. */
export function summarizeFacts(facts: ResumeFact[]): Record<ResumeFactType, number> {
  const summary: Record<ResumeFactType, number> = {
    skill: 0,
    project: 0,
    role: 0,
    experience_bullet: 0,
    certification: 0,
    education: 0,
    achievement: 0,
    tenure: 0,
  };
  for (const fact of facts) summary[fact.type] += 1;
  return summary;
}
