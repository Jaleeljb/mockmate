import type { InterviewQuestion, QuestionCategory } from "@/types";
import type { ResumeFact } from "./resumeFacts";

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

function truncate(text: string, max = 140): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

// Always asked first, verbatim — the standard interview opener.
export const OPENING_POOL: InterviewQuestion[] = [
  q("opening", "Tell me about yourself.", 60, 150),
];

// Always asked last, verbatim — gives the candidate the floor before wrapping up.
export const CLOSING_POOL: InterviewQuestion[] = [
  q("closing", "Do you have any questions for me?", 30, 150),
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
  q("behavioral", "Where do you want to be in your career three years from now, and what are you doing to get there?", 45, 120),
  q("behavioral", "Is there anything about your experience we haven't covered that you think is important for me to know?", 30, 120),
  q("behavioral", "Tell me about a time you had to make a decision without your manager's input. How did it turn out?", 45, 120),
  q("behavioral", "Describe a time you had to pick up the slack for someone else on your team.", 45, 120),
  q("behavioral", "Tell me about a time you had to deliver bad news to a stakeholder or client.", 45, 120),
  q("behavioral", "What's the best piece of feedback you've ever received, and how did it change how you work?", 45, 120),
  q("behavioral", "Tell me about a time you were the least experienced person in the room. How did you handle it?", 45, 120),
  q("behavioral", "Describe a time you had to change your mind about something you initially disagreed with.", 45, 120),
  q("behavioral", "Tell me about a time a project's scope changed midway through. How did you adapt?", 45, 120),
  q("behavioral", "What does a bad day at work look like for you, and how do you get through it?", 30, 120),
];

export const GENERIC_TECHNICAL_POOL: InterviewQuestion[] = [
  q("technical", "Walk me through how you'd approach a problem you'd never seen before in your field.", 60, 150),
  q("technical", "What does a healthy code review or quality-review process look like to you?", 45, 120),
  q("technical", "How do you decide when something is 'good enough' to ship versus needing more work?", 45, 120),
  q("technical", "Tell me about a tool or process you introduced that improved how your team worked.", 60, 150),
  q("technical", "How do you approach debugging something when you don't know where the problem is coming from?", 45, 120),
  q("technical", "What's your process for getting up to speed on a codebase or system you've never touched before?", 45, 120),
  q("technical", "How do you decide between building something yourself versus using an existing tool or library?", 45, 120),
  q("technical", "Tell me about a time a system you built or maintained broke in production. What happened?", 60, 150),
  q("technical", "How do you keep your technical skills current outside of work?", 30, 90),
  q("technical", "What's a technical decision you made that you'd reconsider if you were starting over?", 45, 120),
];

// Skill -> pool of targeted technical questions. Matched against resume-detected skills.
export const SKILL_QUESTION_MAP: Record<string, InterviewQuestion[]> = {
  javascript: [q("technical", "How would you explain closures in JavaScript to someone new to the language?", 45, 120)],
  typescript: [q("technical", "What's the value TypeScript adds over plain JavaScript on a team codebase?", 45, 120)],
  python: [q("technical", "What's your approach to writing Python code that stays readable as a project grows?", 45, 120)],
  java: [q("technical", "How do you think about memory management and garbage collection when writing Java?", 45, 120)],
  "c++": [q("technical", "How do you approach memory management in C++ compared to a garbage-collected language?", 45, 120)],
  "c#": [q("technical", "What do you like and dislike about working in the .NET ecosystem with C#?", 45, 120)],
  react: [q("technical", "How do you decide what belongs in component state versus global state in a React app?", 45, 120)],
  "next.js": [q("technical", "When would you reach for server-side rendering versus static generation in a Next.js app?", 45, 120)],
  nextjs: [q("technical", "When would you reach for server-side rendering versus static generation in a Next.js app?", 45, 120)],
  "node.js": [q("technical", "How do you handle errors gracefully in an asynchronous Node.js service?", 45, 120)],
  nodejs: [q("technical", "How do you handle errors gracefully in an asynchronous Node.js service?", 45, 120)],
  sql: [q("technical", "How would you go about optimizing a slow SQL query?", 45, 120)],
  postgresql: [q("technical", "What's a PostgreSQL-specific feature you've relied on that you'd miss in another database?", 45, 120)],
  mongodb: [q("technical", "How do you decide when a document database like MongoDB is the right fit over a relational one?", 45, 120)],
  aws: [q("technical", "Tell me about a time you had to think about cost or reliability trade-offs on AWS.", 45, 120)],
  azure: [q("technical", "Tell me about a project where you made a cost or reliability trade-off on Azure.", 45, 120)],
  docker: [q("technical", "What problems does containerizing an application actually solve for a team?", 45, 120)],
  kubernetes: [q("technical", "How do you think about scaling and self-healing when running services on Kubernetes?", 45, 120)],
  graphql: [q("technical", "What trade-offs have you run into using GraphQL compared to a REST API?", 45, 120)],
  "machine learning": [q("technical", "How do you validate that a machine learning model is actually ready for production?", 60, 150)],
  "deep learning": [q("technical", "How do you decide when a deep learning approach is actually worth the added complexity?", 60, 150)],
  "data analysis": [q("technical", "Walk me through how you'd approach a dataset you'd never seen before to find something useful in it.", 60, 150)],
  "data science": [q("technical", "How do you communicate a data finding to a stakeholder who isn't technical?", 45, 120)],
  "data engineering": [q("technical", "How do you approach building a data pipeline you know will need to scale?", 60, 150)],
  "product management": [q("technical", "How do you decide what goes on the roadmap when everything feels like a priority?", 60, 150)],
  "project management": [q("technical", "Tell me about a project timeline that slipped. How did you manage the fallout?", 60, 150)],
  agile: [q("technical", "What's a common way agile/scrum practices go wrong on a team, in your experience?", 45, 120)],
  "ui/ux": [q("technical", "Walk me through how you validate a design decision before it ships.", 45, 120)],
  figma: [q("technical", "How do you keep a design system consistent as a product grows?", 45, 120)],
  sales: [q("technical", "Walk me through how you qualify whether a prospect is actually worth pursuing.", 45, 120)],
  marketing: [q("technical", "How do you measure whether a campaign actually worked?", 45, 120)],
  leadership: [q("technical", "How do you adjust your management style for different people on your team?", 60, 150)],
  cybersecurity: [q("technical", "Walk me through how you'd assess the security posture of a system you just inherited.", 60, 150)],
  excel: [q("technical", "What's the most complex thing you've built in Excel to solve a real problem?", 45, 120)],
  tableau: [q("technical", "Walk me through how you design a dashboard so it actually gets used, not just built.", 45, 120)],
  "react native": [q("technical", "What's been the hardest part of shipping a React Native app across both iOS and Android?", 45, 120)],
  flutter: [q("technical", "What made you choose Flutter over native development for a project?", 45, 120)],
  android: [q("technical", "What's changed the most about how you build for Android since you started?", 45, 120)],
  ios: [q("technical", "What's a platform-specific iOS constraint that shaped a product decision you made?", 45, 120)],
  git: [q("technical", "What's your team's branching and code-review workflow, and what would you change about it?", 45, 120)],
  terraform: [q("technical", "How do you think about safely making infrastructure changes with Terraform?", 45, 120)],
  kafka: [q("technical", "What's a situation where an event-driven approach with Kafka was the right call — or wasn't?", 45, 120)],
};

