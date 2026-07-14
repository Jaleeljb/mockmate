import type { InterviewQuestion, QuestionCategory } from "@/types";

let counter = 0;
function q(
  category: QuestionCategory,
  text: string,
  minAnswerSeconds = 60,
  maxAnswerSeconds = 150
): InterviewQuestion {
  counter += 1;
  return { id: `${category}-${counter}`, category, text, minAnswerSeconds, maxAnswerSeconds };
}

export const OPENING_POOL: InterviewQuestion[] = [
  q("opening", "To start, walk me through your background and what's brought you to this interview today.", 60, 150),
];

export const CLOSING_POOL: InterviewQuestion[] = [
  q("closing", "Last question — where do you want to be in your career three years from now, and what are you doing to get there?", 45, 120),
  q("closing", "Before we wrap up, is there anything about your experience we haven't covered that you think is important for me to know?", 30, 120),
];

export const BEHAVIORAL_POOL: InterviewQuestion[] = [
  q("behavioral", "Tell me about a time you disagreed with a manager or teammate. How did you handle it?", 60, 150),
  q("behavioral", "Describe a project that failed or fell short. What happened, and what did you take away from it?", 60, 150),
  q("behavioral", "Tell me about a time you had to learn something completely new under time pressure.", 60, 150),
  q("behavioral", "Give me an example of when you had to influence someone without having authority over them.", 60, 150),
  q("behavioral", "Describe a situation where you had to juggle multiple priorities at once. How did you decide what came first?", 60, 150),
  q("behavioral", "Tell me about a time you received tough feedback. How did you respond to it?", 45, 120),
  q("behavioral", "Walk me through a decision you made with incomplete information.", 60, 150),
  q("behavioral", "Describe a time you went beyond what was expected of you in a role.", 45, 120),
  q("behavioral", "Tell me about a conflict within a team you were part of, and the role you played in resolving it.", 60, 150),
  q("behavioral", "Describe the most complex problem you've solved recently and how you approached it.", 60, 150),
  q("behavioral", "Tell me about a time you had to say no to a request. How did you handle that conversation?", 45, 120),
  q("behavioral", "What's a mistake you made that you're comfortable sharing, and how did you fix it?", 45, 120),
];

export const GENERIC_TECHNICAL_POOL: InterviewQuestion[] = [
  q("technical", "Walk me through how you'd approach a problem you'd never seen before in your field.", 60, 150),
  q("technical", "What does a healthy code review or quality-review process look like to you?", 45, 120),
  q("technical", "How do you decide when something is 'good enough' to ship versus needing more work?", 45, 120),
  q("technical", "Tell me about a tool or process you introduced that improved how your team worked.", 60, 150),
];

// Skill -> pool of targeted technical questions. Matched against resume-detected skills.
export const SKILL_QUESTION_MAP: Record<string, InterviewQuestion[]> = {
  javascript: [q("technical", "How would you explain closures in JavaScript to someone new to the language?", 45, 120)],
  typescript: [q("technical", "What's the value TypeScript adds over plain JavaScript on a team codebase?", 45, 120)],
  python: [q("technical", "What's your approach to writing Python code that stays readable as a project grows?", 45, 120)],
  java: [q("technical", "How do you think about memory management and garbage collection when writing Java?", 45, 120)],
  react: [q("technical", "How do you decide what belongs in component state versus global state in a React app?", 45, 120)],
  "next.js": [q("technical", "When would you reach for server-side rendering versus static generation in a Next.js app?", 45, 120)],
  nextjs: [q("technical", "When would you reach for server-side rendering versus static generation in a Next.js app?", 45, 120)],
  "node.js": [q("technical", "How do you handle errors gracefully in an asynchronous Node.js service?", 45, 120)],
  nodejs: [q("technical", "How do you handle errors gracefully in an asynchronous Node.js service?", 45, 120)],
  sql: [q("technical", "How would you go about optimizing a slow SQL query?", 45, 120)],
  aws: [q("technical", "Tell me about a time you had to think about cost or reliability trade-offs on AWS.", 45, 120)],
  docker: [q("technical", "What problems does containerizing an application actually solve for a team?", 45, 120)],
  kubernetes: [q("technical", "How do you think about scaling and self-healing when running services on Kubernetes?", 45, 120)],
  "machine learning": [q("technical", "How do you validate that a machine learning model is actually ready for production?", 60, 150)],
  "data analysis": [q("technical", "Walk me through how you'd approach a dataset you'd never seen before to find something useful in it.", 60, 150)],
  "data science": [q("technical", "How do you communicate a data finding to a stakeholder who isn't technical?", 45, 120)],
  "product management": [q("technical", "How do you decide what goes on the roadmap when everything feels like a priority?", 60, 150)],
  "project management": [q("technical", "Tell me about a project timeline that slipped. How did you manage the fallout?", 60, 150)],
  agile: [q("technical", "What's a common way agile/scrum practices go wrong on a team, in your experience?", 45, 120)],
  "ui/ux": [q("technical", "Walk me through how you validate a design decision before it ships.", 45, 120)],
  figma: [q("technical", "How do you keep a design system consistent as a product grows?", 45, 120)],
  sales: [q("technical", "Walk me through how you qualify whether a prospect is actually worth pursuing.", 45, 120)],
  marketing: [q("technical", "How do you measure whether a campaign actually worked?", 45, 120)],
  leadership: [q("technical", "How do you adjust your management style for different people on your team?", 60, 150)],
  cybersecurity: [q("technical", "Walk me through how you'd assess the security posture of a system you just inherited.", 60, 150)],
};

export function getSkillQuestions(skills: string[], cap = 4): InterviewQuestion[] {
  const out: InterviewQuestion[] = [];
  for (const skill of skills) {
    const bank = SKILL_QUESTION_MAP[skill.toLowerCase()];
    if (bank && bank.length) {
      out.push(bank[0]);
    }
    if (out.length >= cap) break;
  }
  return out;
}