const GENERIC_SKILL_TEMPLATES: ((skill: string) => string)[] = [
  (skill) =>
    `I see ${skill} on your resume — tell me about a specific project where you used it, and one tricky problem it helped you solve.`,
  (skill) =>
    `How comfortable are you with ${skill} day to day, and what's something about it you're still working to get better at?`,
  (skill) =>
    `Walk me through the last time you used ${skill} in a real project — what were you building, and what was your role?`,
  (skill) =>
    `Your resume lists ${skill} — how did you end up learning it, and where do you rely on it most today?`,
  (skill) =>
    `What's one decision you'd make differently next time you use ${skill}, based on how a past project with it went?`,
];

/**
 * Turns a single JSON resume fact into an interview question. This is the
 * "JSON drives the interview" step: every fact the parser found — skill,
 * project, role, bullet, certification, education line, or achievement —
 * comes through here exactly once, so nothing detected on the resume is
 * silently dropped, and no two facts can produce the same question text.
 */
export function questionFromFact(fact: ResumeFact, templateIndex = 0): InterviewQuestion | null {
  switch (fact.type) {
    case "skill": {
      const curated = SKILL_QUESTION_MAP[fact.subject.toLowerCase()];
      if (curated && curated.length) return curated[0];
      const template = GENERIC_SKILL_TEMPLATES[templateIndex % GENERIC_SKILL_TEMPLATES.length];
      return q("technical", template(fact.subject), 45, 120);
    }
    case "project": {
      const description = fact.detail?.trim();
      const text = description
        ? `Tell me about your project "${fact.subject}." You mention ${truncate(description, 130)} — walk me through your specific role and the biggest challenge you ran into.`
        : `Tell me about your project "${fact.subject}." What was the goal, and what was your specific contribution?`;
      return q("resume", text, 60, 150);
    }
    case "role": {
      const text = fact.detail
        ? `I see you worked as ${fact.subject} at ${fact.detail}. Tell me about the most impactful thing you did in that role.`
        : `Your resume mentions experience as ${fact.subject}. Tell me about the most impactful thing you did in that role.`;
      return q("resume", text, 60, 150);
    }
    case "experience_bullet":
      return q(
        "resume",
        `You mention on your resume: "${truncate(fact.subject, 140)}" — walk me through how you actually did that, step by step.`,
        60,
        150
      );
    case "certification":
      return q(
        "resume",
        `What motivated you to get certified in ${fact.subject}, and how has it come up in your actual work since?`,
        45,
        120
      );
    case "education":
      return q(
        "resume",
        `Your resume mentions ${fact.subject} — how has that background shaped the way you approach your work today?`,
        45,
        120
      );
    case "achievement":
      return q(
        "resume",
        `Your resume highlights: "${truncate(fact.subject, 140)}" — tell me the story behind that.`,
        60,
        150
      );
    case "tenure":
      return q(
        "resume",
        `With about ${fact.subject} years of experience behind you, what's changed most in how you approach your work compared to when you started?`,
        45,
        120
      );
    default:
      return null;
  }
}

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
